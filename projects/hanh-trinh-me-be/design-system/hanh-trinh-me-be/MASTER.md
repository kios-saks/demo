# Hành Trình Mẹ & Bé · Master UI/UX design system

**Applied:** 2026-11-23 · revised 2026-11-24 | **Status:** DEV design system / editorial review pending  
**Source:** [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), [SKILL.md](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md), guidance and searchable product/style/UX tables, observed version 2.15.0.  
**Stack:** Next.js 15, React, CSS. This is a **project-specific adaptation** of the external skill's guidance, not a vendor-certified design or generated output of its CLI.

## Design direction

**Pattern:** Search-first family ecosystem + six family journey groups with twelve detailed stages + calm long-form editorial reading.  
**Reference categories:** Knowledge Base/Documentation (minimal, searchable, clear hierarchy) and Healthcare App (accessible & ethical, large readable text, trust and caution).  
**Style:** Warm Editorial + Accessible & Ethical with subtle flat card elevation. Avoid high-animation, neon, dark UI, decorative emoji navigation and unsupported testimonials.

**Primary audiences:** parents and caregivers on mobile (360–430px), family members researching during pregnancy and the first years, and DEV content reviewers reading 6–10 minute draft articles.

## Semantic color system

| Role | Token | Hex | Purpose |
| --- | --- | --- | --- |
| Primary interaction | `--ui-primary` | `#285B46` | CTA, links, selected navigation |
| Primary hover | `--ui-primary-hover` | `#194531` | Hover & press feedback |
| Page background | `--ui-bg` | `#FAF9F5` | Warm cream canvas |
| Paper | `--ui-white` | `#FFFFFF` | Cards, reading surfaces |
| Main text | `--ui-ink` | `#24362D` | Accessible dark green-charcoal |
| Secondary text | `--ui-muted` | `#536459` | Summaries, metadata |
| Emphasis | `--ui-terracotta` | `#9B5042` | Tiny headings/accent, not a button alternative |
| Soft area | `--ui-sage` | `#E9F2E9` | Educational callouts |
| Separators | `--ui-line` | `#DCE5DC` | Clear card boundaries |

Approximate WCAG text contrast values calculated from sRGB: main text on cream **12.15:1**, secondary on cream **5.98:1**, white on primary **7.85:1**, terracotta on cream **5.51:1**. Text and functional controls must not rely on color alone.

## Typography and geometry

- Base body: Be Vietnam Pro (existing site font), system fallback; 16px, ~1.7 line-height for UI, 17px/~1.95 for article paragraphs.
- Editorial headings: Georgia serif fallback for a trustworthy knowledge-publication feel; avoid all-caps text in main copy.
- Long-form reading width: ~72ch or less; sticky chapter index on desktop, collapsed native details table of contents on mobile.
- Spacing: 8px rhythm; 16px mobile gutters; 24–32px content cards, 48–80px section rhythm.
- Touch targets: 44px minimum on forms/nav/chapter links, with explicit focus rings.
- Responsive CSS breakpoints: 480px, 560px, 740–800px, 1024–1050px. Check at 375, 768, 1024 and 1440px.
- Honor `prefers-reduced-motion`; use contextual subtle hover changes only, preserve semantic state without motion.

## Information architecture & protected editorial flow

1. **Homepage:** two-column desktop hero, stacked mobile hero, prominent search, six expandable journey groups with twelve stage links, topic chips, up to six featured article cards for invited readers, and links to personal tools. Public home uses the same hierarchy without rendering drafts.
2. **Stage page:** explicit stage route identity, six matching articles, actionable guidance, interactive local checklist and FAQ. Breadcrumb and return to library.
3. **Search:** Vietnamese accent-insensitive keyword matching, stage filter, URL query, result count, helpful empty state.
4. **Library:** invitation session, no browser auth challenge, all 72 entries available for testers. Separate catalog, homepage and search routes.
5. **Article:** title/read time, quick summary ahead of cover, sticky desktop contents, collapsed mobile contents, related articles, source links, local save and share actions.
6. **Personal space:** explicit stage preference, bookmarks, checklist, and opt-in reading history stored locally; allow clear/reset. Mobile bottom navigation with four destinations. No new child profile, telemetry or backend write.

## Privacy & editorial guardrails

- Never change the rules that hide `draft` and `in_review` material from public routes.
- Do not surface drafts via an unauthenticated API, search indexing, structured data or metadata.
- Preserve existing `noindex`, private/no-store headers and server-validated invitation session; legacy Basic credential remains supported without a browser auth challenge.
- External assets are first-party SVG covers; no unapproved third-party photos, trackers or remote scripts required for the redesign.
- Clinical source links indicate references for independent Vietnamese editorial work, **not** medical approval. Use explicit draft status.

## Implementation files

- `apps/web/app/ui-ux-pro-max.css`: public-facing tokens, visual journey and responsive behavior.
- `apps/web/public/dev-review-pro.css`: same visual vocabulary for protected server-rendered reading room; allow same-origin CSS under a strict CSP.
- `apps/web/lib/stage-visuals.ts`: first-party generated/curated cover asset path mapping.
- `apps/web/app/page.tsx`, `[stage]/page.tsx`, `tim-kiem/page.tsx`, `bai-viet/[slug]/page.tsx`, `layout.tsx`: accessible information architecture.
- `apps/web/lib/dev-preview.ts`, `apps/web/app/dev-review/**`: protected DEV catalog and long-form reading.
- `scripts/web-api-production-smoke.mjs`: regressions for hidden drafts, labels, structural navigation, thumbnails, CSS, section anchors and accessibility hooks.

## Acceptance checks

- [ ] GitHub Actions 5/5 workflows PASS on final HEAD.
- [ ] Render deploy LIVE on matching HEAD; no stale Web version.
- [ ] Public pages show 12 stages and no draft article body.
- [ ] Unauthenticated `/dev-review` returns 404 with no WWW-Authenticate header; authorized reader renders 72 articles.
- [ ] Long-form article has at least 10 sections with anchors and readable inline figures.
- [ ] Search precedes stage tiles, and featured articles are not duplicated in the unfiltered results list.
- [ ] CSS/screen sizes validated with browser at 390px/768px/1024px/1440px; CSS and CI provide a structural baseline, **not a substitute for visual QA**.

## Ecosystem implementation reference · 24/11/2026

- [UX evaluation and ecosystem roadmap](../../docs/ux-evaluation-and-ecosystem-roadmap-2026-11-24.md) — product intent, Desktop/Mobile concepts, roadmap and acceptance gates.
- `apps/web/lib/reader-navigation.ts`: common six group taxonomy and normalized search.
- `apps/web/lib/reader-library.ts`, `apps/web/app/dev-review/nhom/[key]/route.ts`, `apps/web/middleware.ts`: protected reader surfaces and explicit stage routing.
- `apps/web/public/reader-ecosystem.css`, `apps/web/public/reader-local.js`: responsive design and local-only interactions.
- `scripts/reader-browser-smoke.mjs`: Chromium tests at 390/768/1024/1440px, reader journey and guest denial. Browser test outcomes must be read from the actual CI run; do not claim screenshot/visual QA from structural assertions alone.
- Remaining: source-by-claim mapping and clinical review, search synonyms/relevance, real-user usability testing, optimized loading, authenticated account sync and Expo mobile app (separate from mobile Web).
