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


## CMS mock (Sprint P0 · development only)

Development CMS UI: http://localhost:3000/admin. The application now has demo Writer / Editor / Reviewer roles, protected mock API, revision numbers, change requests and immutable per-revision simulated review events, plus atomic JSON file persistence under \`.local/editorial-state.json\` (gitignored). This is not a production-grade account system or specialist medical approval.

To use locally:
1. Copy \`.env.example\` to \`.env\` in this project folder.
2. Generate three unique random secrets with at least 24 characters and fill \`EDITORIAL_DEMO_WRITER_TOKEN\`, \`EDITORIAL_DEMO_EDITOR_TOKEN\`, \`EDITORIAL_DEMO_REVIEWER_TOKEN\`. Never commit secrets; do not place secrets in a \`NEXT_PUBLIC_\` variable.
3. Run \`npm install\`, then \`npm run dev:api\` and \`npm run dev:web\` in separate terminals.
4. Open \`/admin\`, enter one role token in the password field. The token is only kept in page memory, not localStorage or URL.
5. Writer: edit and submit; Editor: return for changes or approve an independently written revision; Reviewer: simulate separate medical review. Editing invalidates previous approvals. No publish button exists.

**Security:** The API \`/v1/admin/*\` is **404 when NODE_ENV=production**, **503 if tokens missing**, and **401 for invalid bearer keys**. All edits are JSON snapshots in one local process. No real identity/MFA, verified credentials, user registration, Postgres, or production persistence is implemented. Do not deploy /admin as a public CMS. All content remains draft/noindex, and simulate-review does not publish.

\`apps/web\` still reads the shipped JSON separately from editable API local state. CMS edits can be viewed in /admin and API immediately; syncing the reader web/mobile apps to the authoritative API is a separate next sprint.


## Real PostgreSQL adapter (added 2026-11-22)

The existing \`KnowledgeRepository\` / \`EditorialRepository\` contracts now have a working \`PostgresEditorialRepository\` powered by \`pg\`, SQL transactions and migrations. This is real PostgreSQL, not a mocked SQL API. The old mock remains the default.

For development (does not provision a paid cloud database):

\`\`\`bash
docker compose -f compose.postgres.yml up -d
cp .env.example .env
# In .env: set CONTENT_PROVIDER=postgres and uncomment DATABASE_URL.
# Use a *private* password in real environments (compose password is only a local example).
npm install
npm run db:migrate
npm run db:seed
npm run dev:api
\`\`\`

Keep the \`dev:web\` terminal running separately. API /health reports \`provider:"postgres"\` when connected; the existing /admin UI works with this adapter and persists changes in PostgreSQL. Re-running the seed will *not* overwrite edited articles or approval history. \`database/migrations/001_init.sql\` creates source/topic/stage/article/card relational tables, audited events and immutable-per-revision snapshots; the migration runner checks file hashes and refuses modified applied migrations.

Run integration tests with a disposable PostgreSQL 16 instance using \`npm run test:postgres\` while \`DATABASE_URL\` points to it. GitHub Actions creates an isolated PostgreSQL service container, runs migrations, seeds, tests and HTTP smoke. Nothing is deployed to a permanent managed cloud database; that requires choosing a provider and supplying credentials through a secure secret store.

Security: no publish endpoint. PostgreSQL schema explicitly disallows the \`published\` status until real editorial/medical credentials and production security are implemented. Demo role keys are still **development-only**, and \`/v1/admin\` returns 404 in production. Public API hides draft content under \`NODE_ENV=production\`. No user/child medical data is imported.

See \`docs/postgresql-adapter.md\`.
