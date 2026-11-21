import {getWebRepository} from "../../lib/repository";
export const metadata={title:"Thẻ nghiên cứu nội dung nháp",robots:{index:false,follow:false}};
export default async function ResearchPage(){
 const repo=getWebRepository();
 const [cards,stages,sources,topics]=await Promise.all([repo.listResearchCards(),repo.listStages(),repo.listSources(),repo.listTopics()]);
 return <div className="wrap inner-page"><span className="eyebrow">NỘI DUNG MẪU · CẦN THẨM ĐỊNH</span><h1>12 thẻ nghiên cứu theo hành trình</h1>
 <p className="lead">Tóm tắt do nhóm biên tập soạn từ chủ đề trong các nguồn chính thức, không sao chép văn bản gốc. Đây chỉ là tài liệu chờ kiểm chứng từng nhận định và phê duyệt trước khi phát hành.</p>
 <div className="article-grid">{cards.map(c=><div key={c.id} className="article-card">
 <span className="pill">BẢN NHÁP · {stages.find(s=>s.slug===c.stageSlug)?.title}</span><h3>{c.title}</h3><p>{c.summary}</p>
 <p><b>Câu hỏi cho gia đình:</b> {c.readerQuestion}</p><p><b>Gợi ý:</b> {c.practicePrompt}</p>
 <p><b>Chủ đề:</b> {topics.find(t=>t.id===c.topicId)?.title}</p>
 {c.sourceIds.map(id=>{const src=sources.find(s=>s.id===id);return src?<p key={id}><a className="text-link" href={src.url} target="_blank" rel="noopener noreferrer">{src.publisher} — đọc nguồn ↗</a></p>:null})}
 </div>)}</div></div>;
}
