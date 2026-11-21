import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import data from "../../../../packages/content/articles.json";

export function generateStaticParams() { return data.stages.map(s => ({ stage: s.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ stage: string }> }): Promise<Metadata> {
  const { stage } = await params;
  const item = data.stages.find(s => s.slug === stage);
  return { title: item?.title || "Giai đoạn", description: item?.description };
}
export default async function StagePage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  const item = data.stages.find(s => s.slug === stage);
  if (!item) notFound();
  const list = data.articles.filter(a => a.stage === stage);
  return <div className="wrap inner-page">
    <div className="breadcrumbs"><Link href="/">Trang chủ</Link> / {item.title}</div>
    <div className="stage-head"><span className="stage-icon big">{item.icon}</span><span className="eyebrow">{item.range}</span><h1>{item.title}</h1><p>{item.description}</p></div>
    <h2 className="list-title">Bài viết dành cho giai đoạn này <span>({list.length})</span></h2>
    <div className="article-grid">{list.map(a=><Link href={"/bai-viet/"+a.slug} className="article-card" key={a.slug}><span className="pill">Bản nháp cần duyệt</span><h3>{a.title}</h3><p>{a.summary}</p><span className="article-more">Đọc bài →</span></Link>)}</div>
    <p className="disclaimer">Các bài hiện là nội dung mẫu; không dùng để đưa ra quyết định điều trị hoặc tự chẩn đoán.</p>
  </div>;
}
