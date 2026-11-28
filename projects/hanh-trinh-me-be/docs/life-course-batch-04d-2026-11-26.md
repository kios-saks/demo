# S04-AZ-04D — tiền thiếu niên 11–13
26/11/2026 · DEV draft

- 18/18: 2 legacy, 3 micro-lesson, 13 cẩm nang. Toàn kho 118/219, 101 chờ. Giữ draft, ID, media, bài ngoài phạm vi.
- Thay 4 khối dùng chung ở hai bài legacy, thêm bốn phần và hai việc thực hành mỗi cẩm nang. Không tuyên bố rà trùng ngữ nghĩa toàn kho. Nội dung dậy thì và giáo dục giới tính có tính giáo dục, phù hợp tuổi, không chẩn đoán/điều trị. Phân biệt ngủ 11–12 và 13 tuổi.
- 23 trang HTML đã mở, 6 trang tổng quan/metadata. CDC Healthy Schools, UNESCO URL có query và AI answers mở lỗi cache; dùng CDC About Sleep và UNESCO URL sạch. VBPL Thông tư 30 timeout, dùng bài giới thiệu Chính phủ; tìm thấy dấu hiệu sửa đổi nên không khẳng định quy trình tuyển sinh hiện hành. Chưa đọc PDF pháp lý hoặc khung UNESCO; chưa kiểm chứng toàn bộ claim cũ/mới.
- Baseline URL tra cứu 55/131; 76 chờ, 40 URL bổ sung (hợp ledger theo URL, không đồng nghĩa xác minh claim).
- Kiểm tra trực tiếp: đúng 18 ID mục tiêu, nguồn ánh xạ, 219 inventory, 173/173 ô có draft, các bài ngoài phạm vi không đổi, media/status bảo toàn. Thêm test hồi quy; CI/browser chưa xác nhận tại thời điểm tạo commit.

| Nội dung | Token trước/sau |
|---|---:|
| Nói chuyện về dậy thì không xấu hổ | 1001/1156 |
| Xây dựng thỏa thuận an toàn số với con | 996/1040 |
| Dậy thì: hiểu thay đổi cơ thể và chăm sóc bản thân | 119/247 |
| Bạn bè, bản sắc và áp lực đồng trang lứa | 104/230 |
| AI có thể sai: hỏi thông minh và giữ riêng tư | 104/239 |
| Chuyển cấp THCS 11–13 tuổi: chọn môi trường và thích nghi với nhịp học mới | 247/606 |
| Dinh dưỡng 11–13 tuổi: bữa ăn, tăng trưởng và hình ảnh cơ thể | 199/596 |
| Khám sức khỏe 11–13 tuổi: khi nào hỏi bác sĩ và chuẩn bị câu hỏi | 192/583 |
| Nhịp sống 11–13 tuổi: ngủ, học, vận động và màn hình | 191/551 |
| Tự học 11–13 tuổi: ghi chú, ôn tập và chuyển cấp THCS | 205/574 |
| An toàn 11–13 tuổi: bắt nạt, tin nhắn lạ và tìm người hỗ trợ | 201/580 |
| Tư duy 11–13 tuổi: từ ý kiến đến lập luận có bằng chứng | 220/593 |
| Tình bạn 11–13 tuổi: giao tiếp, ranh giới và cách từ chối áp lực | 213/558 |
| Năng khiếu 11–13 tuổi: duy trì sở thích khi lịch học thay đổi | 208/559 |
| Tài chính 11–13 tuổi: tiết kiệm, so sánh giá và nhận diện quảng cáo | 203/550 |
| Khám phá nghề 11–13 tuổi: sở thích, kỹ năng và thế giới việc làm | 208/578 |
| Quyền trẻ em và trách nhiệm trên mạng tuổi 11–13 | 215/592 |
| Kỹ năng sống 11–13 tuổi: tự quản việc học và thích nghi THCS | 207/570 |

## Nguồn và phạm vi
- [NHS — Early or delayed puberty](https://www.nhs.uk/conditions/early-or-delayed-puberty/) — opened: Thay đổi sinh lý, thời điểm khác nhau, khám khi nghi dậy thì sớm/muộn.
- [NHS — Period problems](https://www.nhs.uk/conditions/periods/period-problems/) — opened: Kinh nguyệt có thể chưa đều tuổi dậy thì; đau/ra máu ảnh hưởng sinh hoạt cần khám; nhật ký triệu chứng.
- [WHO — Comprehensive sexuality education](https://www.who.int/news-room/fact-sheets/detail/comprehensive-sexuality-education) — opened: Giáo dục khoa học, phù hợp tuổi, tăng dần về cơ thể, sức khỏe, đồng thuận, an toàn và quyền.
- [WHO — Mental health of adolescents](https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health) — opened: Yếu tố bảo vệ/nguy cơ, phát hiện và hỗ trợ sớm, không kỳ thị.
- [UNICEF Việt Nam — Mental health conversation starters 11–13 years](https://www.unicef.org/vietnam/mental-health-conversation-starters-1113-years) — opened: Lắng nghe, thay đổi tuổi 11–13, dấu hiệu cần quan tâm.
- [UNICEF — 11 tips for communicating with your teen](https://www.unicef.org/parenting/child-care/11-tips-communicating-your-teen) — opened: Giao tiếp đồng cảm, câu hỏi mở, xác nhận cảm xúc.
- [WHO — Adolescent and young adult health](https://www.who.int/news-room/fact-sheets/detail/adolescents-health-risks-and-solutions) — opened: Nguy cơ sức khỏe vị thành niên, phòng ngừa, HPV; không suy ra lịch tiêm Việt Nam.
- [UNICEF — Nutrition in middle childhood and adolescence](https://www.unicef.org/nutrition/middle-childhood-and-adolescence) — opened: Dinh dưỡng giai đoạn tăng trưởng và môi trường ăn uống.
- [WHO Việt Nam — Healthy diet](https://www.who.int/vietnam/news/fact-sheets/detail/healthy-diet) — opened: Đa dạng thực phẩm; không dùng để kê khẩu phần.
- [UNICEF — Teens and body image](https://www.unicef.org/parenting/mental-health/teens-body-image) — opened: Dấu hiệu lo lắng hình ảnh cơ thể, tránh nhận xét ngoại hình, tìm hỗ trợ.
- [CDC — About Sleep](https://www.cdc.gov/sleep/about/) — opened: 6–12 tuổi 9–12 giờ, 13–17 tuổi 8–10 giờ/24h; khó ngủ cần hỏi bác sĩ.
- [WHO Europe — Physical activity](https://www.who.int/europe/news-room/fact-sheets/item/physical-activity) — opened: 5–17 tuổi trung bình ít nhất 60 phút/ngày mức vừa–mạnh trong tuần, điều chỉnh khả năng.
- [UNICEF Việt Nam — Parenting in the AI age](https://www.unicef.org/vietnam/parenting-ai-age) — opened: AI có giới hạn, quyền riêng tư, đồng hành và tránh lệ thuộc.
- [UNESCO — AI competency framework for students](https://www.unesco.org/en/articles/ai-competency-framework-students) — opened-overview: Trang giới thiệu bốn chiều năng lực AI; chưa đọc toàn văn PDF.
- [UNICEF Việt Nam — Cyberbullying](https://www.unicef.org/vietnam/endviolence/cyberbullying-what-it-and-how-stop-it) — opened: Nhận biết, báo cáo, chặn, giữ bằng chứng phù hợp, tìm người tin cậy.
- [EEF — Metacognition and self-regulation](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation/) — opened: Lập kế hoạch, theo dõi, đánh giá; làm mẫu trong nhiệm vụ thật.
- [CFPB — Building blocks of financial capability](https://www.consumerfinance.gov/consumer-tools/educator-tools/youth-financial-education/learn/) — opened: Năng lực tài chính, thói quen và quyết định theo tuổi.
- [OECD — Teenage career readiness](https://www.oecd.org/en/data/dashboards/teenage-career-readiness.html) — opened-overview: Dashboard PISA và hướng nghiệp; không suy ra dự báo cá nhân hoặc số liệu riêng tuổi 11–13.
- [Chính phủ — Giới thiệu Thông tư 30/2024/TT-BGDĐT](https://xaydungchinhsach.chinhphu.vn/thong-tu-30-tt-bgddt-quy-che-tuyen-sinh-thcs-va-tuyen-sinh-thpt-11925010810085927.htm) — opened-overview: Bài giải thích quy chế gốc, ngày hiệu lực ghi 14/02/2025; đã có dấu hiệu sửa đổi, không xác nhận quy trình hiện hành.
- [Chính phủ — VBHN 108/VBHN-VPQH Luật Trẻ em](https://vanban.chinhphu.vn/?docid=215227&pageid=27160) — opened-overview: Metadata văn bản 27/08/2025; chưa đọc PDF hoặc rà sửa đổi.
- [Chính phủ — Luật 91/2025/QH15 Bảo vệ dữ liệu cá nhân](https://vanban.chinhphu.vn/?docid=214590&pageid=27160) — opened-overview: Metadata ban hành 26/06/2025, hiệu lực ghi 01/01/2026; chưa đọc PDF.
- [Chính phủ — Nghị định 356/2025/NĐ-CP](https://vanban.chinhphu.vn/?docid=216387&pageid=27160) — opened-overview: Metadata nghị định hướng dẫn bảo vệ dữ liệu, hiệu lực ghi 01/01/2026; chưa đọc PDF.
- [Tổng đài Quốc gia Bảo vệ Trẻ em 111](https://tongdai111.vn/sites/gioi-thieu) — opened: Tiếp nhận và hỗ trợ bảo vệ trẻ, không thay cấp cứu y tế.

## Checklist
- [x] 18/18 mục, ma trận, checklist, source ledger, test hồi quy.
- [x] Kiểm tra dữ liệu trực tiếp trước commit.
- [ ] Node test/CI, browser, xác minh claim từng bài, thẩm định y khoa/tâm lý/giáo dục/pháp lý.
- [ ] 18 mục tuổi 14–17 (S04-AZ-04E).
Không thay Auth/Database/Family/Mobile, không deploy Production.
