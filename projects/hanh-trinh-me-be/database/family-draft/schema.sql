-- REVIEW DRAFT ONLY. Deliberately outside database/migrations; never applied by startup.
-- Apply to disposable CI PostgreSQL only. Live role provisioning and Supabase review are separate.
BEGIN;
CREATE ROLE mebe_family_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
CREATE SCHEMA mebe_family;
REVOKE ALL ON SCHEMA mebe_family FROM PUBLIC;
GRANT USAGE ON SCHEMA mebe_family TO mebe_family_runtime;
CREATE FUNCTION mebe_family.actor_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog
AS $$ SELECT NULLIF(current_setting('mebe.family_actor',true),'')::uuid $$;
REVOKE ALL ON FUNCTION mebe_family.actor_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION mebe_family.actor_id() TO mebe_family_runtime;
CREATE TABLE mebe_family.accounts (
 id uuid PRIMARY KEY, display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
 consent_version text NOT NULL CHECK(consent_version='family-v1'), consented_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE mebe_family.families (
 id uuid PRIMARY KEY, name text NOT NULL CHECK(char_length(name) BETWEEN 1 AND 80),
 stage text CHECK(stage IN ('chuan-bi-mang-thai','thai-ky-3-thang-dau','thai-ky-3-thang-giua','thai-ky-3-thang-cuoi','hau-san','so-sinh','nhu-nhi','tap-di','mam-non','tieu-hoc','thieu-nien','truong-thanh')),
 revision integer NOT NULL DEFAULT 0 CHECK(revision>=0)
);
-- Independent ownership relation avoids recursive RLS. One owner per family.
CREATE TABLE mebe_family.ownership (
 family_id uuid PRIMARY KEY REFERENCES mebe_family.families(id) DEFERRABLE INITIALLY DEFERRED,
 account_id uuid NOT NULL REFERENCES mebe_family.accounts(id)
);
CREATE INDEX ownership_account_idx ON mebe_family.ownership(account_id);
CREATE TABLE mebe_family.memberships (
 family_id uuid NOT NULL REFERENCES mebe_family.families(id), account_id uuid NOT NULL REFERENCES mebe_family.accounts(id),
 role text NOT NULL CHECK(role IN ('member','viewer')), status text NOT NULL CHECK(status IN ('active','revoked')),
 PRIMARY KEY(family_id,account_id)
);
CREATE INDEX memberships_account_idx ON mebe_family.memberships(account_id,family_id);
CREATE TABLE mebe_family.invitations (
 digest text PRIMARY KEY CHECK(digest ~ '^[0-9a-f]{64}$'),
 family_id uuid NOT NULL REFERENCES mebe_family.families(id), account_id uuid NOT NULL REFERENCES mebe_family.accounts(id),
 role text NOT NULL CHECK(role IN ('member','viewer')), expires_at timestamptz NOT NULL,
 UNIQUE(family_id,account_id)
);
CREATE INDEX invitations_recipient_idx ON mebe_family.invitations(account_id);
REVOKE ALL ON ALL TABLES IN SCHEMA mebe_family FROM PUBLIC;
DO $$ DECLARE r text; BEGIN
 FOR r IN SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role') LOOP
  EXECUTE format('REVOKE ALL ON SCHEMA mebe_family FROM %I',r);
  EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA mebe_family FROM %I',r);
  EXECUTE format('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA mebe_family FROM %I',r);
 END LOOP;
END $$;
ALTER TABLE mebe_family.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mebe_family.accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE mebe_family.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE mebe_family.families FORCE ROW LEVEL SECURITY;
ALTER TABLE mebe_family.ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE mebe_family.ownership FORCE ROW LEVEL SECURITY;
ALTER TABLE mebe_family.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE mebe_family.memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE mebe_family.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mebe_family.invitations FORCE ROW LEVEL SECURITY;
GRANT SELECT,INSERT ON mebe_family.accounts,mebe_family.families,mebe_family.ownership,mebe_family.memberships,mebe_family.invitations TO mebe_family_runtime;
GRANT UPDATE(stage,revision) ON mebe_family.families TO mebe_family_runtime;
GRANT UPDATE(role,status) ON mebe_family.memberships TO mebe_family_runtime;
GRANT DELETE ON mebe_family.invitations TO mebe_family_runtime;
CREATE POLICY account_read ON mebe_family.accounts FOR SELECT TO mebe_family_runtime USING(id=mebe_family.actor_id());
CREATE POLICY account_create ON mebe_family.accounts FOR INSERT TO mebe_family_runtime WITH CHECK(id=mebe_family.actor_id());
CREATE POLICY ownership_read ON mebe_family.ownership FOR SELECT TO mebe_family_runtime USING(account_id=mebe_family.actor_id());
CREATE POLICY ownership_create ON mebe_family.ownership FOR INSERT TO mebe_family_runtime WITH CHECK(account_id=mebe_family.actor_id());
CREATE POLICY family_read ON mebe_family.families FOR SELECT TO mebe_family_runtime USING(EXISTS (SELECT 1 FROM mebe_family.ownership o WHERE o.family_id=families.id AND o.account_id=mebe_family.actor_id()) OR EXISTS (SELECT 1 FROM mebe_family.memberships m WHERE m.family_id=families.id AND m.account_id=mebe_family.actor_id() AND m.status='active'));
CREATE POLICY family_create ON mebe_family.families FOR INSERT TO mebe_family_runtime WITH CHECK(EXISTS (SELECT 1 FROM mebe_family.ownership o WHERE o.family_id=families.id AND o.account_id=mebe_family.actor_id()) AND revision=0 AND stage IS NULL);
CREATE POLICY family_update ON mebe_family.families FOR UPDATE TO mebe_family_runtime USING(EXISTS (SELECT 1 FROM mebe_family.ownership o WHERE o.family_id=families.id AND o.account_id=mebe_family.actor_id()) OR EXISTS (SELECT 1 FROM mebe_family.memberships m WHERE m.family_id=families.id AND m.account_id=mebe_family.actor_id() AND m.status='active' AND m.role='member')) WITH CHECK(EXISTS (SELECT 1 FROM mebe_family.ownership o WHERE o.family_id=families.id AND o.account_id=mebe_family.actor_id()) OR EXISTS (SELECT 1 FROM mebe_family.memberships m WHERE m.family_id=families.id AND m.account_id=mebe_family.actor_id() AND m.status='active' AND m.role='member'));
CREATE POLICY member_read ON mebe_family.memberships FOR SELECT TO mebe_family_runtime USING(account_id=mebe_family.actor_id() OR EXISTS (SELECT 1 FROM mebe_family.ownership o WHERE o.family_id=memberships.family_id AND o.account_id=mebe_family.actor_id()));
CREATE POLICY member_accept ON mebe_family.memberships FOR INSERT TO mebe_family_runtime WITH CHECK(account_id=mebe_family.actor_id() AND status='active' AND EXISTS (SELECT 1 FROM mebe_family.invitations i WHERE i.family_id=memberships.family_id AND i.account_id=mebe_family.actor_id() AND i.role=memberships.role AND i.expires_at>clock_timestamp()));
CREATE POLICY member_change ON mebe_family.memberships FOR UPDATE TO mebe_family_runtime
 USING(EXISTS (SELECT 1 FROM mebe_family.ownership o WHERE o.family_id=memberships.family_id AND o.account_id=mebe_family.actor_id()) OR (account_id=mebe_family.actor_id() AND status='revoked'))
 WITH CHECK((EXISTS (SELECT 1 FROM mebe_family.ownership o WHERE o.family_id=memberships.family_id AND o.account_id=mebe_family.actor_id()) AND status='revoked') OR (account_id=mebe_family.actor_id() AND status='active' AND EXISTS (SELECT 1 FROM mebe_family.invitations i WHERE i.family_id=memberships.family_id AND i.account_id=mebe_family.actor_id() AND i.role=memberships.role AND i.expires_at>clock_timestamp())));
CREATE POLICY invite_read ON mebe_family.invitations FOR SELECT TO mebe_family_runtime USING(account_id=mebe_family.actor_id() OR EXISTS (SELECT 1 FROM mebe_family.ownership o WHERE o.family_id=invitations.family_id AND o.account_id=mebe_family.actor_id()));
CREATE POLICY invite_create ON mebe_family.invitations FOR INSERT TO mebe_family_runtime WITH CHECK(EXISTS (SELECT 1 FROM mebe_family.ownership o WHERE o.family_id=invitations.family_id AND o.account_id=mebe_family.actor_id()) AND account_id<>mebe_family.actor_id());
CREATE POLICY invite_delete ON mebe_family.invitations FOR DELETE TO mebe_family_runtime USING(account_id=mebe_family.actor_id() OR EXISTS (SELECT 1 FROM mebe_family.ownership o WHERE o.family_id=invitations.family_id AND o.account_id=mebe_family.actor_id()));
COMMIT;
