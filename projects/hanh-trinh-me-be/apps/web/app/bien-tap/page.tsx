import Link from "next/link";
import data from "../../../../packages/content/articles.json";
export const metadata = { title: "Góc biên tập (chỉ xem)", robots: { index: false, follow: false } };
export default function Editorial() {
  return <div className="wrap inner-page"><span className="eyebrow">BẢNG KIỂM NỘI DUNG · CHẾ ĐỘ ĐỌC</span><h1>Góc biên tập</h1>
  <p className="lead">Bảng thống kê công khai cho bộ dữ liệu mẫu. Chưa phải CMS: không hỗ trợ chỉnh sửa hoặc phê duyệt. CMS thật phải có đăng nhập, phân quyền, lưu lịch sử và quy trình duyệt y khoa.</p>
  <div className="stats"><div><strong>{data.stages.length}</strong><span>Giai đoạn</span></div><div><strong>{data.articles.length}</strong><span>Bài mẫu</span></div><div><strong>{data.articles.filter(a=>a.status==="draft").length}</strong><span>Chưa duyệt</span></div></div>
  <div className="article-grid">{data.stages.map(s=><div className="article-card" key={s.slug}><h3>{s.icon} {s.title}</h3><p>{data.articles.filter(a=>a.stage===s.slug).length} bài mẫu</p><Link className="article-more" href={"/"+s.slug}>Kiểm tra bài →</Link></div>)}</div>
  </div>;
}
