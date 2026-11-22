"use client";
import {useState} from "react";
import type {ArticleEditorSummary,EditableArticle,EditorialRecord,EditorialEvent,DemoRole} from "../../../../packages/data/src/editorial-contracts";

const API=process.env.NEXT_PUBLIC_CONTENT_API_URL || "http://localhost:4000";
const labels:Record<DemoRole,string>={writer:"Người viết",editor:"Biên tập viên",reviewer:"Người kiểm tra chuyên môn (demo)"};
type Session={id:string;role:DemoRole};
type Form=EditableArticle;
function toForm(r:EditorialRecord):Form{
 const a=r.article;
 return {title:a.title,summary:a.summary,readMinutes:a.readMinutes,tags:[...a.tags],
 sections:structuredClone(a.sections),sources:structuredClone(a.sources)};
}
function friendly(code:string){
 const messages:Record<string,string>={
 UNAUTHORIZED:"Khóa truy cập không hợp lệ.",
 EDITORIAL_DEMO_NOT_CONFIGURED:"Chưa cấu hình ba khóa demo ở Backend.",
 REVISION_CONFLICT:"Phiên bản đã thay đổi; hãy tải lại trước khi lưu.",
 ROLE_FORBIDDEN:"Vai trò này không có quyền thực hiện.",
 SELF_REVIEW_FORBIDDEN:"Không được tự duyệt bản do chính mình sửa.",
 INVALID_SECTIONS:"Nội dung phải có các mục và đoạn văn hợp lệ.",
 INVALID_SOURCES:"Cần ít nhất một nguồn HTTPS hợp lệ.",
 NOT_SUBMITTED_REVISION:"Bản này chưa được gửi duyệt.",
 NOT_A_DRAFT:"Chỉ có thể gửi duyệt bản nháp.",
 REVIEW_NOTE_REQUIRED:"Cần nhận xét tối thiểu 5 ký tự khi yêu cầu sửa."
 };
 return messages[code]||code;
}
async function api<T>(token:string,path:string,method="GET",body?:unknown):Promise<T>{
 const response=await fetch(API+path,{method,headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},
 ...(body?{body:JSON.stringify(body)}:{}),cache:"no-store"});
 let payload:{data?:T;error?:string}={};
 try{payload=await response.json()}catch{}
 if(!response.ok)throw new Error(friendly(payload.error||"HTTP "+response.status));
 return payload.data as T;
}
export default function CmsWorkbench(){
 const[token,setToken]=useState("");
 const[session,setSession]=useState<Session|null>(null);
 const[items,setItems]=useState<ArticleEditorSummary[]>([]);
 const[record,setRecord]=useState<EditorialRecord|null>(null);
 const[form,setForm]=useState<Form|null>(null);
 const[filter,setFilter]=useState("");
 const[note,setNote]=useState("");
 const[error,setError]=useState("");
 const[success,setSuccess]=useState("");
 const[busy,setBusy]=useState(false);
 const[showAudit,setShowAudit]=useState(false);
 const refreshList=async(access:string)=>setItems(await api<ArticleEditorSummary[]>(access,"/v1/admin/articles"));
 async function select(slug:string){
   setError("");setSuccess("");
   try{const next=await api<EditorialRecord>(token,"/v1/admin/articles/"+encodeURIComponent(slug));
     setRecord(next);setForm(toForm(next));setShowAudit(false);}
   catch(e){setError(e instanceof Error?e.message:String(e))}
 }
 async function connect(){
   setBusy(true);setError("");setSuccess("");
   try{const info=await api<Session>(token,"/v1/admin/session");
     await refreshList(token);setSession(info);setSuccess("Đã xác thực vai trò: "+labels[info.role]);}
   catch(e){setSession(null);setRecord(null);setError(e instanceof Error?e.message:String(e))}
   finally{setBusy(false)}
 }
 function logout(){setToken("");setSession(null);setRecord(null);setForm(null);setItems([]);setError("");setSuccess("")}
 async function update(path:string,method:string,body:unknown,done:string){
   setBusy(true);setError("");setSuccess("");
   try{const next=await api<EditorialRecord>(token,path,method,body);
      setRecord(next);setForm(toForm(next));await refreshList(token);setSuccess(done);}
   catch(e){setError(e instanceof Error?e.message:String(e))}
   finally{setBusy(false)}
 }
 const writable=session?.role==="writer"||session?.role==="editor";
 const canEdit=!!record&&record.article.status!=="archived";
 const changed=!!record&&!!form&&JSON.stringify(toForm(record))!==JSON.stringify(form);
 const list=items.filter(x=>[x.title,x.stage,x.status].join(" ").toLocaleLowerCase("vi-VN").includes(filter.toLocaleLowerCase("vi-VN")));
 const url=record?"/v1/admin/articles/"+encodeURIComponent(record.article.slug):"";
 return <div className="cms-frame">
 <section className="cms-access">{!session?<><h2>Đăng nhập bằng khóa vai trò (development)</h2>
   <p>Khóa do Backend cấu hình, chỉ giữ trong bộ nhớ trang hiện tại; không lưu vào trình duyệt hay GitHub.</p>
   <div className="cms-row"><label className="cms-field cms-grow">Khóa truy cập
    <input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} placeholder="EDITORIAL_DEMO_..._TOKEN"/>
   </label><button className="cms-btn" disabled={busy||!token} onClick={connect}>Kết nối CMS</button></div>
 </>:<div className="cms-row cms-between"><strong>{labels[session.role]}</strong><button className="cms-btn secondary" onClick={logout}>Ngắt kết nối</button></div>}</section>
 {error?<p className="cms-alert error" role="alert">{error}</p>:null}
 {success?<p className="cms-alert ok" role="status">{success}</p>:null}
 {session?<div className="cms-grid">
   <aside className="cms-sidebar"><div className="cms-row cms-between"><h2>Danh sách bài viết</h2><button className="cms-link" onClick={()=>refreshList(token)} disabled={busy}>Làm mới</button></div>
     <label className="cms-field">Lọc danh sách<input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Tiêu đề, trạng thái..."/></label>
     <p className="cms-muted">{list.length} bài, {items.filter(x=>x.status==="draft").length} bản nháp</p>
     <div className="cms-list">{list.map(x=><button key={x.slug} type="button" className={"cms-list-item"+(record?.article.slug===x.slug?" active":"")} onClick={()=>select(x.slug)}>
       <strong>{x.title}</strong><span>{x.stage} · {x.status} · v{x.revision}</span></button>)}</div>
   </aside>
   <section className="cms-editor">{!record||!form?<div className="cms-empty"><h2>Chọn một bài viết</h2><p>Mở bản nháp để biên tập, xem lịch sử và gửi duyệt.</p></div>:<>
    <div className="cms-row cms-between"><div><span className="eyebrow">MÃ BÀI · {record.article.slug}</span><h2>{record.article.title}</h2><p>Trạng thái: <b>{record.article.status}</b> · Phiên bản {record.revision}</p></div>
      <button className="cms-btn secondary" disabled={busy} onClick={()=>select(record.article.slug)}>Tải lại</button></div>
    <div className="cms-metrics"><span>Biên tập: {record.editorialApproval?"Đã duyệt demo":"Chưa duyệt"}</span><span>Chuyên môn: {record.medicalApproval?"Đã duyệt demo":"Chưa duyệt"}</span></div>
    <p className="cms-warning">Phê duyệt chỉ mang tính mô phỏng, không thay thế đánh giá của chuyên gia có chứng chỉ. Không có chức năng xuất bản.</p>
    <label className="cms-field">Tiêu đề<input disabled={!writable||!canEdit} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
    <label className="cms-field">Mô tả<textarea rows={3} disabled={!writable||!canEdit} value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})}/></label>
    <div className="cms-row">
      <label className="cms-field" style={{maxWidth:170}}>Số phút đọc<input type="number" min={1} max={90} disabled={!writable||!canEdit} value={form.readMinutes} onChange={e=>setForm({...form,readMinutes:Number(e.target.value)})}/></label>
      <label className="cms-field cms-grow">Từ khóa, cách nhau bằng dấu phẩy<input disabled={!writable||!canEdit} value={form.tags.join(", ")} onChange={e=>setForm({...form,tags:e.target.value.split(",").map(v=>v.trim()).filter(Boolean)})}/></label>
    </div>
    <h3>Các mục nội dung</h3>
    {form.sections.map((section,i)=><div className="cms-subcard" key={i}><div className="cms-row cms-between"><strong>Mục {i+1}</strong>{writable&&form.sections.length>1?<button className="cms-link" onClick={()=>setForm({...form,sections:form.sections.filter((_,j)=>j!==i)})}>Xóa mục</button>:null}</div>
      <label className="cms-field">Tiêu đề mục<input disabled={!writable||!canEdit} value={section.heading} onChange={e=>setForm({...form,sections:form.sections.map((s,j)=>i===j?{...s,heading:e.target.value}:s)})}/></label>
      <label className="cms-field">Nội dung (mỗi đoạn cách bằng dòng trống)<textarea rows={5} disabled={!writable||!canEdit} value={section.paragraphs.join("\n\n")} onChange={e=>setForm({...form,sections:form.sections.map((s,j)=>i===j?{...s,paragraphs:e.target.value.split(/\n\s*\n/).map(v=>v.trim()).filter(Boolean)}:s)})}/></label>
    </div>)}
    {writable&&canEdit?<button className="cms-btn secondary" disabled={busy} onClick={()=>setForm({...form,sections:[...form.sections,{heading:"Mục mới",paragraphs:["Nội dung biên tập."]}]})}>+ Thêm mục</button>:null}
    <h3>Nguồn tham khảo</h3>
    {form.sources.map((source,i)=><div className="cms-subcard" key={i}>
      <label className="cms-field">Tên nguồn<input disabled={!writable||!canEdit} value={source.name} onChange={e=>setForm({...form,sources:form.sources.map((s,j)=>i===j?{...s,name:e.target.value}:s)})}/></label>
      <label className="cms-field">URL HTTPS<input disabled={!writable||!canEdit} value={source.url} onChange={e=>setForm({...form,sources:form.sources.map((s,j)=>i===j?{...s,url:e.target.value}:s)})}/></label>
      {writable&&form.sources.length>1?<button className="cms-link" disabled={busy} onClick={()=>setForm({...form,sources:form.sources.filter((_,j)=>j!==i)})}>Xóa nguồn</button>:null}
    </div>)}
    {writable&&canEdit?<button className="cms-btn secondary" disabled={busy} onClick={()=>setForm({...form,sources:[...form.sources,{name:"Nguồn mới",url:"https://example.org"}]})}>+ Thêm nguồn</button>:null}
    {writable&&canEdit?<div className="cms-actions">
      <button className="cms-btn" disabled={busy||!changed} onClick={()=>update(url,"PUT",{expectedRevision:record.revision,content:form},"Đã lưu bản sửa mới và đặt lại các phê duyệt trước.")}>Lưu bản nháp</button>
      <button className="cms-btn secondary" disabled={busy||changed||record.article.status!=="draft"} onClick={()=>update(url+"/submit","POST",{expectedRevision:record.revision},"Đã gửi bài vào hàng chờ duyệt.")}>Gửi duyệt</button>
    </div>:null}
    {record.article.status==="in_review"&&(session.role==="reviewer"||session.role==="editor")?<div className="cms-subcard">
      <h3>Đánh giá mô phỏng</h3>
      <label className="cms-field">Nhận xét (khi yêu cầu sửa)<textarea rows={2} value={note} onChange={e=>setNote(e.target.value)}/></label>
      <div className="cms-actions">
        {session.role==="editor"?<button className="cms-btn" disabled={busy||!!record.editorialApproval} onClick={()=>update(url+"/review","POST",{expectedRevision:record.revision,decision:"editorial_approve"},"Đã ghi nhận biên tập duyệt (demo).")}>Biên tập duyệt</button>:null}
        {session.role==="reviewer"?<button className="cms-btn" disabled={busy||!!record.medicalApproval} onClick={()=>update(url+"/review","POST",{expectedRevision:record.revision,decision:"medical_approve"},"Đã ghi nhận chuyên môn duyệt (demo).")}>Chuyên môn duyệt</button>:null}
        {session.role==="editor"?<button className="cms-btn secondary" disabled={busy||note.trim().length<5} onClick={()=>update(url+"/review","POST",{expectedRevision:record.revision,decision:"request_changes",note},"Đã yêu cầu sửa, trả về bản nháp.")}>Yêu cầu sửa</button>:null}
      </div>
    </div>:null}
    <div className="cms-history"><button className="cms-btn secondary" onClick={()=>setShowAudit(!showAudit)}>{showAudit?"Ẩn":"Hiện"} lịch sử ({record.events.length})</button>
      {showAudit?<div className="cms-events">{record.events.map((e:EditorialEvent)=><div className="cms-event" key={e.sequence}><strong>#{e.sequence} {e.action}</strong><small>Vai trò: {e.role} · {e.actorId} · v{e.revision} · {e.at}</small>{e.note?<p>{e.note}</p>:null}</div>)}</div>:null}
    </div>
   </>}</section>
 </div>:null}
 </div>;
}