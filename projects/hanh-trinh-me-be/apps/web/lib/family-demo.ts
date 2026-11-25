import {canAccessFamily,type FamilyRole,type FamilyMembership} from "../../api/src/family-access";
import {stageOptions} from "./reader-navigation";
export const demoPersonas=[
 {id:"demo-mom",name:"Mẹ An",description:"Chủ gia đình mẫu"},
 {id:"demo-dad",name:"Bố Minh",description:"Thành viên"},
 {id:"demo-grandma",name:"Bà Lan",description:"Chỉ xem"},
 {id:"demo-guest",name:"Cô Mai",description:"Chưa thiết lập hồ sơ"},
 {id:"demo-other",name:"Gia đình khác",description:"Kiểm tra cách ly"}
] as const;
export const demoFamilyId="demo-family-01";
export const demoTasks=[["prepare","Chuẩn bị góc sinh hoạt cho bé"],["read","Cùng đọc một bài hướng dẫn"],["plan","Thống nhất việc nhà trong tuần"]] as const;
export const demoArticles=[["ngu-an-toan-cho-tre-so-sinh","Ngủ an toàn cho trẻ sơ sinh"],["lam-quen-nhip-sinh-hoat-so-sinh","Làm quen nhịp sinh hoạt sơ sinh"]] as const;
type Account={id:string;displayName:string;consentVersion:"family-v1"};
type Family={id:string;name:string;stage:string|null;revision:number;checklist:string[];saved:string[]};
type Invite={token:string;familyId:string;accountId:string;role:"member"|"viewer";expiresAt:number};
export type DemoState={version:1;actor:string|null;accounts:Account[];families:Family[];members:FamilyMembership[];invites:Invite[];sequence:number};
export type FamilyView=Family&{role:FamilyRole};
export type DemoResponse={status:number;data?:unknown;error?:string};
export function initialDemoState():DemoState{
 const accounts=demoPersonas.filter(p=>p.id!=="demo-guest").map(p=>({id:p.id,displayName:p.name,consentVersion:"family-v1" as const}));
 return {version:1,actor:"demo-mom",accounts,families:[
 {id:demoFamilyId,name:"Gia đình An & Minh",stage:"so-sinh",revision:0,checklist:["prepare"],saved:[]},
 {id:"demo-family-02",name:"Gia đình đối chứng",stage:"mam-non",revision:0,checklist:[],saved:[]}
 ],members:[
 {familyId:demoFamilyId,accountId:"demo-mom",role:"owner",status:"active"},
 {familyId:demoFamilyId,accountId:"demo-dad",role:"member",status:"active"},
 {familyId:demoFamilyId,accountId:"demo-grandma",role:"viewer",status:"active"},
 {familyId:"demo-family-02",accountId:"demo-other",role:"owner",status:"active"}
 ],invites:[],sequence:2};
}
class DemoError extends Error{constructor(readonly status:number,readonly code:string){super(code);}}
const fail=(status:number,code:string):never=>{throw new DemoError(status,code);};
const stages=new Set(stageOptions.map(([id])=>id));
export function demoRequest(state:DemoState,method:string,path:string,body:Record<string,unknown>={},now=Date.now()):{state:DemoState;response:DemoResponse}{
 const s=structuredClone(state);
 const reply=(data:unknown)=>({state:s,response:{status:200,data}});
 try{
  if(method==="POST"&&path==="/demo/session"){
   if(!demoPersonas.some(p=>p.id===body.persona))return fail(400,"INVALID_PERSONA");
   s.actor=String(body.persona);return reply({signedIn:true,simulated:true});
  }
  if(method==="DELETE"&&path==="/demo/session"){s.actor=null;return reply({signedOut:true});}
  const id=s.actor;if(!id)return fail(401,"AUTH_REQUIRED");
  const account=s.accounts.find(a=>a.id===id);
  if(method==="POST"&&path==="/v1/account/onboard"){
   if(account)return fail(409,"ACCOUNT_EXISTS");
   if(body.consentVersion!=="family-v1")return fail(400,"CONSENT_REQUIRED");
   const persona=demoPersonas.find(p=>p.id===id);if(!persona)return fail(401,"AUTH_REQUIRED");
   const a:Account={id,displayName:persona.name,consentVersion:"family-v1"};s.accounts.push(a);return reply(a);
  }
  if(!account)return fail(409,"ONBOARDING_REQUIRED");
  if(method==="GET"&&path==="/v1/account/me")return reply(account);
  const membership=(fid:string)=>s.members.find(m=>m.familyId===fid&&m.accountId===id)??null;
  const access=(fid:string,action:"read"|"writeJourney"|"manageMembers")=>{
   const f=s.families.find(x=>x.id===fid);if(!f||!canAccessFamily(id,fid,membership(fid),action))return fail(404,"NOT_FOUND");return f;
  };
  const view=(f:Family):FamilyView=>({...f,role:membership(f.id)!.role});
  if(method==="GET"&&path==="/v1/families")return reply(s.families.filter(f=>canAccessFamily(id,f.id,membership(f.id),"read")).map(view));
  if(method==="POST"&&path==="/v1/families"){
   if(!["Gia đình mẫu mới","Gia đình cuối tuần","Gia đình nhỏ"].includes(String(body.name)))return fail(400,"INVALID_NAME");
   if(s.families.length>=30)return fail(409,"DEMO_LIMIT");
   const f:Family={id:"demo-family-"+(++s.sequence),name:String(body.name),stage:null,revision:0,checklist:[],saved:[]};
   s.families.push(f);s.members.push({familyId:f.id,accountId:id,role:"owner",status:"active"});return reply(view(f));
  }
  if(method==="POST"&&path==="/v1/family-invitations/accept"){
   const inv=s.invites.find(i=>i.token===body.token&&i.accountId===id&&i.expiresAt>now);
   if(!inv||membership(inv.familyId)?.status==="active")return fail(404,"NOT_FOUND");
   s.invites=s.invites.filter(i=>i.token!==inv.token);
   s.members=s.members.filter(m=>!(m.familyId===inv.familyId&&m.accountId===id));
   s.members.push({familyId:inv.familyId,accountId:id,role:inv.role,status:"active"});
   return reply(view(access(inv.familyId,"read")));
  }
  const parts=path.split("/");if(parts[1]!=="v1"||parts[2]!=="families"||!parts[3])return fail(404,"NOT_FOUND");
  const fid=parts[3],action=parts[4];
  if(method==="GET"&&!action&&parts.length===4)return reply(view(access(fid,"read")));
  if(method==="GET"&&action==="members"&&parts.length===5){access(fid,"manageMembers");return reply(s.members.filter(m=>m.familyId===fid));}
  if(method==="POST"&&action==="invitations"&&parts.length===5){
   access(fid,"manageMembers");const target=body.accountId,role=body.role;
   if(typeof target!=="string"||target===id||!s.accounts.some(a=>a.id===target)||(role!=="member"&&role!=="viewer"))return fail(400,"INVALID_INVITATION");
   if(s.members.some(m=>m.familyId===fid&&m.accountId===target&&m.status==="active"))return fail(409,"ALREADY_MEMBER");
   const token="DEMO-INVITE-"+(++s.sequence),expiresAt=now+86400000;
   s.invites=s.invites.filter(i=>!(i.familyId===fid&&i.accountId===target));s.invites.push({token,familyId:fid,accountId:target,role,expiresAt});return reply({token,expiresAt});
  }
  if(method==="DELETE"&&action==="members"&&parts.length===6){
   access(fid,"manageMembers");const m=s.members.find(m=>m.familyId===fid&&m.accountId===parts[5]);if(!m||m.role==="owner")return fail(404,"NOT_FOUND");
   s.members=s.members.map(x=>x===m?{...x,status:"revoked"}:x);s.invites=s.invites.filter(i=>!(i.familyId===fid&&i.accountId===m.accountId));return reply({revoked:true});
  }
  if(method==="PATCH"&&parts.length===5&&["journey","checklist","saved"].includes(action)){
   const f=access(fid,"writeJourney");
   if(body.revision!==f.revision)return fail(409,"REVISION_CONFLICT");
   if(action==="journey"){
    if(body.stage!==null&&(typeof body.stage!=="string"||!stages.has(body.stage)))return fail(400,"INVALID_STAGE");f.stage=body.stage as string|null;
   }else{
    const items=action==="checklist"?demoTasks:demoArticles;
    if(typeof body.key!=="string"||!items.some(([k])=>k===body.key)||typeof body.checked!=="boolean")return fail(400,"INVALID_ITEM");
    const key=body.key as string;
    f[action==="checklist"?"checklist":"saved"]=[...new Set(f[action==="checklist"?"checklist":"saved"].filter(k=>k!==key).concat(body.checked?[key]:[]))];
   }
   f.revision++;return reply(view(f));
  }
  return fail(404,"NOT_FOUND");
 }catch(e){if(e instanceof DemoError)return {state,response:{status:e.status,error:e.code}};throw e;}
}
