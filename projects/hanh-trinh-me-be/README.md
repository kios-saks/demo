# Hành Trình Mẹ & Bé 🌷

**Hệ sinh thái kiến thức từ trước mang thai đến khi con trưởng thành** — web + Expo mobile + Fastify API + content foundation + marketing roadmap.

**Lưu ý:** Đây là mã nguồn MVP mẫu, CHƯA được triển khai production. 24 bài viết ở trạng thái `draft`, chưa được chuyên gia y tế phê duyệt. Không dùng để tự chẩn đoán hay điều trị.

## Thành phần
- `apps/web`: Next.js responsive; trang chủ, 12 giai đoạn, tra cứu, bài viết có nguồn, góc biên tập chỉ đọc.
- `apps/mobile`: Expo React Native, đọc và tìm bài theo giai đoạn bằng dữ liệu local.
- `apps/api`: Fastify REST API chỉ đọc với /health, /v1/stages, /v1/articles.
- `packages/content/articles.json`: 12 giai đoạn + 24 bài mẫu + nguồn tham khảo.
- `docs/`: kiến trúc, chính sách biên tập, marketing, sản phẩm, dữ liệu, lộ trình.
- `marketing/`: lịch 30 ngày và kịch bản sản xuất nội dung.

## Khởi chạy
Yêu cầu Node.js 20.11+.
```bash
npm install
npm run check:content
npm test
npm run dev:web
npm run dev:api
npm run dev:mobile
```
Chạy mỗi tiến trình ở terminal riêng. Web http://localhost:3000, API http://localhost:4000. Mobile hiện dùng JSON đóng gói, không gọi API; bảo mật tài khoản và CMS sẽ được triển khai ở các sprint tiếp.

## Nguyên tắc
- Review y khoa trước khi xuất bản bài về sức khỏe.
- Không chấm điểm trẻ, không gây lo lắng để bán hàng, không quảng cáo nhắm đến trẻ.
- Sản phẩm affiliate phải dán nhãn và tách khỏi khuyến nghị chuyên môn.
- Bảo vệ dữ liệu trẻ em, tối thiểu hóa thu thập, quyền xóa và rút đồng ý.

Tên thương hiệu là tên làm việc, chưa kiểm tra quyền sử dụng hay tên miền.
