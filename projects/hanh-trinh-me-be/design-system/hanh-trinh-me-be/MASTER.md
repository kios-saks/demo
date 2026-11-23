# Hành Trình Mẹ & Bé · Master UI/UX design system

**Applied:** 2026-11-23 | **Status:** DEV design system / editorial review pending  
**Source:** [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), [SKILL.md](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md), guidance and searchable product/style/UX tables, observed version 2.15.0.  
**Stack:** Next.js 15, React, CSS. This is a **project-specific adaptation** of the external skill's guidance, not a vendor-certified design or generated output of its CLI.

## Design direction

**Pattern:** Search-first family knowledge base + stage-based visual navigation + calm long-form editorial reading.  
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
- Long-form reading width: ~72ch or less; sticky chapter index on desktop, visible expanded section navigation on mobile.
- Spacing: 8px rhythm; 16px mobile gutters; 24–32px content cards, 48–80px section rhythm.
- Touch targets: 44px minimum on forms/nav/chapter links, with explicit focus rings.
- Responsive CSS breakpoints: 480px, 560px, 740–800px, 1024–1050px. Check at 375, 768, 1024 and 1440px.
- Honor `prefers-reduced-motion`; use contextual subtle hover changes only, preserve semantic state without motion.

## Information architecture & protected editorial flow

1. **Homepage:** a clear value proposition, search above the fold, twelve image-backed stage choices, three topical paths, source/transparency explanation and a thoughtful empty state while content remains unpublished.
2. **Stage page:** single-stage explainer/visual + breadcrumb, plus meaningful route to the private editorial preview if the server has the preview token.
3. **Search:** persistent query in URL, stage filter, clear-results count, helpful empty state with an optional deep link to protected DEV search. Public search cannot leak draft body content.
4. **DEV index:** private Basic-auth reader. Search first, eight featured deep articles, twelve stage tiles, grouped remainder. Avoid duplicating featured articles in the unfiltered list.
5. **DEV article detail:** clear title and read time, source disclosure, cover and inline infographic, anchored 10-section table of contents, FAQ/checklists/related articles and original sources. Keep media text alternatives.
6. **Published article experience (for future use):** navigable chapter TOC on desktop and a mobile native `details` pattern.

## Privacy & editorial guardrails

- Never change the rules that hide `draft` and `in_review` material from public routes.
- Do not surface drafts via an unauthenticated API, search indexing, structured data or metadata.
- Preserve existing `noindex`, Basic authentication and private/no-store headers.
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
- [ ] Unauthenticated `/dev-review` returns 401; authorized reader renders 72 articles.
- [ ] Long-form article has at least 10 sections with anchors and readable inline figures.
- [ ] Search precedes stage tiles, and featured articles are not duplicated in the unfiltered results list.
- [ ] CSS/screen sizes validated with browser at 375px/768px/1024px/1440px; CSS and CI provide a structural baseline, **not a substitute for visual QA**.
