# Codex / coding agent instructions — Hành Trình Mẹ & Bé

Scope: `projects/hanh-trinh-me-be/` inside `kios-saks/demo`. Stay on feature branch `feat/hanh-trinh-me-be-ecosystem`. Do not merge PR #1 or create a new repository without explicit user direction.

## Product objective
Develop a Vietnamese-language knowledge ecosystem spanning preconception, pregnancy, postpartum, infancy, childhood, adolescence and adulthood. The current prototype includes Next.js web, Expo React Native mobile, Fastify read-only API, 12 stage hubs, 24 sample draft articles, and marketing docs.

## Quality gates
1. From this directory run `npm install`, `npm run check:content`, `npm test`, `npm exec -w @mebe/api -- tsc --noEmit`, `npm exec -w @mebe/mobile -- tsc --noEmit`, `npm run build:web`.
2. After build, run `npm exec -w @mebe/api -- tsx src/server.ts` and `npm run start -w @mebe/web` in separate terminals, then `node scripts/http-smoke.mjs`.
3. For changes, write/adjust tests first, run targeted checks, then all gates. Re-run GitHub Actions.
4. Keep public-facing page semantics, Vietnamese typography, keyboard accessibility, color contrast, responsive behavior and SEO metadata.
5. Never mark content reviewed without qualified human reviewer. Preserve draft noindex behavior. No automated diagnosis, medical treatment advice, or fear-driven ads.
6. Do not introduce child profiles or sensitive health analytics before consent/legal/security review. Don't commit secrets.
7. Document actual commands, build exit codes, test evidence and remaining known issues in PR description or `docs/qa-report.md`; never claim unexecuted tests passed.

## Priorities
P0: build is green, integration smoke tests, server/client data consistency, editorial approval process, accessible UI.
P1: production CMS with authenticated RBAC, revisions/medical review workflow, mobile sync/offline caching and privacy-safe bookmarks.
P2: optional user accounts, private timeline, notifications, marketing integrations, affiliate with disclosure, source-grounded AI search.

Monorepo starts in a subfolder; use `cd projects/hanh-trinh-me-be` before npm tasks.
