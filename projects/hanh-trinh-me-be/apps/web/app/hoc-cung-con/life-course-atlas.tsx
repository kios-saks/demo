"use client";
import {useEffect,useState} from "react";
import atlas from "./life-course-atlas.json";
import inventory from "./life-course-inventory.json";
import bundle from "./life-course-articles.json";
export default function LifeCourseAtlas({onSelect}:{onSelect:(age:string)=>void}){
 const [id,setId]=useState(""),[pillar,setPillar]=useState("all"),[target,setTarget]=useState("");
 const stage=atlas.stages.find(s=>s.id===id);
 const cells=inventory.cells.filter(c=>!id||c.stage===id);
 const references=inventory.refs.filter(r=>(!id||r.stage===id)&&(pillar==="all"||r.pillar===pillar));
 const articles=id?bundle.articles.filter(a=>a.stage===id&&(pillar==="all"||a.pillar===pillar)):[];
 useEffect(()=>{
  function restore(){
   const hash=location.hash.slice(1);
   const ref=inventory.refs.find(r=>(r.kind==="article"?"az-":r.kind==="lesson"?"lesson-":"!")+r.id===hash&&r.kind!=="legacy");
   const requested=new URLSearchParams(location.search).get("stage")||"";
   const selected=ref?.stage||(atlas.stages.some(s=>s.id===requested)?requested:"");
   const age=atlas.stages.find(s=>s.id===selected)?.lessonAge||"all";
   setId(selected);setPillar("all");onSelect(age);setTarget(ref?hash:"");
  }
  restore();window.addEventListener("hashchange",restore);window.addEventListener("popstate",restore);
  return ()=>{window.removeEventListener("hashchange",restore);window.removeEventListener("popstate",restore);};
 },[onSelect]);
 useEffect(()=>{
  if(!target)return;
  const frame=requestAnimationFrame(()=>{const node=document.getElementById(target);if(node){const detail=node.querySelector("details");if(detail)detail.open=true;node.scrollIntoView({block:"start"});}});
  return ()=>cancelAnimationFrame(frame);
 },[target,id]);
 function selectStage(value:string){
  setTarget("");setId(value);setPillar("all");onSelect(atlas.stages.find(s=>s.id===value)?.lessonAge||"all");
  const url=new URL(location.href);url.hash="";if(value)url.searchParams.set("stage",value);else url.searchParams.delete("stage");
  history.replaceState(history.state,"",url.pathname+url.search);
 }
 return <section className="life-atlas" aria-label="Bản đồ kiến thức vòng đời">
 <h2>Khám phá cuộc đời từ A–Z</h2><p>Chọn giai đoạn để khám phá kiến thức, kỹ năng và hoạt động phù hợp với nhu cầu của mình. Mỗi người có một nhịp phát triển riêng.</p>
 <div className="learn-ages"><button type="button" aria-pressed={!id} onClick={()=>selectStage("")}>Tất cả độ tuổi</button>{atlas.stages.map(s=><button type="button" data-life-stage={s.id} aria-pressed={id===s.id} key={s.id} onClick={()=>selectStage(s.id)}><strong>{s.age}</strong><small>{s.title}</small></button>)}</div>
 {stage&&<div className="learn-card life-focus"><h3>{stage.age} · {stage.title}</h3><h4>Ưu tiên tìm hiểu</h4><ul>{stage.priorities.map(p=><li key={p}>{p}</li>)}</ul>{stage.legacyStage&&<a href={"/"+stage.legacyStage}>Xem thư viện hiện có ở chặng liên quan →</a>}</div>}
 <p data-life-coverage><strong>{inventory.refs.filter(r=>!id||r.stage===id).length} nội dung {id?"theo chặng":"mọi chặng"}</strong> · {new Set(cells.filter(c=>c.refs.length>0).map(c=>c.pillar)).size} chủ đề để khám phá · {inventory.stats.unique} nội dung trong thư viện</p>
 {stage&&<div className="life-pillars">{atlas.pillars.map(p=>{const c=cells.find(x=>x.pillar===p.id)!;return <button type="button" aria-pressed={pillar===p.id} onClick={()=>setPillar(p.id)} data-life-pillar={p.id} className="learn-card life-pillar-button" key={p.id}><h3>{p.title}</h3><p>{c.topic}</p><small>{!c.applicable?"Tham khảo ở chặng phù hợp":c.refs.length?c.refs.length+" nội dung":"Khám phá chủ đề khác"}</small></button>;})}</div>}
 <section className="learn-card life-reading" aria-label="Nội dung theo chặng"><div className="life-reading-head"><h3>{stage?.age||"Mọi độ tuổi"} · {pillar==="all"?"Tất cả nội dung":atlas.pillars.find(p=>p.id===pillar)?.title}</h3><button onClick={()=>setPillar("all")}>Tất cả chủ đề</button></div>
 {references.length===0&&<p>Chưa có bài phù hợp với lựa chọn này. Bạn có thể xem tất cả chủ đề hoặc chọn một chặng khác.</p>}
 <ul data-life-refs>{references.map(r=><li key={r.kind+":"+r.id}>{r.kind==="legacy"?<a href={r.href}>{r.title}</a>:r.kind==="article"?<a href={"#az-"+r.id}>{r.title}</a>:<a href={"#lesson-"+r.id} onClick={()=>onSelect(r.stage)}>{r.title}</a>}</li>)}</ul>
 </section>
 <div className="learn-grid life-deep-grid">{articles.map(a=><article id={"az-"+a.id} data-life-article={a.id} key={a.id} className="learn-card"><span className="learn-meta">Cẩm nang · {stage?.age}</span><h3>{a.title}</h3><p>{a.summary}</p><a href={"/kien-thuc/article/"+a.id+"/doc"}>Mở trang đọc riêng →</a><details><summary>Đọc hướng dẫn chuyên sâu</summary>{a.sections.map(s=><section key={s.heading}><h4>{s.heading}</h4><p>{s.body}</p>{s.sourceIds.length>0&&<small>Tham khảo: {s.sourceIds.map((id,i)=><span key={id}>{i>0?" · ":""}<a href={(bundle.sources as Record<string,{name:string;url:string}>)[id].url} target="_blank" rel="noreferrer">{(bundle.sources as Record<string,{name:string;url:string}>)[id].name}</a></span>)}</small>}</section>)}<h4>Checklist thực hành</h4><ol>{a.practice.map(p=><li key={p}>{p}</li>)}</ol><h4>Giới hạn áp dụng</h4><p>{a.limits}</p><h4>Nguồn định hướng</h4><ul>{a.sourceIds.map(id=><li key={id}><a href={(bundle.sources as Record<string,{name:string;url:string}>)[id].url} target="_blank" rel="noreferrer">{(bundle.sources as Record<string,{name:string;url:string}>)[id].name}</a></li>)}</ul><small>Tra cứu nguồn: {bundle.sourceCheckedOn}. Chưa thẩm định chuyên môn.</small></details></article>)}</div>
 <div className="learn-card life-directory"><h3>Cách lựa chọn trường học và cơ sở đào tạo</h3><p>Tham khảo các tiêu chí dưới đây để tìm hiểu và so sánh cơ sở giáo dục phù hợp với nhu cầu của gia đình. Chúng tôi không xếp hạng hay xác nhận chất lượng của từng trường.</p><p>{atlas.directory.principle}</p><ul>{atlas.directory.fields.map(f=><li key={f}>{f}</li>)}</ul><h4>Nguồn kiểm chứng</h4>{atlas.directory.sources.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.name}</a></p>)}</div>
 <small>Khung sức khỏe vòng đời tham khảo <a href={atlas.source.url} target="_blank" rel="noreferrer">{atlas.source.name}</a>. Các nhóm tuổi và chủ đề được sắp xếp để bạn dễ tìm hiểu theo từng chặng đời.</small>
 </section>;
}
