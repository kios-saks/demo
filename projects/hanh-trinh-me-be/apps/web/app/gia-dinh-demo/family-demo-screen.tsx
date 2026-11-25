"use client";
import {useEffect,useState} from "react";
import {demoPersonas,demoTasks,demoArticles,demoFamilyId,initialDemoState,demoRequest,type DemoState,type FamilyView,type DemoResponse} from "../../lib/family-demo";
import {stageOptions} from "../../lib/reader-navigation";
import type {FamilyMembership} from "../../../api/src/family-access";
import "../gia-dinh/family.css";
import "./demo.css";
const key="mebe-family-demo-v1";
const roles={owner:"Chủ gia đình",member:"Thành viên",viewer:"Chỉ xem"};
const labels:Record<string,string>={AUTH_REQUIRED:"Chưa chọn nhân vật",ONBOARDING_REQUIRED:"Chưa thiết lập hồ sơ",NOT_FOUND:"Không có quyền hoặc không tìm thấy",REVISION_CONFLICT:"Xung đột phiên bản",CONSENT_REQUIRED:"Cần đồng ý",ALREADY_MEMBER:"Đã là thành viên",INVALID_INVITATION:"Lời mời không hợp lệ",ACCOUNT_EXISTS:"Hồ sơ đã tồn tại"};
const personName=(id:string)=>demoPersonas.find(p=>p.id===id)?.name||id;
type Trace={method:string;path:string;status:number;error?:string};
export default function FamilyDemo(){
 const [s,setS]=useState<DemoState>(initialDemoState),[ready,setReady]=useState(false),[selected,setSelected]=useState(demoFamilyId),[trace,setTrace]=useState<Trace[]>([]),[notice,setNotice]=useState(""),[invite,setInvite]=useState(""),[target,setTarget]=useState("demo-guest"),[role,setRole]=useState("member"),[newFamily,setNewFamily]=useState("Gia đình mẫu mới"),[accept,setAccept]=useState(""),[consent,setConsent]=useState(false);
 useEffect(()=>{
  try{const raw=sessionStorage.getItem(key);if(raw){const parsed=JSON.parse(raw) as DemoState;if(parsed.version===1&&Array.isArray(parsed.accounts)&&Array.isArray(parsed.families)&&Array.isArray(parsed.members)&&Array.isArray(parsed.invites))setS(parsed);}}
  catch{}finally{setReady(true);}
 },[]);
 function save(state:DemoState){setS(state);try{sessionStorage.setItem(key,JSON.stringify(state));}catch{}}
 function run(method:string,path:string,body:Record<string,unknown>={}):DemoResponse{
  const result=demoRequest(s,method,path,body);save(result.state);const r=result.response;
  setTrace(t=>[{method,path,status:r.status,error:r.error},...t].slice(0,12));setNotice(r.error?labels[r.error]||r.error:"Đã xử lý thao tác mô phỏng");return r;
 }
 function switchTo(id:string){run("POST","/demo/session",{persona:id});setSelected(demoFamilyId);setInvite("");setConsent(false);setAccept("");}
 function reset(){save(initialDemoState());setTrace([]);setSelected(demoFamilyId);setNotice("Đã khôi phục toàn bộ dữ liệu mẫu.");setInvite("");setAccept("");setConsent(false);}
 const account=demoRequest(s,"GET","/v1/account/me").response;
 const families=(demoRequest(s,"GET","/v1/families").response.data||[]) as FamilyView[];
 const f=families.find(x=>x.id===selected)||families[0];
 const path=f?"/v1/families/"+f.id:"";
 const members=f?.role==="owner"?(demoRequest(s,"GET",path+"/members").response.data||[]) as FamilyMembership[]:[];
 const write=Boolean(f&&f.role!=="viewer");
 const pending=s.invites.filter(i=>i.accountId===s.actor);
 const activeCount=f?.checklist.length||0;
 return <section className="family-shell demo-shell" aria-label="Không gian gia đình mẫu" data-demo-ready={ready?"true":"false"}>
  <div className="family-intro demo-intro"><div><span className="family-eyebrow">SANDBOX · DỮ LIỆU MẪU</span><h1>Gia đình nhỏ, hành trình lớn</h1><p>Trải nghiệm cách cả gia đình cùng chăm sóc, tìm hiểu và trưởng thành. Không cần tài khoản thật.</p><a href="/hanh-trinh">Khám phá hành trình kiến thức →</a></div><div className="demo-hero" aria-hidden="true">♡<span>AN &amp; MINH</span></div></div>
  <div className="demo-banner"><strong>Chế độ mô phỏng DEV</strong><span>Chỉ lưu dữ liệu giả lập trong tab trình duyệt này. Không gửi Supabase, không tạo tài khoản thật, không nhập thông tin cá nhân.</span><button type="button" data-demo-reset onClick={reset}>Khôi phục mẫu</button></div>
  <h2>Chọn nhân vật trải nghiệm</h2>
  <div className="demo-personas">{demoPersonas.map((p,i)=><button type="button" key={p.id} data-demo-persona={p.id} aria-pressed={s.actor===p.id} onClick={()=>switchTo(p.id)}><span className="demo-avatar">{["A","M","L","C","K"][i]}</span><strong>{p.name}</strong><small>{p.description}</small></button>)}</div>
  <div className="family-bar"><strong data-demo-actor>{s.actor?personName(s.actor):"Chưa chọn nhân vật"}</strong>{s.actor&&<button type="button" data-demo-logout onClick={()=>{run("DELETE","/demo/session");setInvite("");}}>Kết thúc phiên mẫu</button>}</div>
  <p className="family-message" role="status" data-demo-notice>{notice||"Chọn vai trò để thử luồng sử dụng."}</p>
  {!s.actor?<div className="family-panel"><h2>Chưa vào phiên demo</h2><p>Chọn một nhân vật phía trên để bắt đầu.</p></div>:account.status!==200?<div className="family-panel"><h2>Thiết lập hồ sơ mẫu</h2><p>Nhân vật: {personName(s.actor)}. Đây là bước giả lập consent, không tạo tài khoản Supabase.</p><label className="family-check"><input type="checkbox" data-demo-consent checked={consent} onChange={e=>setConsent(e.target.checked)}/> Tôi đồng ý sử dụng dữ liệu mẫu trong phiên demo.</label><button data-demo-onboard disabled={!consent} className="family-primary" onClick={()=>run("POST","/v1/account/onboard",{consentVersion:"family-v1"})}>Hoàn tất hồ sơ mẫu</button></div>:<div className="demo-workspace">
   <aside className="family-panel demo-sidebar"><h2>Gia đình của tôi</h2>
    {families.length===0&&<p data-demo-empty>Chưa có gia đình nào.</p>}
    {families.map(x=><button type="button" key={x.id} className="family-choice" data-demo-family={x.id} aria-pressed={f?.id===x.id} onClick={()=>{setSelected(x.id);setInvite("");run("GET","/v1/families/"+x.id);}}>{x.name}<small>{roles[x.role]}</small></button>)}
    <label>Gia đình mẫu mới<select value={newFamily} onChange={e=>setNewFamily(e.target.value)}>{["Gia đình mẫu mới","Gia đình cuối tuần","Gia đình nhỏ"].map(n=><option key={n}>{n}</option>)}</select></label>
    <button type="button" className="family-primary" data-demo-create onClick={()=>{const r=run("POST","/v1/families",{name:newFamily});if(r.status===200)setSelected((r.data as FamilyView).id);}}>Tạo gia đình</button>
    <h3>Lời mời của tôi</h3>
    {pending.length===0?<p>Chưa có lời mời mẫu.</p>:pending.map(i=><div className="demo-invite" key={i.token}><strong>{s.families.find(f=>f.id===i.familyId)?.name}</strong><small>{roles[i.role]} · {i.token}</small><button type="button" data-demo-accept={i.token} onClick={()=>{const r=run("POST","/v1/family-invitations/accept",{token:i.token});if(r.status===200)setSelected((r.data as FamilyView).id);}}>Chấp nhận</button></div>)}
    <label>Mã lời mời mẫu<input value={accept} onChange={e=>setAccept(e.target.value)} maxLength={40} placeholder="DEMO-INVITE-…"/></label><button data-demo-accept-code onClick={()=>{const r=run("POST","/v1/family-invitations/accept",{token:accept});if(r.status===200)setSelected((r.data as FamilyView).id);}}>Thử mã mời</button>
   </aside>
   <div className="demo-main">
    {f?<><div className="family-panel"><div className="demo-heading"><div><span className="family-eyebrow">KHÔNG GIAN CHUNG</span><h2 data-demo-family-title>{f.name}</h2></div><span className="demo-role" data-demo-role>{roles[f.role]}</span></div>
     <p>Giai đoạn hiện tại · <strong data-demo-stage-label>{stageOptions.find(([id])=>id===f.stage)?.[1]||"Chưa chọn"}</strong></p>
     <label>Chọn giai đoạn<select data-demo-stage disabled={!write} value={f.stage||""} onChange={e=>run("PATCH",path+"/journey",{stage:e.target.value||null,revision:f.revision})}><option value="">Chưa chọn</option>{stageOptions.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
     <p className="demo-revision" data-demo-revision>Phiên bản {f.revision} · {write?"Có thể cập nhật":"Chỉ xem"}</p>
    </div>
    <div className="family-panel"><h2>Việc cùng làm</h2><div className="demo-progress"><strong data-demo-progress>{activeCount}/{demoTasks.length} việc hoàn thành</strong><progress max={demoTasks.length} value={activeCount}/></div>
     {demoTasks.map(([id,label])=><label className="demo-check" key={id}><input type="checkbox" data-demo-task={id} checked={f.checklist.includes(id)} disabled={!write} onChange={e=>run("PATCH",path+"/checklist",{key:id,checked:e.target.checked,revision:f.revision})}/><span>{label}</span></label>)}
    </div>
    <div className="family-panel"><h2>Góc đọc chung</h2><p>Lưu bài đọc cho cả gia đình mẫu.</p>{demoArticles.map(([id,title])=><div className="demo-article" key={id}><a href={"/bai-viet/"+id}>{title}</a><button type="button" data-demo-save={id} aria-pressed={f.saved.includes(id)} disabled={!write} onClick={()=>run("PATCH",path+"/saved",{key:id,checked:!f.saved.includes(id),revision:f.revision})}>{f.saved.includes(id)?"Đã lưu":"Lưu"}</button></div>)}</div>
    {f.role==="owner"&&<div className="family-panel"><h2>Quản lý thành viên</h2>{members.map(m=><div className="family-member" key={m.accountId}><span><strong>{personName(m.accountId)}</strong><br/><small>{roles[m.role]} · {m.status==="active"?"Đang tham gia":"Đã thu hồi"}</small></span>{m.role!=="owner"&&m.status==="active"&&<button data-demo-revoke={m.accountId} onClick={()=>run("DELETE",path+"/members/"+m.accountId)}>Thu hồi</button>}</div>)}
     <h3>Mời người thân mẫu</h3><label>Nhân vật<select data-demo-invite-target value={target} onChange={e=>setTarget(e.target.value)}>{demoPersonas.filter(p=>p.id!==s.actor).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Vai trò<select data-demo-invite-role value={role} onChange={e=>setRole(e.target.value)}><option value="member">Thành viên</option><option value="viewer">Chỉ xem</option></select></label><button className="family-primary" data-demo-invite onClick={()=>{const r=run("POST",path+"/invitations",{accountId:target,role});if(r.status===200)setInvite((r.data as {token:string}).token);}}>Tạo lời mời</button>{invite&&<p className="family-message" data-demo-invite-token>{invite}</p>}
    </div>}
    </>:<div className="family-panel"><h2>Bắt đầu hành trình gia đình</h2><p>Tạo gia đình mẫu hoặc chấp nhận lời mời từ người thân.</p></div>}
   </div>
  </div>}
  <details className="family-panel demo-diagnostics" open><summary>Protocol mô phỏng và kiểm tra phân quyền</summary><p>Đây là response mô phỏng nội bộ, không phải request tới API thật. Checklist và bài lưu là contract đề xuất, chưa kết nối database.</p><div className="demo-tools">
   <button data-demo-probe-tenant onClick={()=>run("GET","/v1/families/"+(s.actor==="demo-other"?demoFamilyId:"demo-family-02"))}>Thử truy cập gia đình khác</button>
   <button data-demo-probe-revision disabled={!f} onClick={()=>f&&run("PATCH",path+"/journey",{stage:"so-sinh",revision:-1})}>Thử phiên bản cũ</button>
   <button data-demo-probe-write disabled={!f} onClick={()=>f&&run("PATCH",path+"/journey",{stage:"so-sinh",revision:f.revision})}>Thử quyền ghi</button>
  </div><div className="demo-traces" data-demo-traces>{trace.length?trace.map((t,i)=><div key={i}><code>{t.method} {t.path}</code><strong data-demo-status={t.status}>{t.status} {t.error||"OK"}</strong></div>):<p>Chưa có thao tác nào.</p>}</div></details>
 </section>;
}
