# Hàng chờ duyệt hình ảnh – Hành Trình Mẹ & Bé

Ngày 24/11/2026. Chủ sản phẩm quyết định giữ, sửa hoặc thay thế ảnh. Không tự xóa bản đề xuất. Lưu ảnh cần cân nhắc ngoài thư mục public; không kích hoạt trong Media Registry khi chưa có quyết định. Chấp nhận mỹ thuật không đồng nghĩa với thẩm định y khoa. Không sử dụng ảnh giáo dục có thông tin sai như lời khuyên đúng.

## Hai bộ ảnh cần chủ sản phẩm review

### A — [Xem ảnh](./review-a.webp)
- Generation: 843b4767-5110-49d6-9bcf-50a2cfd07f3f. SHA256: 695d09225f85fd147c03d3d043c38484b5481a0ce77f84edf60ca7a8d0619a10.
- Các cảnh gia đình có thể tham chiếu về ánh sáng, màu sắc. Ô ngủ sơ sinh có gấu bông/chăn mềm nhưng được gắn nhãn an toàn; mâu thuẫn với [CDC safe sleep](https://www.cdc.gov/sudden-infant-death/sleep-safely/). Đề xuất sửa cảnh này hoặc dùng với nhãn phản ví dụ rõ ràng sau thẩm định. Các nhãn ăn dặm và tiêm chủng cần đối chiếu nguồn cụ thể trước khi dùng.
- Trạng thái: pending owner review; not activated.

### B — [Xem ảnh](./review-b.webp)
- Generation: 94ee3a6f-2f50-4eca-b27d-b03be6cdf0d3. SHA256: 0921ad407ab26f0106dff29bbeb99ae5a70f12705bc971a354d1e2c7c856b715.
- Có các cảnh đọc sách, chơi, bữa ăn và học tập có thể tách để minh họa đúng đoạn văn. Ô ngủ sơ sinh có vật mềm; bảng tiêm chủng chỉ ghi tuổi mà không ghi vaccine và chưa đối chiếu lịch Việt Nam; hình thai nhi cần xem xét giải phẫu nếu dùng để giảng dạy. Không coi các nhãn AI là thông tin xác thực.
- Trạng thái: pending owner review; not activated.

## Quy trình

1. Đối chiếu slug, mục, đoạn văn, mục đích giáo dục; xác định ảnh đời sống hoặc sơ đồ kiến thức.
2. Với ảnh cần cân nhắc: lưu preview, provenance, checksum, đề xuất vị trí và lý do; chủ sản phẩm chọn giữ/chỉnh/thay.
3. Với kiến thức sức khỏe, đối chiếu từng chi tiết với nguồn chuyên môn. Ví dụ: [CDC safe sleep](https://www.cdc.gov/sudden-infant-death/sleep-safely/), [WHO infant and young child feeding](https://www.who.int/vietnam/news/fact-sheets/detail/infant-and-young-child-feeding). Duyệt lâm sàng riêng trước khi xuất bản.
4. Khi đủ điều kiện, thêm ảnh vào Media Registry, giữ ảnh cũ nếu ảnh mới chưa được duyệt; CI kiểm tra kích thước, checksum, anchor và responsive. Không sửa bài viết gốc hay DB; giữ PR Draft.
