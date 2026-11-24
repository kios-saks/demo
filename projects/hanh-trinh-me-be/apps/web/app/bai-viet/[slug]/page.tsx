import Link from "next/link";
import {articleCover,coverAlt,coverCaption,inlineAsset} from "../../../lib/editorial-media";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWebRepository } from "../../../lib/repository";

export const dynamic="force-dynamic";
export async function generateStaticParams() {
 if(process.env.NODE_ENV==="production"||process.env.WEB_CONTENT_PROVIDER==="api")return [];
 return (await getWebRepository().listArticles({limit:50})).data.map(a=>({slug:a.slug}));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getWebRepository().getArticle(slug);
  return { title: a?.title || "Bài viết", description: a?.summary, robots: { index: false, follow: true } };
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getWebRepository().getArticle(slug);
  if (!a) notFound();
  const stage = (await getWebRepository().getStage(a.stage))!;
  const disclaimer=await getWebRepository().getDisclaimer();
  return <div className="wrap article-layout"><article className="article-body">
    <div className="breadcrumbs"><Link href="/">Trang chủ</Link> / <Link href={"/"+stage.slug}>{stage.title}</Link> / Bài viết</div>
    <span className="pill">{a.status==="published"?"ĐÃ XUẤT BẢN":"BẢN NHÁP • CHƯA THẨM ĐỊNH"}</span><h1>{a.title}</h1><p className="lead">{a.summary}</p>
    <div className="meta">Đọc khoảng {a.readMinutes} phút · Chuyên mục: {stage.title}</div>
    <div className="disclaimer"><b>Lưu ý:</b> {disclaimer}</div>
    {a.media?.cover&&<figure className="article-cover"><img src={articleCover(a.slug,a.media.cover.src)} alt={coverAlt(a.title,a.slug)} width="1200" height="675"/><figcaption>{coverCaption(a.slug)}</figcaption></figure>}
    {a.media?.highlights?.length&&<section className="quick-takeaway"><h2>Ghi nhớ trong 30 giây</h2><ul>{a.media.highlights.map(x=><li key={x}>{x}</li>)}</ul></section>}
    <details className="mobile-article-toc"><summary>Trong bài viết này · {a.sections.length} phần</summary>
      <nav aria-label="Mục lục bài viết trên điện thoại">{a.sections.map((s,i)=><a key={s.heading} href={"#chuong-"+i}>{String(i+1).padStart(2,"0")} · {s.heading}</a>)}</nav>
    </details>
    {a.sections.map((s,i)=><div key={s.heading}><section className="prose-section" id={"chuong-"+i}><h2>{s.heading}</h2>{s.paragraphs.map(p=><p key={p}>{p}</p>)}</section>{a.media?.inline?.filter(v=>v.afterSection===i).map(v=>{const asset=inlineAsset(a.slug,v);return <figure className="article-infographic" key={v.src}><img src={asset.src} alt={v.alt} width={asset.width} height={asset.height} loading="lazy"/><figcaption>{v.caption} · <a href={v.sourceUrl} target="_blank" rel="noopener noreferrer">Đối chiếu nguồn →</a></figcaption>{asset.points?.length?<details className="infographic-transcript" open><summary>Đọc {asset.points.length} gợi ý trong hình dưới dạng văn bản</summary><ol>{asset.points.map((point,i)=><li key={i}>{point}</li>)}</ol></details>:null}</figure>})}</div>)}
    <section className="sources"><h2>Nguồn đọc thêm</h2><ul>{a.sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.name} ↗</a></li>)}</ul>
      <p>Thông tin tham khảo chỉ dùng để gợi mở việc biên tập; chưa phải xác nhận chuyên môn cho bài viết.</p></section>
    <Link className="text-link" href={"/"+stage.slug}>← Về {stage.title}</Link>
  </article><aside className="article-aside"><div className="aside-card"><h3>Trong bài viết này</h3><nav className="article-toc" aria-label="Mục lục bài viết">{a.sections.map((s,i)=><a key={s.heading} href={"#chuong-"+i}>{String(i+1).padStart(2,"0")} · {s.heading}</a>)}</nav><div className="aside-stage"><h3>{stage.title}</h3><p>{stage.description}</p><Link href={"/"+stage.slug}>Xem thêm chủ đề →</Link></div></div></aside></div>;
}
