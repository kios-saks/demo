# S04-AZ-04H — trung niên 35–59
2026-11-26 · DEV draft

- 16/16 cẩm nang, tổng 187/219 (184 revised-draft + 3 expanded-draft), còn 32. Thêm 64 phần riêng, 32 việc thực hành. Giữ nguyên ID, bài ngoài phạm vi, legacy, lesson, media, trạng thái draft; 173/173 ô áp dụng vẫn partial-draft, không hạ publication gate.
- Kiểm tra trực tiếp dữ liệu bằng JavaScript trước commit: độ sâu ≥500 đơn vị tách khoảng trắng, 8 phần, 5 việc thực hành, source IDs, ánh xạ và không có đoạn mới trùng nguyên văn toàn kho cẩm nang. Chưa audit trùng ngữ nghĩa hoặc chạy Node suite.
- 17 nguồn tra cứu: 10 HTML, 5 tổng quan/metadata, 2 chỉ tìm kiếm. VssID mở timeout; cảnh báo Bộ Công an chỉ đọc kết quả tìm kiếm. Chưa đọc PDF luật/NIST, rà sửa đổi hoặc kiểm chứng mọi claim. Ví dụ VNĐ giả định; không thay tư vấn chuyên môn.
- Baseline trước đó báo 66/131; đối chiếu ledger bằng URL chuẩn hóa cuối dấu / chưa khớp số cũ (66 baseline, 67 bổ sung); giữ số cũ và lưu phần đối chiếu riêng. Không đồng nghĩa thẩm định claim.
- CI 04G f97fae3 run 45742275802: backend-container-smoke, postgres-integration, db-routing-integration PASS; test-and-build FAIL ở Content validation, web-api-integration FAIL ở Check production public content gate and reader interactions. QA-CONTENT-01/02/03, chuyên gia, browser, Node suite và CI mới chưa nghiệm thu. Không deploy hoặc merge.

| Nội dung | Trước/sau |
|---|---:|
| Tuổi 35–59: xây nhịp vận động, nghỉ ngơi và công việc bền vững | 230/554 |
| Dinh dưỡng tuổi 35–59: ăn cân bằng trong bữa cơm gia đình và khi có bệnh nền | 213/525 |
| Khám sức khỏe tuổi 35–59: dự phòng bệnh mạn tính và theo dõi có kế hoạch | 206/525 |
| Tâm lý trung niên: áp lực công việc, thay đổi gia đình và gánh nặng chăm sóc | 209/552 |
| Thay đổi sinh lý tuổi 35–59: tiền mãn kinh, sức khỏe tình dục và cơ thể | 210/554 |
| Học suốt đời tuổi 35–59: cập nhật kỹ năng và thích nghi thay đổi công việc | 216/542 |
| Chọn khóa đào tạo lại tuổi 35–59: chất lượng, đầu ra và khả năng học thực tế | 217/549 |
| An toàn tuổi 35–59: lao động, đi lại và chăm sóc người thân | 199/535 |
| Tư duy tuổi 35–59: kiểm chứng thông tin và đánh giá quyết định dài hạn | 208/537 |
| Công nghệ tuổi 35–59: thích nghi AI, bảo mật và chống lừa đảo | 217/570 |
| Quan hệ tuổi 35–59: con trưởng thành, cha mẹ lớn tuổi và ranh giới giữa các thế hệ | 212/548 |
| Sở thích tuổi 35–59: sáng tạo, thể thao và tham gia cộng đồng | 203/531 |
| Tài chính tuổi 35–59: kế hoạch dài hạn, hưu trí và dự phòng gia đình | 218/545 |
| Nghề nghiệp tuổi 35–59: chuyển nghề, cập nhật kỹ năng và phát triển vai trò | 215/558 |
| Pháp luật tuổi 35–59: lao động, bảo hiểm và quản lý hồ sơ tài sản | 221/561 |
| Kỹ năng sống tuổi 35–59: phân chia trách nhiệm, nghỉ ngơi và chăm sóc người thân | 211/544 |

## Nguồn
- [WHO — Physical activity](https://www.who.int/news-room/fact-sheets/detail/physical-activity) — opened: Khuyến nghị vận động và giảm ít vận động.
- [CDC — About Sleep](https://www.cdc.gov/sleep/about/) — opened: 18–60 tuổi ít nhất 7 giờ/ngày; chất lượng ngủ.
- [WHO — Healthy diet](https://www.who.int/news-room/fact-sheets/detail/healthy-diet) — opened: Đa dạng thực phẩm, natri và lưu ý muối thay thế chứa kali.
- [WHO — Hypertension](https://www.who.int/news-room/fact-sheets/detail/hypertension) — opened: Tăng huyết áp thường không triệu chứng; đo và dấu hiệu cần chăm sóc ngay.
- [WHO — Menopause](https://www.who.int/news-room/fact-sheets/detail/menopause) — opened: Mãn kinh tự nhiên, tiền mãn kinh và khả năng mang thai.
- [WHO — Mental health at work](https://www.who.int/news-room/fact-sheets/detail/mental-health-at-work) — opened: Khối lượng quá mức, quyền kiểm soát và hỗ trợ.
- [WHO — Social connection](https://www.who.int/news-room/questions-and-answers/item/social-connection) — opened: Chất lượng, chức năng, cấu trúc quan hệ; cô đơn và cô lập.
- [UNESCO — Lifelong learning](https://www.unesco.org/en/lifelong-learning) — opened: Học suốt đời, nâng cao và chuyển đổi kỹ năng.
- [OECD — Career Guidance for Adults in a Changing World of Work](https://www.oecd.org/en/publications/career-guidance-for-adults-in-a-changing-world-of-work_9a94bfad-en.html) — opened: Tóm tắt điều hành báo cáo 2021; không suy ra thị trường Việt Nam.
- [UNESCO — Media and Information Literacy](https://www.unesco.org/en/media-information-literacy) — opened-overview: Trang tổng quan chương trình năng lực thông tin; chưa đọc tài liệu chi tiết.
- [NIST — AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) — opened-overview: Khung tự nguyện về độ tin cậy AI, trang tổng quan; chưa đọc PDF.
- [CFPB — Emergency fund](https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/) — opened: Quỹ dự phòng cho chi phí bất ngờ; không áp luật Mỹ cho Việt Nam.
- [WHO — Occupational health](https://www.who.int/health-topics/occupational-health) — opened-overview: Tổng quan sức khỏe nghề nghiệp; không thay quy trình an toàn cụ thể.
- [Chính phủ — Luật BHXH 41/2024/QH15](https://vanban.chinhphu.vn/?classid=1&docid=211199&pageid=27160&typegroupid=3) — opened-overview: Metadata luật gốc, hiệu lực 01/07/2025; chưa đọc PDF hoặc rà sửa đổi.
- [Chính phủ — VBHN 18/VBHN-VPQH Bộ luật Lao động](https://vanban.chinhphu.vn/?classid=2629&docid=217002&pageid=27160) — opened-overview: Metadata văn bản hợp nhất 12/02/2026; chưa đọc PDF hoặc rà sửa đổi.
- [BHXH Việt Nam — Cách xử lý khi VssID hiển thị thiếu năm đóng BHXH](https://baohiemxahoi.gov.vn/tintuc/Pages/cai-cach-chinh-sach-bhxh.aspx?CateID=0&ItemID=25803&OtItem=date) — search-only: Kết quả tìm kiếm có hướng dẫn tra cứu, mở trang timeout.
- [Bộ Công an — 25 kịch bản lừa đảo năm 2026](https://www.bocongan.gov.vn/bai-viet/nang-cao-canh-giac-truoc-25-kich-ban-lua-dao-tren-khong-gian-mang-nam-2026-1788865614) — search-only: Kết quả tìm kiếm: giả danh, OTP, link độc hại; chưa mở toàn văn.

## Checklist
- [x] Nâng cấp 16/16; ma trận, roadmap, ledger, thêm test hồi quy.
- [x] Kiểm tra trực tiếp dữ liệu trước commit.
- [ ] Chạy toàn bộ Node suite, CI xanh, browser, audit nguồn theo claim, thẩm định chuyên gia.
- [ ] Content Pipeline Recovery QA-CONTENT-01/02/03.
- [ ] S04-AZ-04I: 16 nội dung 60–74 tuổi.
