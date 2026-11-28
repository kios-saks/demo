/** Server-only Auth REST adapter. Never use a service_role key. No JWT decoding
 * is accepted as proof of identity: the configured provider validates every token. */
export type AuthConfig={url:string;publishableKey:string};
export class AuthUnavailable extends Error{}
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function authConfig(env:Record<string,string|undefined>):AuthConfig|null{
 try {
  const u=new URL(env.FAMILY_SUPABASE_URL||"");
  const k=env.FAMILY_SUPABASE_PUBLISHABLE_KEY||"";
  if(u.protocol!=="https:"||! /^[a-z0-9-]+\.supabase\.co$/.test(u.hostname)||u.port||u.username||u.password||u.pathname!=="/"||u.search||u.hash||!/^sb_publishable_[A-Za-z0-9_-]{16,256}$/.test(k))return null;
  return {url:u.origin,publishableKey:k};
 }catch{return null;}
}
// Node-only RequestInit typings omit cache; Next fetch supports it at runtime.
export type AuthRequestInit = RequestInit & {cache?: "no-store"};
export type AuthTransport = (input:string,init?:AuthRequestInit)=>Promise<Response>;
export function createSupabaseAuth(config:AuthConfig,transport:AuthTransport=fetch){
 async function request(path:string,method:"GET"|"POST",body?:unknown,token?:string){
  try {
   return await transport(config.url+"/auth/v1/"+path,{method,headers:{apikey:config.publishableKey,Accept:"application/json",...(body===undefined?{}:{"Content-Type":"application/json"}),...(token?{Authorization:"Bearer "+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
  }catch{throw new AuthUnavailable("AUTH_UNAVAILABLE");}
 }
 async function read(r:Response):Promise<Record<string,unknown>>{
  try{const v=await r.json();if(!v||typeof v!=="object"||Array.isArray(v))throw Error();return v as Record<string,unknown>;}catch{throw new AuthUnavailable("AUTH_UNAVAILABLE");}
 }
 async function verifyIdentity(token:string):Promise<string|null>{
  if(!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)||token.length>3500)return null;
  const r=await request("user","GET",undefined,token);
  if([400,401,403,404].includes(r.status)){await r.body?.cancel();return null;}
  if(!r.ok)throw new AuthUnavailable("AUTH_UNAVAILABLE");
  const u=await read(r);
  return typeof u.id==="string"&&uuid.test(u.id)&&u.is_anonymous!==true&&typeof u.email==="string"&&typeof u.email_confirmed_at==="string"&&u.email_confirmed_at.length>0?u.id:null;
 }
 async function signup(email:string,password:string,redirectTo:string):Promise<"accepted"|"invalid"|"limited">{
  const r=await request("signup?redirect_to="+encodeURIComponent(redirectTo),"POST",{email,password});
  await r.body?.cancel();
  if(r.ok)return "accepted";
  if(r.status===429)return "limited";
  if(r.status>=500)throw new AuthUnavailable("AUTH_UNAVAILABLE");
  return "invalid";
 }
 async function login(email:string,password:string):Promise<{token:string;maxAge:number}|null>{
  const r=await request("token?grant_type=password","POST",{email,password});
  if(r.status===429||r.status>=500){await r.body?.cancel();throw new AuthUnavailable("AUTH_UNAVAILABLE");}
  if(!r.ok){await r.body?.cancel();return null;}
  const v=await read(r);
  if(typeof v.access_token!=="string"||typeof v.expires_in!=="number"||!Number.isFinite(v.expires_in)||v.expires_in<=0||!await verifyIdentity(v.access_token))return null;
  // Do not retain or expose the refresh token. Short Web session; sign in again on expiry.
  return {token:v.access_token,maxAge:Math.min(900,Math.floor(v.expires_in))};
 }
 async function logout(token:string){
  const r=await request("logout?scope=local","POST",undefined,token);await r.body?.cancel();
  if(!r.ok&&![401,403].includes(r.status))throw new AuthUnavailable("AUTH_UNAVAILABLE");
 }
 return {verifyIdentity,signup,login,logout};
}
