"use client";
import {useState} from "react";
import atlas from "./life-course-atlas.json";
import inventory from "./life-course-inventory.json";
import bundle from "./life-course-articles.json";
export default function LifeCourseAtlas({onSelect}:{onSelect:(age:string)=>void}){
 const [id,setId]=useState("baby"),[pillar,setPillar]=useState("all");
 const stage=atlas.stages.find(s=>s.id===id)!;
 const cells=inventory.cells.filter(c=>c.stage===id); 
 const references=inventory.refs.filter(r=>r.stage===id&&(pillar==="all"||r.pillar===pillar));
 const articles=bundle.articles.filter(a=>a.stage===id&&(pillar==="all"||a.pillar===pillar));
 return <section className="life-atlas" aria-label="Bản đồ kiến thức vòng đời">
 <h2>Khám phá cuộc đời từ A–Z</h2><p>Chọn giai đoạn để xem nhu cầu kiến thức và phần đang có bài học. Bản đồ là kế hoạch biên tập, không phải chuẩn phát triển bắt buộc.</p>
 <div className="learn-ages">{atlas.stages.map(s=><button type="button" data-life-stage={s.id} aria-pressed={id===s.id} key={s.id} onClick={()=>{setId(s.id);setPillar("all");onSelect(s.lessonAge||"all");}}><strong>{s.age}</strong><small>{s.title}</small></button>)}</div>
 <div className="learn-card life-focus"><h3>{stage.age} · {stage.title}</h3><h4>Ưu tiên tìm hiểu</h4><ul>{stage.priorities.map(p=><li key={p}>{p}</li>)}</ul>{stage.legacyStage&&<a href={"/"+stage.legacyStage}>Xem thư viện hiện có ở chặng liên quan →</a>}</div>
 <p data-life-coverage><strong>{cells.filter(c=>c.status==="partial-draft").length}/{cells.filter(c=>c.applicable).length} nhóm có bài draft</strong> · {cells.filter(c=>c.status==="gap").length} nhóm cần biên tập. Toàn bộ {inventory.stats.unique} nội dung trong danh mục; chưa công nhận ô nào đủ hoặc đã thẩm định.</p>
 <div className="life-pillars">{atlas.pillars.map(p=>{const c=cells.find(x=>x.pillar===p.id)!;return <button type="button" aria-pressed={pillar===p.id} onClick={()=>setPillar(p.id)} data-life-pillar={p.id} className="learn-card life-pillar-button" key={p.id}><h3>{p.title}</h3><p>{c.topic}</p><small>{!c.applicable?"Chưa ưu tiên":c.refs.length?c.refs.length+" nội dung draft · cần rà soát":"Chưa có bài chính · "+c.priority}</small></button>;})}</div>
 <section className="learn-card life-reading" aria-label="Nội dung theo chặng"><div className="life-reading-head"><h3>{stage.age} · {pillar==="all"?"Tất cả nội dung":atlas.pillars.find(p=>p.id===pillar)?.title}</h3><button onClick={()=>setPillar("all")}>Tất cả chủ đề</button></div>
 {references.length===0&&<p>Chưa có bài chính ở phạm vi này. Nội dung đang chờ biên tập; không hiển thị bài giả.</p>}
 <ul data-life-refs>{references.map(r=><li key={r.kind+":"+r.id}>{r.kind==="legacy"?<a href={r.href}>{r.title}</a>:r.kind==="article"?<a href={"#az-"+r.id}>{r.title}</a>:<a href={"#lesson-"+r.id} onClick={()=>onSelect(r.stage)}>{r.title}</a>} <small>· draft</small></li>)}</ul>
 </section>
 <div className="learn-grid life-deep-grid">{articles.map(a=><article id={"az-"+a.id} data-life-article={a.id} key={a.id} className="learn-card"><span className="learn-meta">Bản biên tập · {stage.age}</span><h3>{a.title}</h3><p>{a.summary}</p><details><summary>Đọc hướng dẫn chuyên sâu</summary>{a.sections.map(s=><section key={s.heading}><h4>{s.heading}</h4><p>{s.body}</p>{s.sourceIds.length>0&&<small>Tham khảo: {s.sourceIds.map((id,i)=><span key={id}>{i>0?" · ":""}<a href={(bundle.sources as Record<string,{name:string;url:string}>)[id].url} target="_blank" rel="noreferrer">{(bundle.sources as Record<string,{name:string;url:string}>)[id].name}</a></span>)}</small>}</section>)}<h4>Checklist thực hành</h4><ol>{a.practice.map(p=><li key={p}>{p}</li>)}</ol><h4>Giới hạn áp dụng</h4><p>{a.limits}</p><h4>Nguồn định hướng</h4><ul>{a.sourceIds.map(id=><li key={id}><a href={(bundle.sources as Record<string,{name:string;url:string}>)[id].url} target="_blank" rel="noreferrer">{(bundle.sources as Record<string,{name:string;url:string}>)[id].name}</a></li>)}</ul><small>Tra cứu nguồn: {bundle.sourceCheckedOn}. Chưa thẩm định chuyên môn.</small></details></article>)}</div>
 <div className="learn-card life-directory"><h3>Tra cứu trường học & cơ sở đào tạo</h3><p>Đang chuẩn bị danh mục Việt Nam theo độ tuổi, địa phương và nhu cầu. Chưa có trường nào được xác nhận hoặc xếp hạng trong module.</p><p>{atlas.directory.principle}</p><ul>{atlas.directory.fields.map(f=><li key={f}>{f}</li>)}</ul><h4>Nguồn kiểm chứng</h4>{atlas.directory.sources.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.name}</a></p>)}</div>
 <small>Khung sức khỏe vòng đời tham khảo <a href={atlas.source.url} target="_blank" rel="noreferrer">{atlas.source.name}</a>. Các nhóm tuổi và trụ cột là phân loại biên tập của dự án.</small>
 </section>;
}
