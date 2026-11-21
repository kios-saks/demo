# PostgreSQL-ready data interface — mock first

Date: **2026-11-21**. Scope: no real PostgreSQL instance yet. API and server-rendered Web now depend on the \`KnowledgeRepository\` interface, not raw data files.

## Architecture

\`\`\`text
apps/api/src/app.ts (routes) ──> KnowledgeRepository interface
                                   ▲
                              MockKnowledgeRepository
                                   │
                              JSON data snapshot
                                   │
        articles.json + mock/sources.json + mock/topics.json
                          + mock/research-cards.json

Future:
app.ts ──> KnowledgeRepository ◄── PostgresKnowledgeRepository
                                      │
                               pg pool / SQL queries
                                      │
                               PostgreSQL (not provisioned)
\`\`\`

Web server components use \`apps/web/lib/repository.ts\` with the same interface. Later, production Web should call API (session-aware typed HTTP client) rather than opening direct Postgres connections. Mobile app remains an offline JSON reader for this phase; it will use a versioned API and cache next.

## Actual interface

\`\`\`ts
interface KnowledgeRepository {
 readonly provider: "mock" | "postgres";
 listStages(): Promise<Stage[]>;
 getStage(slug: string): Promise<Stage|null>;
 listArticles(q?: ArticleQuery): Promise<Page<ArticleSummary>>;
 getArticle(slug: string): Promise<Article|null>;
 listTopics(stageSlug?: string): Promise<Topic[]>;
 listSources(stageSlug?: string): Promise<SourceReference[]>;
 listResearchCards(query?: ResearchQuery): Promise<ResearchCard[]>;
 getOverview(): Promise<EditorialOverview>;
 getDisclaimer(): Promise<string>;
}
\`\`\`

- Stateless reads only: no create/update/delete before real authentication and editorial RBAC.
- Public production API always filters \`published\` article status; draft-specific API endpoints return 404 outside demo. The Web prototype is noindex but still displays clearly labeled drafts for development use; do not deploy it as a general consumer site yet.
- Mock repository validates seed references on construction, applies accent-insensitive Vietnamese search, pagination and deterministic sorting, and clones returned objects to prevent accidental in-memory writes.
- Inject a test repository into \`buildApp(repo)\` to test behavior independently of database drivers.

## Structured files

| Path | Count | Purpose |
|---|---:|---|
| \`packages/content/articles.json\` | 24 | Original educational drafts linked to 12 stages |
| \`packages/content/mock/topics.json\` | 13 | Topic taxonomy |
| \`packages/content/mock/sources.json\` | 13 | Curated official external reference metadata |
| \`packages/content/mock/research-cards.json\` | 12 | Newly authored Vietnamese topic cards; one per life stage |
| \`packages/content/mock/manifest.json\` | 1 | Dates, origin, rights and review guardrail |

Source catalog fields: id, publisher, title, URL, publicationYear, topic, stageSlugs, accessedAt, language, referenceType, status, usage, clinicalApproval, notice. No source text, child medical records or third-party assets are copied into our data.

## Future adapter checklist

1. Approve schema/permissions. Run reviewed SQL migrations, provision PostgreSQL with backups, TLS, least privilege and secret storage.
2. Implement \`PostgresKnowledgeRepository implements KnowledgeRepository\` in a separate driver package. Parameterize queries; no user-derived raw SQL. Use transaction isolation and typed row mappers.
3. Write a one-off import from JSON with FK validation, idempotency, dry run, rollback and audit.
4. Write contract tests that run against both mock and disposable test PostgreSQL, including result ordering, filtering, pagination, source joins, status protection and null handling.
5. Change only the API composition root to select repository by validated environment variable. Abort startup on unknown adapter.
6. Protect CMS writes through verified auth + RBAC, revision-specific expert approvals, audit log, CSRF protection and rate limits.
7. Do not publish content from mock seed until medical/editorial verification has happened and individual claim-to-source mapping is checked.

## Source and legal boundaries

The source metadata was collected through official webpages accessed 21 Nov 2026. No claim that WHO, CDC, UNICEF or the Vietnamese Ministry of Health endorses this project. Source references guide later expert review; 12 cards are *newly written summaries* of relevant themes and not translations/copy-pastes of source pages.

## Run checks

\`\`\`bash
npm install
npm run check:content
npm test
npm exec -w @mebe/api -- tsc --noEmit
npm run build:web
\`\`\`

Related: \`docs/editorial-policy.md\` and \`docs/database/postgres-schema.sql\`.
