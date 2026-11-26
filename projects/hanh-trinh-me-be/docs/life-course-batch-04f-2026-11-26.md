# S04-AZ-04F — trưởng thành trẻ 18–22
26/11/2026 · DEV draft

- 19/19: 6 legacy, 3 micro-lesson, 10 cẩm nang; 155/219, 64 chờ. Giữ ID, media, draft, bài ngoài phạm vi.
- Bỏ 12 khối dùng chung; thêm 4 phần và 2 việc thực hành/cẩm nang. Không tuyên bố rà trùng ngữ nghĩa toàn kho. Ví dụ tài chính và dữ liệu giả định.
- 22 trang mở được (5 tổng quan/metadata), 2 chỉ kết quả tìm kiếm. Cổng tuyển sinh 403, danh sách kiểm định 30/9/2026 cache miss, Bộ Công an mở lỗi; không xác nhận bản mới nhất/trường cụ thể. CFPB budgeting lỗi, thay toolkit đọc được. Chưa đọc PDF luật/UNESCO, chưa xác minh toàn bộ claim.
- Baseline 61/131 đã tra cứu, 70 chờ, 58 bổ sung (khớp URL theo quy tắc bỏ / cuối, không đồng nghĩa xác minh claim).
- CI 8c6cba9 run 45740623488: 2 job DB pass, 3 fail vì generate-infographics.mjs đọc manifest cũ. Đồng bộ đúng một URL trong packages/content/mock/infographic-cards.json, không đổi ảnh/text. Kiểm tra trực tiếp 24 manifest và 27 inline, không còn URL lệch; thêm test. CI mới chưa xác nhận.
- Kiểm tra 19 ID, 219 inventory, 173 ô có draft, nguồn, bài ngoài phạm vi, ảnh và trạng thái. Test hồi quy bổ sung.

| Nội dung | Token trước/sau |
|---|---:|
| Khi con bắt đầu tự lập | 986/958 |
| Giữ kết nối gia đình khi con đã lớn | 945/904 |
| Lập kế hoạch tự lập sau 18 tuổi | 1185/1156 |
| Thói quen sức khỏe khi bước vào tuổi trưởng thành | 1164/1133 |
| Thiết lập ranh giới lành mạnh giữa cha mẹ và con trưởng thành | 1137/1109 |
| Duy trì sức khỏe tinh thần và các mối quan hệ khi lớn lên | 1189/1171 |
| Tự lập: thử nghề, học suốt đời và lập kế hoạch | 106/201 |
| Tài chính tự lập: thu nhập, chi phí và dự phòng | 106/209 |
| Tự chủ, ranh giới và kết nối với gia đình | 115/199 |
| Bữa ăn tự lập 18–22 tuổi: đi học, ở trọ và làm việc với ngân sách giới hạn | 209/504 |
| Sức khỏe sinh sản 18–22 tuổi: lựa chọn cá nhân, đồng thuận và chăm sóc phòng ngừa | 219/544 |
| Nhịp sống 18–22 tuổi: ngủ đủ, vận động và cân bằng học–làm | 205/537 |
| Học ở tuổi 18–22: từ kiến thức nền đến năng lực tự học suốt đời | 213/503 |
| Chọn đại học, cao đẳng hoặc học nghề: kiểm định, chương trình và tổng chi phí | 221/503 |
| An toàn khi sống tự lập 18–22 tuổi: đi lại, ở trọ và tránh lừa đảo | 220/513 |
| Tư duy 18–22 tuổi: nghiên cứu, đánh giá bằng chứng và giải quyết vấn đề | 198/534 |
| AI tuổi 18–22: học tập, thực tập và bảo mật dữ liệu | 214/543 |
| Năng khiếu và portfolio 18–22 tuổi: dự án thật, sở thích và kết nối cộng đồng | 206/533 |
| Bước đầu đi làm 18–22 tuổi: hợp đồng, bảo hiểm và hồ sơ cá nhân | 216/504 |

## Nguồn và phạm vi
- [WHO — Mental disorders](https://www.who.int/news-room/fact-sheets/detail/mental-disorders) — opened: Khó khăn tâm thần và chăm sóc chuyên môn.
- [WHO — Depressive disorder](https://www.who.int/news-room/fact-sheets/detail/depression) — opened: Dấu hiệu dai dẳng và tìm hỗ trợ.
- [WHO — Violence against women](https://www.who.int/news-room/fact-sheets/detail/violence-against-women) — opened: Bạo lực bạn tình, hành vi kiểm soát, ảnh hưởng sức khỏe; nguồn tập trung phụ nữ.
- [CDC — About Sleep](https://www.cdc.gov/sleep/about/) — opened: 18–60 tuổi ngủ ít nhất 7 giờ/ngày.
- [WHO — Physical activity](https://www.who.int/news-room/fact-sheets/detail/physical-activity) — opened: Mốc ít nhất 150 phút vận động vừa/tuần ở người trưởng thành.
- [WHO Việt Nam — Healthy diet](https://www.who.int/vietnam/news/fact-sheets/detail/healthy-diet) — opened: Đa dạng thực phẩm, hạn chế đường và muối.
- [WHO — Promoting safe food-handling behaviours](https://www.who.int/activities/promoting-safe-food-handling) — opened: Năm nguyên tắc an toàn thực phẩm trên trang HTML; chưa đọc PDF.
- [WHO — Family planning/contraception methods](https://www.who.int/news-room/fact-sheets/detail/family-planning-contraception) — opened: Lựa chọn tránh thai, khác biệt giữa các biện pháp.
- [WHO — Sexually transmitted infections](https://www.who.int/news-room/fact-sheets/detail/sexually-transmitted-infections-%28stis%29) — opened: STI có thể không triệu chứng.
- [WHO — Condoms](https://www.who.int/news-room/fact-sheets/detail/condoms) — opened: Giảm nguy cơ STI và mang thai ngoài ý muốn.
- [WHO — Emergency contraception](https://www.who.int/news-room/fact-sheets/detail/emergency-contraception) — opened: Trong vòng 5 ngày tùy phương pháp, càng sớm càng tốt.
- [CFPB — Your Money, Your Goals toolkit](https://www.consumerfinance.gov/consumer-tools/educator-tools/your-money-your-goals/toolkit/) — opened: Theo dõi thu chi, hóa đơn và quyết định nợ; ví dụ VN tự biên tập.
- [UNESCO — Guidance for generative AI in education and research](https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research) — opened-overview: Bảo vệ dữ liệu, vai trò con người, trang giới thiệu cập nhật 16/01/2026; chưa đọc PDF.
- [UNESCO — Lifelong learning](https://www.unesco.org/en/lifelong-learning) — opened: Học suốt đời và cập nhật kỹ năng.
- [UNESCO — Media and Information Literacy](https://www.unesco.org/en/media-information-literacy) — opened: Đánh giá thông tin có phê phán.
- [OECD — Career guidance](https://www.oecd.org/en/topics/sub-issues/career-guidance.html) — opened-overview: Đầu mối chủ đề, không dự báo cá nhân.
- [EEF — Metacognition and self-regulation](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation/) — opened: Tự điều chỉnh trong phổ thông; áp dụng cho người lớn là đề xuất.
- [WHO — Road traffic injuries](https://www.who.int/news-room/fact-sheets/detail/road-traffic-injuries) — opened: Phòng ngừa tai nạn.
- [Chính phủ — VBHN 18/VBHN-VPQH Bộ luật Lao động](https://vanban.chinhphu.vn/?classid=0&docid=217002&pageid=27160) — opened-overview: Metadata, chưa đọc PDF/rà sửa đổi.
- [Chính phủ — Luật BHXH 41/2024/QH15](https://vanban.chinhphu.vn/?docid=211199&pageid=27160) — opened-overview: Metadata ban hành 29/06/2024, hiệu lực 01/07/2025; chưa đọc PDF.
- [BHXH Việt Nam — Cách xử lý khi VssID hiển thị thiếu năm đóng BHXH](https://baohiemxahoi.gov.vn/tintuc/Pages/bao-hiem-y-te-hocsinh-sinhvien.aspx?CateID=0&ItemID=25803&OtItem=date) — opened: Quá trình tham gia, liên hệ nhân sự và BHXH.
- [Cục Quản lý chất lượng — Kiểm định chất lượng giáo dục](https://vqa.moet.gov.vn/vi/thong-bao-quan-ly-bao-dam/) — opened-overview: Danh mục thông báo; không xác nhận chương trình cụ thể.
- [Cục Quản lý chất lượng — danh sách cập nhật 30/9/2026](https://vqa.moet.gov.vn/vi/thong-bao-quan-ly-bao-dam/thong-bao/danh-sach-cac-co-so-giao-duc-chuong-trinh-dao-tao-giao-duc-dai-hoc-va-cao-dang-su-pham-duoc-cong-nhan-dat-tieu-chuan-chat-luong-giao-duc-cap-nhat-den-ngay-30-9-2026-95.html) — search-only: Tìm thấy thông báo; mở trang cache miss, chưa đọc danh sách.
- [Bộ Công an — Nâng cao cảnh giác trước 25 kịch bản lừa đảo trên không gian mạng năm 2026](https://www.bocongan.gov.vn/bai-viet/nang-cao-canh-giac-truoc-25-kich-ban-lua-dao-tren-khong-gian-mang-nam-2026-1788865614) — search-only: Kết quả tìm kiếm cảnh báo giả mạo, tuyển dụng, OTP; mở trang lỗi.

## Checklist
- [x] 19/19, ma trận, roadmap, nguồn, test.
- [x] Manifest infographic, kiểm tra dữ liệu.
- [ ] CI, browser, claim verification, chuyên gia, publication gate.
- [ ] 16 nội dung tuổi 23–34 (04G).
Không thay Auth/Database/Family/Mobile/Production.

## Follow-up editorial QA
- Bổ sung 4 ví dụ thực hành riêng về lịch ca, mẫu số dữ liệu, kiểm tra thư viện AI và portfolio mô phỏng. 10/10 cẩm nang đạt ngưỡng tham khảo 500 đơn vị tách khoảng trắng. Độ dài không đồng nghĩa đã thẩm định.
- 12/12 callback hồi quy đã PASS trên commit cd48d71 bằng JS adapter (không phải Node runtime). CI run 45741519559 đang chạy lúc kiểm tra.
