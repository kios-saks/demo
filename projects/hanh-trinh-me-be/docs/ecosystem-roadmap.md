# Roadmap Ecosystem điều chỉnh

**Hành Trình Mẹ & Bé** · Quyết định ngày 24/11/2026 · DEV

## Định hướng

**Web First – API First – Mobile Last.** Hoàn thiện Mobile App sau cùng, khi nghiệp vụ, dữ liệu, Web và API đã ổn định. Mục tiêu chuyển từ thư viện kiến thức sang hệ sinh thái đồng hành cùng gia đình mỗi ngày.

## Roadmap

| Giai đoạn | Phạm vi | Trạng thái |
|---|---|---|
| 1 | Nền tảng hệ sinh thái | Đã hoàn thành ở DEV |
| 2 | Nghiệm thu tổng thể Web – API – Database | Combined DEV LIVE; QA-006 WAIVED; QA khác theo dõi riêng |
| 3 | Hành trình cá nhân hóa | Đã nghiệm thu kỹ thuật DEV (S03-08) |
| 4 | Không gian gia đình | Demo LIVE PASS — dừng mở rộng theo quyết định chủ dự án |
| 4A | Tri thức vòng đời A–Z: kiến thức theo độ tuổi | Ưu tiên mới — đang triển khai |
| 5 | AI Assistant | Hoãn đến khi nền tảng kiến thức ổn định |
| 6 | Ổn định hệ sinh thái, chuẩn bị Production | Kế hoạch |
| 7 | Hoàn thiện Mobile App iOS/Android | Sau cùng |

## Giai đoạn 1 — Nền tảng hệ sinh thái

- [x] Monorepo Web Next.js, Fastify API, Expo prototype; kiến trúc repository.
- [x] Supabase PostgreSQL và Storage.
- [x] 12 giai đoạn, 72 bài viết chuyên sâu ở trạng thái draft, 46 hồ sơ nguồn tham khảo.
- [x] 72 ảnh bìa WebP đang sử dụng và 72 vị trí ảnh minh họa nội bài; giữ infographic giáo dục.
- [x] Upload và duyệt hàng loạt 65 ảnh bìa mới; bảo toàn lịch sử và ảnh gốc.
- [x] Web và API Render DEV LIVE tại baseline 6a696ee, CI 5/5 PASS.

Baseline kiểm tra ngày 24/11/2026: 390 storage objects, 65/65 ảnh bìa mới kích hoạt, 17 revision thay thế còn pending. Không coi các bản thay thế là ảnh thiếu. 72 bài vẫn là draft; duyệt ảnh không đồng nghĩa thẩm định y khoa. CMS bulk inline UI là cải tiến tùy nhu cầu, không phải điều kiện bắt buộc để kết thúc sprint hình ảnh.

## Giai đoạn 2 — Nghiệm thu tổng thể (QA còn lại theo dõi riêng)

- [ ] Xác minh invitation/session, phân quyền và guest denial.
- [ ] Kiểm tra đủ 12 chặng, 72 bài, tìm kiếm có/không dấu, điều hướng, đọc bài và liên kết nguồn.
- [ ] Nghiệm thu responsive tại 390/768/1024/1440px, thiết bị thật, bàn phím/focus, accessibility, tỷ lệ ảnh và infographic.
- [ ] Kiểm tra lựa chọn chặng, bookmark, checklist, lịch sử đọc opt-in, đặt lại và xóa dữ liệu cục bộ.
- [ ] Kiểm tra API readiness, timeout, fallback có nhãn rõ ràng, tính nhất quán với Supabase. Natural cold start Render Free được miễn theo quyết định chủ dự án; nghiệm thu readiness/availability Production vẫn bắt buộc.
- [ ] Kiểm tra CMS role-gated, lịch sử phiên bản và rollback trên fixture riêng; không thay đổi ảnh thật khi kiểm thử.
- [ ] Rà soát claim → nguồn, chất lượng nội dung, bản quyền/provenance ảnh; thẩm định chuyên môn là một cổng riêng.
- [ ] Ghi nhận bằng chứng QA, lỗi, mức độ ưu tiên và kết quả kiểm thử lại.

Điều kiện hoàn thành: không còn lỗi chặn luồng cốt lõi, không rò rỉ draft/secret; CI và smoke test Web/API DEV có bằng chứng riêng. LIVE hoặc CI PASS không thay thế nghiệm thu thiết bị thật.

## Giai đoạn 3 — Hành trình cá nhân hóa

- [ ] Hành trình của tôi: củng cố lựa chọn chặng, gợi ý kiến thức có nguồn theo chặng.
- [ ] Kế hoạch đồng hành, checklist cá nhân tương tác, lưu bài, đọc tiếp.
- [ ] Local-first: quyền chủ động chọn, đổi, đặt lại, xóa; không mặc định thu thập ngày sinh hoặc dữ liệu sức khỏe trẻ.
- [ ] Kiểm thử và nghiệm thu từng luồng trên Web.

## Giai đoạn 4 — Không gian gia đình (FROZEN)

Quyết định chủ dự án 25/11/2026: dừng phát triển mở rộng Không gian gia đình tại bản demo đã nghiệm thu LIVE. Không phát triển dashboard mới, lịch, nhắc việc, nhật ký hay kết nối Auth trong giai đoạn này. Giữ nguyên chức năng hiện tại; không xóa dữ liệu hoặc hạ cấp bảo mật. Các mục chưa xong bên dưới là phạm vi hoãn, không phải backlog ưu tiên. [LIVE QA](https://github.com/kios-saks/demo/actions/runs/45610760274), commit e1acfaa; 5 persona, role, checklist, invite, isolation, responsive, không gọi API thật.

- [ ] Nền tảng tài khoản Web/API, consent, RBAC, cách ly dữ liệu giữa gia đình, export/delete; kiểm thử bảo mật.
- [ ] Không gian gia đình và phân quyền thành viên.
- [ ] Lịch gia đình, kế hoạch, sự kiện, nhắc việc.
- [ ] Nhật ký hành trình, cột mốc, hồ sơ tối thiểu và công cụ đồng hành.
- [ ] Checklist gia đình có trạng thái và đồng bộ phù hợp.

Chỉ thu thập dữ liệu cần thiết. Dữ liệu trẻ em/sức khỏe, lịch tiêm, thuốc hoặc theo dõi y khoa cần đánh giá privacy/security/medical riêng trước khi triển khai.

## Giai đoạn 4A — Tri thức vòng đời A–Z (ưu tiên mới)

Quyết định mở rộng 25/11/2026: phục vụ mọi độ tuổi từ trước sinh đến tuổi cao niên. Giữ thương hiệu hiện tại; tên hệ sinh thái chưa quyết định. Bản đồ 12 chặng × 16 trụ cột là phân loại biên tập, không phải chuẩn phát triển. Không bắt buộc mọi chủ đề ở mọi tuổi; đối chiếu nhu cầu cụ thể. [WHO life-course framework](https://www.who.int/publications/i/item/9789240112575).
- [x] Bản đồ tri thức vòng đời trong /hoc-cung-con: 12 chặng, 16 trụ cột, ưu tiên theo tuổi, liên kết thư viện cũ, hiển thị số bài liên quan hoặc cần biên tập (không giả dữ liệu).
- [x] Kiểm kê metadata 72 bài hiện tại + 21 bài draft theo ma trận 192 ô; phân loại chính từng bài, xác định 173 ô áp dụng, 47 ô có draft, 126 ô trống ban đầu. [Ma trận và backlog](life-course-content-audit-2026-11-25.md).
- [x] Đợt S04-AZ-01: 11 hướng dẫn draft mới, tổng 104 nội dung, 58/173 ô có draft, 115 ô trống (52 P0). [Báo cáo](life-course-batch-01-2026-11-25.md). Độ phủ chưa đồng nghĩa đủ chiều sâu hoặc thẩm định; đọc claim và kiểm tra trùng lặp chi tiết vẫn còn.
- [x] S04-AZ-02: biên tập 52/52 ô P0 thiếu qua bốn đợt 14/11/14/13; 93/93 ô P0 có draft, tổng 156 nội dung, 110/173 ô có draft, 63 ô trống P1. [Báo cáo và ma trận hiện hành](life-course-p0-acceptance-2026-11-25.md). Chưa thẩm định hoặc xác nhận đủ chiều sâu.
- [x] S04-AZ-03: biên tập 63/63 ô P1 thiếu qua bốn đợt 15/16/16/16; P1 80/80, P0 93/93, tổng 219 nội dung và 173/173 ô áp dụng có draft, 0 khoảng trống. [Báo cáo và ma trận](life-course-p1-acceptance-2026-11-25.md). Không đồng nghĩa đầy đủ chiều sâu hoặc thẩm định.
- [x] S04-AZ-04 baseline: audit toàn văn 219 nội dung, 131 URL riêng biệt, 85 nhóm đoạn trùng, 146 bài ngắn; [báo cáo](life-course-quality-audit-2026-11-25.md) và [tiêu chuẩn](life-course-editorial-standard.md).
- [ ] S04-AZ-04 nâng cấp 219 nội dung: snapshot 04A 3/219 expanded draft, 17/131 nguồn baseline được tra cứu (không đồng nghĩa claim verification), [báo cáo](life-course-batch-04a-2026-11-25.md); tiếp tục theo tuổi, chưa expert reviewed.
- [ ] Kiểm chứng từng URL/claim, rà soát trùng ngữ nghĩa, hình minh họa và danh mục trường học thật; ưu tiên theo nhu cầu từng chặng và cổng thẩm định.
- [ ] Danh mục trường học Việt Nam theo địa phương/cấp học/nhu cầu: hồ sơ pháp lý, chương trình, học phí, tuyển sinh, nguồn chính thức, kiểm định phù hợp cấp học, ngày cập nhật; không xếp hạng tuyệt đối, phân biệt nội dung quảng cáo và dữ liệu kiểm chứng. Bắt đầu một địa phương thí điểm sau khi xác định phạm vi; chưa đề cử trường cụ thể.
- [ ] Xây dựng bộ lọc, so sánh, gợi ý theo lựa chọn phụ huynh; không thu thập vị trí chính xác hoặc dữ liệu trẻ em mặc định.
- [ ] Mở rộng người trưởng thành 23–34, trung niên 35–59, 60–74, 75+ với nội dung sức khỏe, quan hệ, học suốt đời, nghề nghiệp, tài chính, pháp luật và chất lượng sống; không trình bày tư vấn cá nhân hóa như chẩn đoán.
- [ ] Mô hình API/CMS thống nhất cho bài viết, nguồn, phiên bản, trường học, freshness, review và publication gate. Chưa migration/deploy Production.
- [x] Rà soát 72 bài hiện có: 6 bài/chặng, các chủ đề AI, tư duy phản biện, năng lực số, tài chính và định hướng nghề còn cần mở rộng.
- [x] Xây dựng 7 nhóm tuổi 0–12 tháng, 1–2, 3–5, 6–10, 11–13, 14–17, 18–22; 5 trụ cột tâm lý/cảm xúc, cơ thể/sinh lý, giáo dục/kỹ năng, AI/công nghệ, tài chính/tự lập.
- [x] Biên tập 21 bài học đầu tiên (3 bài mỗi nhóm tuổi), mỗi bài có mục tiêu, kiến thức, thực hành, câu hỏi và nguồn. Bản draft DEV, 14 nguồn được xác định, chưa chuyên gia thẩm định.
- [x] Web hub /hoc-cung-con, lọc theo tuổi/chủ đề, tìm kiếm, nguồn, điều hướng. Chỉ đúng Combined DEV; chưa deploy.
- [ ] CI, nghiệm thu trình duyệt và deploy DEV. Không mở public Production.
- [ ] Mở rộng theo lộ trình chiều sâu: mốc phát triển, ngôn ngữ, cảm xúc, sức khỏe sinh sản, an toàn cơ thể, kỹ năng học, STEAM, tư duy phản biện, AI có trách nhiệm, an toàn mạng, tài chính và hướng nghiệp.
- [ ] Xây dựng module học theo tuần, câu hỏi tự kiểm tra, hoạt động offline và nội dung song hành dành cho cha mẹ/con phù hợp độ tuổi; không chấm điểm phát triển trẻ.
- [ ] Rà soát claim → nguồn, chuyên gia tâm lý/y khoa/giáo dục, minh họa đúng nội dung, truy cập trên thiết bị thật.
- [ ] Tích hợp catalog vào API/CMS/Database qua migration có kế hoạch; không sửa trực tiếp 72 bài/seed hoặc dữ liệu Supabase đang phục vụ. Không thu thập dữ liệu trẻ em.
- [ ] AI Assistant chỉ sau khi knowledge corpus được thẩm định và có publication gate.
## Giai đoạn 5 — AI Assistant

- [ ] Tra cứu kiến thức theo giai đoạn, truy xuất nguồn, trả lời có dẫn nguồn.
- [ ] Chỉ truy cập nội dung được phép; kiểm soát quyền dữ liệu gia đình.
- [ ] Không thay thế bác sĩ, không tự chẩn đoán/điều trị; hướng dẫn tìm trợ giúp thích hợp.
- [ ] Kiểm thử độ chính xác, truy xuất nguồn, quyền riêng tư và an toàn. Không dùng dữ liệu gia đình để huấn luyện mặc định.

## Giai đoạn 6 — Ổn định hệ sinh thái

- [ ] Hiệu năng Web/API, bảo mật, quản lý tài khoản/phân quyền thật, backup/restore.
- [ ] Nghiệm thu người dùng và thiết bị thật; sửa lỗi, hoàn thiện vận hành.
- [ ] Thẩm định chuyên môn, kiểm chứng claim → nguồn và publication gate.
- [ ] SEO cho nội dung được phép công khai; duy trì bảo vệ draft.
- [ ] Chuẩn bị Production và chỉ phát hành khi được chủ dự án cho phép.

## Giai đoạn 7 — Mobile App (sau cùng)

- [ ] Tái sử dụng API, domain contract và nghiệp vụ Web đã ổn định.
- [ ] Hoàn thiện iOS/Android, đồng bộ tài khoản, offline/cache/revocation, nhắc nhở phù hợp.
- [ ] Kiểm thử E2E thiết bị thật, quyền riêng tư, bảo mật và release gate.

Giữ prototype hiện có, không ưu tiên phát triển Mobile trong các sprint trước.

## Nguyên tắc xuyên suốt

- Không làm lại chức năng đã hoàn thành; chỉ sửa lỗi phát hiện khi nghiệm thu.
- Không render lại hàng loạt hình ảnh vì định dạng; giữ nguyên ảnh gốc, infographic và các revision.
- Mỗi module mới có tiêu chí nghiệm thu, kiểm thử, bằng chứng và trạng thái rõ ràng.
- Ưu tiên Web/API, không thay đổi database, token hoặc cấu hình ngoài phạm vi sprint đã được giao.
- PR #1 giữ Draft; không tự merge hoặc phát hành Production.
- Phân biệt đã triển khai, đã kiểm thử, đã nghiệm thu, và kế hoạch.

**Ưu tiên hiện tại (25/11/2026):** Học cùng con — phát triển kiến thức theo từng độ tuổi. S03-08 đã nghiệm thu kỹ thuật, Family Demo đã LIVE PASS và đóng phạm vi mở rộng theo quyết định chủ dự án. Theo quyết định chủ dự án 25/11/2026, miễn kiểm thử Natural Cold Start trên Render Free (QA-006 CLOSED/WAIVED, không phải PASS) vì Production sẽ dùng gói trả phí. Các QA còn lại không bị miễn; giữ production gate, readiness và giám sát. Không tự nâng gói DEV. Roadmap này thay thế thứ tự ưu tiên cũ; các tài liệu lịch sử vẫn được giữ để tham chiếu.

## Tham chiếu

- [PR #1](https://github.com/kios-saks/demo/pull/1)
- [CI baseline](https://github.com/kios-saks/demo/actions/runs/45418309299)
- [Đánh giá UX và roadmap trước](ux-evaluation-and-ecosystem-roadmap-2026-11-24.md)
- [Báo cáo nội dung](longform-72-completion-2026-11-24.md)

- [x] S04-AZ-04B1: chỉnh sửa 30 bài tiền thai–hậu sản; [báo cáo](life-course-batch-04b1-2026-11-26.md).
- [x] S04-AZ-04B2: chỉnh sửa 18 nội dung năm đầu; [báo cáo](life-course-batch-04b2-2026-11-26.md). Tổng 51/219 có revision (3 expanded-draft, 48 revised-draft); 168 chờ, chưa thẩm định/kiểm chứng toàn bộ claim.

- [x] S04-AZ-04C1: chỉnh sửa 6 bài legacy tuổi tập đi; [báo cáo](life-course-batch-04c1-2026-11-26.md). Tổng 57/219 có revision; 162 chờ, trong đó 43 thuộc 1–10 tuổi. Chưa thẩm định toàn bộ claim, chưa nghiệm thu DEV.

- [x] S04-AZ-04C2: hoàn thành 10/10 revision còn lại tuổi 1–2, 67/219 toàn kho; [báo cáo](life-course-batch-04c2-2026-11-26.md). Chưa thẩm định và CI.

- [x] S04-AZ-04C3: 16/16 nội dung tuổi 3–5 có revision; tổng 83/219, 136 chờ, 17 thuộc 6–10; [báo cáo](life-course-batch-04c3-2026-11-26.md). Chưa thẩm định/CI.

- [x] S04-AZ-04C4: 17/17 revision tuổi 6–10, hoàn thành 49/49 phạm vi 04C (1–10 tuổi), tổng 100/219; 119 chờ; [báo cáo](life-course-batch-04c4-2026-11-26.md). Draft, chưa chuyên gia/CI.
- [x] S04-AZ-04D: 18/18 revision tuổi 11–13; tổng 118/219, 101 chờ; [báo cáo](life-course-batch-04d-2026-11-26.md). Draft, chưa thẩm định/CI.

- [x] S04-AZ-04E: 18/18 revision tuổi 14–17; tổng 136/219, 83 chờ; [báo cáo](life-course-batch-04e-2026-11-26.md). Draft, chưa thẩm định/CI.

- [x] S04-AZ-04F: 19/19 revision tuổi 18–22; tổng 155/219, 64 chờ; [báo cáo](life-course-batch-04f-2026-11-26.md). Draft, chưa thẩm định/CI.

- [x] S04-AZ-04G: 16/16 revision tuổi 23–34; tổng 171/219, 48 chờ; [báo cáo](life-course-batch-04g-2026-11-26.md). Draft, chưa thẩm định/CI.

- [x] S04-AZ-04H: 16/16 revision tuổi 35–59; tổng 187/219, 32 chờ; [báo cáo](life-course-batch-04h-2026-11-26.md). Draft, chưa thẩm định/CI.
- [x] S04-AZ-04I: 16/16 revision tuổi 60–74; tổng 203/219, 16 chờ; [báo cáo](life-course-batch-04i-2026-11-26.md). Draft, chưa thẩm định/CI.
- [x] S04-AZ-04J: 16/16 revision tuổi 75+; tổng 219/219, 0 chờ; [báo cáo](life-course-batch-04j-2026-11-26.md). Biên tập Draft hoàn tất, chưa nghiệm thu chuyên môn/CI.
- [x] S04-AZ-04: 219/219 có revision; [tổng kết và bàn giao](life-course-editorial-completion-2026-11-26.md). Không đồng nghĩa publication-ready.
- [x] Content Pipeline Recovery: nghiệm thu kỹ thuật DEV 222b182, CI 4/4, Supabase 72 bài/92 nguồn, bảo toàn CMS, Render LIVE, CMS/Open Reader smoke PASS, [219/219 UI PASS](https://github.com/kios-saks/demo/actions/runs/45756170970). [Báo cáo](content-pipeline-recovery-2026-11-26.md). Không mở Production.
- [x] Reader experience polish: nghiệm thu kỹ thuật DEV `16b8762`, Render LIVE, CMS/Open Reader smoke PASS, [219/219 post-deploy PASS](https://github.com/kios-saks/demo/actions/runs/45765933955); không mở Production. [Báo cáo](reader-experience-polish-2026-11-26.md).
- [x] Lưu [sitemap, sơ đồ tri thức A–Z, luồng người đọc và kiến trúc Web](web-sitemap-and-architecture-2026-11-26.md) theo baseline đã nghiệm thu.

## Sprint UX Redesign V2 — đề xuất (26/11/2026)

- [x] Lập [UI/UX Audit V2](ux-redesign-v2/README.md), [sitemap V2](ux-redesign-v2/sitemap-v2.md), [10 wireframe Desktop/Mobile](ux-redesign-v2/wireframes.md) và [roadmap/checklist UX-01–UX-10](ux-redesign-v2/sprint-roadmap.md).
- [ ] Chủ dự án review thiết kế và chốt phạm vi. Sprint IN PROGRESS, UX-01 và UX-02 đã nghiệm thu trong phạm vi DEV (2/10); review thiết kế tổng thể vẫn mở. Không thay đổi quyết định tạm dừng mở rộng gia đình/AI hoặc mở Production.

- [x] UX-01 Knowledge Hub V2: nghiệm thu kỹ thuật Combined DEV 26/11/2026, app `8b44343`, QA `af9390c`, CI 4/4, 219/219 nội dung và alias, 6 nhóm/12 chặng, 19 mẫu hash/reload, Production gate đóng. [Post-deploy QA](https://github.com/kios-saks/demo/actions/runs/45774886258) · [báo cáo](ux-redesign-v2/ux-01-implementation.md). Authenticated preview riêng SKIP (thiếu token); PR #1 Draft, chưa merge; UX-02 CLOSED (DEV-only); UX-03 trở đi chưa triển khai.

- [x] UX-02 Unified Search: CLOSED — Combined DEV scope, chủ dự án phê duyệt 26/11/2026. App `3b4c52f` LIVE, CI `1c2d968` 5/5 PASS, [Post-deploy + privacy canary](https://github.com/kios-saks/demo/actions/runs/45788595455) PASS (219 refs, 72 legacy full-text, privatePost:true, synthetic GET/POST HTTP 200). AC02.1/2 CLOSED, AC02.3 CLOSED (DEV-only scope acceptance, không phải strict infrastructure privacy PASS). Regression Benchmark V1 40/40 được duyệt, 219/219 exact title. Giữ legacy GET; privacy hạ tầng chưa xác minh, PRB-UX02-PRIVACY OPEN/BLOCKING trước Production. [Final review](ux-redesign-v2/ux-02-final-review.md). Authenticated preview SKIP thiếu token; Production gate CLOSED, PR #1 Draft. Sprint 2/10 CLOSED; UX-03 là hạng mục tiếp theo, chưa triển khai.


## Production Release Blockers — bắt buộc trước phát hành

- [ ] PRB-UX02-PRIVACY — OPEN / BLOCKING: trước khi mở Production, xác minh và ghi bằng chứng về ingress/edge, proxy, application, APM/error tracing, log export và retention; bảo đảm query cá nhân không được ghi nguyên văn, kể cả legacy GET q tại ingress và POST body. Kiểm thử GET/POST synthetic trên môi trường release-equivalent được cấp phép, có positive control chứng minh request log quan sát được, kiểm tra marker/redaction và không dùng dữ liệu cá nhân thật. Nếu không thể xác minh hoặc redaction không khả thi, giữ Production gate CLOSED và trình chủ dự án phương án tương thích/giảm rủi ro. Không tự nâng gói, đổi cấu hình, xóa log hay mở Production.
