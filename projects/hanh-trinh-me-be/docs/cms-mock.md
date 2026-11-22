# Sprint P0: Content Management (local mock) — 2026-11-22

## Scope actually implemented

- Demo CMS route: \`/admin\` on Next.js web. Select an article, edit title, summary, reading time, sections, tags and sources. Shows revision, simulated approvals and audit history. Data is obtained from API with role bearer header.
- Dev-only API under \`/v1/admin\` with isolated Writer, Editor, Reviewer shared tokens (dev test keys, not user accounts).
- \`EditorialRepository\` interface (extends \`KnowledgeRepository\`) and \`JsonMockEditorialRepository\` persisted to a single local JSON snapshot at \`.local/editorial-state.json\`, protected from git commits. This is a **single-process mock** with serialized, atomic file replacement, not a multiuser database.
- Workflow: edit draft -> revision increments, prior approvals clear -> submit -> editorial approval by Editor and medical *simulation* by Reviewer -> request changes returns to draft. No publish endpoint and no production CMS.
- HTTP failure modes: missing keys 503, invalid key 401, wrong role 403, stale revision 409, invalid source/content 422, production route 404. Requests to /v1/admin carry \`Cache-Control: no-store\`.
- Production API continues to hide draft content. Site is globally noindex.

## Actual roles

| Role | Read | Edit | Submit | Editorial simulation | Medical simulation | Request changes |
|---|---|---|---|---|---|---|
| Writer | Yes | Yes | Yes | No | No | No |
| Editor | Yes | Yes | Yes | Yes if not self-edited | No | Yes |
| Reviewer | Yes | No | No | No | Yes if not self-edited | No |

Actor IDs are the demo role identifiers, not distinct user accounts. This limitation is important: it cannot verify a clinician or distinguish two editors using the same role token. **Clinical approval here is purely a demonstration and has no medical authority.** Publishing is intentionally unavailable.

## Setup

Use \`cp .env.example .env\` at the project root and fill three independently generated secrets, each >=24 characters, e.g. \`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"\`. Do not use the same token twice. \`npm run dev:api\` loads project-level \`.env\` with Node 22 \`process.loadEnvFile\`. Use \`npm run dev:web\` in a second terminal. Visit http://localhost:3000/admin.

Tests: \`npm test\`, API TypeScript check, Next production build and HTTP smoke in GitHub Actions. No paid services or PostgreSQL required.

## Next production sprint

1. Replace demo role tokens with real users, secure sessions, MFA, verified credentials, access revocation, rate limiting and server-side per-user RBAC.
2. Add immutable CMS revisions + distinct editorial and clinical reviewer identities, authorized credentials, source claim mapping, approval evidence and *separate* publisher policy.
3. Introduce \`PostgresEditorialRepository\` with migrations, transaction/concurrency control, production backups and audited ownership.
4. Integrate Web and Mobile read views through versioned API, remove separate bundled snapshots, add caching and offline support.
5. Add UI end-to-end tests, CSRF/session strategy, pen-test and human clinical/legal review before public launch.

**Known limitations:** no live Web article synchronization, no content creation/deletion, no actual identity provider, no cross-process file coordination, no verified medical reviewer, no production deployment, no device E2E tests.
