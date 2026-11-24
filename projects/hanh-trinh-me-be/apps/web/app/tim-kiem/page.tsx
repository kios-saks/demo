import Link from "next/link";
import {getWebRepository} from "../../lib/repository";

export const dynamic="force-dynamic";
export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string;stage?:string}>}){
 const params=await searchParams;
 const q=(params.q||"").trim().slice(0,120);
 const repository=getWebRepository();
 const stages=await repository.listStages();
 const stage=stages.some(s=>s.slug===params.stage)?params.stage||"":"";
 const results=(await repository.listArticles({q,stage,limit:50})).data;
 return <div className="wrap inner-page">
  <nav className="breadcrumbs" aria-label="Đường dẫn trang"><Link href="/">Trang chủ</Link><span aria-hidden="true">/</span><span aria-current="page">Tra cứu</span></nav>
  <span className="eyebrow">TÌM KIẾN THỨC</span>
  <h1>Hôm nay bạn muốn tìm hiểu điều gì?</h1>
  <p className="search-intro">Tìm theo chủ đề hoặc chọn giai đoạn phù hợp với gia đình.</p>
  <form action="/tim-kiem" method="get" className="search-form" role="search">
   <label htmlFor="q" className="sr-only">Từ khóa tìm kiếm</label>
   <input id="q" name="q" type="search" autoComplete="off" placeholder="Ví dụ: giấc ngủ, thai kỳ, ăn dặm…" defaultValue={q}/>
   <label htmlFor="stage" className="sr-only">Chọn giai đoạn</label>
   <select id="stage" name="stage" defaultValue={stage}>
    <option value="">Tất cả giai đoạn</option>{stages.map(s=><option key={s.slug} value={s.slug}>{s.title}</option>)}
   </select>
   <button type="submit">Tìm bài</button>
  </form>
  <p className="result-count" role="status">Có {results.length} bài viết đã được công bố{q?" phù hợp với “"+q+"”":""}.</p>
  {results.length?<div className="article-grid">{results.map(a=><Link href={"/bai-viet/"+a.slug} className="article-card" key={a.slug}>
   {a.media?.cover?<img src={a.media.cover.src} alt={a.media.cover.alt} width="1200" height="675" className="article-card-visual" loading="lazy"/>:null}
   <span className="pill">{stages.find(s=>s.slug===a.stage)?.title}</span><h3>{a.title}</h3><p>{a.summary}</p>
   <span className="article-more">Đọc bài · {a.readMinutes} phút →</span>
  </Link>)}</div>:<div className="empty-library" role="status">
   <h2>Chưa có bài viết đã thẩm định cho tìm kiếm này</h2>
   <p>Thử thay đổi từ khóa hoặc chọn một giai đoạn khác.</p>
   <div className="empty-actions">
    
    <Link className="ghost-btn" href="/tim-kiem">Xóa bộ lọc</Link>
    <Link className="ghost-btn" href="/#hanh-trinh">Xem 12 giai đoạn</Link>
   </div>
  </div>}
 </div>;
}
