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

## Phase 3: contextual visuals and coverage · 24/11/2026

- Lifestyle photos active in the branch: hero, 4/6 group images (preconception, pregnancy, first year, school age+), 2 cover images (play and infant interaction), 2 contextual inline photos (birth bag and infant play). The remaining postpartum and 1–5 group visuals and remaining highlighted cover photos retain their original SVGs until suitable original photographs are reviewed. Do not reuse the same photo for unrelated slots. Generated mockup screenshots are not product assets.
- All 72 article routes are designed to render an inline knowledge visual: retain 27 existing source-linked infographics and supplement the other 45 with two-block accessible SVG reading cards composed from the actual first two paragraphs available to the authorized reader. These cards are not new clinical guidance, not standalone public media, and not 45 new photographs. Exact paragraph excerpts, separate article source anchor, and explicit unreviewed status preserve context and reduce risk. Original article body and stored media data unchanged.
- Contextual inline photo manifest requires exact article slug, section index and heading, descriptive alt/caption, original AI provenance, checksum, editorial DEV approval. No medical procedure illustrated. Validate source image dimensions, integrity and size, and responsive display at 390/768/1024/1440px. No new database writes or publication status changes. Keep PR draft. CI and deployment must be verified before announcing live.

## Phase 5 — featured artwork and expanded visual regression

- All 6 journey groups and all 6 selected homepage articles have original lifestyle WebP artwork; 17 approved development assets in the registry (1 hero, 6 groups, 7 article covers, 3 inline photographs). The remaining 65 article covers use original editorial SVGs. 
- Four new files from generation 5d1cadd1-5d0e-4b64-8c79-c0becaa3a335: postpartum support, empty crib, learning together, and contextual play illustration. Optimized to 960 × 540, 129,230 bytes total, with distinct checksums, provenance and alt text. The empty crib is contextual, not a product safety certification; no clinical approval is claimed.
- The 72-article library retains 27 source-linked infographics and 45 excerpt cards. Three articles have separate section-anchored lifestyle photographs. The other 69 do not yet have an additional lifestyle photograph: this is intentionally tracked separately from coverage of reading visuals. Future batches should select a meaningful scene for a specific section, not reuse covers or generate new medical claims. 
- Expanded Chromium regression now visits all 72 protected article routes at widths 390/768/1024/1440, checks image decode/aspect, overflow, excerpt text bounds, infographic presence and contextual photo presence. HTTP smoke additionally requires six distinct group and six featured WebP URLs. Actual CI result and Render status must be verified independently before marking deployment complete.
- Preserve seed, Supabase, preview gate, sources, and PR #1 Draft. AI mockups are not actual screenshots and are not production assets.

## Quy tắc hình ảnh gia đình · 24/11/2026

- Hình ảnh phải truyền cảm hứng cho gia đình: yêu thương, quan tâm, học tập, vui chơi, chia sẻ trách nhiệm, chuẩn bị và lắng nghe. Không dùng hình ảnh gợi dục, khiêu khích, khoe cơ thể, tình huống thân mật tình dục hoặc nội dung gây sốc.
- Với chủ đề dậy thì, ranh giới, sức khỏe sinh sản và chăm sóc y khoa, ưu tiên cảnh trò chuyện gia đình, sách vở, lịch hẹn, đồ vật hoặc không gian. Không minh họa vùng cơ thể riêng tư, thủ thuật, triệu chứng hoặc cách điều trị bằng ảnh sinh AI. Không đánh đồng minh họa ngữ cảnh với thẩm định chuyên môn.
- Mỗi ảnh inline phải có slug riêng, index đoạn và heading khớp nội dung thực, chú thích mô tả đúng cảnh, alt, provenance, quyền sử dụng và checksum. Không dùng chung ảnh hoặc thay thế bằng mockup báo cáo. Chỉ kích hoạt ảnh đã kiểm tra ngữ cảnh trên DEV; giữ nguyên nguồn và bài viết gốc.
- Lô 2 ảnh inline tại commit 0c6eef7: 9 ảnh WebP 960×540 (tình bạn, đạp xe, sách tranh, trò chơi đóng vai, góc học, đọc trước ngủ, làm quen trường, lắng nghe tuổi teen, chuẩn bị bữa ăn mang đi). Tổng 21/72 bài có ảnh lifestyle inline; còn 51. CI và Render của commit mới cần xác minh riêng.
