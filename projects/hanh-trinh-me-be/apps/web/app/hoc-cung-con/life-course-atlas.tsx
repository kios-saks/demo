"use client";
import {useState} from "react";
import atlas from "./life-course-atlas.json";
import catalog from "./learning-catalog.json";
const crosswalk:Record<string,string[]>={psych:["psych"],body:["body"],education:["skills"],thinking:["skills"],digital:["modern"],finance:["finance"],life:["skills"],career:["skills"]};
export default function LifeCourseAtlas({onSelect}:{onSelect:(age:string)=>void}){
 const [id,setId]=useState("baby");
 const stage=atlas.stages.find(s=>s.id===id)!;
 const count=(pillar:string)=>catalog.lessons.filter(l=>l.age===stage.lessonAge&&(crosswalk[pillar]||[]).includes(l.category)).length;
 return <section className="life-atlas" aria-label="Bản đồ kiến thức vòng đời">
 <h2>Khám phá cuộc đời từ A–Z</h2><p>Chọn giai đoạn để xem nhu cầu kiến thức và phần đang có bài học. Bản đồ là kế hoạch biên tập, không phải chuẩn phát triển bắt buộc.</p>
 <div className="learn-ages">{atlas.stages.map(s=><button type="button" data-life-stage={s.id} aria-pressed={id===s.id} key={s.id} onClick={()=>{setId(s.id);onSelect(s.lessonAge||"all");}}><strong>{s.age}</strong><small>{s.title}</small></button>)}</div>
 <div className="learn-card life-focus"><h3>{stage.age} · {stage.title}</h3><h4>Ưu tiên tìm hiểu</h4><ul>{stage.priorities.map(p=><li key={p}>{p}</li>)}</ul>{stage.legacyStage&&<a href={"/"+stage.legacyStage}>Xem thư viện hiện có ở chặng liên quan →</a>}</div>
 <div className="life-pillars">{atlas.pillars.map(p=>{const n=count(p.id),applicable=stage.applicable.includes(p.id);return <article data-life-pillar={p.id} className="learn-card" key={p.id}><h3>{p.title}</h3><p>{p.description}</p><small>{!applicable?"Chưa ưu tiên ở chặng này":n>0?"Có "+n+" bài học liên quan (draft)":"Cần biên tập / rà soát thư viện cũ"}</small></article>;})}</div>
 <div className="learn-card life-directory"><h3>Tra cứu trường học & cơ sở đào tạo</h3><p>Đang chuẩn bị danh mục Việt Nam theo độ tuổi, địa phương và nhu cầu. Chưa có trường nào được xác nhận hoặc xếp hạng trong module.</p><p>{atlas.directory.principle}</p><ul>{atlas.directory.fields.map(f=><li key={f}>{f}</li>)}</ul><h4>Nguồn kiểm chứng</h4>{atlas.directory.sources.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.name}</a></p>)}</div>
 <small>Khung sức khỏe vòng đời tham khảo <a href={atlas.source.url} target="_blank" rel="noreferrer">{atlas.source.name}</a>. Các nhóm tuổi và trụ cột là phân loại biên tập của dự án.</small>
 </section>;
}
