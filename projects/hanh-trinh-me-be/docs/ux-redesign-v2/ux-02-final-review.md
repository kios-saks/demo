# UX-02 final review — 26/11/2026

Status: UX-02 CLOSED — Combined DEV-only scope accepted by project owner on 26/11/2026 ICT. AC02.1/2/3 CLOSED (AC02.3 scoped, not strict infrastructure privacy PASS). Regression Benchmark V1 approved 40/40. PRB-UX02-PRIVACY OPEN/BLOCKING. App 3b4c52f LIVE, QA 45788595455 PASS. Production gate CLOSED; PR #1 Draft.

## AC02.2 — fixed regression benchmark V1, owner approved

Source: scripts/knowledge-search.test.mjs and life-course-inventory.json at e9d9f5de87253c05564e7a4e9151026668a37655. Expected target must be present in Top 3, not a claim of all three ranks. 30 baseline (unfiltered, ten per kind) plus ten intent variants; CI 40/40, 219/219 unique exact titles. Owner explicitly approved the complete fixed set on 26/11/2026. The baseline legacy queries skew toward pregnancy, intent repeats some baseline subjects; this is not actual user analytics or a representative held-out evaluation. Extend independent behavioral coverage in UX-10.

| # | Query | Filter | Expected key | Expected inventory title | Owner decision |
|---:|---|---|---|---|---|
| 1 | cuộc trò chuyện trước khi có em bé | none | legacy:cuoc-tro-chuyen-truoc-khi-co-con | 5 cuộc trò chuyện trước khi có em bé | Approved |
| 2 | cuộc hẹn tiền thai | none | legacy:hen-tu-van-tien-thai | Một cuộc hẹn tiền thai nên chuẩn bị gì? | Approved |
| 3 | axit folic truoc mang thai | none | legacy:axit-folic-truoc-khi-mang-thai | Axit folic trước mang thai: những điều nên biết | Approved |
| 4 | khám sức khỏe tiền thai | none | legacy:kham-suc-khoe-tien-thai | Khám sức khỏe tiền thai: checklist chuẩn bị | Approved |
| 5 | rà soát thuốc và tiêm chủng | none | legacy:thuoc-tiem-chung-va-ke-hoach-thai-ky | Rà soát thuốc và tiêm chủng trước khi có thai | Approved |
| 6 | ke hoach ho tro gia dinh truoc khi co con | none | legacy:ke-hoach-ho-tro-tien-thai | Kế hoạch hỗ trợ gia đình trước khi có con | Approved |
| 7 | lần khám thai đầu tiên | none | legacy:lan-kham-thai-dau-tien | Lần khám thai đầu tiên: chuẩn bị như thế nào? | Approved |
| 8 | cam xuc thay doi trong dau thai ky | none | legacy:cam-xuc-dau-thai-ky | Khi cảm xúc thay đổi trong đầu thai kỳ | Approved |
| 9 | khám thai 3 tháng đầu | none | legacy:lich-kham-thai-ba-thang-dau | Khám thai 3 tháng đầu: theo dõi những gì? | Approved |
| 10 | om nghen va an uong | none | legacy:om-nghen-va-an-uong-dau-thai-ky | Ốm nghén và ăn uống 3 tháng đầu | Approved |
| 11 | chơi để luyện chú ý | none | lesson:choi-tu-duy | Chơi để luyện chú ý và giải quyết vấn đề | Approved |
| 12 | làm hòa với bạn | none | lesson:cam-xuc-va-ban-be | Nhận biết cảm xúc và làm hòa với bạn | Approved |
| 13 | lam quen cong nghe | none | lesson:con-va-cong-nghe | Làm quen công nghệ có người lớn đồng hành | Approved |
| 14 | điểm số sai lầm | none | lesson:hoc-khong-so-sai | Điểm số, sai lầm và cảm giác thuộc về | Approved |
| 15 | thám tử thông tin | none | lesson:kiem-chung-thong-tin | Thám tử thông tin: đọc và kiểm chứng | Approved |
| 16 | tien tieu vat | none | lesson:tien-tieu-vat | Tiền tiêu vặt: nhu cầu, mong muốn và tiết kiệm | Approved |
| 17 | dậy thì hiểu thay đổi cơ thể | none | lesson:day-thi-thay-doi | Dậy thì: hiểu thay đổi cơ thể và chăm sóc bản thân | Approved |
| 18 | ap luc dong trang lua | none | lesson:ban-be-va-ap-luc | Bạn bè, bản sắc và áp lực đồng trang lứa | Approved |
| 19 | ai co the sai | none | lesson:ai-co-the-sai | AI có thể sai: hỏi thông minh và giữ riêng tư | Approved |
| 20 | quan hệ lành mạnh đồng thuận | none | lesson:quan-he-va-dong-thuan | Quan hệ lành mạnh, đồng thuận và ranh giới | Approved |
| 21 | bữa sáng bữa phụ và bữa ăn tại trường | none | article:bua-an-di-hoc-6-10 | Ăn uống tuổi tiểu học: bữa sáng, bữa phụ và bữa ăn tại trường | Approved |
| 22 | chon truong tieu hoc | none | article:chon-tieu-hoc-theo-nhu-cau | Chọn trường tiểu học: so sánh sự phù hợp, không chạy theo danh tiếng | Approved |
| 23 | chuyển cấp THCS | none | article:chuyen-cap-thcs | Chuyển cấp THCS 11–13 tuổi: chọn môi trường và thích nghi với nhịp học mới | Approved |
| 24 | học tập tuổi 14 17 trong thời đại ai | none | article:du-an-hoc-tap-thoi-ai | Học tập tuổi 14–17 trong thời đại AI: xây năng lực bằng một dự án thực tế | Approved |
| 25 | an uong khi di lam | none | article:an-uong-khi-di-lam | Ăn uống khi đi làm tuổi 23–34: cân bằng giữa thời gian, chi phí và sức khỏe | Approved |
| 26 | xây nhịp vận động nghỉ ngơi | none | article:van-dong-va-nhip-song-trung-nien | Tuổi 35–59: xây nhịp vận động, nghỉ ngơi và công việc bền vững | Approved |
| 27 | giảm nguy cơ té ngã | none | article:phong-te-nga-tuoi-60-74 | Tuổi 60–74: rà soát môi trường sống để giảm nguy cơ té ngã | Approved |
| 28 | nghi huu va suc khoe tinh than | none | article:nghi-huu-va-ket-noi | Nghỉ hưu và sức khỏe tinh thần: giữ kết nối, sở thích và cảm giác có ý nghĩa | Approved |
| 29 | kế hoạch chăm sóc tôn trọng khả năng | none | article:ke-hoach-cham-soc-75-plus | Tuổi 75+: chuẩn bị một kế hoạch chăm sóc tôn trọng khả năng và mong muốn cá nhân | Approved |
| 30 | gắn bó năm đầu đời | none | article:gan-bo-va-dap-ung-nam-dau | Gắn bó năm đầu đời: đáp lại tín hiệu, dỗ dành và chăm sóc người chăm bé | Approved |
| 31 | cách khám sức khỏe tiền thai | kind=legacy | legacy:kham-suc-khoe-tien-thai | Khám sức khỏe tiền thai: checklist chuẩn bị | Approved |
| 32 | axit folic truoc mang thai la gi | kind=legacy | legacy:axit-folic-truoc-khi-mang-thai | Axit folic trước mang thai: những điều nên biết | Approved |
| 33 | dậy thì hiểu thay đổi cơ thể | kind=lesson | lesson:day-thi-thay-doi | Dậy thì: hiểu thay đổi cơ thể và chăm sóc bản thân | Approved |
| 34 | tham tu thong tinn | kind=lesson | lesson:kiem-chung-thong-tin | Thám tử thông tin: đọc và kiểm chứng | Approved |
| 35 | tiền tiêu vặt là gì | kind=lesson | lesson:tien-tieu-vat | Tiền tiêu vặt: nhu cầu, mong muốn và tiết kiệm | Approved |
| 36 | ai co the sai | kind=lesson | lesson:ai-co-the-sai | AI có thể sai: hỏi thông minh và giữ riêng tư | Approved |
| 37 | chọn trường tiểu học | kind=article | article:chon-tieu-hoc-theo-nhu-cau | Chọn trường tiểu học: so sánh sự phù hợp, không chạy theo danh tiếng | Approved |
| 38 | giảm nguy cơ té ngã | stage=older | article:phong-te-nga-tuoi-60-74 | Tuổi 60–74: rà soát môi trường sống để giảm nguy cơ té ngã | Approved |
| 39 | an uong khi di lam | kind=article | article:an-uong-khi-di-lam | Ăn uống khi đi làm tuổi 23–34: cân bằng giữa thời gian, chi phí và sức khỏe | Approved |
| 40 | nghi huu va suc khoe tinh than | kind=article | article:nghi-huu-va-ket-noi | Nghỉ hưu và sức khỏe tinh thần: giữ kết nối, sở thích và cảm giác có ý nghĩa | Approved |

Separate regression tests include synonym, typo constraints and zero-result. All 40 rows approved by the project owner; no fixture or threshold modified. Any future change to this approved baseline must be recorded and reviewed.

## AC02.3 — privacy audit and compatibility proposal

- Render service srv-dc19cibl550s73drji5g on Free compute; accessible log label types from 08:34:43 UTC: app, build. Request log query returned zero rows, no pagination. Compute plan is not workspace plan. Render documentation (https://render.com/docs/logging) states HTTP request logs are available for Pro workspaces or higher and include requested URL. No assertion about internal retention, inaccessible logs or body recording can be inferred.
- Direct container probe failed DNS before HTTP request (HTTP 000). Add a DEV-only post-deploy synthetic canary step to the existing trusted PR workflow. Two distinct non-personal queries in legacy GET URL and private POST body, expected HTTP 200 empty results and security headers. Log only run ID, synthetic markers, HTTP status, optional Rndr-Id and UTC timestamps, never response body. After run, filter Render application/request logs by marker and time, check positive-control visibility; zero matches without positive request visibility is inconclusive for platform logging.
- Application code: search query not forwarded to corpus API/DB; Fastify logger disabled, renderer logs error class only, no query telemetry. Existing Chromium LIVE QA proves new search POST HTTP URL has no q; fragment still retained by browser. Legacy GET receives q by design and could appear in upstream access logs before application code runs.
- Proposed legacy compatibility policy (not implemented): continue accepting GET /tim-kiem?q=...; immediately return 303 to /tim-kiem#q=... with private/no-store and no-referrer, then let current client submit POST. Preserve allowlisted filters, old stage values and stable links. This reduces subsequent URL propagation but cannot erase the original inbound request. No-JS compatibility needs a documented fallback. Prefer explicit warning and query-free links/forms for new flows. For strict no-query logging, require edge redaction or stop accepting arbitrary q on GET; do not promise both absolute logging prevention and unchanged GET compatibility. Obtain owner approval and verify infrastructure log configuration/streams before closing AC02.3.
- No upgrade, log deletion, secret access, Production changes or application changes authorized by this audit. Canary uses only synthetic inputs. Keep AC02.3 open unless the privacy gate has verified evidence or an explicitly approved narrower scope.

## Owner decision and completed synthetic audit — 26/11/2026 ICT

Owner decision: “Tôi phê duyệt toàn bộ 40 benchmark UX-02 làm Regression Benchmark V1.” All 40 rows approved, no modification of expected keys/filters or thresholds. AC02.2 CLOSED. Approval is for the fixed regression benchmark, not an independent population-level user study; UX-10 should expand behavioral coverage as previously documented.

CI for QA commit 1c2d968: 5/5 PASS (PR 45788595340, push 45788587855, live 45788595412, cold 45788595415, post-deploy 45788595455). LIVE app SHA 3b4c52f remains on dep-dc3uu8qjnfac73b01idg. [Post-deploy run](https://github.com/kios-saks/demo/actions/runs/45788595455), job 139801597243: DEV_LIFE_COURSE_219_PASS, UX01_HUB_BROWSER_PASS, UX02_SEARCH_BROWSER_PASS {refs:219,widths:3,accentEquivalent:true,filters:true,history:true,fulltextLegacy:72,privatePost:true}. Authenticated preview SKIP (token unavailable).

UX02_PRIVACY_CANARY_HTTP_PASS at 16:09:39 ICT, exact synthetic probes (UTC):

| Method | Synthetic marker | Status | Started–finished UTC | Render request ID |
|---|---|---|---|---|
| GET | ux02syntheticget45788595455x1 | 200 | 09:09:36.661–09:09:38.064 | cce45bbd-8f0b-4e4f |
| POST | ux02syntheticpost45788595455x1 | 200 | 09:09:38.064–09:09:39.059 | e21c28be-eee6-4aa6 |

Both probes passed empty-state and no-store/noindex/no-referrer assertions. Render service srv-dc19cibl550s73drji5g audit window 09:09:30–09:11:00 UTC: marker-filtered app logs 0 GET / 0 POST; request logs 0 GET / 0 POST; request logs filtered by /tim-kiem and /api/dev-search 0; unfiltered app logs in window 0. All returned hasMore=false. Available type labels app/build. The HTTP positive control is established by canary status and IDs, but no positive request-log visibility exists. No evidence of query leakage in observable logs; no claim of absence in platform logs or retention. No actual personal data used.

AC02.3 remains OPEN under the original no-personal-query-logging criterion. Technical safeguards PASS: POST excludes q from HTTP URL, no query forwarded to corpus/DB, no application query telemetry, no-store/no-referrer, fail-closed and filters/history. Existing arbitrary GET q remains a residual risk even if redirected to a fragment; a redirect cannot erase initial ingress. No new redirect or compatibility change in this checkpoint. Recommended next decision: (A) explicitly accept limited DEV-only privacy scope and document residual legacy/platform risk as a Production release blocker, or (B) retain original strict gate and obtain verifiable edge/request log redaction, including initial legacy GET and POST body handling. No scope waiver implied by benchmark approval. Do not upgrade plans, delete logs, or change infrastructure automatically. No production authorization.

Current status: UX-02 technical LIVE PASS, 2/3 AC CLOSED; 1/10 sprint fully CLOSED. PR #1 remains Draft/unmerged, Production gate remains CLOSED. Evidence-only docs update; no application or schema changes, no redeployment requested.

## Final owner scope acceptance — 26/11/2026 ICT

Decision: “Tôi chấp thuận nghiệm thu AC02.3 trong phạm vi Combined DEV, giữ tương thích URL cũ và đưa việc xác minh privacy logging hạ tầng thành Production Release Blocker.” This explicitly supersedes the earlier OPEN acceptance status for Combined DEV only. AC02.3 CLOSED / DEV-SCOPE ACCEPTED, not a strict infrastructure privacy PASS. Legacy GET q remains supported without redirect changes. Existing Private POST, filters, history, fail-closed, no-store/noindex/no-referrer, synthetic canary evidence remain intact. No application, data, schema or infrastructure change. No authority to release Production.

- [x] AC02.1 Unified Index: 219/219 unique, 72 legacy full-text.
- [x] AC02.2 Relevance: owner-approved fixed 40 fixtures, Top 3 40/40, exact title 219/219.
- [x] AC02.3 Combined DEV scoped acceptance: functional/privacy safeguards PASS; residual platform and legacy logging risk deferred to release blocker, not verified away.

- [ ] PRB-UX02-PRIVACY — OPEN / BLOCKING: trước khi mở Production, xác minh và ghi bằng chứng về ingress/edge, proxy, application, APM/error tracing, log export và retention; bảo đảm query cá nhân không được ghi nguyên văn, kể cả legacy GET q tại ingress và POST body. Kiểm thử GET/POST synthetic trên môi trường release-equivalent được cấp phép, có positive control chứng minh request log quan sát được, kiểm tra marker/redaction và không dùng dữ liệu cá nhân thật. Nếu không thể xác minh hoặc redaction không khả thi, giữ Production gate CLOSED và trình chủ dự án phương án tương thích/giảm rủi ro. Không tự nâng gói, đổi cấu hình, xóa log hay mở Production.

UX-02 CLOSED in Combined DEV, 3/3 AC accepted in scope; sprint 2/10 CLOSED. UX-03 Homepage next, not implemented in this checkpoint. Application SHA 3b4c52f remains LIVE (dep-dc3uu8qjnfac73b01idg); QA 1c2d968 5/5 PASS and run 45788595455 PASS. Authenticated preview SKIP because token unavailable; not represented as PASS. PR #1 remains Draft/unmerged and Production gate CLOSED. Documentation-only decision; new CI may be triggered but no redeployment requested.
