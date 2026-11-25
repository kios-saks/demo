# S03-08 — Quyết định truy cập Reader DEV bằng link
25/11/2026 — chủ dự án yêu cầu không cần mã mời; ai có link đều đọc được.
- Chỉ Combined DEV service srv-dc19cibl550s73drji5g; Production, Backend cũ, CMS, API preview token và dữ liệu cá nhân vẫn giữ bảo vệ.
- Nội dung draft vẫn chưa thẩm định y khoa; noindex/no-store, không thay đổi trạng thái bài trong DB. Link access là truy cập công khai trên Internet, không phải bảo mật.
- Không xóa hay đổi token hiện có. Không yêu cầu GitHub secret mã mời cho browser test DEV mở.
- S03-08 trước thay đổi: cd05772 LIVE dep-dc39rm2jnfac73a5238g; CI 45575549767 5/5, runtime Reader/CMS PASS; browser run 45581480905 guest denial PASS, authenticated BLOCKED thiếu secret. Không ghi nhận PASS tương tác.
- Cổng nghiệm thu mới: browser context sạch, mở /hanh-trinh và bài viết trực tiếp không token, checklist/progress/reload/reset/bookmark/responsive/clear; CMS guest vẫn 404, Production gate CI vẫn PASS. Chỉ đóng sau deploy đúng commit và live browser PASS.
