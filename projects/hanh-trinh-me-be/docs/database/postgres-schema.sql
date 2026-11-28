-- PostgreSQL data model proposal, VERSION 001 (NOT EXECUTED).
-- All content is in JSON demo. Do not treat this file as a deployed migration.
-- Run on a fresh PostgreSQL database only after DB/security/reviewer planning.
BEGIN;
CREATE TABLE IF NOT EXISTS knowledge_stages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  icon TEXT NOT NULL,
  range_label TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK(sort_order > 0)
);
CREATE TABLE IF NOT EXISTS knowledge_topics (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK(sort_order > 0),
  editorial_status TEXT NOT NULL DEFAULT 'draft' CHECK (editorial_status IN ('draft','in_review','published','archived'))
);
CREATE TABLE IF NOT EXISTS knowledge_topic_stages (
  topic_id TEXT NOT NULL REFERENCES knowledge_topics(id) ON DELETE CASCADE,
  stage_slug TEXT NOT NULL REFERENCES knowledge_stages(slug) ON DELETE CASCADE,
  PRIMARY KEY(topic_id,stage_slug)
);
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id TEXT PRIMARY KEY,
  publisher TEXT NOT NULL,
  title TEXT NOT NULL,
  original_url TEXT NOT NULL CHECK (original_url ~ '^https://'),
  publication_year TEXT,
  topic TEXT NOT NULL,
  language_code TEXT NOT NULL DEFAULT 'en',
  reference_type TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'reference-collected',
  accessed_at DATE,
  clinical_approval BOOLEAN NOT NULL DEFAULT FALSE,
  rights_notice TEXT NOT NULL,
  CHECK(clinical_approval=FALSE OR review_status='professionally-reviewed')
);
CREATE TABLE IF NOT EXISTS knowledge_source_stages (
  source_id TEXT NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  stage_slug TEXT NOT NULL REFERENCES knowledge_stages(slug) ON DELETE CASCADE,
  PRIMARY KEY(source_id,stage_slug)
);
CREATE TABLE IF NOT EXISTS knowledge_articles (
  slug TEXT PRIMARY KEY,
  stage_slug TEXT NOT NULL REFERENCES knowledge_stages(slug),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  read_minutes INTEGER NOT NULL CHECK(read_minutes > 0),
  sort_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','in_review','published','archived')),
  revision_number INTEGER NOT NULL DEFAULT 1 CHECK(revision_number > 0),
  last_reviewed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  -- Future CMS must store versioned, immutable snapshots + approvals separately.
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  CONSTRAINT require_review_for_published CHECK(status <> 'published' OR (last_reviewed_at IS NOT NULL AND published_at IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS knowledge_article_sources (
  article_slug TEXT NOT NULL REFERENCES knowledge_articles(slug) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES knowledge_sources(id),
  claim_annotation TEXT,
  PRIMARY KEY(article_slug,source_id)
);
CREATE TABLE IF NOT EXISTS knowledge_research_cards (
  id TEXT PRIMARY KEY,
  stage_slug TEXT NOT NULL REFERENCES knowledge_stages(slug),
  topic_id TEXT NOT NULL REFERENCES knowledge_topics(id),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  reader_question TEXT NOT NULL,
  practice_prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','in_review','published','archived')),
  authored_at DATE NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  medical_approval BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK(status <> 'published' OR (reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS knowledge_research_card_sources (
  card_id TEXT NOT NULL REFERENCES knowledge_research_cards(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES knowledge_sources(id),
  PRIMARY KEY(card_id,source_id)
);
CREATE TABLE IF NOT EXISTS editorial_review_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  article_slug TEXT NOT NULL REFERENCES knowledge_articles(slug),
  revision_number INTEGER NOT NULL CHECK(revision_number > 0),
  reviewer_identifier TEXT NOT NULL,
  reviewer_role TEXT NOT NULL CHECK(reviewer_role IN ('editor','medical_reviewer','legal_reviewer')),
  decision TEXT NOT NULL CHECK(decision IN ('approved','rejected','changes_requested')),
  reviewer_note TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_articles_stage_status ON knowledge_articles(stage_slug,status,sort_order);
CREATE INDEX IF NOT EXISTS idx_articles_search ON knowledge_articles USING GIN (to_tsvector('simple',coalesce(title,'')||' '||coalesce(summary,'')));
CREATE INDEX IF NOT EXISTS idx_sources_publisher ON knowledge_sources(publisher);
CREATE INDEX IF NOT EXISTS idx_cards_stage_status ON knowledge_research_cards(stage_slug,status);
COMMIT;
