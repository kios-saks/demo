# S03-09 — Không gian gia đình và tài khoản
Status: implementation started, fixture-only access-policy foundation. No live migration, API wiring, auth service configuration or deployment yet.
Architecture: Fastify API buildApp composes repositories; keep family domain separate from editorial KnowledgeRepository and CMS credentials. Next.js reader remains anonymous on designated DEV; family endpoints require separately verified account identity. Production and Mobile unchanged.
## Proposed access design (review before wiring)
Owner: read/write shared journey, manage invitations/membership; member: read/write journey; viewer: read only. No access for anonymous, pending or revoked membership, wrong tenant, unknown action/role. Authorization is based on verified principal + current server-side membership scoped to exact family ID, never caller-supplied role. No family ownership transfer or last-owner removal in initial scope; account/membership creation transactional. The pure policy is only a foundation, not an authentication implementation.
## Delivery sequence
- [x] Read current composition and establish role/tenant policy + fixture unit tests.
- [ ] Verify CI for policy; design identity verification (prefer established auth, no homemade password/session implementation).
- [ ] Define family repository + isolated mock fixtures, account onboarding/session revocation, membership/invitation lifecycle, consent.
- [ ] Enforce authorization on every route and data query; include cross-family read/write, spoofed identity, revoked membership, concurrent membership changes, audit and export/delete tests.
- [ ] Web account + family UX; preserve guest reader/local-first and opt-in migration of local preferences. No child medical information or DOB collected by default.
- [ ] Draft schema migration and test in isolated database only; review RLS/least privilege and rollback before owner approval of actual database changes.
- [ ] CI and live DEV acceptance once approved. No production publishing.
