import Link from "next/link";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {getWebRepository} from "../../lib/repository";
import {stageVisuals} from "../../lib/stage-visuals";

export const dynamic="force-dynamic";
export async function generateStaticParams(){
 if(process.env.WEB_CONTENT_PROVIDER==="api")return [];
 return (await getWebRepository().listStages()).map(s=>({stage:s.slug}));
}
export async function generateMetadata({params}:{params:Promise<{stage:string}>}):Promise<Metadata>{
 const {stage}=await params;
 const item=await getWebRepository().getStage(stage);
 return {title:item?.title||"Giai đoạn",description:item?.description};
}
export default async function StagePage({params}:{params:Promise<{stage:string}>}){
 const {stage}=await params;
 const repository=getWebRepository();
 const item=await repository.getStage(stage);
 if(!item)notFound();
 const list=(await repository.listArticles({stage,limit:50})).data;
 const previewEnabled=Boolean(process.env.DEV_CONTENT_PREVIEW_TOKEN&&process.env.DEV_CONTENT_PREVIEW_TOKEN.length>=24);
 return <div className="wrap inner-page">
  <nav className="breadcrumbs" aria-label="Đường dẫn trang"><Link href="/">Trang chủ</Link><span aria-hidden="true">/</span><span aria-current="page">{item.title}</span></nav>
  <section className="stage-head" aria-labelledby="stage-page-title">
   <div><span className="eyebrow">HÀNH TRÌNH THEO GIAI ĐOẠN</span><span className="stage-range">{item.range}</span>
    <h1 id="stage-page-title">{item.title}</h1><p>{item.description}</p>
    <div className="hero-actions"><Link className="ghost-btn" href="/#hanh-trinh">← Xem 12 giai đoạn</Link>
     {previewEnabled?<Link className="primary-btn" href={"/dev-review?stage="+encodeURIComponent(stage)}>Đọc bản thảo của giai đoạn →</Link>:null}
    </div>
   </div>
   <img className="stage-image" src={stageVisuals[item.slug]||"/media/cover-family-planning.svg"} alt={"Minh họa giai đoạn "+item.title} width="1200" height="675"/>
  </section>
  <section aria-labelledby="stage-list-heading">
   <span className="eyebrow">NỘI DUNG THEO CHẶNG</span>
   <h2 className="list-title" id="stage-list-heading">Bài viết của giai đoạn này <span>({list.length})</span></h2>
   {list.length?<div className="article-grid">{list.map(a=><Link href={"/bai-viet/"+a.slug} className="article-card" key={a.slug}>
    {a.media?.cover?<img className="article-card-visual" src={a.media.cover.src} alt={a.media.cover.alt} width="1200" height="675" loading="lazy"/>:null}
    <span className="pill">{a.status==="published"?"Đã xuất bản":"Đang biên tập"}</span><h3>{a.title}</h3>
    <p>{a.summary}</p><span className="article-more">Đọc bài · {a.readMinutes} phút →</span>
   </Link>)}</div>:<div className="empty-library">
    <h3>Chuyên mục đang trong quá trình biên tập</h3>
    <p>Các bài hướng dẫn của giai đoạn này chưa được thẩm định để công bố. Trong môi trường phát triển, bạn có thể đọc bản nháp, checklist và tài liệu tham khảo trong thư viện DEV có mật khẩu.</p>
    <div className="empty-actions">
     {previewEnabled?<Link className="primary-btn" href={"/dev-review?stage="+encodeURIComponent(stage)}>Đọc nội dung DEV của giai đoạn →</Link>:null}
     <Link className="ghost-btn" href={"/nguon-tham-khao?stage="+encodeURIComponent(stage)}>Xem nguồn tham khảo →</Link>
    </div>
   </div>}
  </section>
  <p className="disclaimer">Các nội dung sức khỏe chưa thẩm định không được dùng để tự chẩn đoán hoặc thay thế tư vấn từ nhân viên y tế.</p>
 </div>;
}
