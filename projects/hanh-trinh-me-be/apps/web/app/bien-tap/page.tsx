import Link from "next/link";
import { getWebRepository } from "../../lib/repository";
export const metadata = { title: "Góc biên tập (chỉ xem)", robots: { index: false, follow: false } };
export default async function Editorial() {
  const repository=getWebRepository();
  const overview=await repository.getOverview();
  const stages=await repository.listStages();
  const articles=(await repository.listArticles({limit:50})).data;
  return <div className="wrap inner-page"><span className="eyebrow">BẢNG KIỂM NỘI DUNG · CHẾ ĐỘ ĐỌC</span><h1>Góc biên tập</h1>
  <p className="lead">Bảng thống kê công khai cho bộ dữ liệu mẫu. Chưa phải CMS: không hỗ trợ chỉnh sửa hoặc phê duyệt. CMS thật phải có đăng nhập, phân quyền, lưu lịch sử và quy trình duyệt y khoa.</p>
  <div className="stats"><div><strong>{overview.stages}</strong><span>Giai đoạn</span></div><div><strong>{overview.articles}</strong><span>Bài mẫu</span></div><div><strong>{overview.drafts}</strong><span>Chưa duyệt</span></div></div>
  <div className="article-grid">{stages.map(s=><div className="article-card" key={s.slug}><h3>{s.icon} {s.title}</h3><p>{articles.filter(a=>a.stage===s.slug).length} bài mẫu</p><Link className="article-more" href={"/"+s.slug}>Kiểm tra bài →</Link></div>)}</div>
    <p className="lead">Nguồn mock và thẻ nghiên cứu: <Link className="text-link" href="/nguon-tham-khao">Danh mục nguồn tham khảo →</Link> · <Link className="text-link" href="/goc-nghien-cuu">Thẻ nghiên cứu chưa duyệt →</Link></p>
  </div>;
}
