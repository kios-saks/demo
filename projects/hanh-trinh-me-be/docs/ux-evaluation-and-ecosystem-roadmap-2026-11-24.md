# Đánh giá UX – Hành Trình Mẹ & Bé

Ngày 24/11/2026 · Tài liệu tham chiếu sản phẩm · Baseline: f11eec8c

## 1. Kết luận và phạm vi đánh giá

Sản phẩm đã có 72 bài chuyên sâu, 12 giai đoạn, 72 ảnh bìa và 27 infographic theo báo cáo biên tập. Người dùng không đến để đọc hết thư viện: họ cần tìm câu trả lời, biết nội dung phù hợp với chặng đường gia đình, và có thể quay lại để tiếp tục. Mục tiêu: **Đúng kiến thức, đúng giai đoạn, đúng nhu cầu**.

Đánh giá UX 6,5/10 là định tính từ cấu trúc mã, CSS và luồng truy cập, chưa phải nghiên cứu người dùng hay đo hiệu năng live.

| Tiêu chí | Điểm sơ bộ |
|---|---:|
| Độ phong phú nội dung | 8/10 |
| Giao diện | 7,5/10 |
| Điều hướng | 6,5/10 |
| Trải nghiệm đọc | 7/10 |
| Tìm kiếm | 5,5/10 |
| Cá nhân hóa | 2/10 |
| Giữ chân | 4,5/10 |
| Minh bạch nguồn | 7,5/10 |

Giữ lại: 12 giai đoạn, nội dung dài, mục lục, ảnh đúng tỷ lệ, infographic và nguồn. Không cần làm lại kho dữ liệu. CI baseline [45322747160](https://github.com/kios-saks/demo/actions/runs/45322747160) thất bại ở kiểm tra /so-sinh sau khi nhận cookie tester, chưa chứng minh điều hướng theo giai đoạn hoạt động đúng.

## 2. Hành trình sử dụng và cải tiến

| Nhu cầu | Vấn đề | Cải tiến |
|---|---|---|
| Mới vào web | Thống kê nội dung, quá nhiều lựa chọn | Tìm kiếm và chọn chặng ngay đầu trang |
| Có con 6 tháng | Phải dò nhiều giai đoạn | Nhóm theo độ tuổi, mở ra các giai đoạn chi tiết |
| Tìm ăn dặm | Khớp từ khóa đơn giản | Chuẩn hóa tiếng Việt có/không dấu, gợi ý và từ đồng nghĩa |
| Đọc bài dài | Cuộn nhiều, mục lục dài trên điện thoại | Ghi nhớ nhanh, mục lục thu gọn, đọc tiếp |
| Quay lại ngày mai | Không có lưu bài | Bookmark/lịch sử cục bộ |
| Thực hiện checklist | Văn bản tĩnh | Checklist có trạng thái, đặt lại được |
| Kiểm chứng thông tin | Nguồn chủ yếu cuối bài | Claim → nguồn khi có dữ liệu đã xác minh, giữ nguồn cuối bài |
| Dùng điện thoại | Nội dung trang chủ quá dài | Mobile-first, điều hướng gọn, đọc một cột |

## 3. Đề xuất trang chủ Desktop Web/Mobile

**Desktop:** header ngang (Trang chủ, Khám phá, Đã lưu, Hành trình); hero hai cột gồm tiêu đề, ô tìm kiếm và ảnh minh họa; thẻ hành trình cá nhân; 6 nhóm giai đoạn (3 cột hoặc 6 cột khi đủ chỗ); chủ đề phổ biến; 3–4 bài nổi bật theo lưới; lối vào checklist, kho đã lưu và nguồn. Khung nội dung tối đa 1280px. Không phóng to bố cục mobile.

**Mobile:** header ngắn, hero dọc, tìm kiếm ngay đầu, nhóm giai đoạn 2 cột (mở đến đủ 12 chặng), chủ đề dạng chip, danh sách bài một cột, điều hướng dưới Trang chủ / Khám phá / Đã lưu / Hành trình, mục lục bài thu gọn. Tablet là bố cục trung gian.

Sáu nhóm: Chuẩn bị mang thai; Thai kỳ (3 tam cá nguyệt); Sau sinh; 0–12 tháng (sơ sinh, nhũ nhi); 1–5 tuổi (tập đi, mầm non); 6 tuổi trở lên (tiểu học, thiếu niên, trưởng thành). Luôn bảo toàn 12 slug dữ liệu gốc.

Design system: Warm Editorial, Accessible & Ethical, màu sage #285B46, kem #FAF9F5, chữ #24362D, muted #536459, terracotta #9B5042. Typography tiếng Việt rõ ràng, tiêu đề Georgia, nội dung system sans. Ảnh hiện có là SVG first-party, không cắt ảnh; cân nhắc ảnh đời thực sau duyệt quyền sử dụng. Focus ring, target 44px, giảm chuyển động, không có popup Basic Auth hay nhãn môi trường kỹ thuật trong trải nghiệm tester.

## 4. Đặc biệt: Chuyển từ thư viện kiến thức sang hệ sinh thái

### Hành trình của tôi
MVP: chọn giai đoạn quan tâm, lọc và gợi ý bài viết phù hợp, đổi/xóa lựa chọn. Không yêu cầu hồ sơ trẻ, ngày sinh, thông tin sức khỏe hoặc đăng nhập tài khoản thật. Chỉ lưu tùy chọn cục bộ khi người dùng chủ động chọn. Không đánh đồng sở thích đọc với thông tin y khoa.

### Trải nghiệm đọc thông minh
Tóm tắt 30 giây, nội dung cần biết, minh họa, mục lục, lưu/chia sẻ/đọc tiếp, bài liên quan. Không tự động tạo lời khuyên điều trị hoặc gắn nhãn đã duyệt khi chưa có chuyên gia. Cần đưa thông tin an toàn và dấu hiệu tìm trợ giúp lên vị trí dễ thấy, sau khi đối chiếu nguồn.

### Checklist tương tác
Checklist chuẩn bị trước sinh, đồ dùng, công việc gia đình theo chặng. Tích/xóa và đặt lại cục bộ. Không biến checklist thành chẩn đoán, hồ sơ bệnh, nhắc thuốc hoặc theo dõi sức khỏe trẻ khi chưa có privacy/legal/security review.

### Kho kiến thức cá nhân
Bookmark, lịch sử đọc và tiếp tục đọc; lưu trên thiết bị, cho phép xóa. Đồng bộ Web–Mobile và tài khoản thật chỉ sau khi có consent, phân quyền, export/delete và đánh giá bảo mật. Không thêm analytics nhạy cảm hay gửi sở thích đọc ra bên thứ ba.

### Mở rộng sau
Các công cụ hỗ trợ gia đình → đồng bộ tài khoản Web–Mobile → trợ lý AI tra cứu nguồn (không chẩn đoán). Cộng đồng và affiliate chỉ khi có moderation, disclosure và kiểm duyệt phù hợp. Không ưu tiên thương mại trước trải nghiệm tra cứu.

## 5. Chuẩn trải nghiệm bài viết
Tiêu đề trả lời vấn đề → tóm tắt 30 giây → điều cần biết → giải thích chi tiết → ảnh/infographic → điều cần thận trọng → FAQ → nguồn → bài liên quan. 900 từ là chuẩn độ dài, không phải tiêu chí chất lượng lâm sàng; giữ nguyên bản nháp và nguồn, không tạo claim mới trong sprint UI.

## 6. Backlog
- P0: sửa điều hướng/lọc; đồng nhất layout; sắp xếp trang chủ; search có/không dấu; responsive, hiệu năng.
- P1: tùy chọn chặng; nâng trải nghiệm đọc; bookmark/lịch sử; checklist; bài liên quan; khảo sát tester.
- P2: công cụ gia đình, tài khoản và đồng bộ Web–Mobile, AI có dẫn nguồn.

## 7. Tiêu chí nghiệm thu
- Tester có lời mời hợp lệ vào trang chủ, chọn đúng 12 giai đoạn, tìm có/không dấu, mở bài và quay lại; không có popup hay chữ DEV.
- Trang chủ gọn: chọn chặng trước bài nổi bật; không render 72 card cùng lúc ở trang chủ; thư viện riêng vẫn đủ bài.
- Kiểm tra layout 390px, 768px, 1024px, 1440px; không tràn ngang; ảnh giữ tỷ lệ; keyboard/focus; thao tác mobile >=44px.
- Bản nháp không mở cho khách ngoài nhóm test. API token chỉ server-side; noindex/noarchive/no-store; không thay đổi trạng thái bài; PR #1 giữ Draft.
- CI 5 job, Render commit khớp; HTTP và visual QA thật phải được báo cáo riêng, không suy diễn từ trạng thái live.

Tài liệu này là đường hướng để tham chiếu, không phải tuyên bố đã triển khai toàn bộ các tính năng P1/P2. Cập nhật trạng thái triển khai và kết quả đo ở QA report.
