CREATE TABLE IF NOT EXISTS media_import_catalog (
 logical_path text PRIMARY KEY,
 asset_id text NOT NULL REFERENCES media_assets(id),
 usage text NOT NULL CHECK (usage IN ('review_archive','legacy_source')),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE media_import_catalog ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE media_import_catalog FROM PUBLIC;
