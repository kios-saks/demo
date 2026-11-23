# Long-form editorial content rollout — 2026-11-23

## Scope delivered

Eight article drafts have been expanded from approximately 170–390 words to 976–1,241 Vietnamese words each, across **10 sections per article**. Existing opening, citation/disclaimer sections and media references were preserved.

| Editorial category | Article slug | Approx. words |
|---|---|---:|
| Before pregnancy | `hen-tu-van-tien-thai` | 1,089 |
| Before pregnancy | `axit-folic-truoc-khi-mang-thai` | 1,177 |
| Early pregnancy | `om-nghen-va-an-uong-dau-thai-ky` | 1,171 |
| Postpartum | `hoi-phuc-sau-sinh-mo-va-sinh-thuong` | 1,212 |
| Newborn | `ngu-an-toan-cho-tre-so-sinh` | 1,181 |
| Complementary feeding | `an-dam-khi-nao-bat-dau` | 1,241 |
| Feeding safety | `an-toan-chong-sac-khi-an-dam` | 1,200 |
| Responsive interaction | `choi-va-tuong-tac-voi-be` | 976 |

## Reading experience

- Password-gated `/dev-review` features an **8-item detailed reading shelf** and identifies these articles as **CHUYÊN SÂU • BẢN NHÁP**.
- Each article page includes the ten chapter headings in its table of contents, original media, stage checklist, related reading and linked source references.
- Reading time is updated to 6–7 minutes depending on article length. These are estimates.
- Public Web remains draft-hidden; draft articles must not become public just because detail has improved.

## Source provenance and review

The authored Vietnamese text was newly composed using official CDC, WHO and NHS guidance as background reading. Relevant supporting topics include CDC folic acid 400 mcg, CDC infant safe sleep, WHO complementary feeding at about six months, NHS food preparation / choking, NHS pregnancy sickness and caesarean recovery, and CDC maternal warning signs. Original source URLs remain attached to articles; four additional NHS source references were added to the shared source register and to the matching drafts.

**Clinical review is pending.** These drafts are not certified medical guidance. Do not auto-publish or index any article. Clinical reviewers should verify timing, age ranges, local Vietnam emergency pathways, drug and supplement guidance, and first aid implications against current standards before publication.

## Supabase DEV sync

- Updated 8 articles only when the exact previous four-section snapshot matched the database, the expected revision matched, and status was `draft` with no pending submission or approval.
- Only updated `sections`, `readMinutes` and added missing `sources`; existing cover and infographic metadata, tags and summaries were retained.
- Every successful change incremented `knowledge_articles.revision`, wrote a new snapshot to `editorial_revisions`, and wrote an `editorial_events` edit entry with actor `editorial-deepening-2026-11-23`.
- A separate database verification confirmed **8/8 updated drafts** have ten chapters, current snapshots and audit events.
- No role, review-approval, public status, RLS or storage policies were changed.

## Quality gates

The `packages/content/mock/deep-articles.json` manifest maintains the pilot list and word thresholds. `npm run check:content` checks that each has at least ten unique headings, 900–1,000+ Vietnamese words, sufficient reading time, named sources and `draft` status. Production Web API smoke now checks that deep content really renders in the private reader and remains private for guests.

## Next phase

**64 other drafts remain shorter and require editorial development**, with topical prioritization rather than padding for word count. Work through pregnancy, newborn, 0–12 months and early childhood next; assign clinical reviewer, cite individual claims and record approval in CMS before any public release.
