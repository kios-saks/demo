# UI/UX Audit V2 — User-centric Knowledge Ecosystem
Ngày 26/11/2026 · Hành Trình Mẹ & Bé · Baseline ứng dụng 16b8762, tài liệu 39ac483
**Trạng thái: đề xuất thiết kế, chờ phê duyệt; không thay đổi ứng dụng.**

## Tóm tắt quyết định
Chuyển từ hai khu kiến thức song song sang một Knowledge Hub với Personal Journey. Ưu tiên tìm câu trả lời, tiếp đến khám phá theo chặng, thực hành và quay lại. Không mở rộng chức năng tài khoản, AI, dịch vụ hoặc mobile app trong sprint này.

**Đánh giá định tính 6,3/10** (trung bình làm tròn 9 tiêu chí): nền tảng nội dung 8,5; hình ảnh 8; đọc 7,5; trang chủ 6,5; điều hướng 6; mobile 6; tìm kiếm 4,5; cá nhân hóa 5; giữ chân 4,5. Không phải điểm chất lượng y khoa, dữ liệu analytics hoặc kết quả nghiên cứu người dùng. Nghiệm thu kỹ thuật 219/219 của bản hiện tại không chứng minh hiệu quả UX.

## Bằng chứng hiện trạng
| ID | Quan sát có thể đối chiếu trong mã | Hệ quả UX giả định | Mức |
|---|---|---|---|
| A01 | reader-library.ts, reader-navigation.ts: 6 nhóm/12 giai đoạn legacy; life-course-atlas.tsx: 12 chặng khác/16 lĩnh vực. | Người đọc khó chọn lối vào và hiểu sự chồng lặp 72 bài. | P0 |
| A02 | renderReaderLibrary lọc danh sách 72 bài theo title/summary/stage/tags; learning-hub.tsx tìm trong 21 lesson; 126 cẩm nang chỉ lọc theo chặng/trụ cột. | Từ khóa AI, tài chính, tuổi già có thể bỏ sót nội dung đã có. | P0 |
| A03 | home(): hero, hành trình, 6 nhóm, chip, featured, rồi liên kết A–Z gần cuối. | Nhu cầu ngoài mẹ và bé bị đẩy sâu; người mới khó nhận ra phạm vi vòng đời. | P0 |
| A04 | dev-preview.ts tạo reader shell; layout.tsx tạo Next shell khác; reader-ecosystem.css 4 tab mobile không có A–Z trực tiếp. | Chuyển trang mất cảm giác cùng một sản phẩm. | P0 |
| A05 | life-course-atlas.tsx có 12 nút, 16 thẻ, danh sách và cẩm nang trùng lối đọc; learning.css một cột trụ cột dưới 420px. | Cuộn dài trước khi thấy kết quả, tốn chú ý. | P0 |
| A06 | 126 cẩm nang và 21 lesson mở details trong trang tổng hợp; #az/#lesson phụ thuộc trạng thái lọc. | Deep link, chia sẻ, quay lại, mục lục không thống nhất. | P1 |
| A07 | reader-local.js và reader-library.ts lưu slug legacy; A–Z không có cùng hành vi lưu/đọc tiếp. | Người quay lại không tìm được toàn bộ thứ đã quan tâm. | P1 |
| A08 | Journey chỉ lưu một stage legacy; atlas mặc định baby; lesson có 7 nhóm tuổi. | Người quan tâm nhiều thế hệ phải đổi liên tục; mặc định có thể sai. | P1 |
| A09 | CSS hiện có focus, responsive và ảnh contain; test 72×4 đã PASS; không có kết quả field CWV hoặc kiểm thử toàn bộ A–Z với AT. | Không suy ra khả năng tiếp cận thực tế từ CI. | P1 |
| A10 | Post-deploy chứng minh nội dung hiển thị nhưng không đo thời gian/tỷ lệ thành công nhiệm vụ người dùng. | Thiếu bằng chứng hành vi để ưu tiên tiếp. | P1 |

Mã đối chiếu tại baseline: [reader library](../../apps/web/lib/reader-library.ts), [reader navigation](../../apps/web/lib/reader-navigation.ts), [reader shell](../../apps/web/lib/dev-preview.ts), [Next layout](../../apps/web/app/layout.tsx), [atlas](../../apps/web/app/hoc-cung-con/life-course-atlas.tsx), [learning hub](../../apps/web/app/hoc-cung-con/learning-hub.tsx), [CSS](../../apps/web/app/hoc-cung-con/learning.css), [local state](../../apps/web/public/reader-local.js), [inventory](../../apps/web/app/hoc-cung-con/life-course-inventory.json). [CI](https://github.com/kios-saks/demo/actions/runs/45758373690), [live QA](https://github.com/kios-saks/demo/actions/runs/45765933955), [sitemap hiện trạng](../web-sitemap-and-architecture-2026-11-26.md).

## Giả thuyết hành vi và JTBD
| Người dùng / ngữ cảnh | Việc cần làm | Ma sát hiện tại | Hành vi đề xuất |
|---|---|---|---|
| Người chăm trẻ, dùng một tay, ít thời gian | Tìm ăn dặm 6 tháng, giấc ngủ, khi nào tìm trợ giúp | Chọn nhiều cấp, cuộn dài | Tìm kiếm ngay; lọc độ tuổi tùy chọn; kết quả có tóm tắt, lưu ý an toàn có nguồn |
| Cha/mẹ chuẩn bị sinh | Biết việc cần chuẩn bị, lưu bài và checklist | Tách danh mục, hành trình một stage | Đường vào theo nhu cầu; kế hoạch có thể đánh dấu, đọc lại |
| Người trẻ | Tìm AI, nghề nghiệp, tài chính | Thương hiệu và entry thiên về trẻ nhỏ; search bỏ sót | Search mọi chặng; nội dung và hình ảnh trưởng thành |
| Người chăm người cao tuổi / người lớn tuổi | Tìm kiến thức, dễ đọc, quay lại | 16 thẻ mobile, chữ nhỏ, menu không đồng nhất | Cỡ chữ, target lớn, lọc gọn, nguồn và giới hạn rõ |
| Người quay lại | Tiếp tục đọc, xem các bài lưu cho nhiều chặng | Chỉ lưu legacy, một chặng | Kho chung, nhiều mối quan tâm cục bộ, chọn/xóa tự do |

Đây là persona giả thuyết (không gán dữ liệu thật hoặc hành vi chắc chắn theo tuổi/giới). UX-10 kiểm chứng bằng nhiệm vụ quan sát. Với câu hỏi y tế khẩn cấp không được biến search thành công cụ chẩn đoán; thông tin an toàn phải dựa trên nguồn đã kiểm chứng và giới hạn chuyên môn.

## Nguyên tắc thiết kế
1. Tìm trước, lọc sau; không bắt chọn tuổi/đăng nhập.
2. Một mục Khám phá, một chỉ mục 219, một mô hình định danh nội dung, một shell điều hướng.
3. Progressive disclosure: 6 nhóm tuổi dễ quét, 12 chặng chi tiết, 16 lĩnh vực qua bộ lọc; không bỏ taxonomy legacy trong dữ liệu.
4. Đọc nhanh và đọc sâu cùng tồn tại, không mất nguồn, hình ảnh hoặc giới hạn áp dụng; nội dung chưa thẩm định không gắn nhãn đã duyệt.
5. Mobile-first, dùng bàn phím được, chữ Việt rõ, không phụ thuộc màu, thiết kế phù hợp cả người lớn tuổi.
6. Cá nhân hóa do người dùng chọn, local-first; không thu tên, ngày sinh, bệnh, tài chính, hồ sơ trẻ hoặc từ khóa nhạy cảm.
7. Giữ ranh giới DEV/Production, noindex, kiểm soát CMS, revision, media, guest denial; không mở Production.

## Phạm vi V2
Bao gồm UX-01–10, 5 màn hình chính, responsive, định tuyến tương thích, trạng thái rỗng/lỗi/loading, search ranking xác định được, bookmark/multi-interest, kiểm thử. Không bao gồm viết lại 219 nội dung, chuyển toàn bộ sang DB, tài khoản thật/đồng bộ cloud, công cụ y tế, AI chat, directory trường, thương mại, phát hành Mobile.

## Liên kết
- [Sitemap mới & hợp đồng IA](sitemap-v2.md)
- [Wireframe và design specification](wireframes.md)
- [Sprint backlog, acceptance và nghiên cứu UX](sprint-roadmap.md)
