import Link from "next/link";
import { getWebRepository } from "../lib/repository";
export const dynamic="force-dynamic";

export default async function Home() {
  const repo=getWebRepository();
  const stages=await repo.listStages();
  const articles=(await repo.listArticles({limit:50})).data;
  return (
    <>
      <section className="hero"><div className="wrap hero-inner">
        <div><span className="eyebrow">THƯ VIỆN TRI THỨC CHO GIA ĐÌNH</span>
          <h1>Mỗi chặng lớn lên,<br/><em>một người bạn đồng hành.</em></h1>
          <p>Từ khi chuẩn bị mang thai đến lúc con trưởng thành: tìm kiến thức dễ hiểu, những điều đáng hỏi và gợi ý thực hành trong gia đình.</p>
          <div className="hero-actions"><Link className="primary-btn" href="#hanh-trinh">Khám phá hành trình <span aria-hidden="true">→</span></Link><Link className="ghost-btn" href="/tim-kiem">Tìm một chủ đề</Link></div>
          <p className="micro">Nội dung hiện ở trạng thái biên tập nháp và cần chuyên gia duyệt trước khi xuất bản chính thức.</p>
          {process.env.DEV_CONTENT_PREVIEW_TOKEN&&process.env.DEV_CONTENT_PREVIEW_TOKEN.length>=24?<div className="dev-gateway"><strong>Đang xem bản giới thiệu công khai, chưa phải kho nội dung DEV.</strong><p>Để đọc 72 bản nháp, hướng dẫn theo 12 giai đoạn, checklist và nguồn tham khảo, hãy vào thư viện DEV có mật khẩu.</p><Link className="primary-btn" href="/dev-review">Vào thư viện nội dung DEV (có mật khẩu) →</Link></div>:null}
        </div>
        <div className="hero-art"><img src="/media/cover-family-planning.svg" className="hero-editorial-image" alt="Minh họa gia đình cùng chuẩn bị hành trình làm cha mẹ" width="1200" height="675" /></div>
      </div></section>
      <section className="wrap section" id="hanh-trinh">
        <div className="section-heading"><div><span className="eyebrow">KHÁM PHÁ THEO GIAI ĐOẠN</span><h2>Hành trình của gia đình</h2></div><p>Chọn đúng giai đoạn để bắt đầu. Bạn có thể quay lại bất cứ lúc nào.</p></div>
        <div className="stage-grid">{stages.map(s => <Link href={"/"+s.slug} className="stage-card" key={s.slug}>
          <div className="stage-icon">{s.icon}</div><span className="stage-range">{s.range}</span><h3>{s.title}</h3><p>{s.description}</p><span className="stage-link">Xem bài viết →</span>
        </Link>)}</div>
      </section>
      <section className="feature-band"><div className="wrap"><span className="eyebrow">BẮT ĐẦU VỚI NHỮNG ĐIỀU GẦN GŨI</span><h2>Kiến thức để hiểu nhau hơn, không phải để so sánh.</h2>
        <div className="feature-grid"><div><strong>01 / Dễ tìm</strong><p>Nội dung được tổ chức theo thời điểm và nhu cầu.</p></div><div><strong>02 / Có nguồn</strong><p>Mỗi bài ghi rõ tài liệu tham khảo và trạng thái biên tập.</p></div><div><strong>03 / Tôn trọng</strong><p>Không phán xét lựa chọn cá nhân, không tự chẩn đoán sức khỏe.</p></div></div>
      </div></section>
      <section className="wrap section"><div className="section-heading"><div><span className="eyebrow">ĐỌC GẦN ĐÂY</span><h2>Gợi ý cho hôm nay</h2></div><Link className="text-link" href="/tim-kiem">Xem tất cả bài viết →</Link></div>
        <div className="article-grid">{articles.slice(0,6).map(a=><Link className="article-card" href={"/bai-viet/"+a.slug} key={a.slug}>
          {a.media?.cover && <img className="article-card-visual" src={a.media.cover.src} alt={a.media.cover.alt} width="1200" height="675" loading="lazy"/>}
          <span className="pill">{stages.find(s=>s.slug===a.stage)?.title}</span><h3>{a.title}</h3><p>{a.summary}</p><span className="article-more">Đọc bài · {a.readMinutes} phút →</span>
        </Link>)}</div>
        {articles.length===0&&<div className="dev-art-gallery">
          {([["cover-family-planning.svg","Chuẩn bị"],["cover-antenatal-checkup.svg","Thai kỳ"],["cover-safe-sleep.svg","Sơ sinh"],["cover-first-solids.svg","Ăn dặm"],["cover-school-safety.svg","Tuổi đi học"],["cover-teen-mental-health.svg","Tuổi teen"]] as const).map(([src,label])=><div key={src} className="dev-art-tile"><img src={"/media/"+src} width="1200" height="675" loading="lazy" alt={"Minh họa chủ đề "+label}/><strong>{label}</strong></div>)}
          <p className="dev-art-note">Kho bài viết đang biên tập; các bài nháp chỉ xem được qua trang DEV có mật khẩu.</p>
        </div>}
      </section>
    </>
  );
}
