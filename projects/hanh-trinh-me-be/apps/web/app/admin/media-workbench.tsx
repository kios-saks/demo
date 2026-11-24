"use client";
import {useEffect,useRef,useState} from "react";

type Role="editor"|"reviewer";
type Item={slug:string;title:string;stage:string;active_revision:number|null;active_asset_id:string|null;active_mime:string|null;original_mime:string|null;pending:number;latest_pending:number|null};
type Catalog={items:Item[];progress:{total:number;webp:number;target:number;upgraded:number;pending:number;missing:number}};
type Revision={slot:"cover"|"inline";revision:number;asset_id:string;alt:string;caption:string;provenance:string;review_status:string;mime_type:string;width:number;height:number;after_section:number|null;anchor_heading:string|null};
type History={revisions:Revision[];active:{slot:string;revision:number}[];events:{slot:string;revision:number;action:string;actor_role:string;note:string|null;created_at:string}[]};
type Entry={id:number;file:File;slug:string;alt:string;caption:string;state:"ready"|"pending"|"error";message:string;revision?:number};
type Approval={slug:string;revision:number;expected:number|null};
const message=(e:unknown)=>e instanceof Error?e.message:"Không thực hiện được.";
const path=(slug:string)=>"/"+encodeURIComponent(slug);
const coverOf=(h:History|null)=>h?.active.find(x=>x.slot==="cover")?.revision??null;
const approved=(r:Revision)=>["dev_approved","dev_context_only"].includes(r.review_status);
const labels:Record<string,string>={NOT_FOUND:"Không có quyền hoặc không tìm thấy dữ liệu.",MEDIA_DISABLED:"Backend chưa bật quản lý ảnh.",MEDIA_UNAVAILABLE:"Backend chưa sẵn sàng hoặc kết nối bị gián đoạn. Thử lại trên cùng trang; không cần chọn lại ảnh.",ACTIVE_REVISION_CHANGED:"Ảnh đang hoạt động đã thay đổi. Hãy tải lại trước khi duyệt.",INVALID_WEBP:"File WebP không hợp lệ.",INVALID_IMAGE:"File vượt giới hạn hoặc sai định dạng.",NOT_APPROVED:"Revision này chưa được duyệt.",MEDIA_INTEGRITY:"Checksum ảnh không khớp.",INVALID_OR_OVERSIZED_PAYLOAD:"Dữ liệu không hợp lệ hoặc vượt giới hạn."};
async function api<T>(token:string,route:string,payload?:unknown):Promise<T>{
 const response=await fetch("/api/media-admin"+route,{method:payload===undefined?"GET":"POST",headers:{Authorization:"Bearer "+token,...(payload===undefined?{}:{"Content-Type":"application/json"})},body:payload===undefined?undefined:JSON.stringify(payload),cache:"no-store",redirect:"error"});
 let data;try{data=await response.json();}catch{throw Error("Backend hoặc Web đang khởi động; hãy thử lại, các ảnh đã chọn vẫn được giữ trong trang.");}
 if(!response.ok)throw Error(labels[data.error]||"Yêu cầu thất bại: "+response.status);
 return data.data as T;
}
async function encode(file:File){
 if(file.size>2*1024*1024||!file.name.toLowerCase().endsWith(".webp"))throw Error("Chỉ nhận WebP không quá 2 MiB.");
 const bytes=new Uint8Array(await file.arrayBuffer());
 const image=await createImageBitmap(file);
 try{if(image.width>4096||image.height>4096||image.width<1||image.height<1)throw Error("Kích thước ảnh không hợp lệ.");}finally{image.close();}
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),x=>x.toString(16).padStart(2,"0")).join("");
 let raw="";for(let i=0;i<bytes.length;i+=16384)raw+=String.fromCharCode(...bytes.subarray(i,i+16384));
 return {imageBase64:btoa(raw),digest};
}
function LocalPreview({file}:{file:File}){
 const [src,setSrc]=useState("");
 useEffect(()=>{const url=URL.createObjectURL(file);setSrc(url);return()=>URL.revokeObjectURL(url);},[file]);
 return src?<img className="media-preview" src={src} alt="Ảnh chọn từ máy"/>:null;
}
function RevisionPreview({token,slug,revision,onVerified}:{token:string;slug:string;revision:Revision;onVerified:(n:number)=>void}){
 const [src,setSrc]=useState(""),[error,setError]=useState("");
 const cb=useRef(onVerified);cb.current=onVerified;
 useEffect(()=>{
  let canceled=false,url="";const abort=new AbortController();setSrc("");setError("");
  void (async()=>{
   try{
    const res=await fetch("/api/media-admin"+path(slug)+"/image/"+revision.slot+"/"+revision.revision,{headers:{Authorization:"Bearer "+token},cache:"no-store",redirect:"error",signal:abort.signal});
    if(!res.ok||res.headers.get("x-media-asset")!==revision.asset_id)throw Error("Không tải được revision hoặc SHA256 không khớp.");
    const blob=await res.blob();
    if(canceled)return;url=URL.createObjectURL(blob);setSrc(url);
   }catch(e){if(!canceled)setError(message(e));}
  })();
  return()=>{canceled=true;abort.abort();if(url)URL.revokeObjectURL(url);};
 },[token,slug,revision.revision,revision.asset_id,revision.slot]);
 return <div>{error?<p role="alert" className="cms-alert error">{error}</p>:src?<img className="media-preview" src={src} alt={revision.alt} onLoad={()=>cb.current(revision.revision)} onError={()=>setError("Trình duyệt không giải mã được ảnh.")}/>:<p className="cms-muted">Đang tải ảnh…</p>}</div>;
}

export default function MediaWorkbench(){
 const [token,setToken]=useState(""),[role,setRole]=useState<Role|null>(null);
 const [catalog,setCatalog]=useState<Catalog|null>(null),[slug,setSlug]=useState(""),[history,setHistory]=useState<History|null>(null);
 const [selected,setSelected]=useState<number|null>(null),[verified,setVerified]=useState<number[]>([]);
 const [entries,setEntries]=useState<Entry[]>([]),[approvals,setApprovals]=useState<Approval[]>([]);
 const [filter,setFilter]=useState(""),[view,setView]=useState("remaining"),[note,setNote]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[success,setSuccess]=useState("");
 const counter=useRef(0);
 const refresh=async(access=token)=>{const c=await api<Catalog>(access,"/catalog");setCatalog(c);return c;};
 async function connect(){
  setBusy(true);setError("");setSuccess("");
  try{const session=await api<{role:Role}>(token,"/session");await refresh();setRole(session.role);setSuccess("Đã xác thực "+session.role);}
  catch(e){setError(message(e));setRole(null);setCatalog(null);}
  finally{setBusy(false);}
 }
 function logout(){setToken("");setRole(null);setCatalog(null);setSlug("");setHistory(null);setSelected(null);setVerified([]);setEntries([]);setApprovals([]);setNote("");setError("");setSuccess("");}
 async function load(s:string){
  setSlug(s);setHistory(null);setSelected(null);setVerified([]);
  const h=await api<History>(token,path(s));setHistory(h);
  setSelected(h.revisions.find(x=>x.slot==="cover"&&x.review_status==="pending")?.revision??coverOf(h));
  return h;
 }
 async function select(s:string){
  setBusy(true);setError("");try{await load(s);}catch(e){setError(message(e));}finally{setBusy(false);}
 }
 function add(files:FileList|null){
  if(!files||!catalog)return;
  const next=Array.from(files).slice(0,72).map(file=>{
   const stem=file.name.replace(/\.webp$/i,"").replace(/^(?:lifestyle-)?cover-/,"");
   const item=catalog.items.find(x=>x.slug===stem);
   return {id:++counter.current,file,slug:item?.slug||"",alt:item?"Ảnh minh họa chủ đề: "+item.title:"",caption:"Ảnh minh họa tạo bằng AI · Hành Trình Mẹ & Bé",state:"ready" as const,message:""};
  });
  setEntries(old=>[...old,...next].slice(0,72));
 }
 function change(id:number,patch:Partial<Entry>){setEntries(old=>old.map(x=>x.id===id?{...x,...patch}:x));}
 async function uploadAll(){
  if(role!=="editor")return;
  const todo=entries.filter(x=>x.state!=="pending");
  const slugs=todo.map(x=>x.slug);
  if(!todo.length||todo.some(x=>!x.slug||!x.alt.trim()||!x.caption.trim())||new Set(slugs).size!==slugs.length){setError("Chọn bài viết, mô tả và chú thích cho từng ảnh; không trùng bài trong cùng đợt.");return;}
  setBusy(true);setError("");setSuccess("");let count=0;
  try{
   for(const x of todo){
    try{
     const {imageBase64,digest}=await encode(x.file);
     const h=await api<History>(token,path(x.slug));
     // Retry-safe for already uploaded immutable bytes; avoid duplicate revisions.
     const exists=h.revisions.find(r=>r.slot==="cover"&&r.asset_id===digest&&r.review_status==="pending");
     if(exists){change(x.id,{state:"pending",revision:exists.revision,message:"Đã có revision chờ duyệt"});count++;continue;}
     if(h.revisions.some(r=>r.slot==="cover"&&r.asset_id===digest)){throw Error("Ảnh này đã có trong lịch sử; dùng chức năng duyệt hoặc rollback thay vì upload lại.");}
     let result:{revision:number;assetId:string};
     try{result=await api<{revision:number;assetId:string}>(token,path(x.slug)+"/upload",{slot:"cover",imageBase64,alt:x.alt.trim(),caption:x.caption.trim(),provenance:"AI-generated editorial cover; DEV only; "+x.file.name.slice(0,180)});}
     catch(originalError){
      // A transport failure can occur after the server has committed the revision.
      // Reconcile with history before offering manual retry; never repeat POST here.
      const recovered=await api<History>(token,path(x.slug)).catch(()=>null);
      const match=recovered?.revisions.find(r=>r.slot==="cover"&&r.asset_id===digest&&r.review_status==="pending");
      if(!match)throw originalError;
      result={revision:match.revision,assetId:match.asset_id};
     }
     if(result.assetId!==digest)throw Error("Checksum sau upload không khớp.");
     change(x.id,{state:"pending",revision:result.revision,message:"Đã tải lên · chờ reviewer"});count++;
    }catch(e){change(x.id,{state:"error",message:message(e)});}
   }
   await refresh();if(slug)await load(slug);setSuccess(count+"/"+todo.length+" ảnh đã vào hàng chờ duyệt. Ảnh đang hoạt động chưa thay đổi.");
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 const active=coverOf(history),current=history?.revisions.find(x=>x.slot==="cover"&&x.revision===active);
 const candidate=history?.revisions.find(x=>x.slot==="cover"&&x.revision===selected);
 const compared=!!candidate&&verified.includes(candidate.revision)&&(!current||verified.includes(current.revision));
 function queueApproval(){
  if(role!=="reviewer"||!candidate||candidate.review_status!=="pending"||!compared)return;
  setApprovals(old=>[...old.filter(x=>x.slug!==slug),{slug,revision:candidate.revision,expected:active}]);setSuccess("Đã đánh dấu ảnh này sau khi xem trước. Chưa kích hoạt.");
 }
 async function review(action:"approve"|"rollback"|"request_changes"){
  if(role!=="reviewer"||!candidate||!note.trim()||!compared||candidate.revision===active)return;
  setBusy(true);setError("");setSuccess("");
  try{
   await api(token,path(slug)+"/review",{slot:"cover",revision:candidate.revision,expectedActiveRevision:active,action,note:note.trim()});
   setApprovals(old=>old.filter(x=>x.slug!==slug));await refresh();await load(slug);setSuccess(action==="rollback"?"Đã khôi phục revision cũ.":action==="approve"?"Đã kích hoạt revision mới.":"Đã yêu cầu chỉnh sửa.");setNote("");
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 async function approveAll(){
  if(role!=="reviewer"||!approvals.length||!note.trim())return;
  if(!window.confirm("Kích hoạt "+approvals.length+" ảnh đã xem và đánh dấu? Chỉ áp dụng trong DEV."))return;
  setBusy(true);setError("");setSuccess("");const failed:string[]=[];let done=0;
  try{
   for(const a of approvals){
    try{
     const h=await api<History>(token,path(a.slug));
     if(coverOf(h)!==a.expected||!h.revisions.some(r=>r.slot==="cover"&&r.revision===a.revision&&r.review_status==="pending"))throw Error("Revision đã thay đổi; cần xem lại.");
     await api(token,path(a.slug)+"/review",{slot:"cover",revision:a.revision,expectedActiveRevision:a.expected,action:"approve",note:note.trim()});
     setApprovals(old=>old.filter(x=>x.slug!==a.slug));done++;
    }catch(e){failed.push(a.slug+": "+message(e));}
   }
   await refresh();if(slug)await load(slug);setSuccess("Kích hoạt "+done+"/"+approvals.length+" ảnh. Không cần redeploy Web.");if(failed.length){setError(failed.join(" | "));setApprovals([]);}
  }catch(e){setError(message(e));}finally{setBusy(false);}
 }
 const normalized=filter.toLocaleLowerCase("vi");
 const list=catalog?.items.filter(x=>(view==="all"||view==="pending"&&x.pending>0||view==="remaining"&&x.original_mime==="image/svg+xml"&&x.active_mime!=="image/webp"||view==="upgraded"&&x.original_mime==="image/svg+xml"&&x.active_mime==="image/webp")&&[x.slug,x.title,x.stage].join(" ").toLocaleLowerCase("vi").includes(normalized))||[];
 const progress=catalog?.progress;
 return <div className="cms-frame media-cms">
  <section className="cms-access">
   <h2>Quản lý ảnh bài viết</h2><p>Kho ảnh DEV riêng tư. Duyệt ảnh ở đây chỉ là duyệt biên tập, không phải thẩm định y khoa hoặc xuất bản.</p>
   {!role?<form className="cms-row" onSubmit={e=>{e.preventDefault();void connect();}}><label className="cms-field cms-grow">Editor hoặc Reviewer Token<input type="password" autoComplete="off" value={token} onChange={e=>setToken(e.target.value)} required placeholder="Khóa Media DEV trên Render"/></label><button className="cms-btn" disabled={busy||token.length<32}>{busy?"Đang kết nối Backend…":"Đăng nhập"}</button></form>:<div className="cms-row cms-between"><strong>Vai trò: {role==="editor"?"Editor · tải ảnh":"Reviewer · duyệt và khôi phục"}</strong><button type="button" className="cms-btn secondary" disabled={busy} onClick={logout}>Đăng xuất / đổi vai trò</button></div>}
   <p className="cms-muted">Token chỉ giữ trong bộ nhớ của trang; không lưu localStorage, cookie hoặc URL. Hai vai trò sử dụng khóa riêng.</p>
  </section>
  {error?<p className="cms-alert error" role="alert">{error}</p>:null}
  {success?<p className="cms-alert ok" role="status">{success}</p>:null}
  {role&&progress?<><section className="cms-access">
   <div className="cms-row cms-between"><h2>Tiến độ nâng cấp ảnh bìa</h2><button className="cms-btn secondary" disabled={busy} onClick={async()=>{setBusy(true);try{await refresh();}catch(e){setError(message(e));}finally{setBusy(false);}}}>Làm mới</button></div>
   <div className="media-metrics"><div><small>Đã nâng cấp từ SVG</small><strong>{progress.upgraded}/{progress.target}</strong></div><div><small>Ảnh WebP đang dùng</small><strong>{progress.webp}/{progress.total}</strong></div><div><small>Revision chờ duyệt</small><strong>{progress.pending}</strong></div><div><small>Thiếu ảnh hoạt động</small><strong>{progress.missing}</strong></div></div>
   <progress aria-label="Tiến độ nâng cấp ảnh bìa" max={Math.max(1,progress.target)} value={progress.upgraded}/><p>Còn {progress.target-progress.upgraded} bài thuộc nhóm ảnh SVG ban đầu. Số liệu từ Backend thật.</p>
  </section>
  {role==="editor"?<section className="cms-access"><h2>Upload ảnh bìa hàng loạt</h2><p>Chọn nhiều file WebP từ gói đã giải nén. Tên file dạng slug.webp, cover-slug.webp hoặc lifestyle-cover-slug.webp tự nhận bài. Có thể chỉnh lại bài đích và nội dung mô tả. Mỗi file tối đa 2 MiB.</p>
   <label className="cms-field">Chọn ảnh<input type="file" multiple accept=".webp,image/webp" disabled={busy} onChange={e=>{add(e.target.files);e.target.value="";}}/></label>
   <div className="media-upload-grid">{entries.map(x=><div className="cms-subcard" key={x.id}><LocalPreview file={x.file}/><strong className="media-file">{x.file.name}</strong>
    <label className="cms-field">Bài viết<select disabled={busy||x.state==="pending"} value={x.slug} onChange={e=>{const item=catalog?.items.find(i=>i.slug===e.target.value);change(x.id,{slug:e.target.value,alt:item?"Ảnh minh họa chủ đề: "+item.title:""});}}><option value="">Chọn bài viết</option>{catalog?.items.map(i=><option key={i.slug} value={i.slug}>{i.title}</option>)}</select></label>
    <label className="cms-field">Alt text<input maxLength={500} value={x.alt} disabled={busy||x.state==="pending"} onChange={e=>change(x.id,{alt:e.target.value})}/></label><label className="cms-field">Chú thích<textarea maxLength={1000} rows={2} value={x.caption} disabled={busy||x.state==="pending"} onChange={e=>change(x.id,{caption:e.target.value})}/></label>
    <p role="status">{x.state==="ready"?"Sẵn sàng":x.state==="pending"?"Revision "+x.revision+" · "+x.message:x.message}</p>
    <button className="cms-link" disabled={busy} onClick={()=>setEntries(old=>old.filter(i=>i.id!==x.id))}>Bỏ khỏi danh sách trên máy</button></div>)}</div>
   <button className="cms-btn" disabled={busy||!entries.some(x=>x.state!=="pending")} onClick={uploadAll}>Tải {entries.filter(x=>x.state!=="pending").length} ảnh lên hàng chờ duyệt</button>
  </section>:null}
  <div className="cms-grid">
   <aside className="cms-sidebar"><h2>Danh sách bài viết</h2><label className="cms-field">Tìm bài<input disabled={busy} value={filter} onChange={e=>setFilter(e.target.value)}/></label><label className="cms-field">Trạng thái<select value={view} onChange={e=>setView(e.target.value)}><option value="remaining">Ảnh SVG chưa nâng cấp</option><option value="pending">Có ảnh chờ duyệt</option><option value="upgraded">Đã nâng cấp</option><option value="all">Tất cả</option></select></label>
    <p>{list.length} bài</p><div className="cms-list">{list.map(x=><button disabled={busy} key={x.slug} className={"cms-list-item"+(x.slug===slug?" active":"")} onClick={()=>select(x.slug)}><strong>{x.title}</strong><span>{x.active_mime==="image/webp"?"WebP":x.active_mime==="image/svg+xml"?"SVG":"Chưa có"} · v{x.active_revision??"–"} · {x.pending} chờ duyệt</span></button>)}</div>
   </aside>
   <section className="cms-editor">{!history?<div className="cms-empty">Chọn bài viết để so sánh ảnh và xem lịch sử.</div>:<>
    <h2>{catalog?.items.find(x=>x.slug===slug)?.title}</h2><p className="media-file">{slug}</p>
    <label className="cms-field">Revision cần xem<select value={selected??""} disabled={busy} onChange={e=>{setSelected(Number(e.target.value));setVerified([]);}}>{history.revisions.filter(r=>r.slot==="cover").map(r=><option key={r.revision} value={r.revision}>v{r.revision} · {r.review_status}{r.revision===active?" · ACTIVE":""}</option>)}</select></label>
    <div className="media-compare">{current?<div><h3>Ảnh đang dùng · v{current.revision}</h3><RevisionPreview key={slug+"-active-"+current.revision+"-"+selected} token={token} slug={slug} revision={current} onVerified={n=>setVerified(old=>old.includes(n)?old:[...old,n])}/><small>{current.asset_id.slice(0,16)} · {current.width} × {current.height}</small></div>:null}{candidate?<div><h3>Ảnh đang xem · v{candidate.revision}</h3><RevisionPreview key={slug+"-candidate-"+candidate.revision} token={token} slug={slug} revision={candidate} onVerified={n=>setVerified(old=>old.includes(n)?old:[...old,n])}/><small>{candidate.asset_id.slice(0,16)} · {candidate.width} × {candidate.height}</small><p>{candidate.alt}</p><p>{candidate.caption}</p><p>{candidate.provenance}</p></div>:null}</div>
    {role==="reviewer"&&candidate&&candidate.revision!==active?<><p className="cms-warning">Xem kỹ cả hai ảnh trước khi phê duyệt. Không xóa ảnh cũ; khôi phục bằng revision đã duyệt.</p><label className="cms-field">Nhận xét biên tập<textarea value={note} maxLength={1000} onChange={e=>setNote(e.target.value)}/></label><div className="cms-actions">
     {candidate.review_status==="pending"?<><button className="cms-btn" disabled={busy||!note.trim()||!compared} onClick={()=>{if(window.confirm("Kích hoạt ảnh v"+candidate.revision+" trong DEV?"))void review("approve");}}>Duyệt và kích hoạt</button><button className="cms-btn secondary" disabled={busy||!compared} onClick={queueApproval}>Đánh dấu đã xem để duyệt lô</button><button className="cms-btn secondary" disabled={busy||!note.trim()||!compared} onClick={()=>review("request_changes")}>Yêu cầu chỉnh sửa</button></>:approved(candidate)?<button className="cms-btn secondary" disabled={busy||!note.trim()||!compared} onClick={()=>{if(window.confirm("Khôi phục ảnh v"+candidate.revision+"?"))void review("rollback");}}>Rollback revision này</button>:null}
    </div></>:null}
    <h3>Lịch sử hoạt động</h3><div className="cms-events">{history.events.filter(e=>e.slot==="cover").map((e,i)=><div className="cms-event" key={i}><strong>v{e.revision} · {e.action}</strong><small>{e.actor_role} · {new Date(e.created_at).toLocaleString("vi-VN")}</small>{e.note?<p>{e.note}</p>:null}</div>)}</div>
   </>}</section>
  </div>
  {role==="reviewer"&&approvals.length>0?<section className="cms-access"><h2>{approvals.length} ảnh đã đánh dấu xem trước</h2>{approvals.map(a=><div key={a.slug} className="cms-row cms-between"><span>{a.slug} · v{a.revision}</span><button className="cms-link" disabled={busy} onClick={()=>setApprovals(old=>old.filter(x=>x.slug!==a.slug))}>Bỏ chọn</button></div>)}<label className="cms-field">Nhận xét chung cho lô<textarea maxLength={1000} value={note} onChange={e=>setNote(e.target.value)}/></label><button className="cms-btn" disabled={busy||!note.trim()} onClick={approveAll}>Duyệt và kích hoạt {approvals.length} ảnh</button></section>:null}
  </>:null}
 </div>;
}
