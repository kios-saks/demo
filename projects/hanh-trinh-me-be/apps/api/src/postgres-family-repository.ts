import {randomUUID,randomBytes,createHash} from "node:crypto";
import type {Pool,PoolClient} from "pg";
import type {FamilyRepository} from "./family-routes.js";
import {FamilyError,type Account,type FamilyView} from "./family-service.js";
import type {FamilyMembership} from "./family-access.js";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail=(status:number,code:string):never=>{throw new FamilyError(status,code)};
const name=(v:unknown):string=>{
 if(typeof v!=="string")return fail(400,"INVALID_NAME");
 const n=v.trim();if(!n||n.length>80||/[\u0000-\u001f\u007f]/.test(n))return fail(400,"INVALID_NAME");return n;
};
const familyId=(id:string)=>{if(!uuid.test(id))fail(404,"NOT_FOUND");return id;};
const digest=(v:string)=>createHash("sha256").update(v).digest("hex");
const familySelect=`SELECT f.id,f.name,f.stage,f.revision,CASE WHEN o.account_id=$1 THEN 'owner' ELSE m.role END AS role
 FROM mebe_family.families f
 LEFT JOIN mebe_family.ownership o ON o.family_id=f.id AND o.account_id=$1
 LEFT JOIN mebe_family.memberships m ON m.family_id=f.id AND m.account_id=$1 AND m.status='active'
 WHERE (o.account_id IS NOT NULL OR m.account_id IS NOT NULL)`;
/** Not registered in live startup. The pool must use a dedicated least-privilege
 * login that can SET ROLE mebe_family_runtime, never a shared owner credential.
 * Only an independently verified Auth principal can supply the actor ID.
 * Transaction-local actor is not an auth mechanism for arbitrary SQL clients. */
export class PostgresFamilyRepository implements FamilyRepository{
 constructor(private readonly pool:Pool,private readonly validStages:ReadonlySet<string>){}
 private async tx<T>(actor:string,fn:(c:PoolClient)=>Promise<T>):Promise<T>{
  if(!uuid.test(actor))return fail(401,"AUTH_REQUIRED");
  const c=await this.pool.connect();let discard=false;
  try{
   await c.query("BEGIN");
   await c.query("SET LOCAL ROLE mebe_family_runtime");
   await c.query("SET LOCAL statement_timeout='10s'");
   await c.query("SET LOCAL lock_timeout='5s'");
   await c.query("SELECT set_config('mebe.family_actor',$1,true)",[actor]);
   const result=await fn(c);
   await c.query("COMMIT");return result;
  }catch(e){try{await c.query("ROLLBACK");}catch{discard=true;}throw e;}finally{c.release(discard);}
 }
 private async account(c:PoolClient,id:string):Promise<Account>{
  const r=await c.query<Account>('SELECT id, display_name AS "displayName", consent_version AS "consentVersion" FROM mebe_family.accounts WHERE id=$1',[id]);
  return r.rows[0]??fail(409,"ONBOARDING_REQUIRED");
 }
 private async family(c:PoolClient,id:string,fid:string):Promise<FamilyView>{
  const r=await c.query<FamilyView>(familySelect+" AND f.id=$2",[id,fid]);
  return r.rows[0]??fail(404,"NOT_FOUND");
 }
 private async owner(c:PoolClient,id:string,fid:string){
  if((await this.family(c,id,fid)).role!=="owner")fail(404,"NOT_FOUND");
 }
 private async lock(c:PoolClient,fid:string){
  // Same family mutation lock across invite/accept/revoke/journey. Never hold across network I/O.
  await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1::text,0))",[fid.toLowerCase()]);
 }
 async onboard(id:string,displayName:unknown,consent:unknown){
  if(consent!=="family-v1")return fail(400,"CONSENT_REQUIRED");
  const n=name(displayName);
  return this.tx(id,async c=>{
   const r=await c.query("INSERT INTO mebe_family.accounts(id,display_name,consent_version) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING",[id,n,consent]);
   if(r.rowCount!==1)fail(409,"ACCOUNT_EXISTS");return this.account(c,id);
  });
 }
 me(id:string){return this.tx(id,c=>this.account(c,id));}
 create(id:string,displayName:unknown){
  const n=name(displayName);
  return this.tx(id,async c=>{
   await this.account(c,id);const fid=randomUUID();
   // Deferred FK permits ownership first; both records commit atomically.
   await c.query("INSERT INTO mebe_family.ownership(family_id,account_id) VALUES($1,$2)",[fid,id]);
   await c.query("INSERT INTO mebe_family.families(id,name) VALUES($1,$2)",[fid,n]);
   return this.family(c,id,fid);
  });
 }
 list(id:string){return this.tx(id,async c=>{await this.account(c,id);return (await c.query<FamilyView>(familySelect+" ORDER BY f.name,f.id",[id])).rows;});}
 get(id:string,fid:string){return this.tx(id,async c=>{await this.account(c,id);return this.family(c,id,familyId(fid));});}
 updateJourney(id:string,fid:string,stage:unknown,revision:unknown){
  familyId(fid);
  return this.tx(id,async c=>{
   await this.account(c,id);await this.lock(c,fid);
   const f=await this.family(c,id,fid);if(f.role==="viewer")fail(404,"NOT_FOUND");
   if(stage!==null&&(typeof stage!=="string"||!this.validStages.has(stage)))fail(400,"INVALID_STAGE");
   if(typeof revision!=="number"||!Number.isSafeInteger(revision)||revision!==f.revision)fail(409,"REVISION_CONFLICT");
   const r=await c.query("UPDATE mebe_family.families SET stage=$2,revision=revision+1 WHERE id=$1 AND revision=$3",[fid,stage,revision]);
   if(r.rowCount!==1)fail(409,"REVISION_CONFLICT");return this.family(c,id,fid);
  });
 }
 members(id:string,fid:string){
  familyId(fid);
  return this.tx(id,async c=>{
   await this.account(c,id);await this.owner(c,id,fid);
   const r=await c.query<FamilyMembership>('SELECT family_id AS "familyId",account_id AS "accountId",role,status FROM mebe_family.memberships WHERE family_id=$1 ORDER BY account_id',[fid]);
   return [{familyId:fid,accountId:id,role:"owner",status:"active"} as FamilyMembership,...r.rows];
  });
 }
 invite(id:string,fid:string,target:unknown,role:unknown){
  familyId(fid);
  return this.tx(id,async c=>{
   await this.account(c,id);await this.lock(c,fid);await this.owner(c,id,fid);
   if(typeof target!=="string"||!uuid.test(target)||target.toLowerCase()===id.toLowerCase()||(role!=="member"&&role!=="viewer"))fail(400,"INVALID_INVITATION");
   const existing=await c.query("SELECT 1 FROM mebe_family.memberships WHERE family_id=$1 AND account_id=$2 AND status='active'",[fid,target]);
   if(existing.rowCount)fail(409,"ALREADY_MEMBER");
   await c.query("DELETE FROM mebe_family.invitations WHERE family_id=$1 AND account_id=$2",[fid,target]);
   const token=randomBytes(32).toString("base64url");
   try{
    const r=await c.query<{expires_at:Date}>("INSERT INTO mebe_family.invitations(digest,family_id,account_id,role,expires_at) VALUES($1,$2,$3,$4,clock_timestamp()+interval '24 hours') RETURNING expires_at",[digest(token),fid,target,role]);
    return {token,expiresAt:r.rows[0].expires_at.getTime()};
   }catch(e){if((e as {code?:string}).code==="23503")return fail(400,"INVALID_INVITATION");throw e;}
  });
 }
 accept(id:string,token:unknown){
  return this.tx(id,async c=>{
   await this.account(c,id);
   if(typeof token!=="string"||!/^[A-Za-z0-9_-]{43}$/.test(token))return fail(404,"NOT_FOUND");
   const key=digest(token);
   const lookup=()=>c.query<{family_id:string;role:"member"|"viewer"}>("SELECT family_id,role FROM mebe_family.invitations WHERE digest=$1 AND account_id=$2 AND expires_at>clock_timestamp()",[key,id]);
   const first=(await lookup()).rows[0];if(!first)return fail(404,"NOT_FOUND");
   await this.lock(c,first.family_id);
   const v=(await lookup()).rows[0];if(!v||v.family_id!==first.family_id)return fail(404,"NOT_FOUND");
   const existing=(await c.query<{status:string}>("SELECT status FROM mebe_family.memberships WHERE family_id=$1 AND account_id=$2",[v.family_id,id])).rows[0];
   if(existing?.status==="active")fail(404,"NOT_FOUND");
   if(existing){
    const r=await c.query("UPDATE mebe_family.memberships SET role=$3,status='active' WHERE family_id=$1 AND account_id=$2 AND status='revoked'",[v.family_id,id,v.role]);
    if(r.rowCount!==1)fail(404,"NOT_FOUND");
   }else await c.query("INSERT INTO mebe_family.memberships(family_id,account_id,role,status) VALUES($1,$2,$3,'active')",[v.family_id,id,v.role]);
   const used=await c.query("DELETE FROM mebe_family.invitations WHERE digest=$1 AND account_id=$2",[key,id]);
   if(used.rowCount!==1)fail(404,"NOT_FOUND");
   return this.family(c,id,v.family_id);
  });
 }
 revoke(id:string,fid:string,target:string){
  familyId(fid);familyId(target);
  return this.tx(id,async c=>{
   await this.account(c,id);await this.lock(c,fid);await this.owner(c,id,fid);
   const r=await c.query("UPDATE mebe_family.memberships SET status='revoked' WHERE family_id=$1 AND account_id=$2",[fid,target]);
   if(r.rowCount!==1)fail(404,"NOT_FOUND");
   await c.query("DELETE FROM mebe_family.invitations WHERE family_id=$1 AND account_id=$2",[fid,target]);
  });
 }
}
