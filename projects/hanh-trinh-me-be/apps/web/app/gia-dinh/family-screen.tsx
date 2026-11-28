"use client";
import {useEffect,useState,type FormEvent} from "react";
import {stageOptions} from "../../lib/reader-navigation";
import "./family.css";
type Mode="login"|"signup"|"family";
type Family={id:string;name:string;stage:string|null;revision:number;role:"owner"|"member"|"viewer"};
type Account={id:string;displayName:string};
type Member={accountId:string;role:string;status:string};
class RequestError extends Error{constructor(readonly code:string){super(code)}}
async function request<T>(path:string,method="GET",body?:unknown):Promise<T>{
 const r=await fetch("/api/family/"+path,{method,cache:"no-store",credentials:"same-origin",headers:body===undefined?{}:{"Content-Type":"application/json"},...(body===undefined?{}:{body:JSON.stringify(body)})});
 const j=await r.json();if(!r.ok)throw new RequestError(j.error||"FAMILY_UNAVAILABLE");return j.data as T;
}
const errors:Record<string,string>={AUTH_REQUIRED:"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",LOGIN_FAILED:"Không đăng nhập được. Kiểm tra email, mật khẩu và xác nhận email.",SIGNUP_FAILED:"Không thể đăng ký. Kiểm tra thông tin và thử lại.",RATE_LIMIT:"Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",PASSWORD_TOO_SHORT:"Mật khẩu cần ít nhất 12 ký tự.",REVISION_CONFLICT:"Dữ liệu đã thay đổi ở thiết bị khác. Hãy tải lại trước khi lưu.",NOT_FOUND:"Không tìm thấy hoặc bạn không có quyền thực hiện.",ALREADY_MEMBER:"Tài khoản này đã là thành viên.",INVALID_INVITATION:"Kiểm tra mã tài khoản và quyền được mời.",FAMILY_NOT_ENABLED:"Tính năng gia đình chưa được kích hoạt.",LOGOUT_PROVIDER_UNAVAILABLE:"Đã xóa phiên trên trình duyệt; chưa xác nhận thu hồi phiên tại nhà cung cấp."};
export default function FamilyScreen({enabled,initialMode}:{enabled:boolean;initialMode:Mode}){
 const [mode,setMode]=useState<Mode>(initialMode),[session,setSession]=useState(false),[account,setAccount]=useState<Account|null>(null),[families,setFamilies]=useState<Family[]>([]),[selected,setSelected]=useState<Family|null>(null),[members,setMembers]=useState<Member[]>([]),[invite,setInvite]=useState(""),[stage,setStage]=useState(""),[busy,setBusy]=useState(false),[notice,setNotice]=useState(""),[error,setError]=useState("");
 function reset(){setSession(false);setAccount(null);setFamilies([]);setSelected(null);setMembers([]);setInvite("");setStage("");}
 async function load(){
  try{const a=await request<Account>("account/me");setAccount(a);setFamilies(await request<Family[]>("families"));}
  catch(e){if(e instanceof RequestError&&e.code==="ONBOARDING_REQUIRED"){setAccount(null);setFamilies([]);return;}throw e;}
 }
 function report(e:unknown){const code=e instanceof RequestError?e.code:"FAMILY_UNAVAILABLE";if(code==="AUTH_REQUIRED"){reset();setMode("login");}setError(errors[code]||"Không thể hoàn thành yêu cầu. Vui lòng thử lại.");}
 async function execute(fn:()=>Promise<void>){if(busy||!enabled)return;setBusy(true);setError("");setNotice("");try{await fn();}catch(e){report(e);}finally{setBusy(false);}}
 useEffect(()=>{
  // Supabase confirmation redirect can include a fragment. Never adopt or persist its tokens.
  if(location.hash.includes("access_token=")||location.hash.includes("refresh_token="))history.replaceState(null,"",location.pathname+location.search);
  if(!enabled)return;
  let alive=true;
  void request<{signedIn:boolean}>("auth/session").then(async()=>{if(!alive)return;setSession(true);setMode("family");await load();}).catch(e=>{if(alive&&!(e instanceof RequestError&&e.code==="AUTH_REQUIRED"))report(e);});
  return ()=>{alive=false;};
 },[enabled]);
 async function openFamily(id:string){setInvite("");setMembers([]);setSelected(null);const f=await request<Family>("families/"+id);setSelected(f);setStage(f.stage||"");if(f.role==="owner")setMembers(await request<Member[]>("families/"+id+"/members"));}
 function submit(e:FormEvent<HTMLFormElement>,fn:(data:FormData)=>Promise<void>){e.preventDefault();const d=new FormData(e.currentTarget);void execute(()=>fn(d));}
 return <section className="family-shell" aria-label="Không gian gia đình">
  <div className="family-intro"><span className="family-eyebrow">KHÔNG GIAN RIÊNG</span><h1>Cùng nhau lớn lên</h1><p>Một nơi để gia đình chia sẻ hành trình, chọn giai đoạn và đồng hành mỗi ngày.</p><a href="/thu-vien">← Tiếp tục đọc kiến thức miễn phí</a></div>
  {!enabled&&<p className="family-message" role="status">Tính năng tài khoản đang được chuẩn bị. Chưa nhận thông tin đăng ký hoặc lưu dữ liệu thật.</p>}
  {error&&<p className="family-error" role="alert">{error}</p>}{notice&&<p className="family-message" role="status">{notice}</p>}
  {!session?<div className="family-panel"><nav className="family-tabs" aria-label="Tài khoản"><button type="button" aria-pressed={mode!=="signup"} onClick={()=>{setMode("login");setError("");}}>Đăng nhập</button><button type="button" aria-pressed={mode==="signup"} onClick={()=>{setMode("signup");setError("");}}>Đăng ký</button></nav>
   <h2>{mode==="signup"?"Tạo tài khoản":"Chào mừng trở lại"}</h2><p>{mode==="signup"?"Xác nhận email trước khi đăng nhập.":"Đăng nhập để mở không gian riêng của gia đình."}</p>
   <form key={mode} onSubmit={e=>submit(e,async d=>{
    const payload={email:String(d.get("email")).trim(),password:String(d.get("password"))};
    if(mode==="signup"){await request("auth/signup","POST",payload);setMode("login");setNotice("Nếu thông tin hợp lệ, hãy kiểm tra email, xác nhận tài khoản rồi đăng nhập.");}
    else{await request("auth/login","POST",payload);setSession(true);setMode("family");await load();}
   })}><label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required disabled={!enabled||busy}/></label>
   <label>Mật khẩu<input name="password" type="password" autoComplete={mode==="signup"?"new-password":"current-password"} minLength={mode==="signup"?12:1} maxLength={256} required disabled={!enabled||busy}/></label>
   <button className="family-primary" disabled={!enabled||busy}>{busy?"Đang xử lý…":mode==="signup"?"Đăng ký":"Đăng nhập"}</button></form>
  </div>:<>
   <div className="family-bar"><strong>{account?.displayName||"Tài khoản của bạn"}</strong><button disabled={busy} onClick={()=>void execute(async()=>{try{await request("auth/logout","POST");}finally{reset();setMode("login");}})}>Đăng xuất</button></div>
   {!account?<div className="family-panel"><h2>Thiết lập hồ sơ</h2><p>Chỉ lưu tên hiển thị và xác nhận đồng ý. Không yêu cầu ngày sinh hoặc dữ liệu sức khỏe trẻ.</p>
   <form onSubmit={e=>submit(e,async d=>{await request("account/onboard","POST",{displayName:d.get("displayName"),consentVersion:"family-v1"});await load();})}>
   <label>Tên hiển thị<input name="displayName" required maxLength={80}/></label><label className="family-check"><input type="checkbox" required/> Tôi đồng ý lưu tên hiển thị và dữ liệu hành trình trong không gian gia đình.</label><button className="family-primary" disabled={busy}>Hoàn tất hồ sơ</button></form></div>:<div className="family-grid">
   <div className="family-panel"><h2>Gia đình của tôi</h2><p className="family-code">Mã tài khoản của bạn: <code>{account.id}</code></p>
   {families.length===0&&<p>Bạn chưa tham gia gia đình nào.</p>}
   {families.map(f=><button className="family-choice" key={f.id} disabled={busy} aria-pressed={selected?.id===f.id} onClick={()=>void execute(()=>openFamily(f.id))}>{f.name} <small>{f.role==="owner"?"Chủ gia đình":f.role==="member"?"Thành viên":"Chỉ xem"}</small></button>)}
   <form onSubmit={e=>submit(e,async d=>{const f=await request<Family>("families","POST",{name:d.get("name")});await load();await openFamily(f.id);})}><label>Tên gia đình mới<input name="name" required maxLength={80}/></label><button className="family-primary" disabled={busy}>Tạo gia đình</button></form>
   <form onSubmit={e=>submit(e,async d=>{const f=await request<Family>("family-invitations/accept","POST",{token:d.get("token")});await load();await openFamily(f.id);})}><label>Mã lời mời gia đình<input name="token" required autoComplete="off" maxLength={43}/></label><button disabled={busy}>Tham gia gia đình</button></form>
   </div>
   <div className="family-panel">{selected?<><h2>{selected.name}</h2><p>Hành trình chung của gia đình</p>
   <form onSubmit={e=>submit(e,async()=>{const f=await request<Family>("families/"+selected.id+"/journey","PATCH",{stage:stage||null,revision:selected.revision});setSelected(f);await load();setNotice("Đã lưu giai đoạn.");})}>
   <label>Giai đoạn<select value={stage} disabled={selected.role==="viewer"||busy} onChange={e=>setStage(e.target.value)}><option value="">Chưa chọn</option>{stageOptions.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>{selected.role!=="viewer"&&<button className="family-primary" disabled={busy}>Lưu giai đoạn</button>}</form>
   <button disabled={busy} onClick={()=>void execute(()=>openFamily(selected.id))}>Tải lại</button>
   {selected.role==="owner"&&<><h3>Thành viên</h3>{members.map(m=><div className="family-member" key={m.accountId}><span className="family-code">{m.accountId}<br/>{m.role} · {m.status}</span>{m.role!=="owner"&&m.status==="active"&&<button disabled={busy} onClick={()=>void execute(async()=>{await request("families/"+selected.id+"/members/"+m.accountId,"DELETE");await openFamily(selected.id);})}>Thu hồi</button>}</div>)}
   <form onSubmit={e=>submit(e,async d=>{const v=await request<{token:string}>("families/"+selected.id+"/invitations","POST",{accountId:d.get("accountId"),role:d.get("role")});setInvite(v.token);})}><h3>Mời người thân</h3><label>Mã tài khoản người được mời<input name="accountId" required maxLength={36}/></label><label>Quyền<select name="role"><option value="member">Thành viên</option><option value="viewer">Chỉ xem</option></select></label><button disabled={busy}>Tạo lời mời</button></form>
   {invite&&<div className="family-message"><strong>Mã mời dùng một lần (24 giờ)</strong><p className="family-code">{invite}</p><small>Chỉ chia sẻ riêng với người được mời.</small></div>}</>}
   </>:<p>Chọn một gia đình để xem hành trình và các quyền của bạn.</p>}</div>
   </div>}
  </>}
 </section>;
}
