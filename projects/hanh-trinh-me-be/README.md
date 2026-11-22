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


## Choose Docker, Supabase, or both (database routing)

The domain-level KnowledgeRepository and EditorialRepository contracts remain provider-neutral. DatabaseConnectionProvider and RoutedEditorialRepository now allow these modes via DATABASE_MODE:

- mock: bundled JSON repository.
- docker: local PostgreSQL, default legacy behavior for CONTENT_PROVIDER=postgres.
- supabase: hosted Supabase PostgreSQL over verified TLS, when real credentials exist.
- both: explicit DATABASE_PRIMARY selects the only writable/readable business store; second database is read-only for connection health and data drift checks (NO automatic sync or failover).

Use npm run db:status to compare readiness and safe content/revision fingerprints. In both mode, migration and seed require DB_TARGET=docker or DB_TARGET=supabase. Read docs/database-routing.md for the complete setup, Supabase certificate instructions, security limitations and CI evidence. No Supabase cloud instance is created automatically.


### Connected hosted Supabase project

Project hanh-trinh-me-be (yfmwznvlblbhicxexffe) now exists in Singapore. The private mebe schema contains the seeded draft knowledge base. See docs/database-routing.md for verification and secure runtime setup. This ChatGPT connection does not automatically give GitHub or API deployment the database password.

## Web-to-Backend API adapter (next deployment milestone)

The Web now implements the existing KnowledgeRepository contract using ApiKnowledgeRepository.
Set WEB_CONTENT_PROVIDER=api and CONTENT_API_INTERNAL_URL=http://your-private-api-service:4000 on the **Web runtime**.
Do not use NEXT_PUBLIC_ for this variable, and do not place a database password in Web or Mobile.

The backend still owns DATABASE_MODE=supabase and SUPABASE_DATABASE_URL. Put both values in the Backend
hosting provider's private environment/secret store. The hosted Supabase project is available, but
connecting Supabase to ChatGPT does not transfer a PostgreSQL password to an app host or GitHub Actions.

The HTTP adapter does not silently fall back to bundled JSON if the Backend is unavailable.
In production API mode it restricts all public Web reads to published articles even if the API is misconfigured;
draft details return 404 and the internal editorial/research pages are unavailable. Since zero
articles have passed verified medical review, production correctly has no visible article body yet.
In Next.js development mode, the draft preview is shown with warnings and reflects CMS/API edits
without rebuilding the Web bundle.

GitHub Actions additionally builds Next.js in API mode and exercises an integrated SSR smoke against
a production-mode Fastify instance. This is NOT a real hosted PostgreSQL password-authenticated
connection test; production deployment and secrets still need a hosting app connection.

## Credentials currently requiring hosting access

The database owner credential shared in a chat is not committed anywhere. Rotate it promptly and
prefer a narrowly scoped app role with only the necessary mebe schema permissions instead of using
the Supabase postgres owner for the long-lived Backend. Keep NODE_ENV=production and use trusted TLS.
Run npm run db:status and GET /health plus /v1/stages after deploying to prove the app-to-Supabase connection.

## Mobile live API and offline cache

Expo app can read the same Fastify API through the shared ApiKnowledgeRepository
and a MobileContentSync adapter using AsyncStorage 2.2.0 (Expo SDK 54).
The public API URL is not a secret, and must never be a PostgreSQL URI.

Set EXPO_PUBLIC_CONTENT_API_URL=https://your-public-backend-host on the MOBILE
build/runtime. It must be an HTTPS origin for a production build. In development
it may be an HTTP LAN address reachable from the emulator/device.

When configured: the app fetches stages and article summaries and caches them
for offline reading for up to 72 hours; a viewed article is cached separately.
Release UI and API transport restrict content to published articles and use a
separate cache namespace from preview mode. If server returns 404 for a revoked
article, its cached detail is removed. No secrets, accounts or private medical
data are stored by the feature. Offline previews are never automatically
promoted to public content.

If EXPO_PUBLIC_CONTENT_API_URL is not configured, the current development
client still offers bundled mock draft content, but the release UI does NOT
display bundled drafts. The seed is currently still a source import in the
prototype, so remove it completely from the release artifact before real
public distribution; an actual device/mobile binary build has NOT yet been
performed. Mobile API sync is tested by repository unit tests and TS checks.

Remaining mobile tasks: device smoke tests on iOS/Android, encrypted user
storage (when personal data is added), background sync/retries, offline
revocation behavior, auth and proper release-channel configuration.


## Production safety / container deployment

See `docs/backend-deployment.md` for API-only Docker build, `/health/ready`, private runtime settings and the hosting checklist. The Web production release gates unpublished articles even when configured with the mock provider; Mobile no longer imports the 24 draft JSON articles. The production Docker image excludes `.env` via `.dockerignore` and includes no database password. CI tests the Docker image against a mock provider; it does **not** claim a deployed password-authenticated connection to Supabase.

## Bộ dữ liệu tri thức có nguồn — cập nhật 22/11/2026

Dữ liệu seed phát triển đã được biên tập thành **72 bài viết tiếng Việt (6 bài cho mỗi 12 giai đoạn)**, bao gồm 24 bài cũ được bổ sung nguồn/độ chi tiết và 48 bài mới, liên kết **45 tài liệu nguồn** (WHO, UNICEF, CDC, NHS và nguồn trước đây). Mỗi bài có phần hướng dẫn, khi nào cần chuyên gia, liên kết trực tiếp ở cuối bài và chú thích nguồn gốc biên tập độc lập. `mock/manifest.json` mô tả giới hạn quyền sử dụng.

**Không sao chép toàn văn bên thứ ba**. Trích dẫn URL và mô tả ngắn không hàm ý các tổ chức nguồn chứng thực nội dung do dự án viết. Người đọc cần đối chiếu với hướng dẫn của cơ sở y tế tại Việt Nam khi liên quan xét nghiệm, lịch tiêm, thuốc hoặc tình huống cấp cứu.

**Tình trạng phát hành:** các bài vẫn là `draft`, không có bài `published`; triển khai Render hiện là một URL Internet thực, do đó không công khai các bài nháp chỉ vì dự án được gọi là dev. Kho dữ liệu có thể xem trong Supabase schema `mebe` và qua API ở môi trường phát triển được bảo vệ, chưa hiển thị công khai trên Web production. Cần cơ chế preview giới hạn quyền truy cập trước khi mở các bài nháp lên Web qua URL public. Không mặc nhiên áp dụng review y khoa nhiều tầng trong giai đoạn biên tập.

Cập nhật từ source đến database được thực hiện bằng migration nhập liệu có bảo toàn lịch sử, không được chỉnh sửa snapshot revision cũ và không ghi đè bài có nội dung do biên tập viên sửa.
