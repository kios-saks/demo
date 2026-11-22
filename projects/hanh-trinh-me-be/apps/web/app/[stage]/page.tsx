import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWebRepository } from "../../lib/repository";

export const dynamic="force-dynamic";
export async function generateStaticParams() {
 if(process.env.WEB_CONTENT_PROVIDER==="api")return [];
 return (await getWebRepository().listStages()).map(s=>({stage:s.slug}));
}
export async function generateMetadata({ params }: { params: Promise<{ stage: string }> }): Promise<Metadata> {
  const { stage } = await params;
  const item = await getWebRepository().getStage(stage);
  return { title: item?.title || "Giai đoạn", description: item?.description };
}
export default async function StagePage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage } = await params;
  const item = await getWebRepository().getStage(stage);
  if (!item) notFound();
  const list = (await getWebRepository().listArticles({stage,limit:50})).data;
  return <div className="wrap inner-page">
    <div className="breadcrumbs"><Link href="/">Trang chủ</Link> / {item.title}</div>
    <div className="stage-head"><span className="stage-icon big">{item.icon}</span><span className="eyebrow">{item.range}</span><h1>{item.title}</h1><p>{item.description}</p></div>
    <h2 className="list-title">Bài viết dành cho giai đoạn này <span>({list.length})</span></h2>
    <div className="article-grid">{list.map(a=><Link href={"/bai-viet/"+a.slug} className="article-card" key={a.slug}><span className="pill">{a.status==="published"?"Đã xuất bản":"Bản nháp cần duyệt"}</span><h3>{a.title}</h3><p>{a.summary}</p><span className="article-more">Đọc bài →</span></Link>)}</div>
    <p className="disclaimer">Các bài hiện là nội dung mẫu; không dùng để đưa ra quyết định điều trị hoặc tự chẩn đoán.</p>
  </div>;
}
