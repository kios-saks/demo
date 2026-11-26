# S04-AZ-04C4 — tuổi tiểu học 6–10
26/11/2026 · DEV draft

- 17/17: 6 legacy, 3 micro-lesson, 8 cẩm nang A–Z. S04-AZ-04C: 49/49; tiền thai–10 tuổi: 100/100 đã có revision. Toàn kho 100/219, 119 chờ.
- Thay 12 khối lặp và bỏ 8 đoạn chung ở đầu bài; giữ nguyên ID, media, cảnh báo riêng, nguồn cũ và draft. Không tuyên bố đã audit ngữ nghĩa toàn kho. Cẩm nang thêm 4 phần và 2 việc thực hành, micro-lesson giữ cấu trúc ngắn.
- 18 trang HTML mở được, trong đó 5 trang tổng quan/metadata. Nguồn WHO healthy diet bản global và oral health đường dẫn /en/ không mở được, dùng phiên bản đọc được; UNESCO MIL không mở được, giữ nguồn cũ, bổ sung UNICEF Việt Nam. Không xác nhận nguồn chết. Thông cáo WHO môi trường bữa ăn trường 2026 không phải guideline toàn văn. Chưa đọc PDF pháp luật/WHO, chưa kiểm tra sửa đổi pháp luật hoặc tất cả claim.
- Baseline URL tra cứu 49/131; 82 chờ, 31 URL bổ sung (hợp các ledger theo URL, không đồng nghĩa kiểm chứng). Không nâng lên editorial-verified/expert reviewed.
- Kiểm tra trực tiếp trước commit: đúng 17 ID, 219 inventory, 173/173 ô có draft, số section/source, source references, mọi ID/media/status bảo toàn, bài ngoài phạm vi không đổi. Thêm test Node, chưa xác nhận chạy CI/browser.

| Nội dung | Token trước/sau |
|---|---:|
| Đồng hành việc học không chỉ nhìn điểm số | 942/997 |
| Đồng hành cùng tình bạn đầu đời | 939/953 |
| Thói quen học tập 6–11 tuổi không chạy theo điểm số | 1133/1046 |
| Trẻ tiểu học ngủ bao nhiêu là đủ? | 1125/1020 |
| Vận động mỗi ngày cho trẻ 6–11 tuổi | 1128/1054 |
| Bắt nạt ở trường: cha mẹ và giáo viên cần phối hợp | 1169/1096 |
| Điểm số, sai lầm và cảm giác thuộc về | 104/228 |
| Thám tử thông tin: đọc và kiểm chứng | 106/238 |
| Tiền tiêu vặt: nhu cầu, mong muốn và tiết kiệm | 99/227 |
| Ăn uống tuổi tiểu học: bữa sáng, bữa phụ và bữa ăn tại trường | 258/602 |
| Chọn trường tiểu học: so sánh sự phù hợp, không chạy theo danh tiếng | 257/593 |
| Sức khỏe học đường 6–10 tuổi: răng, thị lực, thính lực và khám định kỳ | 205/544 |
| Cơ thể 6–10 tuổi: vệ sinh, quyền riêng tư và chuẩn bị trước dậy thì | 211/577 |
| Kỹ năng số 6–10 tuổi: quảng cáo, quyền riêng tư và AI có người lớn đồng hành | 214/579 |
| Khám phá sở thích 6–10 tuổi: câu lạc bộ, nghệ thuật và thể thao | 210/541 |
| Quyền học tập và trách nhiệm tuổi tiểu học: hiểu quy tắc, biết tìm hỗ trợ | 223/573 |
| Kỹ năng sống 6–10 tuổi: chuẩn bị đồ, việc nhà và quản lý thời gian | 200/533 |

## Nguồn và phạm vi
- [CDC — About Sleep](https://www.cdc.gov/sleep/about/) — opened: 9–12 giờ/24h ở 6–12 tuổi, nhật ký ngủ, thói quen và trao đổi bác sĩ khi có khó khăn.
- [WHO Europe — Physical activity](https://www.who.int/europe/news-room/fact-sheets/item/physical-activity) — opened: 5–17 tuổi trung bình ít nhất 60 phút/ngày vận động vừa–mạnh trong tuần; hoạt động mạnh và tăng sức cơ/xương ít nhất 3 ngày/tuần.
- [WHO Việt Nam — Healthy diet](https://www.who.int/vietnam/news/fact-sheets/detail/healthy-diet) — opened: Đa dạng thực phẩm, hạn chế đường tự do, muối; không áp khẩu phần điều trị.
- [WHO — WHO urges schools worldwide to promote healthy eating for children (27/01/2026)](https://www.who.int/news/item/27-01-2026-who-urges-schools-worldwide-to-promote-healthy-eating-for-children) — opened: Thông cáo về môi trường thực phẩm trường học, chưa đọc guideline PDF.
- [UNICEF — Positive parenting tips for children aged 6–10](https://www.unicef.org/asia-pacific/place-for-parents/positive-parenting-tips-6-10) — opened: Khích lệ, không làm nhục, tôn trọng sở thích và tham gia việc gia đình.
- [UNICEF — Bullying: What is it and how to stop it](https://www.unicef.org/parenting/child-care/bullying) — opened: Chủ ý gây hại, lặp lại, chênh lệch quyền lực; trò chuyện, can thiệp.
- [UNICEF — How to talk to your child's school about bullying](https://www.unicef.org/parenting/child-care/how-talk-school-about-bullying) — opened: Phối hợp nhà trường, hỗ trợ và phòng ngừa.
- [EEF — Metacognition and self-regulation](https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation/) — opened: Lập kế hoạch, theo dõi, đánh giá trong nhiệm vụ học cụ thể; làm mẫu, giảm hỗ trợ.
- [UNICEF Việt Nam — Parenting in the AI age](https://www.unicef.org/vietnam/parenting-ai-age) — opened: Giải thích AI phù hợp tuổi, cùng xem xét câu trả lời, rủi ro dữ liệu, nội dung và lệ thuộc.
- [UNICEF Việt Nam — Digital parenting](https://www.unicef.org/vietnam/digital-parenting) — opened-overview: Trang tổng hợp an toàn và quyền riêng tư trên môi trường số; không phải hướng dẫn từng nền tảng.
- [CFPB — Building blocks of financial capability](https://www.consumerfinance.gov/consumer-tools/educator-tools/youth-financial-education/learn/) — opened: 6–12 tuổi hình thành thói quen tài chính, lập kế hoạch và khái niệm tiền; bài tập VN do dự án biên tập.
- [WHO — Vision and hearing screening for school-age children (2025)](https://www.who.int/publications/i/item/9789240105201) — opened-overview: Trang giới thiệu sổ tay sàng lọc mắt/tai tuổi học đường; chưa đọc PDF 96 trang.
- [WHO — Oral health](https://www.who.int/news-room/fact-sheets/detail/oral-health) — opened: Chải răng hai lần/ngày với kem fluoride, hạn chế đường tự do.
- [NHS — Early or delayed puberty](https://www.nhs.uk/conditions/early-or-delayed-puberty/) — opened: Thay đổi cơ thể khác nhau; lo dậy thì sớm/muộn nên trao đổi bác sĩ; không chẩn đoán từ bài.
- [Chính phủ — Thông tư 09/2024/TT-BGDĐT](https://vanban.chinhphu.vn/?docid=210411&pageid=27160) — opened-overview: Trang công bố: ban hành 03/06/2024, hiệu lực ghi 19/07/2024; chưa đọc PDF hoặc kiểm tra sửa đổi.
- [Chính phủ — VBHN 108/VBHN-VPQH Luật Trẻ em](https://vanban.chinhphu.vn/?classid=2629&docid=215227&pageid=27160) — opened-overview: Trang công bố văn bản hợp nhất 27/08/2025; chưa đọc PDF, không kết luận điều khoản hiện hành.
- [Chính phủ — VBHN 72/VBHN-VPQH Luật Giáo dục](https://vanban.chinhphu.vn/?classid=0&docid=217346&pageid=27160) — opened-overview: Trang công bố văn bản hợp nhất 25/03/2026; chưa đọc PDF, không kết luận điều khoản hiện hành.
- [Tổng đài Quốc gia Bảo vệ Trẻ em 111](https://tongdai111.vn/sites/gioi-thieu) — opened: Tiếp nhận thông tin bạo lực, xâm hại, hỗ trợ và chuyển tuyến; hoạt động 24/7 miễn phí.

## Checklist
- [x] 17/17 mục tuổi 6–10, ma trận, roadmap, source ledger, test hồi quy.
- [x] Kiểm tra dữ liệu trong bước tạo commit.
- [ ] Chạy toàn bộ Node test/CI, browser; rà lại nguồn cũ, claim, chuyên gia, bản quyền hình ảnh và quy định Việt Nam.
- [ ] 18 nội dung tuổi 11–13 (đợt kế tiếp).
Không thay Auth/Database/Family/Mobile, không deploy Production.
