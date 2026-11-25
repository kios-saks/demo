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
- [ ] Kiểm kê 72 bài hiện tại + 21 bài draft theo ma trận chặng/chủ đề; xác định bài trùng, khoảng trống, claim và nguồn.
- [ ] Biên tập theo từng chặng, ưu tiên dinh dưỡng, sinh hoạt, sức khỏe, tâm sinh lý, giáo dục, thích nghi, an toàn và trường học trước; tiếp theo năng lực số, tài chính, nghề nghiệp, pháp luật, năng khiếu và kỹ năng sống.
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
