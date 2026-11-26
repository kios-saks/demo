# S04-AZ-04C2 — hoàn thiện tuổi 1–2
26/11/2026 · DEV draft

- 10/10: 7 cẩm nang và 3 micro-lesson; tổng 16/16 tuổi 1–2; 67/219 toàn kho, 152 chờ.
- Kiểm tra cấu trúc, ID, source IDs, số phần và practice bằng kiểm tra dữ liệu trước commit; thêm test Node, chưa chạy CI tại thời điểm ghi.
- 7 nguồn HTML đã mở, 2 nguồn search-only (NSPCC 403, thông tư mới xác định metadata); chưa kiểm chứng toàn bộ claim, văn bản hợp nhất, chuyên gia hoặc browser. Không deploy.
- Baseline tra cứu 35/131, ngoài baseline 21 (hợp ledger).

| Nội dung | Token trước/sau |
|---|---:|
| Con giận dữ: gọi tên cảm xúc và giữ giới hạn | 108/224 |
| Tự lập qua việc nhỏ hằng ngày | 89/185 |
| Cơ thể của con và quyền nói không | 108/236 |
| Chọn nhà trẻ cho con 1–2 tuổi: từ khảo sát đến tuần đầu thích nghi | 307/633 |
| Khám sức khỏe 1–2 tuổi: theo dõi phát triển, răng và câu hỏi cần chuẩn bị | 205/441 |
| Cơ thể 1–2 tuổi: vận động, ngôn ngữ và tập chăm sóc bản thân | 203/424 |
| Nhịp sinh hoạt 1–2 tuổi: ngủ, rửa tay và tự phục vụ | 188/408 |
| Trò chơi tư duy 1–2 tuổi: phân loại, xếp và thử lại | 206/402 |
| Quan hệ 1–2 tuổi: chơi cạnh bạn, xin lượt và chia sẻ từng bước | 202/402 |
| Âm nhạc, vẽ và vận động tự do tuổi 1–2 | 197/401 |

## Nhật ký nguồn
- [CDC — Milestones by 18 Months](https://www.cdc.gov/act-early/milestones/18-months.html) — opened: Lựa chọn đơn giản, chơi giả vờ, ăn và ngủ đều; mốc không thay sàng lọc.
- [CDC — Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html) — opened: Quan sát mốc, mất kỹ năng, hỗ trợ chơi cạnh bạn và luân phiên.
- [NHS — Looking after your baby's teeth](https://www.nhs.uk/baby/babys-development/teething/looking-after-your-babys-teeth/) — opened: Chải hai lần mỗi ngày, lớp kem fluoride mỏng dưới 3 tuổi.
- [CDC — About Sleep](https://www.cdc.gov/sleep/about/) — opened: 11–14 giờ tuổi 1–2 gồm ngủ trưa.
- [UNICEF — Learning activities for babies and toddlers](https://www.unicef.org/parenting/child-care/21-learning-activities-babies-and-toddlers) — opened: Chơi tương tác, khám phá phù hợp tuổi.
- [UNICEF Asia Pacific — Positive parenting](https://www.unicef.org/asia-pacific/place-for-parents/positive-parenting) — opened: Giới hạn không làm nhục, lắng nghe, khuyến khích lên tiếng.
- [UNICEF — Managing child separation anxiety](https://www.unicef.org/parenting/child-care/managing-child-separation-anxiety) — opened: Chia tay rõ ràng, làm quen tách người chăm từng bước.
- [NSPCC — Talk PANTS](https://www.nspcc.org.uk/advice-for-families/pants-underwear-rule/) — search-only: Nguyên tắc bảo vệ cơ thể; chỉ kết quả tìm kiếm, mở trang 403; điều chỉnh cho cha mẹ trẻ nhỏ, không áp dụng nguyên bộ bài.
- [Cổng TTĐT Chính phủ — Thông tư 09/2024/TT-BGDĐT](https://chinhphu.vn/?docid=210411&pageid=27160) — search-only: Xác định văn bản công khai giáo dục; chưa đọc toàn văn/hợp nhất, không kết luận hiệu lực hiện tại.

## Checklist
- [x] 10 nội dung, ma trận, nguồn, test hồi quy.
- [ ] CI, chuyên gia, claim verification, UI.
- [ ] 16 nội dung tuổi 3–5.
