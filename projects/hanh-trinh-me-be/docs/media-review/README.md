# Hàng chờ duyệt hình ảnh – Hành Trình Mẹ & Bé

Ngày 24/11/2026. Chủ sản phẩm quyết định giữ, sửa hoặc thay thế ảnh. Không tự xóa bản đề xuất. Lưu ảnh cần cân nhắc ngoài thư mục public; không kích hoạt trong Media Registry khi chưa có quyết định. Chấp nhận mỹ thuật không đồng nghĩa với thẩm định y khoa. Không sử dụng ảnh giáo dục có thông tin sai như lời khuyên đúng.

## Hai bộ ảnh cần chủ sản phẩm review

### A — [Xem ảnh](./review-a.webp)
- Generation: 843b4767-5110-49d6-9bcf-50a2cfd07f3f. SHA256: 695d09225f85fd147c03d3d043c38484b5481a0ce77f84edf60ca7a8d0619a10.
- Các cảnh gia đình có thể tham chiếu về ánh sáng, màu sắc. Ô ngủ sơ sinh có gấu bông/chăn mềm nhưng được gắn nhãn an toàn; mâu thuẫn với [CDC safe sleep](https://www.cdc.gov/sudden-infant-death/sleep-safely/). Đề xuất sửa cảnh này hoặc dùng với nhãn phản ví dụ rõ ràng sau thẩm định. Các nhãn ăn dặm và tiêm chủng cần đối chiếu nguồn cụ thể trước khi dùng.
- Trạng thái: owner decided to create a replacement; original retained; not activated.

### B — [Xem ảnh](./review-b.webp)
- Generation: 94ee3a6f-2f50-4eca-b27d-b03be6cdf0d3. SHA256: 0921ad407ab26f0106dff29bbeb99ae5a70f12705bc971a354d1e2c7c856b715.
- Có các cảnh đọc sách, chơi, bữa ăn và học tập có thể tách để minh họa đúng đoạn văn. Ô ngủ sơ sinh có vật mềm; bảng tiêm chủng chỉ ghi tuổi mà không ghi vaccine và chưa đối chiếu lịch Việt Nam; hình thai nhi cần xem xét giải phẫu nếu dùng để giảng dạy. Không coi các nhãn AI là thông tin xác thực.
- Trạng thái: owner decided to create a replacement; original retained; not activated.

## Quy trình

1. Đối chiếu slug, mục, đoạn văn, mục đích giáo dục; xác định ảnh đời sống hoặc sơ đồ kiến thức.
2. Với ảnh cần cân nhắc: lưu preview, provenance, checksum, đề xuất vị trí và lý do; chủ sản phẩm chọn giữ/chỉnh/thay.
3. Với kiến thức sức khỏe, đối chiếu từng chi tiết với nguồn chuyên môn. Ví dụ: [CDC safe sleep](https://www.cdc.gov/sudden-infant-death/sleep-safely/), [WHO infant and young child feeding](https://www.who.int/vietnam/news/fact-sheets/detail/infant-and-young-child-feeding). Duyệt lâm sàng riêng trước khi xuất bản.
4. Khi đủ điều kiện, thêm ảnh vào Media Registry, giữ ảnh cũ nếu ảnh mới chưa được duyệt; CI kiểm tra kích thước, checksum, anchor và responsive. Không sửa bài viết gốc hay DB; giữ PR Draft.

### C — [Xem mockup thiết kế](./review-c.webp)
- Generation 7f031ff4-1822-41d5-8863-a4fc8c27e7cd. SHA256 29c0efae8ec1f72b5efd3608f921d591b85301b62f34b2774eb649c15f1f2663.
- Đây là mockup sinh ngoài yêu cầu ảnh lifestyle, không phải ảnh chụp website hay báo cáo dự án. Các số 94%, 67/72 và các dấu hoàn thành trên ảnh là dữ liệu minh họa không chính xác. Thực tế tại baseline: 25/72 bài có ảnh lifestyle trong repo, 47 còn thiếu.
- Không kích hoạt. Có thể tham chiếu bố cục review A/B nếu chủ sản phẩm muốn; nội dung sức khỏe và giải phẫu phải được kiểm chứng riêng.

## Hàng đợi sản xuất
[47 brief theo đoạn văn](../inline-media-production-plan-2026-11-24.json). Mỗi mục có slug, mục nội dung, trích đoạn gốc, mục đích giáo dục, yêu cầu hình và nguồn ứng viên. Brief chưa phải tài nguyên hình ảnh.

## Quyết định chủ sản phẩm — 24/11/2026
- A và B: tạo ảnh thay thế, lưu bản gốc. Không xóa review-a.webp / review-b.webp.
- [A thay thế](./review-a-replacement.webp), generation af18a4ef-212f-416c-8c0d-392ff3644ca7, SHA256 42f9c08f92afedfa014a1c3ac3294f7c1c977e2e63dc8c60648f18632db155b5. Đã sử dụng hai ô đời sống đúng đoạn văn; các ô y khoa (ngủ, ăn dặm, tiêm chủng) giữ ở hàng chờ, chưa được thẩm định.
- B thay thế generation ca06b59a-d92c-4967-85ff-a18f1315a335 đã tạo ở cuộc trò chuyện; bản gốc B vẫn lưu nguyên. [B thay thế](./review-b-replacement.webp), SHA256 4af4662f41d98da46b2676a71ef8b86298bf260ba2031ef9e26c6f2c305c9116; đã lưu riêng, chưa kích hoạt.
- Thêm 4 ảnh đời sống từ generation 722c500a-7596-46c7-b9d0-a408fd057bd8. Tổng 6 ảnh mới được gắn đúng mục trong bài, 31/72 bài có ảnh riêng. Chưa coi CI là đạt trước khi có kết quả.

### Review cảnh ngủ trong A/B thay thế
Hai ảnh mới thể hiện trẻ nằm ngửa, đầu không bị che và không thấy gấu bông/chăn rời. Đối chiếu CDC (https://www.cdc.gov/sudden-infant-death/sleep-safely/) và NIH (https://safetosleep.nichd.nih.gov/reduce-risk/safe-sleep-environment): bề mặt phải chắc, phẳng, không nghiêng, có ga vừa khít và cũi đạt chuẩn phù hợp. Các đặc tính vật lý/chứng nhận không thể xác nhận bằng ảnh AI. Chờ chủ sản phẩm chọn phương án mỹ thuật và thẩm định chuyên môn; không tự động kích hoạt. Những ô khác chưa sử dụng vẫn được bảo toàn trong hai ảnh tổng thể.
