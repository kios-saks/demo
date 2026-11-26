# UX-01 — Knowledge Hub V2 candidate
Baseline 72f5b3b (docs), app 16b8762. Status: implemented candidate, CI and live QA pending.

- One protected Combined DEV entry /kham-pha: six life-stage groups, 12 stages, all 219 IDs, no default baby; legacy metadata through existing live reader, no snapshot fallback if live media mode requires Supabase. Index validates 72+126+21, 192 cells/173 applicable/19 not-priority, each reference exactly one, legacy mapping, draft status.
- Stable URL /kien-thuc/:kind/:id returns 307 to current reader. Legacy /bai-viet/:slug remains, A–Z /hoc-cung-con?stage=…#az-ID/#lesson-ID restores stage and opens detail. Old /thu-vien, /tim-kiem, stage, /da-luu, /hanh-trinh remain unchanged. UX-02 search, UX-05 advanced filters, UX-06 common detail, UX-07/08 personal functionality pending.
- New routes require exact owner-approved Combined DEV plus existing reader guard; noindex/no-store, 404 on other service/Production even if old preview cookie present. No existing CMS/raw preview policy changes. One primary Explore entry in both navigation variants on designated DEV; subordinate older links preserved. Closed preview remains unchanged; UX-04 full shell pending.
- No changes to content JSON, sources, media, revisions, draft/approval, database or Production.
- Precommit pure-index evaluation over actual Git data verified 219 IDs and destinations, groups 32/51/53/19/32/32, corrupt missing/published data rejected. This is not native Node/Chromium CI.
- CI adds knowledge-index.test.mjs, dynamic reader fixture, Production route denials and isolated Chromium hub smoke (219 IDs/aliases, 6 groups/12 stages, 3 widths, legacy hash + reload per stage/kind representative). Post-deploy workflow additionally runs new hub smoke without removing previous 219 QA.
- AC01.1/2/3 pending actual CI and live QA; no final PASS yet.
