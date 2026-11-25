"use client";
import {useState} from "react";
import catalog from "./learning-catalog.json";
import "./learning.css";
import LifeCourseAtlas from "./life-course-atlas";
const sourceMap:Record<string,{name:string;url:string}>=catalog.sources;
export default function LearningHub(){
 const [age,setAge]=useState("all"),[category,setCategory]=useState("all"),[search,setSearch]=useState("");
 const norm=(s:string)=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");
 const lessons=catalog.lessons.filter(l=>(age==="all"||l.age===age)&&(category==="all"||l.category===category)&&norm(l.title+" "+l.goal+" "+l.knowledge).includes(norm(search.trim())));
 return <section className="learn-shell">
  <header className="learn-hero"><span>HỌC CÙNG CON · TRI THỨC VÒNG ĐỜI</span><h1>Tri thức cho mọi độ tuổi, từ khởi đầu đến tuổi già.</h1><p>Khám phá sức khỏe, dinh dưỡng, giáo dục, trường học, kỹ năng, công nghệ, tài chính và thích nghi trong từng chặng đời.</p><a href="/thu-vien">← Thư viện chăm sóc mẹ và bé</a></header>
  <aside className="learn-note">Bản biên tập DEV, chưa thẩm định chuyên môn. Độ tuổi là gợi ý, không phải tiêu chuẩn bắt buộc. Không thay thế tư vấn y tế hoặc giáo dục cá nhân.</aside>
  <LifeCourseAtlas onSelect={a=>{setAge(a);setCategory("all");setSearch("");}}/><h2>Bài học hiện có (bản biên tập)</h2><div className="learn-ages"><button aria-pressed={age==="all"} onClick={()=>setAge("all")}>Tất cả độ tuổi</button>{catalog.groups.map(g=><button data-learning-age={g.id} key={g.id} aria-pressed={age===g.id} onClick={()=>setAge(g.id)}><strong>{g.age}</strong><small>{g.title}</small></button>)}</div>
  <div className="learn-controls"><label>Chủ đề<select data-learning-category value={category} onChange={e=>setCategory(e.target.value)}><option value="all">Tất cả chủ đề</option>{catalog.categories.map(c=><option value={c.id} key={c.id}>{c.title}</option>)}</select></label><label>Tìm kiến thức<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Ví dụ: AI, dậy thì, tài chính"/></label></div>
  <p aria-live="polite" data-learning-count>{lessons.length}/{catalog.lessons.length} bài học</p>
  {lessons.length===0&&<p>Không tìm thấy bài phù hợp. Hãy thử đổi chủ đề hoặc độ tuổi.</p>}
  <div className="learn-grid">{lessons.map(l=><article id={"lesson-"+l.id} data-learning-lesson={l.id} className="learn-card" key={l.id}><div className="learn-meta"><span>{catalog.groups.find(g=>g.id===l.age)?.age}</span><span>{catalog.categories.find(c=>c.id===l.category)?.title}</span></div><h3>{l.title}</h3><p>{l.goal}</p><details><summary>Đọc bài và thực hành</summary><h4>Kiến thức nền tảng</h4><p>{l.knowledge}</p><h4>Hoạt động cùng con</h4><p>{l.practice}</p><h4>Câu hỏi suy ngẫm</h4><p>{l.reflection}</p><h4>Nguồn tham khảo</h4><ul>{l.sourceIds.map(id=><li key={id}><a href={sourceMap[id].url} target="_blank" rel="noreferrer">{sourceMap[id].name}</a></li>)}</ul><small>Nguồn định hướng nội dung; hoạt động là đề xuất biên tập. Bản draft.</small></details></article>)}</div>
 </section>;
}
