# Sprint UX Redesign V2 — roadmap và nghiệm thu
**Trạng thái: IN PROGRESS · UX-01 PASS kỹ thuật DEV, 1/10 nghiệm thu.** Thiết kế ở mức low fidelity; không tự đóng ticket vì có tài liệu. App baseline 16b8762. Mỗi hạng mục sau phê duyệt cần PR nhỏ, kiểm thử, bằng chứng trước/ sau. P0 là kiến trúc và khả năng tìm, P1 là chiều sâu, chất lượng và nghiên cứu; UX-09/10 bắt đầu baseline từ đầu, không chờ cuối.

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
- [ ] AC02.1: index đủ 219 từ nguồn hợp lệ, title/summary/topics/stage + nội dung phù hợp; legacy lấy live, không fallback draft trái phép; mỗi ID đúng một kết quả.
- [ ] AC02.2: normalize dấu/đ, exact title > title tokens > tags/summary > body, synonym curated (ăn dặm, dậy thì, AI, tài chính, tuổi già), typo có ngưỡng; không sinh câu trả lời y tế. Cố định ≥30 query fixtures (≥10 mỗi kind, có dấu/không dấu, synonym, typo, zero result) cùng expected top 3 do UX/content duyệt; ≥90% truy vấn có đáp án đúng trong top 3 và 100% exact title unique tìm đúng.
- [ ] AC02.3: filter age/topic/kind hợp lệ, clear, URL + browser history, empty/error khác nhau, không lộ raw data/token/nhạy cảm, không log query cá nhân. Evidence: unit/integration + live test.
Dependency: UX-01.

**UX-02 candidate:** [audit và triển khai](ux-02-implementation.md). AC02.1/2/3 còn mở; benchmark candidate cần owner/content review, CI và post-deploy thực tế.

### UX-03 · P0 · Homepage
- [ ] AC03.1: ở 390×844, search và lối chọn nhóm tuổi nhận biết không cần cuộn quá một viewport; không hero quá cao, không pop-up/ép đăng nhập; có đường đến A–Z và tìm kiếm chính.
- [ ] AC03.2: chưa chọn sở thích → gợi ý chung; đã chọn → gợi ý liên quan và tiếp tục đọc nếu opt-in. Không tạo bài giả/trending nếu không có số liệu.
- [ ] AC03.3: 5 nhiệm vụ phổ biến (ăn dặm, dậy thì, AI, tài chính, tuổi già) có đường đến bài ≤3 thao tác chính từ home qua search/chọn nhóm; đo UX-10. Evidence: desktop/mobile browser flows.
Dependency: UX-01/02/04.

### UX-04 · P0 · Shell & navigation
- [ ] AC04.1: 4 đích Trang chủ/Khám phá/Hành trình/Cá nhân cùng tên, order, active state trên mọi reader route, desktop/mobile; nguồn footer, CMS/demo không quảng bá.
- [ ] AC04.2: keyboard Tab/Shift-Tab, skip link, focus visible, aria-current, safe area, không che nội dung/focus, không tràn ngang ở 320/390/768/1024/1440.
- [ ] AC04.3: giữ route aliases, noindex/nofollow/no-store phù hợp, raw API/CMS guest denials, Production draft gate. Evidence: visual + route/security tests.
Dependency: UX-01.

### UX-05 · P0 · Khám phá và filter
- [ ] AC05.1: kết quả hữu ích trước bộ lọc dài; desktop sidebar; mobile sheet, label/selection/count thật; 16 lĩnh vực không chiếm 16 hàng trước kết quả, không mặc định loại nội dung sai.
- [ ] AC05.2: multi-select chặng OR, nhóm filter AND, áp dụng/xóa, back/forward, reload, deep link giữ đúng state; pagination/limit, không duplicate.
- [ ] AC05.3: empty, error, loading, retry, accessibility focus management; 219 IDs xuất hiện qua tập hợp kết quả, không mất 19 ô không ưu tiên. Evidence: test matrix 12 chặng × 16 chủ đề + mobile flow.
Dependency: UX-01/02/04.

### UX-06 · P1 · Chi tiết chung
- [ ] AC06.1: 219/219 stable deep links đúng kind/id, refresh/back/share works, legacy URL + old hash fallback; giữ nội dung, headings, source URLs, media/revisions và disclaimer.
- [ ] AC06.2: common template title, summary (chỉ trích từ nội dung có sẵn), meta, TOC, source, related; bài học có hoạt động/reflection, cẩm nang có giới hạn/checklist; không gắn nhãn clinical approved.
- [ ] AC06.3: source/medical limitation dễ thấy, ảnh contain và transcript; kiểm 219 nội dung tự động + 72×4 visual regression và mẫu A–Z mọi chặng/loại. Evidence: browser + source integrity.
Dependency: UX-01/04/05.

### UX-07 · P1 · Bookmark và chia sẻ
- [ ] AC07.1: lưu/bỏ lưu cho đủ 219 stable IDs; idempotent, reload/back, kho cá nhân đúng, không duplicate; migrate bookmark legacy cũ không mất dữ liệu, rollback/fixture.
- [ ] AC07.2: share URL canonical không chứa token/personal data; fallback copy; người nhận vẫn chịu đúng quyền/DEV gate; không hứa link công khai Production.
- [ ] AC07.3: storage blocked/quota/JSON lỗi → thông báo, không báo lưu thành công sai; xóa dữ liệu có xác nhận. Evidence: unit + browser fixture.
Dependency: UX-06.

### UX-08 · P1 · Multi-interest journey
- [ ] AC08.1: chọn 0,1,nhiều trong 12 chặng, đổi/xóa dễ; migrate lựa chọn legacy theo mapping, không suy đoán tuổi thật; local only.
- [ ] AC08.2: recommendation deterministic từ stage/topic; checklist theo chặng hiện có; giữ tiến độ cũ, không tạo lịch y tế/công việc giả; trạng thái không có checklist rõ ràng.
- [ ] AC08.3: history opt-in mặc định tắt, clear all/clear history, không lưu họ tên/tuổi chính xác/bệnh hoặc gửi sở thích ra server, thử private browser/storage error. Evidence: local storage regression + network assertions.
Dependency: UX-01/07.

### UX-09 · P1 · Accessibility & performance
- [ ] AC09.1: WCAG 2.2 AA target; automated axe không critical/serious trên 5 route chính + detail kinds, manual keyboard, VoiceOver/NVDA hoặc tương đương, zoom 200%, reflow 320px, contrast text 4.5:1/large 3:1, focus visible/unobscured; target chính 44px internal.
- [ ] AC09.2: warm lab mobile/desktop đo LCP/CLS/TBT (TBT chỉ proxy), 3 lượt/route thiết bị/network ghi rõ; mục tiêu field p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 nếu đủ mẫu hợp lệ. Không có field data → N/A, không tuyên bố CWV PASS. Đo cold start riêng không trộn warm, không tăng ping để che vấn đề; readiness/retry như cũ.
- [ ] AC09.3: no horizontal overflow, ảnh giữ tỷ lệ; JS/CSS budget và kích thước index ghi baseline, không ship toàn bộ bài dài vào first render; nếu p75 lab warm vượt target thì ghi nguyên nhân và fix/owner exception. Evidence: audit JSON/screenshots/manual notes.
Dependency: baseline từ đợt 0, final sau UX-03–08. Chuẩn: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Web Vitals](https://web.dev/articles/vitals).

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
