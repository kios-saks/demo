# Kiến trúc hệ sinh thái

## MVP đang có
Next.js web và Expo app đọc cùng một bộ JSON. Fastify cung cấp API public chỉ đọc. Không có tài khoản, DB thực, CMS đăng nhập, AI hay deploy production.

## Hướng triển khai
- **FE Web** Next.js SEO, accessibility, theo giai đoạn, search, trang bài.
- **Mobile** Expo React Native, bookmark local-first, offline cache và push opt-in (tương lai).
- **BE** Fastify/NestJS, OpenAPI, auth/RBAC, content, personal timeline, notifications, analytics.
- **CMS** quản lý tác giả, nguồn, version, review y khoa, lịch xuất bản; admin MFA.
- **Data** PostgreSQL + Prisma, object storage media, Redis queue, full-text search.
- **Marketing** SEO clusters, newsletters consent, social planning, UTM, affiliate disclosure.
- **Ops** staging/prod, GitHub Actions, tests, backups, OpenTelemetry, secrets, rate limits.

## Entities dự kiến
`users`, `households`, `household_members`, `child_profiles` (nên ưu tiên tuổi tương đối thay vì ngày sinh đầy đủ), `stages`, `topics`, `articles`, `article_revisions`, `article_sources`, `editorial_reviews`, `media_assets`, `family_events`, `consents`, `notification_preferences`, `campaigns`, `affiliate_clicks`, `audit_logs`.

## Publication state machine
Draft → fact-check → clinical review (khi có nội dung y khoa) → editor approval → published → re-review/withdraw. Mỗi approval gắn với revision bất biến. Bất kỳ sửa đổi nào làm mất approval trước đó.

## Quyền
Reader chỉ thấy published; writer chỉnh draft; editor duyệt văn phong; reviewer có chuyên môn duyệt lâm sàng; admin quản lý nhưng không được bỏ qua bước review. Phân quyền ở API, không chỉ ở UI.

## Privacy/safeguarding
Không thu thập dữ liệu sức khỏe bé trong MVP. Bản production cần đánh giá pháp lý ở Việt Nam; đồng ý hợp lệ, bảo vệ trẻ em, xóa/export, tách dữ liệu công khai và gia đình, mã hóa, signed URLs, giám sát và incident response. Không gửi symptom searches, birth dates hay child ID sang hệ thống quảng cáo.
