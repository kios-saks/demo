# Wireframe Desktop/Mobile — low fidelity V2
Đây là bản thiết kế đề xuất, không phải ảnh chụp hiện trạng hoặc giao diện đã code. SVG trong thư mục wireframes/ là tài liệu vector có thể chỉnh sửa; dữ liệu trên khung chỉ minh họa (không phải claim y khoa hoặc nội dung đã duyệt).

| Màn hình | Desktop 1440 reference (khung 1200) | Mobile 390 reference |
|---|---|---|
| Trang chủ | [Desktop](wireframes/home-desktop.svg) | [Mobile](wireframes/home-mobile.svg) |
| Khám phá / tìm kiếm | [Desktop](wireframes/explore-desktop.svg) | [Mobile](wireframes/explore-mobile.svg) |
| Chi tiết nội dung | [Desktop](wireframes/reader-desktop.svg) | [Mobile](wireframes/reader-mobile.svg) |
| Hành trình | [Desktop](wireframes/journey-desktop.svg) | [Mobile](wireframes/journey-mobile.svg) |
| Cá nhân | [Desktop](wireframes/personal-desktop.svg) | [Mobile](wireframes/personal-mobile.svg) |

## Quy tắc layout và hành vi
| Màn hình | Thứ tự ưu tiên / Desktop | Mobile / trạng thái |
|---|---|---|
| Trang chủ | Search lớn, 6 nhóm, gợi ý theo nhu cầu, tiếp tục đọc khi có dữ liệu | Search trước hero ảnh; nhóm 2–3 cột, không ảnh hero đẩy CTA xuống; không ép onboarding |
| Khám phá | Search + filter trái, kết quả phải; chips đang áp dụng, đếm thật, pagination | Search, chips, sheet bộ lọc có áp dụng/xóa; kết quả xuất hiện ngay; giữ vị trí khi back |
| Chi tiết | Breadcrumb, heading, meta, tóm tắt, nội dung; TOC sticky ở sidebar; nguồn, bài liên quan | Một cột, TOC thu gọn, nút lưu/chia sẻ; ưu tiên cảnh báo cần thiết trước phần dài; ảnh contain |
| Hành trình | Chặng quan tâm, đổi/xóa, checklist theo chặng, gợi ý đọc | Card gọn, chọn nhiều tùy ý; chưa chọn: CTA; không có checklist thì hướng dẫn/đọc thêm, không bịa tiến độ |
| Cá nhân | Tab đã lưu/đọc tiếp/tùy chọn, quyền riêng tư rõ | Empty state + khám phá; opt-in lịch sử; xóa dữ liệu có xác nhận; lỗi storage thông báo chính xác |

Mọi trang: cùng 4 đích chính Trang chủ / Khám phá / Hành trình / Cá nhân; desktop header, mobile bottom nav có safe-area và không che focus/CTA; nguồn ở footer. Focus nhìn thấy, aria-current, trạng thái active không chỉ màu; Back/Forward và deep link giữ bộ lọc; không có nhãn nội bộ. Link chia sẻ chỉ copy URL không chứa token/hồ sơ. Loading có skeleton hoặc thông báo ngắn; không biến lỗi API thành 0 kết quả; retry hữu hạn, không request trùng, bảo toàn dữ liệu.

## Design tokens đề xuất
- Warm Editorial: primary #285B46; text #24362D; muted #536459; background #FAF9F5; secondary #83A990; accent #D7B89C. Màu phụ dùng nền/điểm nhấn, không mặc định đủ contrast cho chữ.
- Font system sans hỗ trợ tiếng Việt; có thể dùng serif tiêu đề nếu đo tải và đọc tốt. Body 16–18px, line-height 1.65–1.8; chiều rộng đọc 60–75 ký tự là mục tiêu thiết kế. Không thu nhỏ chữ để nhét thẻ.
- Spacing 4/8/12/16/24/32/48; radius 10–16; grid 12 cột desktop, 1 cột đọc mobile; max width 1200–1280px. Hình ảnh không crop thông tin.
- Target nội bộ 44×44 CSS px cho thao tác chính; WCAG 2.2 AA, tương phản chữ thường ≥4,5:1, chữ lớn ≥3:1; tương phản UI, focus, zoom/reflow, keyboard, screen reader theo [WCAG 2.2](https://www.w3.org/TR/WCAG22/). 44px là mục tiêu thiết kế, không phải ngưỡng AA chung.
- Tránh ảnh chỉ về sơ sinh ở mọi chặng; không tạo hình ảnh y tế mới trong scope UI. Giữ chú thích AI và nguồn hiện có.

## Handoff
Mỗi frame phải được review thứ tự nội dung, copy, keyboard, mobile scroll, empty/error/loading và các giới hạn chuyên môn trước code. Frame tĩnh không mô phỏng tương tác hoặc xác nhận accessibility. Xem [checklist](sprint-roadmap.md).
