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

## Repository interface và dữ liệu mock từ nguồn chính thức (21/11/2026)

> Tất cả bài viết và thẻ nghiên cứu đều DRAFT, chưa được bác sĩ/biên tập viên phê duyệt. Dữ liệu có nguồn tham khảo không đồng nghĩa được chứng thực hoặc cấp phép sao chép từ tổ chức nguồn.

- `packages/data/src/contracts.ts`: interface `KnowledgeRepository` và các type domain, async, tách hoàn toàn SQL.
- `packages/data/src/mock-repository.ts`: `MockKnowledgeRepository` đọc JSON in-memory, không lưu thay đổi; defensive clone.
- `packages/content/articles.json`: 12 stages, 24 draft articles gốc.
- `packages/content/mock/sources.json`: 13 nguồn WHO / CDC / UNICEF / Bộ Y tế Việt Nam (URL + metadata, ngày kiểm tra).
- `packages/content/mock/topics.json`: 13 chủ đề được chuẩn hóa.
- `packages/content/mock/research-cards.json`: 12 thẻ nghiên cứu viết mới, liên kết qua sourceIds/topicId/stageSlug.
- `apps/api/src/repository.ts`: dependency composition root. Khi có PostgreSQL, viết adapter mới implement interface này, không cần đổi routes.
- `docs/database/postgres-schema.sql`: DDL PostgreSQL **đề xuất, chưa chạy và chưa có DB thật**.
- `docs/repository-pattern.md`: hợp đồng và hướng dẫn đổi adapter.

API mới (môi trường demo):
- `GET /v1/topics?stage=so-sinh`
- `GET /v1/sources?stage=so-sinh`
- `GET /v1/research-cards?stage=so-sinh` (không mở trong production)
- `GET /v1/editorial/overview` (không mở trong production)

Web có thêm `/nguon-tham-khao` và `/goc-nghien-cuu`, đều noindex. Web dùng `KnowledgeRepository` qua server-side adapter. Mobile vẫn dùng dữ liệu bundled để offline; API sync được dự kiến cho bước tiếp.

```bash
cd projects/hanh-trinh-me-be
npm install
npm run check:content
npm test
npm exec -w @mebe/api -- tsc --noEmit
npm exec -w @mebe/mobile -- tsc --noEmit
npm run build:web
```

**Chính sách production:** API tự động ẩn toàn bộ article khác `published` khi `NODE_ENV=production`; chỉ có `published` mới xuất hiện trên public API. Web prototype vẫn hiển thị nội dung mẫu rõ nhãn DRAFT và áp dụng `noindex` toàn site; cần tích hợp CMS/auth/publish workflow trước khi production public.
