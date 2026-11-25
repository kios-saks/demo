import {randomUUID,randomBytes,createHash} from "node:crypto";
import {canAccessFamily,type FamilyMembership,type FamilyRole} from "./family-access.js";
export type Account = {id:string; displayName:string; consentVersion:"family-v1"};
export type Family = {id:string; name:string; stage:string|null; revision:number};
type Invitation = {familyId:string; accountId:string; role:Exclude<FamilyRole,"owner">; expiresAt:number};
export class FamilyError extends Error {
 constructor(readonly status:number,readonly code:string){super(code);}
}
const fail=(status:number,code:string):never=>{throw new FamilyError(status,code)};
const validName=(value:unknown):string=>{
 if(typeof value!=="string")return fail(400,"INVALID_NAME");
 const name=value.trim();if(!name||name.length>80||/[\u0000-\u001f\u007f]/.test(name))return fail(400,"INVALID_NAME");return name;
};
const digest=(token:string)=>createHash("sha256").update(token).digest("hex");
/** Explicit test fixture only; no persistence, no live configuration or password management.
 * Operations are synchronous so membership check + mutation cannot interleave.
 * A database adapter must reproduce this guarantee transactionally. */
export class FixtureFamilyService {
 private accounts=new Map<string,Account>();
 private families=new Map<string,Family>();
 private memberships=new Map<string,Map<string,FamilyMembership>>();
 private invitations=new Map<string,Invitation>();
 constructor(private readonly validStages:ReadonlySet<string>,private readonly now=()=>Date.now()){}
 private account(id:string):Account {return this.accounts.get(id)??fail(409,"ONBOARDING_REQUIRED");}
 private access(id:string,familyId:string,action:"read"|"writeJourney"|"manageMembers"):Family {
  this.account(id);
  const f=this.families.get(familyId);
  if(!f||!canAccessFamily(id,familyId,this.memberships.get(familyId)?.get(id)??null,action))return fail(404,"NOT_FOUND");
  return f;
 }
 onboard(id:string,name:unknown,consent:unknown):Account{
  if(consent!=="family-v1")return fail(400,"CONSENT_REQUIRED");
  const displayName=validName(name);
  if(this.accounts.has(id))return fail(409,"ACCOUNT_EXISTS");
  const a:Account={id,displayName,consentVersion:"family-v1"};this.accounts.set(id,a);return {...a};
 }
 me(id:string):Account{return {...this.account(id)};}
 create(id:string,name:unknown):Family{
  this.account(id);const f:Family={id:randomUUID(),name:validName(name),stage:null,revision:0};
  this.families.set(f.id,f);
  this.memberships.set(f.id,new Map([[id,{familyId:f.id,accountId:id,role:"owner",status:"active"}]]));return {...f};
 }
 list(id:string):Family[]{this.account(id);return [...this.families.values()].filter(f=>canAccessFamily(id,f.id,this.memberships.get(f.id)?.get(id)??null,"read")).map(f=>({...f}));}
 get(id:string,familyId:string):Family{return {...this.access(id,familyId,"read")};}
 updateJourney(id:string,familyId:string,stage:unknown,revision:unknown):Family{
  const f=this.access(id,familyId,"writeJourney");
  if(stage!==null&&(typeof stage!=="string"||!this.validStages.has(stage)))return fail(400,"INVALID_STAGE");
  if(typeof revision!=="number"||!Number.isSafeInteger(revision)||revision!==f.revision)return fail(409,"REVISION_CONFLICT");
  f.stage=stage as string|null;f.revision++;return {...f};
 }
 members(id:string,familyId:string):FamilyMembership[]{
  this.access(id,familyId,"manageMembers");return [...this.memberships.get(familyId)!.values()].map(m=>({...m}));
 }
 invite(id:string,familyId:string,target:unknown,role:unknown):{token:string;expiresAt:number}{
  this.access(id,familyId,"manageMembers");
  if(typeof target!=="string"||target===id||!this.accounts.has(target)||!(role==="member"||role==="viewer"))return fail(400,"INVALID_INVITATION");
  if(this.memberships.get(familyId)?.get(target)?.status==="active")return fail(409,"ALREADY_MEMBER");
  // Replace outstanding invites for the same family and recipient.
  for(const [key,v] of this.invitations)if(v.familyId===familyId&&v.accountId===target)this.invitations.delete(key);
  const token=randomBytes(32).toString("base64url"),expiresAt=this.now()+24*60*60*1000;
  this.invitations.set(digest(token),{familyId,accountId:target,role,expiresAt});return {token,expiresAt};
 }
 accept(id:string,token:unknown):Family{
  this.account(id);
  if(typeof token!=="string"||!/^[A-Za-z0-9_-]{43}$/.test(token))return fail(404,"NOT_FOUND");
  const key=digest(token),v=this.invitations.get(key);
  if(!v||v.accountId!==id||v.expiresAt<=this.now())return fail(404,"NOT_FOUND");
  const members=this.memberships.get(v.familyId),f=this.families.get(v.familyId);
  if(!members||!f||members.get(id)?.status==="active")return fail(404,"NOT_FOUND");
  this.invitations.delete(key);members.set(id,{familyId:v.familyId,accountId:id,role:v.role,status:"active"});return {...f};
 }
 revoke(id:string,familyId:string,target:string):void{
  this.access(id,familyId,"manageMembers");
  const members=this.memberships.get(familyId)!,m=members.get(target);
  if(!m||m.role==="owner")return fail(404,"NOT_FOUND");
  members.set(target,{...m,status:"revoked"});
  for(const [key,v] of this.invitations)if(v.familyId===familyId&&v.accountId===target)this.invitations.delete(key);
 }
}
