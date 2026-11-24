# Đánh giá hình ảnh – Hành Trình Mẹ & Bé

24/11/2026 · Visual Content Redesign · Tài liệu tham chiếu

## Đánh giá từ góc nhìn phụ huynh

Điểm định tính 5,5/10, dựa trên mã tạo ảnh và tài nguyên SVG, chưa phải khảo sát hoặc đo live. Đồng nhất thương hiệu 8/10, tỷ lệ 8/10, đa dạng 3,5/10, cảm xúc 4/10, phù hợp nội dung 5/10, chuyên nghiệp 5/10, tiềm năng tải nhanh 9/10.

66/72 cover dùng 12 motif theo giai đoạn, lặp tiêu đề, logo và bố cục. 6 ảnh nguyên bản có nhiều khoảng trống. Các nhóm hành trình dùng lại cover bài viết. 24 infographic tự sinh chia ba cột ngang; chữ 27px ở ảnh 1200px chỉ khoảng 8px trên điện thoại 360px. Một số ảnh chứa nhãn DEV. Đồng nhất không đồng nghĩa với trùng lặp; ưu tiên nội dung hình ảnh, cảm xúc và ngữ cảnh người dùng.

## Visual Design System — Warm Lifestyle Editorial

- Sage #285B46, sage nhạt #B8C9AD, kem #FAF9F5, be #E8C8B5, cam đất #9B5042. Tông da đa dạng, ánh sáng tự nhiên, bố cục có khoảng thở và chủ thể rõ. Tránh dùng chữ/logo trong ảnh bìa, vì tiêu đề đã có ở HTML.
- Hướng dài hạn: 60% ảnh đời sống, 25% minh họa kiến thức, 15% infographic/sơ đồ (định hướng chứ không phải quota bắt buộc). Không giả nhận ảnh AI/vector là ảnh chụp thật. Ảnh editorial tự vẽ là lựa chọn nhẹ, không phụ thuộc nguồn ngoài; ảnh chụp hoặc ảnh AI chân thực là bước sản xuất riêng khi có tài nguyên và kiểm duyệt.
- Hero: gia đình tương tác, không dùng lại cover bài. 6 nhóm hành trình có ảnh riêng; 12 chặng có ảnh riêng phản ánh đúng độ tuổi; 72 cover có brief theo từng slug, không lặp motif cả chặng. Giữ URL asset hiện có nếu có thể để không cần ghi Supabase. Hình ảnh 16:9, không cắt nội dung. Hero ưu tiên tải, ảnh dưới fold lazy.
- Infographic: bố cục dọc, 3 bước rõ, chữ dễ đọc trên mobile, bản text HTML đi kèm; giữ nguồn gốc và lưu ý chưa thẩm định. Không đưa nhãn DEV vào hình. Không thay đổi claim y khoa từ bản dữ liệu đã có. Không tạo minh họa thao tác lâm sàng khi chưa được kiểm duyệt.
- Không lấy ảnh stock chưa rõ license, logo bên thứ ba, ảnh trẻ thật không có quyền, hotlink hoặc giả mạo chuyên gia. Tài nguyên mới tự vẽ bằng code hoặc có hồ sơ license, nguồn, tác giả, quyền sử dụng. Không tuyên bố được WHO/CDC/NHS chứng thực. Bản quyền/clinical review là quy trình riêng trước release.
- Kiểm tra 390/768/1024/1440px, tương phản, alt, kích thước, không tràn ngang, tỷ lệ nguyên bản; kiểm thử actual browser. Kiểm tra manifest đủ 72/27, từng brief, không DEV trong ảnh, bảo toàn toàn bộ seed và DB.

## Roadmap

P0 Hero, 6 nhóm, bỏ nhãn DEV trong media. P1 12 ảnh chặng, 72 cover riêng theo nội dung, 27 infographic responsive. P2 hình trong bài, CMS media, sản xuất ảnh lifestyle thực/AI có kiểm duyệt. Không merge PR #1, không publish draft, không thay đổi dữ liệu hoặc token. Chỉ báo PASS từ kiểm thử thực tế.
