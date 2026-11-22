import Link from "next/link";
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
 <p className="lead">Danh mục metadata và liên kết gốc được tổng hợp từ WHO, CDC, UNICEF và cơ quan Bộ Y tế Việt Nam ngày 21/11/2026. Các đơn vị này không tài trợ hay chứng thực dự án. Không có nội dung sức khỏe nào đã được duyệt y khoa.</p>
 <form action="/nguon-tham-khao" method="get" className="search-form">
  <label htmlFor="stage" className="sr-only">Lọc giai đoạn</label>
  <select id="stage" name="stage" defaultValue={stage}><option value="">Mọi giai đoạn</option>{stages.map(s=><option key={s.slug} value={s.slug}>{s.title}</option>)}</select>
  <button type="submit">Lọc nguồn</button>
 </form><p className="result-count">{sources.length} nguồn tham khảo · Metadata không sao chép nguyên văn nội dung bên thứ ba</p>
 <div className="article-grid">{sources.map(s=><div key={s.id} className="article-card">
  <span className="pill">{s.publisher}</span><h3>{s.title}</h3>
  <p>Kiểm tra liên kết: {s.accessedAt} · Ngôn ngữ: {s.language.toUpperCase()} · Chưa thẩm định từng luận điểm.</p>
  <a href={s.url} className="article-more" target="_blank" rel="noopener noreferrer">Xem nguồn chính thức ↗</a>
 </div>)}</div><div className="disclaimer">Nguồn được liệt kê chỉ để tra cứu và biên tập; không thay thế tư vấn chuyên môn. <Link href="/goc-nghien-cuu">Xem các thẻ nghiên cứu mẫu →</Link></div></div>;
}
