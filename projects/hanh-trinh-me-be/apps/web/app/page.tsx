import Link from "next/link";
import { getWebRepository } from "../lib/repository";
import {stageVisuals} from "../lib/stage-visuals";

export const dynamic="force-dynamic";

const journeys=[
 {stage:"chuan-bi-mang-thai",title:"Khi gia đình chuẩn bị đón bé",detail:"Sức khỏe tiền thai, cảm xúc và kế hoạch chăm sóc.",index:"01 / CHUẨN BỊ"},
 {stage:"so-sinh",title:"Những ngày đầu bên em bé",detail:"Chăm sóc an toàn, nhịp sinh hoạt và kết nối.",index:"02 / BẮT ĐẦU"},
 {stage:"tap-di",title:"Khi con lớn lên mỗi ngày",detail:"Khám phá, giao tiếp và đồng hành đến tuổi trưởng thành.",index:"03 / ĐỒNG HÀNH"}
];
const previewEnabled=Boolean(process.env.DEV_CONTENT_PREVIEW_TOKEN&&process.env.DEV_CONTENT_PREVIEW_TOKEN.length>=24);

export default async function Home() {
 const repo=getWebRepository();
 const stages=await repo.listStages();
 const articles=(await repo.listArticles({limit:50})).data;
 return (
  <>
   <section className="hero" aria-labelledby="hero-heading">
    <div className="wrap hero-inner">
     <div>
      <span className="eyebrow">CẨM NANG KIẾN THỨC DÀNH CHO GIA ĐÌNH</span>
      <h1 id="hero-heading">Mỗi chặng lớn lên,<br/><em>mình cùng hiểu hơn.</em></h1>
      <p className="hero-lead">Từ khi chuẩn bị mang thai đến lúc con trưởng thành, Hành Trình Mẹ & Bé giúp gia đình tiếp cận thông tin dễ hiểu, gợi ý thực hành và các nguồn để đọc sâu hơn.</p>
      <form action="/tim-kiem" method="get" className="hero-search" role="search">
       <label htmlFor="home-search"><span className="sr-only">Tìm kiếm kiến thức về mẹ và bé</span>
        <input id="home-search" name="q" type="search" placeholder="Bạn đang quan tâm điều gì?" autoComplete="off"/>
       </label>
       <button type="submit">Tìm chủ đề</button>
      </form>
      <div className="hero-actions">
       {previewEnabled?<Link className="primary-btn" href="/dev-review">Đọc thư viện DEV <span aria-hidden="true">→</span></Link>:null}
       <Link className={previewEnabled?"ghost-btn":"primary-btn"} href="#hanh-trinh">Khám phá 12 giai đoạn <span aria-hidden="true">→</span></Link>
      </div>
      <div className="hero-qualities" aria-label="Đặc điểm thư viện">
       <span>Theo từng giai đoạn</span><span>Dễ tìm, dễ đọc</span><span>Có tài liệu tham khảo</span>
      </div>
      {previewEnabled?<div className="dev-gateway"><strong>Đang xem bản giới thiệu công khai, chưa phải kho nội dung DEV.</strong><p>72 bài nháp, 8 bài chuyên sâu, checklist và nguồn tham khảo đang được biên tập trong không gian riêng.</p><Link className="text-link" href="/dev-review">Mở kho đọc DEV có mật khẩu →</Link></div>:null}
     </div>
     <div className="hero-art">
      <img src="/media/cover-family-planning.svg" className="hero-editorial-image" alt="Tranh minh họa một gia đình đang cùng nhau chuẩn bị chào đón em bé" width={1200} height={675} fetchPriority="high"/>
      <p className="hero-image-caption">Đồng hành bằng sự thấu hiểu, không bằng những tiêu chuẩn so sánh.</p>
     </div>
    </div>
   </section>
   <section className="wrap section" id="hanh-trinh" aria-labelledby="journey-title">
    <div className="section-heading">
     <div><span className="eyebrow">CHỌN ĐIỂM BẮT ĐẦU</span><h2 id="journey-title">12 giai đoạn trong hành trình gia đình</h2></div>
     <p>Không cần đọc mọi thứ cùng lúc. Chọn chặng phù hợp nhất với bạn hôm nay.</p>
    </div>
    <div className="journey-grid">
     {stages.map((s,i)=><Link href={"/"+s.slug} className="journey-card" key={s.slug}>
      <div className="journey-card-image">
       <img src={stageVisuals[s.slug]||"/media/cover-family-planning.svg"} alt={"Minh họa giai đoạn "+s.title} width={1200} height={675} loading="lazy"/>
       <span className="journey-card-index">{String(i+1).padStart(2,"0")}</span>
      </div>
      <div className="journey-card-content">
       <span className="journey-card-range">{s.range}</span><h3>{s.title}</h3>
       <p>{s.description}</p><span className="journey-card-action">Khám phá chặng này <span aria-hidden="true">→</span></span>
      </div>
     </Link>)}
    </div>
   </section>
   <section className="content-paths" aria-labelledby="topic-title">
    <div className="wrap">
     <span className="eyebrow">TÌM THEO MỐI QUAN TÂM</span>
     <h2 id="topic-title">Bắt đầu từ điều gần gũi nhất</h2>
     <p className="intro">Mỗi gia đình có những câu hỏi khác nhau. Ba lối đọc dưới đây giúp bạn tìm đúng nhóm nội dung mà không phải lướt qua cả thư viện.</p>
     <div className="topic-grid">
      {journeys.map(j=><Link className="journey-topic-card" href={"/"+j.stage} key={j.stage}>
       <span className="topic-count">{j.index}</span><h3>{j.title}</h3><p>{j.detail}</p><span>Xem chủ đề <span aria-hidden="true">→</span></span>
      </Link>)}
     </div>
    </div>
   </section>
   <section className="trust-band" aria-labelledby="editorial-title">
    <div className="wrap">
     <span className="eyebrow">NGUYÊN TẮC BIÊN TẬP</span>
     <h2 id="editorial-title">Thông tin giúp gia đình hiểu hơn, không thay lời khuyên y tế.</h2>
     <div className="trust-points">
      <div><strong>Có nguồn để đối chiếu</strong><p>Dẫn tới tài liệu của cơ quan và tổ chức chuyên môn khi sử dụng nội dung tham khảo.</p></div>
      <div><strong>Đọc theo hoàn cảnh</strong><p>Những gợi ý thực hành không áp dụng đồng loạt cho mọi mẹ, mọi bé hay mọi gia đình.</p></div>
      <div><strong>Minh bạch trạng thái</strong><p>Bài chưa thẩm định vẫn là bản nháp và được giữ trong khu đọc DEV có mật khẩu.</p></div>
     </div>
    </div>
   </section>
   <section className="wrap section" aria-labelledby="latest-title">
    <div className="section-heading"><div><span className="eyebrow">BÀI VIẾT</span><h2 id="latest-title">{articles.length?"Bài viết được chia sẻ":"Nội dung đang được biên tập"}</h2></div>
     <Link className="text-link" href={articles.length?"/tim-kiem":"/nguon-tham-khao"}>{articles.length?"Xem tất cả bài viết":"Tìm hiểu về nguồn tham khảo"} <span aria-hidden="true">→</span></Link>
    </div>
    {articles.length?<div className="article-grid">
     {articles.slice(0,6).map(a=><Link className="article-card" href={"/bai-viet/"+a.slug} key={a.slug}>
      {a.media?.cover?<img className="article-card-visual" src={a.media.cover.src} alt={a.media.cover.alt} width="1200" height="675" loading="lazy"/>:null}
      <span className="pill">{stages.find(s=>s.slug===a.stage)?.title}</span><h3>{a.title}</h3><p>{a.summary}</p><span className="article-more">Đọc bài · {a.readMinutes} phút →</span>
     </Link>)}
    </div>:<div className="empty-library">
     <h3>Chúng tôi đang hoàn thiện thư viện trước khi phát hành.</h3>
     <p>Các bài viết mới được biên tập và đối chiếu nguồn. Nội dung chưa thẩm định không hiển thị công khai để tránh gây hiểu lầm.</p>
     <div className="empty-actions">
      {previewEnabled?<Link className="primary-btn" href="/dev-review">Xem 72 bản thảo trong DEV →</Link>:null}
      <Link className="ghost-btn" href="/nguon-tham-khao">Xem danh mục nguồn tham khảo →</Link>
     </div>
    </div>}
   </section>
  </>
 );
}
