-- 001: PostgreSQL-backed read models and simulated editorial workflow.
-- All public content is seeded as DRAFT. No publish route or verified clinician system exists.
CREATE TABLE app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);
CREATE TABLE knowledge_stages (
  slug text PRIMARY KEY,
  title text NOT NULL,
  icon text NOT NULL,
  range_label text NOT NULL,
  description text NOT NULL,
  sort_order integer NOT NULL CHECK (sort_order > 0)
);
CREATE TABLE knowledge_topics (
  id text PRIMARY KEY,
  data jsonb NOT NULL
);
CREATE TABLE knowledge_topic_stages (
  topic_id text NOT NULL REFERENCES knowledge_topics(id) ON DELETE CASCADE,
  stage_slug text NOT NULL REFERENCES knowledge_stages(slug) ON DELETE CASCADE,
  PRIMARY KEY (topic_id,stage_slug)
);
CREATE TABLE knowledge_sources (
  id text PRIMARY KEY,
  data jsonb NOT NULL
);
CREATE TABLE knowledge_source_stages (
  source_id text NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  stage_slug text NOT NULL REFERENCES knowledge_stages(slug) ON DELETE CASCADE,
  PRIMARY KEY (source_id,stage_slug)
);
CREATE TABLE knowledge_articles (
  slug text PRIMARY KEY,
  stage_slug text NOT NULL REFERENCES knowledge_stages(slug),
  sort_order integer NOT NULL CHECK(sort_order>0),
  status text NOT NULL CHECK(status IN ('draft','in_review','archived')),
  search_text text NOT NULL DEFAULT '',
  payload jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1 CHECK(revision>0),
  last_editor_id text NOT NULL DEFAULT 'seed-import',
  submitted_revision integer,
  editorial_approval jsonb,
  medical_approval jsonb,
  updated_at timestamptz,
  CHECK(submitted_revision IS NULL OR submitted_revision=revision)
);
CREATE INDEX idx_articles_stage_order ON knowledge_articles(stage_slug,sort_order,slug);
CREATE INDEX idx_articles_status ON knowledge_articles(status);
CREATE INDEX idx_articles_search ON knowledge_articles(search_text text_pattern_ops);
CREATE TABLE knowledge_research_cards (
  id text PRIMARY KEY,
  stage_slug text NOT NULL REFERENCES knowledge_stages(slug),
  topic_id text NOT NULL REFERENCES knowledge_topics(id),
  data jsonb NOT NULL
);
CREATE TABLE knowledge_card_sources (
  card_id text NOT NULL REFERENCES knowledge_research_cards(id) ON DELETE CASCADE,
  source_id text NOT NULL REFERENCES knowledge_sources(id),
  PRIMARY KEY(card_id,source_id)
);
CREATE TABLE editorial_revisions (
  article_slug text NOT NULL REFERENCES knowledge_articles(slug) ON DELETE CASCADE,
  revision integer NOT NULL CHECK(revision>0),
  snapshot jsonb NOT NULL,
  editor_id text NOT NULL,
  written_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(article_slug,revision)
);
CREATE TABLE editorial_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  article_slug text NOT NULL REFERENCES knowledge_articles(slug) ON DELETE CASCADE,
  sequence integer NOT NULL CHECK(sequence>0),
  action text NOT NULL CHECK(action IN ('edit','submit','editorial_approve','medical_approve','request_changes')),
  actor_id text NOT NULL,
  role text NOT NULL CHECK(role IN ('writer','editor','reviewer')),
  revision integer NOT NULL CHECK(revision>0),
  happened_at timestamptz NOT NULL DEFAULT now(),
  note text,
  UNIQUE(article_slug,sequence)
);
CREATE INDEX idx_events_article_order ON editorial_events(article_slug,sequence);
