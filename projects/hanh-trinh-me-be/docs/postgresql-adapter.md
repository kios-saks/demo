# PostgreSQL adapter, migration and QA

## What is real

\`PostgresEditorialRepository\` implements **both** \`KnowledgeRepository\` and \`EditorialRepository\`. It talks to PostgreSQL using \`pg\`, parameterized statements, row-level locks (\`FOR UPDATE\`), single-client transactions and version checks. There are no in-memory fallback reads in PostgreSQL mode. All API routes, including demo CMS endpoints, use the same repository.

Tables are created through \`database/migrations/001_init.sql\`, applied by a transaction-safe migration runner with SHA-256 checksum tracking. \`apps/api/src/db/seed.ts\` is an idempotent seed importer that inserts stages, topics, sources, original draft articles, research cards, and their associations. Original 24 articles, 12 stages, 13 topics, 13 sources and 12 draft research cards are retained.

## Development setup

Prerequisites: Node.js 22+, npm, Docker Engine and Docker Compose.

1. Run \`docker compose -f compose.postgres.yml up -d\` inside project root. The compose example binds PostgreSQL only on \`127.0.0.1:5432\`, with local-example credentials.
2. Copy \`.env.example\` to \`.env\`, change \`CONTENT_PROVIDER=postgres\`, set \`DATABASE_URL=postgresql://mebe:local-only-change-me@127.0.0.1:5432/mebe\`.
3. Run \`npm install && npm run db:migrate && npm run db:seed\`. Both operations are safe to rerun. Do not change applied SQL files in place; add versioned migrations.
4. Start \`npm run dev:api\` and \`npm run dev:web\` in separate terminals. API health will indicate \`provider: "postgres"\`.
5. \`/admin\` remains only a **development demo**, requiring three strong role-specific keys. It writes SQL-backed edits, approval simulations and audit events. Content browser pages are still using static seed in Web; Web/Mobile read API sync is a different sprint.

\`npm run test:postgres\` runs against DATABASE_URL and **modifies the connected test DB**. Do not point these tests at production or any valuable database. GitHub Actions isolates them in an ephemeral PostgreSQL 16 container.

## Data tables and safety

- \`knowledge_stages\`, \`knowledge_topics\`, \`knowledge_topic_stages\`.
- \`knowledge_sources\`, \`knowledge_source_stages\`.
- \`knowledge_articles\` keeps an indexable search text, the canonical article JSONB, revision and workflow state. SQL constraints disallow published until a future verified production publishing migration.
- \`knowledge_research_cards\`, \`knowledge_card_sources\`.
- \`editorial_revisions\` (one immutable JSON snapshot per article revision), \`editorial_events\` (append-only activity log). Edits reset approvals; reviewers cannot self-approve; stale revision updates reject with 409.
- \`app_settings\` stores content version/disclaimer, \`schema_migrations\` prevents migration rewriting.

The first seed uses \`ON CONFLICT DO NOTHING\`; reimport doesn't replace user-edited drafts, previous revisions, and reviewer events. All values are passed as SQL parameters. Source metadata is curated reference metadata, not licensed scraped article content.

## Boundaries

This phase proves a **real local/CI PostgreSQL backend**; it does not create a persistent hosted DB, manage secrets, backup production data, or verify clinicians. No permanent server, public CMS, auth provider, publish approval or secure private household data exists yet. The system should not be exposed publicly as a clinical content service.

For permanent production: choose a provider/region, set up encrypted TLS access and restricted database roles, backups/PITR, monitoring, secrets manager, proper CMS identity/MFA, clinical review and deployment pipeline. Verify and approve the domain before cutover.
