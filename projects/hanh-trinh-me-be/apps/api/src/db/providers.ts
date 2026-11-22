import {readFileSync} from "node:fs";
import {Pool} from "pg";
import type {DatabaseTarget} from "./config.js";

/**
 * Adapter seam: replace an implementation without touching handlers,
 * domain repository contracts, or the router.
 */
export interface DatabaseConnectionProvider {
 readonly target:DatabaseTarget;
 open():Pool;
}
function secureSupabaseUrl(uri:string):string {
 const u=new URL(uri);
 // Explicit pg SSL config must not be overridden by URI query parameters.
 for(const key of ["sslmode","sslrootcert","sslcert","sslkey","ssl"])u.searchParams.delete(key);
 return u.toString();
}
export class PgConnectionProvider implements DatabaseConnectionProvider {
 constructor(readonly target:DatabaseTarget,private readonly uri:string,private readonly caPath?:string){}
 open():Pool{
   const remote=this.target==="supabase";
   // No insecure TLS bypass for Supabase. CA may be loaded from the cloud project's settings.
   const ssl=remote?{rejectUnauthorized:true,...(this.caPath?{ca:readFileSync(this.caPath,"utf8")}:{})}:undefined;
   return new Pool({
     connectionString:remote?secureSupabaseUrl(this.uri):this.uri,
     ...(ssl?{ssl}:{}),max:remote?5:10,
     idleTimeoutMillis:10000,connectionTimeoutMillis:5000,
     application_name:"mebe-"+this.target
   });
 }
}
export type ConnectionProviderFactory=(target:DatabaseTarget,uri:string)=>DatabaseConnectionProvider;
export function defaultConnectionProvider(target:DatabaseTarget,uri:string):DatabaseConnectionProvider {
 return new PgConnectionProvider(target,uri,target==="supabase"?process.env.SUPABASE_CA_CERT_PATH:undefined);
}
