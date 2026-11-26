# S04-AZ-04G — trưởng thành 23–34
26/11/2026 · DEV draft

- 16/16 cẩm nang A–Z; tổng 171/219, 48 chờ. Không thay legacy, lessons, media, ID, draft hoặc nội dung ngoài phạm vi. 64 phần mới riêng từng chủ đề, 32 việc thực hành; không có đoạn mới trùng nguyên văn sau chuẩn hóa khoảng trắng; chưa audit trùng ngữ nghĩa toàn kho.
- 16/16 đạt >=500 đơn vị tách khoảng trắng, >=8 phần, >=5 việc thực hành. Ví dụ VNĐ, thời gian và công việc là giả định; không tư vấn y khoa, pháp lý hoặc tài chính cá nhân.
- 29 nguồn đã tra cứu: 18 nội dung HTML, 8 trang tổng quan/metadata, 3 chỉ kết quả tìm kiếm. CDC preconception URL cũ lỗi, thay Planning for Pregnancy; Luật Hôn nhân trang cache miss, Dân sự URL cũ 500; chưa đọc PDF luật/NIST/UNESCO hoặc đối chiếu mọi sửa đổi và claim. OECD đọc tóm tắt điều hành, không coi là dữ liệu VN hiện tại.
- Baseline 66/131 đã tra cứu, 65 chờ; 65 URL bổ sung theo quy tắc khớp URL bỏ / cuối (không đồng nghĩa kiểm chứng claim).
- CI commit cdc7d51 run 45741593416: backend smoke, PostgreSQL, routing PASS; test-and-build và web-api-integration FAIL. QA-CONTENT-01/02/03 chưa xử lý trong phạm vi 04G, không hạ điều kiện hoặc mở publication gate. Kiểm tra trực tiếp 16 mục, 219 ID, 173 ô draft, nguồn, độ sâu, không đổi bài ngoài phạm vi. Thêm test Node; CI mới chưa xác nhận.

| Nội dung | Trước/sau |
|---|---:|
| Ăn uống khi đi làm tuổi 23–34: cân bằng giữa thời gian, chi phí và sức khỏe | 251/617 |
| Khám sức khỏe chủ động tuổi 23–34: xây hồ sơ và kế hoạch theo nguy cơ | 219/605 |
| Căng thẳng tuổi 23–34: phân biệt khó khăn nhất thời với nhu cầu hỗ trợ | 224/598 |
| Sức khỏe sinh sản 23–34: lựa chọn có con, tránh thai và chuẩn bị chăm sóc | 218/604 |
| Nhịp sống tuổi 23–34: ngủ, vận động và thời gian phục hồi khi đi làm | 215/582 |
| Học nâng cao 23–34 tuổi: chọn kỹ năng có ích và xây sản phẩm thực tế | 215/590 |
| Chọn chương trình đào tạo tuổi 23–34: học nghề, học thêm hay chứng chỉ | 220/597 |
| An toàn tuổi 23–34: công việc, giao dịch số và kế hoạch khẩn cấp | 216/602 |
| Tư duy tuổi 23–34: ra quyết định bằng bằng chứng và phương án dự phòng | 212/581 |
| AI trong công việc 23–34 tuổi: hiệu quả, kiểm thử và bảo vệ dữ liệu | 217/604 |
| Quan hệ tuổi 23–34: hôn nhân, sống riêng và kết nối tôn trọng | 214/603 |
| Sở thích tuổi 23–34: nghệ thuật, vận động và nghỉ ngơi giữa công việc | 205/571 |
| Tài chính 23–34 tuổi: ngân sách, quỹ dự phòng, nợ và bảo hiểm | 226/588 |
| Nghề nghiệp 23–34 tuổi: phát triển kỹ năng, chuyển việc và thương lượng | 215/599 |
| Pháp luật đời sống 23–34 tuổi: hợp đồng, nhà ở, cư trú và bảo hiểm | 203/580 |
| Kỹ năng sống 23–34 tuổi: quản lý thời gian, việc nhà và chăm sóc người thân | 210/589 |

## Nguồn và phạm vi
- [WHO — Healthy diet](https://www.who.int/news-room/fact-sheets/detail/healthy-diet) — opened: Đa dạng và cân bằng thực phẩm; không kê khẩu phần cá nhân.
- [WHO — Five keys to safer food](https://www.who.int/activities/promoting-safe-food-handling/five-key-to-safer-food) — opened: Năm nguyên tắc an toàn thực phẩm.
- [WHO — Noncommunicable diseases](https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases) — opened: Yếu tố nguy cơ bệnh không lây và dự phòng.
- [WHO Việt Nam — Hypertension](https://www.who.int/vietnam/news/fact-sheets/detail/hypertension) — opened: Tăng huyết áp có thể không có triệu chứng; đo và đánh giá chuyên môn.
- [WHO — Mental health at work](https://www.who.int/news-room/fact-sheets/detail/mental-health-at-work) — opened: Can thiệp điều kiện công việc và nguy cơ tâm lý xã hội.
- [WHO — Burn-out an occupational phenomenon](https://www.who.int/news/item/28-05-2019-burn-out-an-occupational-phenomenon-international-classification-of-diseases) — opened: ICD-11: hiện tượng nghề nghiệp, không phải bệnh; không áp dụng mọi lĩnh vực đời sống.
- [WHO — Family planning/contraception methods](https://www.who.int/news-room/fact-sheets/detail/family-planning-contraception) — opened: Quyền lựa chọn, các phương pháp và vai trò bao cao su.
- [CDC — Planning for Pregnancy](https://www.cdc.gov/pregnancy/about/index.html) — opened: Trang 14/07/2026; tư vấn tiền thai, thuốc, tiêm chủng, axit folic; không kê liều cá nhân.
- [CDC — About Sleep](https://www.cdc.gov/sleep/about/) — opened: 18–60 tuổi ít nhất 7 giờ/ngày, chất lượng ngủ.
- [WHO — Physical activity](https://www.who.int/news-room/fact-sheets/detail/physical-activity) — opened: Lợi ích và cơ hội vận động; không kê cường độ cá nhân.
- [UNESCO — Lifelong learning](https://www.unesco.org/en/lifelong-learning) — opened: Học suốt đời, nâng cao và chuyển đổi kỹ năng.
- [OECD — Career guidance for adults in a changing world of work](https://www.oecd.org/en/publications/career-guidance-for-adults-in-a-changing-world-of-work_9a94bfad-en.html) — opened: Đã đọc tóm tắt điều hành HTML báo cáo 2021; không suy ra thị trường VN 2026.
- [Cục Quản lý chất lượng — Kiểm định chất lượng giáo dục](https://vqa.moet.gov.vn/vi/thong-bao-quan-ly-bao-dam/) — opened-overview: Danh mục thông báo, không xác nhận từng chương trình hoặc tình trạng mới nhất.
- [WHO — Occupational health](https://www.who.int/health-topics/occupational-health) — opened: Phòng nguy cơ nghề nghiệp và môi trường làm việc.
- [Bộ Công an — Cảnh giác 25 kịch bản lừa đảo 2026](https://www.bocongan.gov.vn/bai-viet/nang-cao-canh-giac-truoc-25-kich-ban-lua-dao-tren-khong-gian-mang-nam-2026-1788865614) — search-only: Kết quả tìm kiếm: OTP, giả danh và việc nhẹ lương cao; mở trang cache miss.
- [UNESCO — Media and Information Literacy](https://www.unesco.org/en/media-information-literacy) — opened: Năng lực đánh giá thông tin có phê phán.
- [UNESCO — Guidance for generative AI in education and research](https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research) — opened-overview: Trang giới thiệu hướng dẫn, vai trò con người và dữ liệu; chưa đọc PDF.
- [NIST — AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) — opened-overview: Khung tự nguyện, đang được sửa đổi; trang tổng quan, chưa đọc toàn văn PDF.
- [Chính phủ — Luật 91/2025/QH15 Bảo vệ dữ liệu cá nhân](https://vanban.chinhphu.vn/?docid=214590&pageid=27160) — opened-overview: Metadata, chưa đọc PDF hoặc rà văn bản hướng dẫn.
- [WHO — Social connection](https://www.who.int/news-room/questions-and-answers/item/social-connection) — opened: Kết nối xã hội, cô đơn và thay đổi đời sống.
- [WHO — Violence against women](https://www.who.int/news-room/fact-sheets/detail/violence-against-women) — opened: Bạo lực bạn tình và hậu quả sức khỏe; nguồn tập trung phụ nữ.
- [Chính phủ — Luật Hôn nhân và gia đình 52/2014/QH13](https://vanban.chinhphu.vn/?classid=1&docid=175351&pageid=27160) — search-only: Metadata qua kết quả tìm kiếm, mở trang cache miss; chưa đọc PDF.
- [CFPB — Your Money, Your Goals toolkit](https://www.consumerfinance.gov/consumer-tools/educator-tools/your-money-your-goals/toolkit/) — opened: Thu chi, nghĩa vụ và quyết định nợ; không áp luật Mỹ cho Việt Nam.
- [CFPB — Emergency fund](https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/) — opened: Dự phòng tùy tình hình và chi phí bất ngờ.
- [Chính phủ — Luật BHXH 41/2024/QH15](https://vanban.chinhphu.vn/?docid=211199&pageid=27160) — opened-overview: Metadata luật gốc, chưa đọc PDF/rà sửa đổi.
- [Chính phủ — VBHN 18/VBHN-VPQH Bộ luật Lao động](https://vanban.chinhphu.vn/?classid=0&docid=217002&pageid=27160) — opened-overview: Metadata văn bản hợp nhất, chưa đọc PDF/rà sửa đổi.
- [Chính phủ — Bộ luật Dân sự 91/2015/QH13](https://vanban.chinhphu.vn/?classid=&docid=183188&pageid=27160) — search-only: Metadata qua kết quả tìm kiếm; URL cũ trả lỗi 500; chưa đọc PDF.
- [Chính phủ — VBHN 132/VBHN-VPQH Luật Nhà ở](https://vanban.chinhphu.vn/?docid=215257&pageid=27160) — opened-overview: Metadata, chưa đọc PDF/rà sửa đổi.
- [Chính phủ — Luật Cư trú 68/2020/QH14](https://vanban.chinhphu.vn/?docid=202609&pageid=27160) — opened-overview: Metadata luật gốc, chưa đọc PDF/rà sửa đổi.

## Checklist
- [x] 16/16, ma trận, roadmap, ledger, test.
- [x] Kiểm tra dữ liệu trực tiếp.
- [ ] Content Pipeline Recovery QA-CONTENT-01/02/03; CI đầy đủ, browser, xác minh claim, thẩm định chuyên gia.
- [ ] 16 nội dung tuổi 35–59 (04H).
Không đổi Auth/DB/Family/Mobile, không deploy DEV/Production.
