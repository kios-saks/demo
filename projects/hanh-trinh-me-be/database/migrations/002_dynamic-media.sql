-- Additive schema, compatible with the initial DEV Supabase migration.
CREATE TABLE IF NOT EXISTS media_assets (
 id text PRIMARY KEY CHECK (id ~ '^[0-9a-f]{64}$'), object_path text NOT NULL UNIQUE,
 mime_type text NOT NULL CHECK (mime_type IN ('image/webp','image/png','image/jpeg','image/svg+xml')),
 byte_size integer NOT NULL CHECK (byte_size BETWEEN 1 AND 2097152),
 width integer NOT NULL CHECK(width BETWEEN 1 AND 8192), height integer NOT NULL CHECK(height BETWEEN 1 AND 8192),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS media_revisions (
 article_slug text NOT NULL REFERENCES knowledge_articles(slug), slot text NOT NULL CHECK(slot IN ('cover','inline')),
 revision integer NOT NULL CHECK(revision>0), asset_id text NOT NULL REFERENCES media_assets(id),
 alt text NOT NULL CHECK(length(alt) BETWEEN 1 AND 500), caption text NOT NULL CHECK(length(caption) BETWEEN 1 AND 1000),
 provenance text NOT NULL CHECK(length(provenance) BETWEEN 1 AND 2000), after_section integer, anchor_heading text,
 review_status text NOT NULL DEFAULT 'pending' CHECK(review_status IN ('pending','dev_context_only','dev_approved')),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((slot='cover' AND after_section IS NULL AND anchor_heading IS NULL) OR
 (slot='inline' AND after_section>=0 AND anchor_heading IS NOT NULL)),
 PRIMARY KEY(article_slug,slot,revision)
);
CREATE TABLE IF NOT EXISTS article_media (
 article_slug text NOT NULL, slot text NOT NULL, revision integer NOT NULL,
 PRIMARY KEY(article_slug,slot), FOREIGN KEY(article_slug,slot,revision) REFERENCES media_revisions(article_slug,slot,revision)
);
CREATE TABLE IF NOT EXISTS media_review_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, article_slug text NOT NULL, slot text NOT NULL, revision integer NOT NULL,
 action text NOT NULL CHECK(action IN ('upload','approve','rollback','request_changes')),
 actor_role text NOT NULL CHECK(actor_role IN ('editor','reviewer')), note text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(article_slug,slot,revision) REFERENCES media_revisions(article_slug,slot,revision)
);
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_review_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE media_assets,media_revisions,article_media,media_review_events FROM PUBLIC;
