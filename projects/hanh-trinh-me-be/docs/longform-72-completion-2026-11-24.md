# Biên tập chuyên sâu 72/72 bài · 24/11/2026

## Phạm vi hoàn thành

- **72 bài viết chuyên sâu** theo 12 giai đoạn, **6 bài/giai đoạn**.
- **64 bài** được nâng từ 4 phần lên **12 phần**, bổ sung 6 chương viết riêng theo chủ đề và 2 phần liên kết bối cảnh/chỉ dẫn chung của giai đoạn.
- **8 bài chuyên sâu ban đầu** được giữ nguyên (10 phần/bài).
- **Mỗi bài >=900 từ**: kiểm tra trực tiếp Supabase cho kết quả 939–1.241 từ, trung bình khoảng 1.105 từ/bài. Mốc từ là chỉ số độ đầy đủ sơ bộ, không bảo đảm chất lượng hoặc tính đúng của từng khuyến cáo.
- 72 ảnh bìa, 27 infographic, nguồn, tag và tóm tắt hiện tại được giữ nguyên; thời gian đọc cập nhật theo độ dài.
- **Tất cả vẫn là `draft`, 0 bài published**, chưa ghi ngày duyệt y khoa.

## Cấu trúc 64 bài bổ sung

Mỗi bài có các phần riêng: bối cảnh, chuẩn bị và từng bước thực hành, tình huống gia đình, điều cần thận trọng, câu hỏi để trao đổi, theo dõi tiếp. Hai phần bổ sung liên kết mạch nội dung của giai đoạn (mối quan tâm liên quan, checklist và FAQ). Bốn phần cũ còn được giữ lại nhằm bảo toàn thông tin và nguồn đã biên tập.

Để tránh việc biên tập trở nên rời rạc:
- Các phần viết riêng ở `packages/content/mock/depth-briefs/<stage>.json` (12 file, 64 bản ghi).
- Script tái lập dữ liệu: `scripts/expand-depth-content.mjs`.
- Snapshot nội dung Web/API: `packages/content/articles.json`.
- `npm run check:depth` kiểm tra tất cả 64 brief có đủ sáu phần, khớp bản đã commit và bảo vệ 8 bài pilot.
- `npm run check:content` kiểm tra 72/72 bài có >=10 phần, >=900 từ, 2+ nguồn và thời gian đọc phù hợp.

## Kiểm tra database

64 cập nhật Supabase được thực hiện theo điều kiện:
- đúng 4 phần của bản trước trong GitHub,
- đúng `slug` và giai đoạn,
- `draft` và chưa có yêu cầu duyệt hay phê duyệt,
- chỉ ghi `sections`, `readMinutes`, `revision`, `last_editor_id` và `updated_at`,
- lưu một snapshot ở `editorial_revisions` và một sự kiện `editorial_events` mỗi bài.

Đối chiếu DB ngày 24/11/2026: **72/72** bài đủ chuẩn cấu trúc; **64/64** chỉnh sửa mới có snapshot và audit event; **0 bài published**.

## Phương pháp nghiên cứu và giới hạn trách nhiệm

Nội dung bằng tiếng Việt được viết mới, dựa trên tài liệu tham khảo được đính kèm sẵn từ các đơn vị như WHO, CDC, NHS và UNICEF. Các mô tả tình huống và câu hỏi thực hành là biên tập độc lập, không phải bản dịch chính thức hoặc lời khuyên được các tổ chức nguồn bảo trợ.

**Chưa hoàn tất kiểm chứng từng luận điểm theo nguồn; chưa được nhân viên y tế phê duyệt.** Các chủ đề có nguy cơ cao gồm: dấu hiệu nguy hiểm mẹ và trẻ, thai máy, dùng thuốc, dinh dưỡng, ngủ an toàn, sơ cứu và sức khỏe tinh thần. Khi thẩm định, cần đối chiếu hướng dẫn hiện hành tại Việt Nam, chỉnh sửa các khẳng định chưa được nguồn hỗ trợ, ký duyệt theo đúng bản revision và ghi người duyệt/ngày duyệt.

Không tự động thay đổi `status` để public; chưa được merge PR khi thiếu kiểm thử cuối và đánh giá UX thực tế.

## Công việc tách khỏi mục tiêu viết nội dung

- Kiểm duyệt y khoa và mapping từng claim → nguồn.
- Bản quyền và duyệt từng infographic.
- CMS production (tài khoản thật, MFA, RBAC theo người, duyệt revision và media).
- Mobile, kiểm thử thiết bị thực và chính sách dữ liệu trẻ em.
- Chạy smoke kiểm tra kết nối thực Web–API–Supabase sau deploy.

## Kiểm tra nhanh

```bash
cd projects/hanh-trinh-me-be
npm ci
npm run check:depth
npm run check:content
npm test
npm run build:web
```

Đường dẫn DEV đã bảo vệ: `/dev-review`. Trang chủ công khai giữ bài nháp ẩn và dùng `noindex`.
