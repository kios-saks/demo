import Link from "next/link";
import { getWebRepository } from "../../lib/repository";
export const dynamic="force-dynamic";
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; stage?: string }> }) {
  const params = await searchParams; const q = (params.q || "").trim().toLocaleLowerCase("vi-VN"); const stage = params.stage || "";
  const repository=getWebRepository();
  const stages=await repository.listStages();
  const results=(await repository.listArticles({q,stage,limit:50})).data;
  return <div className="wrap inner-page"><span className="eyebrow">TRA CỨU KIẾN THỨC</span><h1>Tìm điều bạn đang quan tâm</h1>
    <form action="/tim-kiem" method="get" className="search-form">
      <label htmlFor="q" className="sr-only">Từ khóa</label><input id="q" name="q" placeholder="Ví dụ: ngủ, đi học, cảm xúc..." defaultValue={params.q || ""}/>
      <label htmlFor="stage" className="sr-only">Giai đoạn</label><select id="stage" name="stage" defaultValue={stage}><option value="">Mọi giai đoạn</option>{stages.map(s=><option key={s.slug} value={s.slug}>{s.title}</option>)}</select>
      <button type="submit">Tìm kiếm</button>
    </form><p className="result-count">{results.length} bài viết phù hợp</p>
    <div className="article-grid">{results.map(a=><Link href={"/bai-viet/"+a.slug} className="article-card" key={a.slug}><span className="pill">{stages.find(s=>s.slug===a.stage)?.title}</span><h3>{a.title}</h3><p>{a.summary}</p><span className="article-more">Đọc bài →</span></Link>)}</div>
  </div>;
}
