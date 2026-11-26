# Content Pipeline Recovery — 2026-11-26
Base de9126fd2a562c6c845717c924493f2c26ac7e0b · DEV only, not publication-ready.

## CI evidence
Run [45746734666](https://github.com/kios-saks/demo/actions/runs/45746734666), three jobs PASS; Content validation (job 139664498514) fails generator old structure 11 != 12. Web API job 139664498468: production SSR draft gate and authenticated reader 72 PASS; browser fails lich-kham-thai-ba-thang-dau at 390px. Its curated non-editorial infographic falls through to base CSS without object-fit; add explicit contain for all infographic images (authenticated and standard routes). Existing browser assertions remain; diagnostic identifies offending src/fit. Browser rerun required to confirm.

## Fixes
- QA-CONTENT-01: current content + revision ledger/inventory canonical for revised articles. Keep 64 historical briefs and eight pilots; do not regenerate removed shared sections. Validate added section, absent removed headings, source coverage, counts, draft, >=900 words, >=10 sections, readMinutes >=5. Generation no-op on revised content.
- QA-CONTENT-02: 14 topic-specific additions to existing revised sections, no section reorder/media/source edits; retain thresholds and historical counts; recovery ledger records new counts. Reading time recalculated for 14 only.
- QA-CONTENT-03: 42 missing URLs, 53 guides affected, synchronize central registry from existing article review evidence (including search-only/overview; no new network verification). No clinical approval or publication change.
- Reader: base infographic object-fit contain, existing viewport checks kept; no auth or production gate change.

| Article | Before | After |
|---|---:|---:|
| cuoc-tro-chuyen-truoc-khi-co-con | 890 | 1011 |
| lan-kham-thai-dau-tien | 881 | 993 |
| cam-xuc-dau-thai-ky | 878 | 991 |
| nhat-ky-thai-ky | 843 | 967 |
| dong-hanh-khi-mang-thai | 834 | 954 |
| tui-do-di-sinh | 848 | 962 |
| ke-hoach-ho-tro-sau-sinh | 817 | 942 |
| nguoi-me-cung-can-duoc-cham-soc | 840 | 963 |
| chia-viec-trong-gia-dinh | 813 | 938 |
| lam-quen-nhip-sinh-hoat-so-sinh | 837 | 963 |
| nhung-cau-hoi-khi-cham-be | 817 | 942 |
| moc-phat-trien-khong-phai-cuoc-dua | 853 | 973 |
| hoc-thong-qua-choi | 898 | 1009 |
| chuan-bi-ngay-dau-di-hoc | 881 | 996 |

## Verification
- [x] Direct JS validation: 72 legacy >=900, 10+ sections, registry coverage, revision and inventory integrity; no out-of-scope changes, same media; script syntax checked in V8.
- [x] Added regression test; existing 219 suite remains in workflow.
- [ ] Full Node/CI, browser, Combined DEV acceptance. Do not close QA before CI.
- [ ] Deployment branch reconciliation: Combined DEV tracks feat/hanh-trinh-me-be-ecosystem, autoDeployTrigger checksPass; fix is on feat/mebe-s04-age-learning. No merge, branch change, database writes or deploy until CI verified and compatible handoff. PR #1 stays Draft. Production gate untouched.

## Follow-up: curated registry root cause
- The reader fallback was triggered because the maternal warning infographic registry retained the previous CDC path ending in /, while the revised article cites /index.html. Update only registry sourceUrl to the exact article source; retain original SVG, curated points and portrait image. Add generator exact-source guard, three-curated-entry regression, and browser assertions for all 27 portrait infographics and transcripts. The generic object-fit fix stays in place for legitimate fallback assets. Both commits require final CI before Combined DEV.
