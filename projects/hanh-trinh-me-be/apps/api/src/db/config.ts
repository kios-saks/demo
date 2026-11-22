/** Environment-only routing; never expose credentials through health endpoints or logs. */
import type {DatabaseTarget,DatabaseMode} from "../../../../packages/data/src/database-target.js";
export type {DatabaseTarget,DatabaseMode} from "../../../../packages/data/src/database-target.js";
export interface DatabaseRouteConfig {
 mode:DatabaseMode;
 primary:DatabaseTarget|null;
 secondary:DatabaseTarget|null;
 urls:Partial<Record<DatabaseTarget,string>>;
}
type Env=Record<string,string|undefined>;
const targets=["docker","supabase"] as const;
function validateUrl(label:string,uri:string|undefined):string {
 if(!uri)throw new Error(label+" is required for selected database mode");
 try{
   const url=new URL(uri);
   if(!["postgres:","postgresql:"].includes(url.protocol)||!url.hostname||!url.username||!url.password)
     throw new Error("invalid");
   if(url.port==="6543"&&label==="SUPABASE_DATABASE_URL")
     throw new Error("Supabase transaction-pooler port 6543 is not supported for migrations; use direct or session pooler at port 5432");
   return uri;
 }catch(e){
   if(e instanceof Error&&e.message.includes("transaction-pooler"))throw e;
   throw new Error("Invalid "+label+"; provide a PostgreSQL URI with credentials");
 }
}
export function parseDatabaseConfig(env:Env=process.env):DatabaseRouteConfig {
 const legacy=env.CONTENT_PROVIDER;
 const mode=(env.DATABASE_MODE||(legacy==="postgres"?"docker":legacy==="mock"||!legacy?"mock":legacy)) as DatabaseMode;
 if(!["mock","docker","supabase","both"].includes(mode))
   throw new Error("DATABASE_MODE must be mock, docker, supabase or both");
 if(mode==="mock")return {mode,primary:null,secondary:null,urls:{}};
 const primary:DatabaseTarget=mode==="both"?(env.DATABASE_PRIMARY as DatabaseTarget):mode;
 if(!targets.includes(primary))
   throw new Error("DATABASE_PRIMARY must be explicitly set to docker or supabase in both mode");
 const secondary=mode==="both"?(primary==="docker"?"supabase":"docker"):null;
 const urls:Partial<Record<DatabaseTarget,string>>={};
 for(const target of [primary,...(secondary?[secondary]:[])]){
   const label=target==="docker"?"DOCKER_DATABASE_URL":"SUPABASE_DATABASE_URL";
   urls[target]=validateUrl(label,target==="docker"?(env.DOCKER_DATABASE_URL||env.DATABASE_URL):env.SUPABASE_DATABASE_URL);
 }
 if(secondary){
   const a=new URL(urls[primary]!);const b=new URL(urls[secondary]!);
   if(a.hostname===b.hostname&&a.port===b.port&&a.pathname===b.pathname&&a.username===b.username)
     throw new Error("Both database targets cannot point to the same database");
 }
 return {mode,primary,secondary,urls};
}
/** Maintenance commands only modify the explicitly named target in both mode. */
export function resolveMaintenanceTarget(config:DatabaseRouteConfig,env:Env=process.env):DatabaseTarget {
 if(config.mode==="mock")throw new Error("No database migration/seed in mock mode");
 if(config.mode==="both"){
   if(!targets.includes(env.DB_TARGET as DatabaseTarget))
     throw new Error("DB_TARGET=docker or DB_TARGET=supabase is required in both mode");
   return env.DB_TARGET as DatabaseTarget;
 }
 if(env.DB_TARGET&&env.DB_TARGET!==config.primary)
   throw new Error("DB_TARGET does not match active DATABASE_MODE");
 return config.primary!;
}
