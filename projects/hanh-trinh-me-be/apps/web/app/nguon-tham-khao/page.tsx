import {getWebRepository} from "../../lib/repository";
export const dynamic="force-dynamic";
export const metadata={title:"Danh mục nguồn tham khảo",robots:{index:false,follow:false}};
export default async function SourcesPage({searchParams}:{searchParams:Promise<{stage?:string}>}){
 const {stage=""}=await searchParams;
 const repo=getWebRepository();
 const stages=await repo.listStages();
 const sources=await repo.listSources(stage);
 return <div className="wrap inner-page"><span className="eyebrow">THƯ VIỆN NGUỒN · TÀI LIỆU THAM KHẢO</span>
 <h1>Nguồn nghiên cứu và tham khảo</h1>
 <p className="lead">Khám phá các tài liệu gốc từ tổ chức y tế, giáo dục và cơ quan chuyên môn. Việc dẫn nguồn không có nghĩa các tổ chức này tài trợ hoặc chứng thực Hành Trình Mẹ & Bé. Nội dung sức khỏe trên website chưa được thẩm định y khoa.</p>
 <form action="/nguon-tham-khao" method="get" className="search-form">
  <label htmlFor="stage" className="sr-only">Lọc giai đoạn</label>
  <select id="stage" name="stage" defaultValue={stage}><option value="">Mọi giai đoạn</option>{stages.map(s=><option key={s.slug} value={s.slug}>{s.title}</option>)}</select>
  <button type="submit">Lọc nguồn</button>
 </form><p className="result-count">{sources.length} nguồn tham khảo · Liên kết đến tài liệu gốc</p>
 <div className="article-grid">{sources.map(s=><div key={s.id} className="article-card">
  <span className="pill">{s.publisher}</span><h3>{s.title}</h3>
  <p>Kiểm tra liên kết: {s.accessedAt} · Ngôn ngữ: {s.language.toUpperCase()} · Chưa thẩm định từng luận điểm.</p>
  <a href={s.url} className="article-more" target="_blank" rel="noopener noreferrer">Xem nguồn chính thức ↗</a>
 </div>)}</div><div className="disclaimer">Tài liệu được cung cấp để bạn tìm hiểu và đối chiếu thông tin; không thay thế tư vấn chuyên môn.</div></div>;
}
