# Infographic rollout — 2026-11-23

## Scope

Added 24 unique, source-linked editorial infographic briefs across 12 development stages, exactly 2 per stage. Preserved the 3 manually composed original infographics, bringing the total to **27 in-article illustrations**. All 72 article cover illustrations remain unchanged.

- Briefs: `packages/content/mock/infographic-cards.json`
- Deterministic SVG generator: `scripts/generate-infographics.mjs`
- Media build entrypoint: `npm run generate:media` (calls `scripts/generate-media.mjs` which imports the infographic builder)
- Output (gitignored): `apps/web/public/media/auto-infographic-<article-slug>.svg`
- Content links and transcript: `packages/content/articles.json` (`media.inline[].points`)
- Accessible transcript rendering: public article template and password-guarded DEV reading room
- Protected DEV summary now reports actual cover and infographic counts
- Content gate `scripts/check-content.mjs` enforces 72 distinct covers, 27 inline infographics, 24 manifest-linked diagrams, source membership, exact text transcription, and asset existence
- Web/API production smoke verifies the guarded infographic article, SVG asset response and text alternative

## Editorial guardrails

Every card is an **original, concise list of three discussion/practice prompts**. External URLs are explicitly shown as **further reading**, not as claims that WHO, CDC, UNICEF, NHS or any other publisher has reviewed or endorsed the artwork. The article-level list of sources remains unchanged. No external image is scraped, copied or embedded.

The 24 cards are *draft* editorial material, not medical advice. Medical/clinical statements must be independently checked by a suitably qualified human before publication. The `draft` flags, review status, preview authentication, noindex directives and production article gate remain unchanged.

## State and verification

- GitHub: change is on feature branch `feat/hanh-trinh-me-be-ecosystem` in draft PR #1.
- Supabase private `mebe` schema: 24 new `media.inline` payloads added **only to articles with no existing inline images**, preserving existing CMS edits and three earlier infographics.
- Follow-up database SQL confirmed: `72` articles, `72` covers, `27` articles with inline infographics, `27` total inline infographics, `72` drafts.
- Actual hosted Web delivery must be checked after Render deploy. A successful build is not proof that a browser loaded all images.
- `editorial_revisions` snapshots were not rewritten for the media backfill. Future CMS work should treat media amendments as versioned editorial revisions.
- The image URLs are accessible as static assets even though article drafts are password-gated in the DEV reading room. Do not treat this as a production-ready private-media delivery design.

## Verification commands

```bash
cd projects/hanh-trinh-me-be
npm install --no-audit --no-fund
npm run generate:media
npm run check:content
npm test
npm run build:web
```

## Next work

1. Confirm GitHub Actions and Render Web deploy on latest commit. Check representative SVG requests and password-guarded article pages.
2. Review all 24 infographic text layouts visually on desktop and mobile. Replace prompt-only cards with manually designed illustrations for priority topics when editorially approved.
3. Build role-based CMS upload/revision approval and asset versioning before public release.
4. Establish secure private storage and media moderation for unpublished or user-contributed images.
