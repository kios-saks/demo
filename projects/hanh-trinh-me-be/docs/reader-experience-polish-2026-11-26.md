# Reader experience polish

Scope: reader-visible labels, live-style Vietnamese copy, captions, learning coverage and source page. Remove synthetic family navigation, retain explicit synthetic warnings on direct demo route and actual account links only when configured. Add homepage A–Z link under existing service gate. Keep all 219 content payloads, media assets/revisions, approval statuses, auth, noindex and Production gate unchanged; no database mutation. Preserve medical limitations and AI illustration disclosures. School section describes selection criteria and official links, not an unimplemented directory. Browser QA adds reader copy assertions; existing content/safety checks retained. Post-deploy workflow runner pinned to Ubuntu 24.04. CI/live verification complete.

## Nghiệm thu kỹ thuật DEV — 26/11/2026

- Commit 16b8762: CI 4/4 workflows, 5/5 integration jobs PASS; production gate PASS.
- Render deployment dep-dc3soe3l550s73fgalng LIVE lúc 13:07:25 ICT; COMBINED_API_READY, COMBINED_DEV_READY, DEV_CMS_SMOKE_PASS, DEV_OPEN_READER_SMOKE_PASS trên instance h5frf.
- [Post-deploy QA](https://github.com/kios-saks/demo/actions/runs/45765933955): READER_POLISH_READY, DEV_LIFE_COURSE_219_PASS (72 + 21 + 126; 12 chặng), 6 HTTP PASS/0 FAIL/1 SKIP (thiếu token preview riêng). Không mở Production hoặc xác nhận thẩm định chuyên môn.
- [Sơ đồ website](web-sitemap-and-architecture-2026-11-26.md) · [PR evidence](https://github.com/kios-saks/demo/pull/1#issuecomment-7184181175).
