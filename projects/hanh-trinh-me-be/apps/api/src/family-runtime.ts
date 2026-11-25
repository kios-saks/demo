import {readFileSync} from "node:fs";
import {Pool,type PoolClient} from "pg";
import {randomUUID} from "node:crypto";
import {PostgresFamilyRepository} from "./postgres-family-repository.js";
import {createSupabaseFamilyDependencies,type FamilyDependencies} from "./family-routes.js";
import {authConfig} from "../../../packages/auth/src/supabase-auth.js";
const project="yfmwznvlblbhicxexffe",service="srv-dc19cibl550s73drji5g";
const stages=new Set(["chuan-bi-mang-thai","thai-ky-3-thang-dau","thai-ky-3-thang-giua","thai-ky-3-thang-cuoi","hau-san","so-sinh","nhu-nhi","tap-di","mam-non","tieu-hoc","thieu-nien","truong-thanh"]);
type Env=Record<string,string|undefined>;
export function familyRuntimeConfig(env:Env){
 if(env.RENDER!=="true"||env.RENDER_SERVICE_ID!==service||env.MEBE_COMBINED_DEV!=="true"||env.DATABASE_MODE!=="supabase")return null;
 const audit=env.FAMILY_DB_AUDIT_ENABLED==="true",enabled=env.FAMILY_API_ENABLED==="true";
 if(!audit&&!enabled)return null;
 const auth=authConfig(env);
 if(!auth||auth.url!=="https://"+project+".supabase.co"||!env.SUPABASE_CA_CERT_PATH||!env.FAMILY_DATABASE_URL)throw Error("FAMILY_CONFIG_INVALID");
 let url:URL;try{url=new URL(env.FAMILY_DATABASE_URL);}catch{throw Error("FAMILY_CONFIG_INVALID");}
 if(url.protocol!=="postgresql:"||url.hostname!=="aws-0-ap-southeast-1.pooler.supabase.com"||url.port!=="5432"||url.pathname!=="/postgres"||url.username!=="mebe_family_login."+project||!url.password||url.search||url.hash)throw Error("FAMILY_CONFIG_INVALID");
 if(env.FAMILY_DATABASE_URL===env.SUPABASE_DATABASE_URL)throw Error("FAMILY_CONFIG_INVALID");
 return {uri:url.href,caPath:env.SUPABASE_CA_CERT_PATH,enabled,audit};
}
type TlsClient=PoolClient & {connection?:{stream?:{encrypted?:boolean;authorized?:boolean}}};
function requireCheck(ok:unknown,code:string):asserts ok{if(!ok)throw Error(code);}
export async function auditFamilyDatabase(pool:Pool){
 const c=await pool.connect();let discard=false;
 try{
  // Verify transport on the actual node-postgres socket, not merely a config flag.
  const socket=(c as TlsClient).connection?.stream;
  requireCheck(socket?.encrypted&&socket.authorized,"FAMILY_TLS_REQUIRED");
  await c.query("BEGIN");
  await c.query("SET LOCAL statement_timeout='10s'");
  await c.query("SET LOCAL lock_timeout='3s'");
  const identity=(await c.query("SELECT current_user AS name,session_user AS login,rolsuper,rolbypassrls,rolcreatedb,rolcreaterole,rolreplication FROM pg_roles WHERE rolname=current_user")).rows[0];
  requireCheck(identity?.name==="mebe_family_login"&&identity.login==="mebe_family_login"&&!identity.rolsuper&&!identity.rolbypassrls&&!identity.rolcreatedb&&!identity.rolcreaterole&&!identity.rolreplication,"FAMILY_LOGIN_PRIVILEGE_INVALID");
  const grants=(await c.query("SELECT has_schema_privilege(current_user,'mebe','USAGE') AS editorial,has_schema_privilege(current_user,'mebe_family','USAGE') AS inherited,pg_has_role(current_user,'mebe_family_runtime','MEMBER') AS member")).rows[0];
  requireCheck(!grants.editorial&&!grants.inherited&&grants.member,"FAMILY_LOGIN_GRANT_INVALID");
  await c.query("SET LOCAL ROLE mebe_family_runtime");
  const role=(await c.query("SELECT current_user AS name,rolsuper,rolbypassrls,rolcanlogin FROM pg_roles WHERE rolname=current_user")).rows[0];
  requireCheck(role?.name==="mebe_family_runtime"&&!role.rolsuper&&!role.rolbypassrls&&!role.rolcanlogin,"FAMILY_RUNTIME_ROLE_INVALID");
  const tables=(await c.query("SELECT count(*)::int AS total,count(*) FILTER(WHERE relrowsecurity AND relforcerowsecurity)::int AS forced FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='mebe_family' AND relkind='r'")).rows[0];
  requireCheck(tables.total===5&&tables.forced===5,"FAMILY_RLS_SCHEMA_INVALID");
  const a=randomUUID(),b=randomUUID(),f=randomUUID();
  const actor=(id:string)=>c.query("SELECT set_config('mebe.family_actor',$1,true)",[id]);
  // Synthetic rows are NEVER committed. No real Auth accounts are created.
  await actor(a);
  await c.query("INSERT INTO mebe_family.accounts(id,display_name,consent_version) VALUES($1,'Runtime audit','family-v1')",[a]);
  await c.query("INSERT INTO mebe_family.ownership(family_id,account_id) VALUES($1,$2)",[f,a]);
  await c.query("INSERT INTO mebe_family.families(id,name) VALUES($1,'Runtime audit')",[f]);
  requireCheck((await c.query("SELECT id FROM mebe_family.families WHERE id=$1",[f])).rowCount===1,"FAMILY_OWNER_READ_FAILED");
  await actor(b);
  await c.query("INSERT INTO mebe_family.accounts(id,display_name,consent_version) VALUES($1,'Runtime audit','family-v1')",[b]);
  requireCheck((await c.query("SELECT id FROM mebe_family.accounts WHERE id=$1",[a])).rowCount===0,"FAMILY_ACCOUNT_LEAK");
  requireCheck((await c.query("SELECT id FROM mebe_family.families WHERE id=$1",[f])).rowCount===0,"FAMILY_TENANT_LEAK");
  requireCheck((await c.query("UPDATE mebe_family.families SET stage='so-sinh' WHERE id=$1",[f])).rowCount===0,"FAMILY_TENANT_WRITE_LEAK");
  await c.query("SAVEPOINT denied_write");
  let denied=false;try{await c.query("INSERT INTO mebe_family.memberships(family_id,account_id,role,status) VALUES($1,$2,'member','active')",[f,b]);}catch(e){denied=(e as {code?:string}).code==="42501";}finally{await c.query("ROLLBACK TO SAVEPOINT denied_write");}
  requireCheck(denied,"FAMILY_MEMBERSHIP_ESCALATION");
  await c.query("ROLLBACK");
  // Session state must disappear after rollback; no actor or elevated role survives.
  const reset=(await c.query("SELECT current_user AS name, nullif(current_setting('mebe.family_actor',true),'') IS NULL AS clean")).rows[0];
  requireCheck(reset.name==="mebe_family_login"&&reset.clean,"FAMILY_POOL_CONTEXT_LEAK");
  return {tls:true,role:true,forcedRlsTables:5,tenantIsolation:true,rolledBack:true};
 }catch(e){discard=true;try{await c.query("ROLLBACK");}catch{}throw e;}finally{c.release(discard);}
}
export async function prepareFamilyRuntime(env:Env):Promise<{deps?:FamilyDependencies;close:()=>Promise<void>}|null>{
 const config=familyRuntimeConfig(env);if(!config)return null;
 const pool=new Pool({connectionString:config.uri,ssl:{rejectUnauthorized:true,ca:readFileSync(config.caPath,"utf8")},max:2,idleTimeoutMillis:10000,connectionTimeoutMillis:10000,application_name:"mebe-family-dev"});
 pool.on("error",()=>console.warn("FAMILY_DB_IDLE_CONNECTION_ERROR"));
 try{
  const evidence=await auditFamilyDatabase(pool);
  console.info("FAMILY_DB_TLS_RLS_PASS",JSON.stringify(evidence));
  if(!config.enabled){await pool.end();return null;}
  const deps=createSupabaseFamilyDependencies(new PostgresFamilyRepository(pool,stages),env);
  requireCheck(deps,"FAMILY_CONFIG_INVALID");
  return {deps,close:()=>pool.end()};
 }catch(e){await pool.end().catch(()=>{});throw e;}
}
