# UX-02 final review — 26/11/2026

Status: technical LIVE PASS; AC02.1 CLOSED, AC02.2 and AC02.3 OPEN. Owner/content approval not yet recorded. Production gate CLOSED; PR #1 Draft. App 3b4c52f; post-deploy QA 45785858483 success. No new deployment requested.

## AC02.2 — fixed regression benchmark V1, pending owner approval

Source: scripts/knowledge-search.test.mjs and life-course-inventory.json at e9d9f5de87253c05564e7a4e9151026668a37655. Expected target must be present in Top 3, not a claim of all three ranks. 30 baseline (unfiltered, ten per kind) plus ten intent variants; CI 40/40, 219/219 unique exact titles. No independent owner approval yet. The baseline legacy queries skew toward pregnancy, intent repeats some baseline subjects; this is not actual user analytics or a representative held-out evaluation. Extend independent behavioral coverage in UX-10.

| # | Query | Filter | Expected key | Expected inventory title | Owner decision |
|---:|---|---|---|---|---|
| 1 | cuộc trò chuyện trước khi có em bé | none | legacy:cuoc-tro-chuyen-truoc-khi-co-con | 5 cuộc trò chuyện trước khi có em bé | Pending |
| 2 | cuộc hẹn tiền thai | none | legacy:hen-tu-van-tien-thai | Một cuộc hẹn tiền thai nên chuẩn bị gì? | Pending |
| 3 | axit folic truoc mang thai | none | legacy:axit-folic-truoc-khi-mang-thai | Axit folic trước mang thai: những điều nên biết | Pending |
| 4 | khám sức khỏe tiền thai | none | legacy:kham-suc-khoe-tien-thai | Khám sức khỏe tiền thai: checklist chuẩn bị | Pending |
| 5 | rà soát thuốc và tiêm chủng | none | legacy:thuoc-tiem-chung-va-ke-hoach-thai-ky | Rà soát thuốc và tiêm chủng trước khi có thai | Pending |
| 6 | ke hoach ho tro gia dinh truoc khi co con | none | legacy:ke-hoach-ho-tro-tien-thai | Kế hoạch hỗ trợ gia đình trước khi có con | Pending |
| 7 | lần khám thai đầu tiên | none | legacy:lan-kham-thai-dau-tien | Lần khám thai đầu tiên: chuẩn bị như thế nào? | Pending |
| 8 | cam xuc thay doi trong dau thai ky | none | legacy:cam-xuc-dau-thai-ky | Khi cảm xúc thay đổi trong đầu thai kỳ | Pending |
| 9 | khám thai 3 tháng đầu | none | legacy:lich-kham-thai-ba-thang-dau | Khám thai 3 tháng đầu: theo dõi những gì? | Pending |
| 10 | om nghen va an uong | none | legacy:om-nghen-va-an-uong-dau-thai-ky | Ốm nghén và ăn uống 3 tháng đầu | Pending |
| 11 | chơi để luyện chú ý | none | lesson:choi-tu-duy | Chơi để luyện chú ý và giải quyết vấn đề | Pending |
| 12 | làm hòa với bạn | none | lesson:cam-xuc-va-ban-be | Nhận biết cảm xúc và làm hòa với bạn | Pending |
| 13 | lam quen cong nghe | none | lesson:con-va-cong-nghe | Làm quen công nghệ có người lớn đồng hành | Pending |
| 14 | điểm số sai lầm | none | lesson:hoc-khong-so-sai | Điểm số, sai lầm và cảm giác thuộc về | Pending |
| 15 | thám tử thông tin | none | lesson:kiem-chung-thong-tin | Thám tử thông tin: đọc và kiểm chứng | Pending |
| 16 | tien tieu vat | none | lesson:tien-tieu-vat | Tiền tiêu vặt: nhu cầu, mong muốn và tiết kiệm | Pending |
| 17 | dậy thì hiểu thay đổi cơ thể | none | lesson:day-thi-thay-doi | Dậy thì: hiểu thay đổi cơ thể và chăm sóc bản thân | Pending |
| 18 | ap luc dong trang lua | none | lesson:ban-be-va-ap-luc | Bạn bè, bản sắc và áp lực đồng trang lứa | Pending |
| 19 | ai co the sai | none | lesson:ai-co-the-sai | AI có thể sai: hỏi thông minh và giữ riêng tư | Pending |
| 20 | quan hệ lành mạnh đồng thuận | none | lesson:quan-he-va-dong-thuan | Quan hệ lành mạnh, đồng thuận và ranh giới | Pending |
| 21 | bữa sáng bữa phụ và bữa ăn tại trường | none | article:bua-an-di-hoc-6-10 | Ăn uống tuổi tiểu học: bữa sáng, bữa phụ và bữa ăn tại trường | Pending |
| 22 | chon truong tieu hoc | none | article:chon-tieu-hoc-theo-nhu-cau | Chọn trường tiểu học: so sánh sự phù hợp, không chạy theo danh tiếng | Pending |
| 23 | chuyển cấp THCS | none | article:chuyen-cap-thcs | Chuyển cấp THCS 11–13 tuổi: chọn môi trường và thích nghi với nhịp học mới | Pending |
| 24 | học tập tuổi 14 17 trong thời đại ai | none | article:du-an-hoc-tap-thoi-ai | Học tập tuổi 14–17 trong thời đại AI: xây năng lực bằng một dự án thực tế | Pending |
| 25 | an uong khi di lam | none | article:an-uong-khi-di-lam | Ăn uống khi đi làm tuổi 23–34: cân bằng giữa thời gian, chi phí và sức khỏe | Pending |
| 26 | xây nhịp vận động nghỉ ngơi | none | article:van-dong-va-nhip-song-trung-nien | Tuổi 35–59: xây nhịp vận động, nghỉ ngơi và công việc bền vững | Pending |
| 27 | giảm nguy cơ té ngã | none | article:phong-te-nga-tuoi-60-74 | Tuổi 60–74: rà soát môi trường sống để giảm nguy cơ té ngã | Pending |
| 28 | nghi huu va suc khoe tinh than | none | article:nghi-huu-va-ket-noi | Nghỉ hưu và sức khỏe tinh thần: giữ kết nối, sở thích và cảm giác có ý nghĩa | Pending |
| 29 | kế hoạch chăm sóc tôn trọng khả năng | none | article:ke-hoach-cham-soc-75-plus | Tuổi 75+: chuẩn bị một kế hoạch chăm sóc tôn trọng khả năng và mong muốn cá nhân | Pending |
| 30 | gắn bó năm đầu đời | none | article:gan-bo-va-dap-ung-nam-dau | Gắn bó năm đầu đời: đáp lại tín hiệu, dỗ dành và chăm sóc người chăm bé | Pending |
| 31 | cách khám sức khỏe tiền thai | kind=legacy | legacy:kham-suc-khoe-tien-thai | Khám sức khỏe tiền thai: checklist chuẩn bị | Pending |
| 32 | axit folic truoc mang thai la gi | kind=legacy | legacy:axit-folic-truoc-khi-mang-thai | Axit folic trước mang thai: những điều nên biết | Pending |
| 33 | dậy thì hiểu thay đổi cơ thể | kind=lesson | lesson:day-thi-thay-doi | Dậy thì: hiểu thay đổi cơ thể và chăm sóc bản thân | Pending |
| 34 | tham tu thong tinn | kind=lesson | lesson:kiem-chung-thong-tin | Thám tử thông tin: đọc và kiểm chứng | Pending |
| 35 | tiền tiêu vặt là gì | kind=lesson | lesson:tien-tieu-vat | Tiền tiêu vặt: nhu cầu, mong muốn và tiết kiệm | Pending |
| 36 | ai co the sai | kind=lesson | lesson:ai-co-the-sai | AI có thể sai: hỏi thông minh và giữ riêng tư | Pending |
| 37 | chọn trường tiểu học | kind=article | article:chon-tieu-hoc-theo-nhu-cau | Chọn trường tiểu học: so sánh sự phù hợp, không chạy theo danh tiếng | Pending |
| 38 | giảm nguy cơ té ngã | stage=older | article:phong-te-nga-tuoi-60-74 | Tuổi 60–74: rà soát môi trường sống để giảm nguy cơ té ngã | Pending |
| 39 | an uong khi di lam | kind=article | article:an-uong-khi-di-lam | Ăn uống khi đi làm tuổi 23–34: cân bằng giữa thời gian, chi phí và sức khỏe | Pending |
| 40 | nghi huu va suc khoe tinh than | kind=article | article:nghi-huu-va-ket-noi | Nghỉ hưu và sức khỏe tinh thần: giữ kết nối, sở thích và cảm giác có ý nghĩa | Pending |

Separate regression tests include synonym, typo constraints and zero-result. Owner can approve the fixed set or request specific revisions; no self-approval.

## AC02.3 — privacy audit and compatibility proposal

- Render service srv-dc19cibl550s73drji5g on Free compute; accessible log label types from 08:34:43 UTC: app, build. Request log query returned zero rows, no pagination. Compute plan is not workspace plan. Render documentation (https://render.com/docs/logging) states HTTP request logs are available for Pro workspaces or higher and include requested URL. No assertion about internal retention, inaccessible logs or body recording can be inferred.
- Direct container probe failed DNS before HTTP request (HTTP 000). Add a DEV-only post-deploy synthetic canary step to the existing trusted PR workflow. Two distinct non-personal queries in legacy GET URL and private POST body, expected HTTP 200 empty results and security headers. Log only run ID, synthetic markers, HTTP status, optional Rndr-Id and UTC timestamps, never response body. After run, filter Render application/request logs by marker and time, check positive-control visibility; zero matches without positive request visibility is inconclusive for platform logging.
- Application code: search query not forwarded to corpus API/DB; Fastify logger disabled, renderer logs error class only, no query telemetry. Existing Chromium LIVE QA proves new search POST HTTP URL has no q; fragment still retained by browser. Legacy GET receives q by design and could appear in upstream access logs before application code runs.
- Proposed legacy compatibility policy (not implemented): continue accepting GET /tim-kiem?q=...; immediately return 303 to /tim-kiem#q=... with private/no-store and no-referrer, then let current client submit POST. Preserve allowlisted filters, old stage values and stable links. This reduces subsequent URL propagation but cannot erase the original inbound request. No-JS compatibility needs a documented fallback. Prefer explicit warning and query-free links/forms for new flows. For strict no-query logging, require edge redaction or stop accepting arbitrary q on GET; do not promise both absolute logging prevention and unchanged GET compatibility. Obtain owner approval and verify infrastructure log configuration/streams before closing AC02.3.
- No upgrade, log deletion, secret access, Production changes or application changes authorized by this audit. Canary uses only synthetic inputs. Keep AC02.3 open unless the privacy gate has verified evidence or an explicitly approved narrower scope.
