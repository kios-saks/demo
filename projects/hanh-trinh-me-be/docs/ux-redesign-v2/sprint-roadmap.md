# Sprint UX Redesign V2 — roadmap và nghiệm thu
**Trạng thái: IN PROGRESS · UX-01–UX-08 CLOSED trong phạm vi DEV, 8/10 nghiệm thu.** Thiết kế ở mức low fidelity; không tự đóng ticket vì có tài liệu. App baseline 16b8762. Mỗi hạng mục sau phê duyệt cần PR nhỏ, kiểm thử, bằng chứng trước/ sau. P0 là kiến trúc và khả năng tìm, P1 là chiều sâu, chất lượng và nghiên cứu; UX-09/10 bắt đầu baseline từ đầu, không chờ cuối.

## Roadmap theo dependency
| Đợt | Mục tiêu | Hạng mục | Gate trước chuyển tiếp |
|---|---|---|---|
| 0 — Design review | Chốt IA, wireframe, scope, baseline nhiệm vụ | UX-01 thiết kế, UX-09/10 baseline | Chủ dự án duyệt route/mapping và tiêu chí |
| 1 — Unified hub | Identity/index, shell, URL-state | UX-01, UX-02, UX-04 | 219 duy nhất, route tương thích, security test |
| 2 — Discovery | Homepage và explore mobile-first | UX-03, UX-05 | Search/filter/back và responsive PASS |
| 3 — Reading & return | Detail, lưu, journey, privacy | UX-06, UX-07, UX-08 | 219 detail links và migration/local privacy PASS |
| 4 — Validation | Accessibility, hiệu năng, nghiên cứu nhiệm vụ, fix | UX-09, UX-10 | Regression + postdeploy đúng SHA + owner review |

Không gán ngày lịch/nhân sự khi chưa biết capacity. Owner đề xuất: Product/UX (IA, prototype, test), FE (shell/reader/state), BE/Data (index/contract và quyền), QA (evidence), chuyên môn nội dung (giới hạn/nguồn). Có thể một người kiêm nhiều vai trò.

## Checklist nghiệm thu từng hạng mục
### UX-01 · P0 · Kiến trúc thông tin
- [x] AC01.1: 219 stable identity kind:id = 72 legacy + 21 lesson + 126 article, unique, giữ 12 chặng/16 chủ đề/192 ô và mapping stage legacy; không mất nguồn hoặc nhân bản. Evidence: inventory invariant tests.
- [x] AC01.2: một entry Khám phá, 6 nhóm tuổi dễ quét, không mặc định baby khi chưa chọn; route map owner duyệt, tất cả URL cũ và hash được kiểm thử (guest authorized DEV, unauthorized Production).
- [x] AC01.3: matrix nội bộ, CMS/demo không lộ trên menu; schema, draft gates và payload không sửa. Evidence: route tests và diff.
Dependency: none; gate kỹ thuật UX-01 đã đạt, mở dependency UX-02–08 theo thứ tự roadmap.

**UX-01 CLOSED — technical DEV acceptance (26/11/2026):** [báo cáo triển khai và nghiệm thu](ux-01-implementation.md). App `8b44343` LIVE, QA `af9390c` CI 4/4, [post-deploy run 45774886258](https://github.com/kios-saks/demo/actions/runs/45774886258): 219 refs/aliases, 6 groups, 12 stages, 19 hash samples. Kiểm thử authenticated preview riêng SKIP do thiếu token; không thay thế bằng PASS. Production gate đóng; PR #1 vẫn Draft. Phạm vi nghiệm thu kỹ thuật theo yêu cầu chủ dự án, không đồng nghĩa duyệt toàn bộ thiết kế hoặc chuyên môn nội dung.

### UX-02 · P0 · Unified search
- [x] AC02.1: index đủ 219 từ nguồn hợp lệ, title/summary/topics/stage + nội dung phù hợp; legacy lấy live, không fallback draft trái phép; mỗi ID đúng một kết quả. Evidence: app `3b4c52f`, batch legacy 72 (full-text), 219 unique refs, [LIVE QA 45785858483](https://github.com/kios-saks/demo/actions/runs/45785858483), unit and PostgreSQL integration PASS.
- [x] AC02.2: normalize dấu/đ, exact title > title tokens > tags/summary > body, synonym curated (ăn dặm, dậy thì, AI, tài chính, tuổi già), typo có ngưỡng; không sinh câu trả lời y tế. Cố định ≥30 query fixtures (≥10 mỗi kind, có dấu/không dấu, synonym, typo, zero result) cùng expected top 3 do UX/content duyệt; ≥90% truy vấn có đáp án đúng trong top 3 và 100% exact title unique tìm đúng.
- [x] AC02.3: filter age/topic/kind hợp lệ, clear, URL + browser history, empty/error khác nhau, không lộ raw data/token/nhạy cảm, không log query cá nhân. Evidence: unit/integration + live test. CLOSED (Combined DEV-only, owner scope acceptance 26/11/2026): technical safeguards and synthetic canary PASS; legacy GET compatibility retained; strict infrastructure logging/redaction/retention not verified, transferred to mandatory Production Release Blocker PRB-UX02-PRIVACY (OPEN). Không coi ngoại lệ phạm vi DEV là strict privacy PASS.
Dependency: UX-01.

**UX-02 CLOSED — Combined DEV-only acceptance (26/11/2026):** App `3b4c52f` LIVE; CI `1c2d968` 5/5 PASS; [QA 45788595455](https://github.com/kios-saks/demo/actions/runs/45788595455) PASS 219 refs, 72 legacy full-text, privatePost:true, synthetic GET/POST HTTP 200. AC02.1 CLOSED; AC02.2 CLOSED (40 approved fixtures V1, Top 3 40/40, exact title 219/219); AC02.3 CLOSED trong phạm vi Combined DEV theo quyết định chủ dự án, giữ URL cũ. Strict privacy hạ tầng chưa xác minh: PRB-UX02-PRIVACY OPEN/BLOCKING trước Production. Authenticated preview SKIP thiếu token, không đổi thành PASS. [Final review](ux-02-final-review.md). Sprint 2/10 CLOSED, UX-03 tiếp theo. Production gate CLOSED; PR #1 Draft.

### UX-03 · P0 · Homepage
- [x] AC03.1: ở 390×844, search và lối chọn nhóm tuổi nhận biết không cần cuộn quá một viewport; không hero quá cao, không pop-up/ép đăng nhập; có đường đến A–Z và tìm kiếm chính.
- [x] AC03.2: chưa chọn sở thích → gợi ý chung; đã chọn → gợi ý liên quan và tiếp tục đọc nếu opt-in. Không tạo bài giả/trending nếu không có số liệu.
- [x] AC03.3: 5 nhiệm vụ phổ biến (ăn dặm, dậy thì, AI, tài chính, tuổi già) có đường đến bài ≤3 thao tác chính từ home qua search/chọn nhóm; đo UX-10. Evidence: desktop/mobile browser flows.
Dependency: UX-01/02/04.

**UX-03 CLOSED — Combined DEV technical acceptance (26/11/2026):** [audit / implementation / final acceptance](ux-03-implementation.md). App `68f3d01` LIVE; CI `edaf716` 5/5 PASS. [LIVE QA 45798534809](https://github.com/kios-saks/demo/actions/runs/45798534809): AC03.1 search bottom 307.16px, age bottom 706.59px ≤ visible 783px at 390×844, 4 widths, no overflow/modal; AC03.2 real general/personalized recommendations, explicit opt-in, legacy recent history, reset/clear PASS; AC03.3 10/10 browser task flows at 390/1440, 2 principal actions each. UX03_HOMEPAGE_BROWSER_PASS and UX01/02 regressions PASS. UX-10 human usability study remains required; A–Z history expansion remains UX-07/08. Authenticated preview SKIP missing token. Sprint 3/10 CLOSED; UX-04 next. Production gate CLOSED, PRB-UX02-PRIVACY OPEN/BLOCKING, PR #1 Draft.

### UX-04 · P0 · Shell & navigation
- [x] AC04.1: 4 đích Trang chủ/Khám phá/Hành trình/Cá nhân cùng tên, order, active state trên mọi reader route, desktop/mobile; nguồn footer, CMS/demo không quảng bá.
- [x] AC04.2: keyboard Tab/Shift-Tab, skip link, focus visible, aria-current, safe area, không che nội dung/focus, không tràn ngang ở 320/390/768/1024/1440.
- [x] AC04.3: giữ route aliases, noindex/nofollow/no-store phù hợp, raw API/CMS guest denials, Production draft gate. Evidence: visual + route/security tests.
Dependency: UX-01.

**UX-04 CLOSED — Combined DEV technical acceptance (27/11/2026):** [audit / implementation / final acceptance](ux-04-implementation.md). App `52cc86e` LIVE; CI `4391764` 5/5 PASS. [LIVE QA 45924315181](https://github.com/kios-saks/demo/actions/runs/45924315181), job 140262010783 PASS, shell probe true and browser step executed. AC04.1 four destinations/labels/order/active/breadcrumb/footer on 24 tested routes; AC04.2 five widths (320/390/768/1024/1440), keyboard/skip/focus/bottom padding PASS; AC04.3 route/security headers, missing alias 404, CI Production draft isolation, UX01/02/03 regressions and 219 refs/aliases PASS. Physical iOS notch and assistive-technology validation remain UX-09/10; authenticated preview SKIP missing token. Sprint 4/10 CLOSED; UX-05 next. Production gate CLOSED, PRB-UX02-PRIVACY OPEN/BLOCKING, PR #1 Draft.

### UX-05 · P0 · Khám phá và filter
- [x] AC05.1: kết quả hữu ích trước bộ lọc dài; desktop sidebar; mobile sheet, label/selection/count thật; 16 lĩnh vực không chiếm 16 hàng trước kết quả, không mặc định loại nội dung sai.
- [x] AC05.2: multi-select chặng OR, nhóm filter AND, áp dụng/xóa, back/forward, reload, deep link giữ đúng state; pagination/limit, không duplicate.
- [x] AC05.3: empty, error, loading, retry, accessibility focus management; 219 IDs xuất hiện qua tập hợp kết quả, không mất 19 ô không ưu tiên. Evidence: test matrix 12 chặng × 16 chủ đề + mobile flow.
Dependency: UX-01/02/04.

**UX-05 CLOSED — Combined DEV technical acceptance (27/11/2026):** [audit / implementation / final acceptance](ux-05-implementation.md). App `9e1042b` LIVE; CI `e69ef0d` 5/5 PASS. [LIVE QA 45936329361 attempt 2](https://github.com/kios-saks/demo/actions/runs/45936329361/attempts/2), job 140302242925, probe true and actual Discovery Browser Smoke PASS. AC05.1 first results visible before mobile bottom navigation, mobile sheet/desktop sidebar, true facet counts; AC05.2 OR/AND, reload/back/forward, URL state, 219 unique IDs across 10 pages at 24/page limit; AC05.3 empty, CI upstream fail-closed/retry and 192 cells/19 nonpriority/576 kind cases, mobile Escape/focus return. UX01–04 regression PASS. Attempt 1 React hydration #418 did not recur; root cause unresolved, monitor/reopen on recurrence; no test suppression or runtime change. Physical devices/AT and user study remain UX09/10; authenticated preview SKIP missing token. Sprint 5/10 CLOSED; UX-06 next. Production gate CLOSED, PRB-UX02-PRIVACY OPEN/BLOCKING, PR #1 Draft.

### UX-06 · P1 · Chi tiết chung
- [x] AC06.1: 219/219 stable deep links đúng kind/id, refresh/back/share works, legacy URL + old hash fallback; giữ nội dung, headings, source URLs, media/revisions và disclaimer.
- [x] AC06.2: common template title, summary (chỉ trích từ nội dung có sẵn), meta, TOC, source, related; bài học có hoạt động/reflection, cẩm nang có giới hạn/checklist; không gắn nhãn clinical approved.
- [x] AC06.3: source/medical limitation dễ thấy, ảnh contain và transcript; kiểm 219 nội dung tự động + 72×4 visual regression và mẫu A–Z mọi chặng/loại. Evidence: browser + source integrity.
Dependency: UX-01/04/05.

**UX-06 CLOSED — Combined DEV technical acceptance (27/11/2026):** [audit / implementation / final acceptance](ux-06-implementation.md). App `9efe0a1` LIVE; Application CI 10/10 PASS; 5/5 workflows success after rerun. [LIVE QA 45940983727 attempt 2](https://github.com/kios-saks/demo/actions/runs/45940983727/attempts/2), job 140357816530, MEBE_UX06_LIVE=true and actual Detail Browser Smoke PASS. AC06.1 219 HTTP identities/source integrity, stable /doc and compatibility aliases/old hash, refresh/back/share link; AC06.2 shared reader with original summary, TOC/meta/sources/related, practice/checklist/reflection/limits; AC06.3 364 layout checks (288 legacy + 76 representative A–Z/lesson), four widths, media contain, existing transcripts, visible limitations, CI 144 media slots. UX01–05 regressions PASS. Source directory SSR 6 reloads/filter/noReact PASS; #418 absent during acceptance, underlying old React mismatch not proven. Authenticated preview SKIP missing token; physical device/AT and human study remain UX09/10. Sprint 6/10 CLOSED; UX-07 next. Production gate CLOSED, PRB-UX02-PRIVACY OPEN/BLOCKING, PR #1 Draft.

### UX-07 · P1 · Bookmark và chia sẻ
- [x] AC07.1: lưu/bỏ lưu cho đủ 219 stable IDs; idempotent, reload/back, kho cá nhân đúng, không duplicate; migrate bookmark legacy cũ không mất dữ liệu, rollback/fixture.
- [x] AC07.2: share URL canonical không chứa token/personal data; fallback copy; người nhận vẫn chịu đúng quyền/DEV gate; không hứa link công khai Production.
- [x] AC07.3: storage blocked/quota/JSON lỗi → thông báo, không báo lưu thành công sai; xóa dữ liệu có xác nhận. Evidence: unit + browser fixture.
Dependency: UX-06.

**UX-07 CLOSED — Combined DEV technical acceptance (27/11/2026):** [audit / implementation / final acceptance](ux-07-implementation.md). App `26a70dd` LIVE 15:20:31 ICT; 5/5 workflows and 10/10 application CI jobs PASS. [LIVE QA 45958405684 attempt 2](https://github.com/kios-saks/demo/actions/runs/45958405684/attempts/2), job 140424439493, MEBE_UX07_LIVE=true and actual Bookmark Browser Smoke PASS. AC07.1 canonical 219 IDs, CI save/remove 219 each, 438 idempotency, lossless legacy 72 migration/rollback, personal filter, reload/back/cross-tab, discovery and search; AC07.2 canonical share on three kinds, native/copy/manual fallback fixture, no query and no network, DEV access gate; AC07.3 corrupt/blocked/quota, accurate failure UI, confirmed clear. UX01–06 regression PASS, 219 HTTP integrity and 364 layout checks. No #418 or search timeout in this run; first deploy port-scan timeout resolved by same-SHA retry, root cause unproven. Authenticated preview SKIP missing token; OS native share UI, physical device/AT and human validation remain UX09/10. Sprint 7/10 CLOSED; UX-08 next, expanded opt-in history still pending. Production gate CLOSED, PRB-UX02-PRIVACY OPEN/BLOCKING, PR #1 Draft.

### UX-08 · P1 · Multi-interest journey
- [x] AC08.1: chọn 0,1,nhiều trong 12 chặng, đổi/xóa dễ; migrate lựa chọn legacy theo mapping, không suy đoán tuổi thật; local only.
- [x] AC08.2: recommendation deterministic từ stage/topic; checklist theo chặng hiện có; giữ tiến độ cũ, không tạo lịch y tế/công việc giả; trạng thái không có checklist rõ ràng.
- [x] AC08.3: history opt-in mặc định tắt, clear all/clear history, không lưu họ tên/tuổi chính xác/bệnh hoặc gửi sở thích ra server, thử private browser/storage error. Evidence: local storage regression + network assertions.
Dependency: UX-01/07.

**UX-08 CLOSED — Combined DEV technical acceptance (27/11/2026):** [audit / implementation / final acceptance](ux-08-implementation.md). App `61f58ac` LIVE 17:12:59 ICT; 5/5 workflows and 10/10 application CI jobs PASS. [LIVE QA 45978073258 attempt 2](https://github.com/kios-saks/demo/actions/runs/45978073258/attempts/2), job 140442115494 SUCCESS, MEBE_UX08_LIVE=true and actual Journey Browser Smoke PASS. AC08.1: 4096 subsets in CI, lazy migration 12 legacy stages/6 groups, explicit empty, local save, five widths and cross-tab. AC08.2: 192 stage/topic + 12 general cases in CI, deterministic selection, 48 original checklist keys, shared adolescent progress, four honest no-checklist states. AC08.3: 219 unique history IDs in CI and LIVE fixture, actual reads in three kinds, default off, expanded consent, confirmed clear, opt-out, quota/corrupt/blocked/noNetwork. UX01–07 regression PASS, 219 HTTP integrity and 364 layout checks. Authenticated preview SKIP missing token; synthetic isolated contexts/storage faults, not physical OS private mode validation. Physical devices/AT and human study remain UX09/10. Sprint 8/10 CLOSED (80%); UX-09 next. Production gate CLOSED, PRB-UX02-PRIVACY OPEN/BLOCKING, PR #1 Draft.

### UX-09 · P1 · Accessibility & performance
- [ ] AC09.1: WCAG 2.2 AA target; automated axe không critical/serious trên 5 route chính + detail kinds, manual keyboard, VoiceOver/NVDA hoặc tương đương, zoom 200%, reflow 320px, contrast text 4.5:1/large 3:1, focus visible/unobscured; target chính 44px internal.
- [ ] AC09.2: warm lab mobile/desktop đo LCP/CLS/TBT (TBT chỉ proxy), 3 lượt/route thiết bị/network ghi rõ; mục tiêu field p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 nếu đủ mẫu hợp lệ. Không có field data → N/A, không tuyên bố CWV PASS. Đo cold start riêng không trộn warm, không tăng ping để che vấn đề; readiness/retry như cũ.
- [ ] AC09.3: no horizontal overflow, ảnh giữ tỷ lệ; JS/CSS budget và kích thước index ghi baseline, không ship toàn bộ bài dài vào first render; nếu p75 lab warm vượt target thì ghi nguyên nhân và fix/owner exception. Evidence: audit JSON/screenshots/manual notes.
Dependency: baseline từ đợt 0, final sau UX-03–08. Chuẩn: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Web Vitals](https://web.dev/articles/vitals).

**UX-09 baseline IN PROGRESS (27/11/2026):** [audit / measurement plan](ux-09-implementation.md) and [provisional budgets](ux-09-budgets.json). Separate read-only DEV audit workflow, 46 axe scans and 72 Lighthouse lab samples; baseline report-only, no runtime changes before results. Manual real device/AT and field data not claimed. AC09.1–3 OPEN. Sprint 8/10 CLOSED (80%); Production gate CLOSED, PRB-UX02-PRIVACY OPEN/BLOCKING, PR #1 Draft.

**UX-09 Sprint A candidate (28/11/2026):** complete baseline 46/46 axe, 72/72 lab; SSR course compatibility, target sizes, inline link styling, regression readiness. [Implementation](ux-09-implementation.md). CI and exact LIVE Before/After pending; AC09.1–3 OPEN; Sprint 8/10 CLOSED (80%).

**UX-09 Sprint A LIVE / Sprint B isolated candidate (28/11/2026):** app `4ce5292` confirmed LIVE 08:10:47 ICT, deployment `dep-dc52jak9v7es738ueivg`; candidate app CI PASS. [Post-deploy QA](https://github.com/kios-saks/demo/actions/runs/46082526594/job/140814887714) and [axe/Lighthouse rerun](https://github.com/kios-saks/demo/actions/runs/46082526798/job/140814892525) RUNNING; prior 12 HTTP 503 overlapped startup/readiness, full causation unproven. Library priority fix and 5-width regression staged on `feat/mebe-ux09-library-sprint-b`; CI/Before-After evidence pending. [Evidence](ux-09-implementation.md). AC09.1–3 OPEN; sprint 8/10 CLOSED; Production gate CLOSED, PRB-UX02-PRIVACY OPEN/BLOCKING, PR #1 Draft.

### UX-10 · P1 · Kiểm thử hành vi
- [ ] AC10.1: baseline và prototype/task test với ít nhất 12 người trưởng thành tự nguyện, ≥3 mỗi nhóm (người chăm bé, cha/mẹ chuẩn bị, người trẻ, người lớn tuổi/người chăm); không tuyển trẻ cho vòng đầu; consent, không thu thông tin sức khỏe riêng tư.
- [ ] AC10.2: kịch bản tìm ăn dặm 6 tháng, dấu hiệu cần tìm trợ giúp (không nhập triệu chứng cá nhân), AI/hướng nghiệp, tài chính, tuổi già, lưu/đọc tiếp, nhiều chặng, xóa dữ liệu. 4–5 task phù hợp/người, ít nhất 48 lượt hợp lệ, mỗi task có đáp án/điểm đích định trước; không hướng dẫn menu. Ghi pass unassisted, time, số click/tap/submit (không đếm ký tự), error, SEQ 1–7.
- [ ] AC10.3: ≥90% lượt task thành công không trợ giúp; median time tìm bài ≤30s, median ≤3 thao tác từ home ở nhiệm vụ tìm; báo numerator/denominator, phân nhóm, quan sát thất bại, sample bias; nếu không đạt sửa và retest. Không coi 12 người là đại diện dân số hay số liệu retention.
- [ ] AC10.4: không ghi raw query nhạy cảm, chỉ task ID/elapsed/result/viewport, consent và retention có hạn; baseline và retest cùng task/điều kiện tương đương, báo cáo ẩn danh; owner sign-off. Evidence: research plan, raw anonymized counts, summary. 
Dependency: bắt đầu đợt 0, final sau UX-03–09.

## Test matrix & Definition of Done
- Fixture: 219 identities, nguồn/sections/hash hoặc comparison, media slots, old URL aliases, local-state migration; protected route & Production guard. 
- Browser 320,390,768,1024,1440 (ưu tiên 390×844), ít nhất Chrome desktop/mobile, Safari iOS hoặc WebKit, keyboard và screen reader thực tế. Empty/loading/error/no JS/storage denied/back/reload/deep link; không coi mock network là live.
- CI existing 5 jobs không regress, không làm suy yếu smoke; visual 72×4 giữ, A–Z 12 stage và 219 detail; Render đúng SHA LIVE, readiness, CMS/Open Reader smoke cùng instance; postdeploy 219 thật + copy/nav regression. API auth riêng nếu thiếu token phải ghi SKIP; không đánh dấu PASS giả.
- Data/production guard: 72/21/126 không mất, draft, expertReviewed false, source/anchor/revision history giữ, không mở Production hoặc sửa DB ngoài scope; CMS/guest denial giữ. Noindex vẫn bật.
- Evidence register cho mỗi UX: status TODO/DOING/BLOCKED/PASS, commit, test/run URL, viewport, expected/actual, defect, owner, date. Nếu chưa có thử nghiệm người dùng thì UX-10 chưa PASS; nếu field chưa đủ mẫu không tuyên bố đạt field CWV.
- Gate kết thúc: toàn bộ AC bắt buộc PASS hoặc exception do owner ghi rõ; không tự đánh dấu 10/10 từ kế hoạch. Report checklist sau từng batch.

## Rủi ro và xử lý
| Rủi ro | Giảm thiểu |
|---|---|
| Trùng/mất ID khi hợp nhất | Namespace kind:id, mapping snapshot, regression 219 |
| Tăng payload / client hydration | Index gọn, body theo route, pagination, measure |
| Đứt link cũ hoặc bookmark | Alias/fragment migration, giữ storage key/fixture, rollback |
| Nhầm quyền draft/public | Dùng policy hiện có, CI + guest tests; noindex không thay auth |
| Cá nhân hóa thành thu thập nhạy cảm | Local opt-in, clear, không analytics query |
| Ẩn giới hạn chuyên môn vì polish | Giữ disclaimer, nguồn/AI labels; expert approval ngoài scope |
| Mẫu test nhỏ / không có field metric | Báo định tính, counts, N/A; không suy diễn conversion |


### Production release gate — privacy

- [ ] PRB-UX02-PRIVACY — OPEN / BLOCKING: trước khi mở Production, xác minh và ghi bằng chứng về ingress/edge, proxy, application, APM/error tracing, log export và retention; bảo đảm query cá nhân không được ghi nguyên văn, kể cả legacy GET q tại ingress và POST body. Kiểm thử GET/POST synthetic trên môi trường release-equivalent được cấp phép, có positive control chứng minh request log quan sát được, kiểm tra marker/redaction và không dùng dữ liệu cá nhân thật. Nếu không thể xác minh hoặc redaction không khả thi, giữ Production gate CLOSED và trình chủ dự án phương án tương thích/giảm rủi ro. Không tự nâng gói, đổi cấu hình, xóa log hay mở Production.
