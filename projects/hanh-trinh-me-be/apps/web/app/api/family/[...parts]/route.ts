import {NextRequest,NextResponse} from "next/server";
import {familyWebConfig} from "../../../../lib/family-web-config";
import {createSupabaseAuth} from "../../../../../../packages/auth/src/supabase-auth";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const cookie="__Host-mebe_family";
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow","Referrer-Policy":"no-referrer","X-Content-Type-Options":"nosniff"};
const json=(v:unknown,status=200)=>NextResponse.json(v,{status,headers});
const deny=(code:string,status:number)=>json({error:code},status);
function clear(r:NextResponse){r.cookies.set(cookie,"",{httpOnly:true,secure:true,sameSite:"strict",path:"/",maxAge:0});return r;}
async function body(req:NextRequest):Promise<Record<string,unknown>>{
 if(!req.headers.get("content-type")?.startsWith("application/json")||!req.body)throw Error();
 const reader=req.body.getReader();const chunks:Uint8Array[]=[];let length=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>8192){await reader.cancel();throw Error();}chunks.push(value);}}finally{reader.releaseLock();}
 const b=JSON.parse(Buffer.concat(chunks).toString("utf8"));if(!b||typeof b!=="object"||Array.isArray(b))throw Error();return b;
}
function target(method:string,parts:string[]):string|null{
 const p=parts.join("/");
 if((method==="GET"&&["account/me","families"].includes(p))||(method==="POST"&&["account/onboard","families","family-invitations/accept"].includes(p)))return p;
 const id=/^[0-9a-f-]{36}$/i;
 if(parts[0]!=="families"||!id.test(parts[1]||""))return null;
 if(method==="GET"&&(parts.length===2||parts.length===3&&parts[2]==="members"))return p;
 if(parts.length===3&&((method==="PATCH"&&parts[2]==="journey")||(method==="POST"&&parts[2]==="invitations")))return p;
 if(method==="DELETE"&&parts.length===4&&parts[2]==="members"&&id.test(parts[3]))return p;
 return null;
}
async function handle(req:NextRequest,{params}:{params:Promise<{parts:string[]}>}){
 const cfg=familyWebConfig();if(!cfg)return deny("FAMILY_NOT_ENABLED",404);
 const {parts}=await params,p=parts.join("/"),method=req.method;
 if(req.headers.get("sec-fetch-site")==="cross-site"||(method!=="GET"&&req.headers.get("origin")!==cfg.origin))return deny("FORBIDDEN_ORIGIN",403);
 const auth=createSupabaseAuth(cfg.auth),token=req.cookies.get(cookie)?.value;
 try{
  if(method==="POST"&&["auth/signup","auth/login"].includes(p)){
   let b:Record<string,unknown>;try{b=await body(req);}catch{return deny("INVALID_BODY",400);}
   if(Object.keys(b).some(k=>!["email","password"].includes(k))||typeof b.email!=="string"||typeof b.password!=="string"||b.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)||b.password.length<1||b.password.length>256)return deny("INVALID_CREDENTIALS",400);
   if(p==="auth/signup"){
    if(process.env.FAMILY_SIGNUP_ENABLED!=="true")return deny("SIGNUP_DISABLED",403);
    if(b.password.length<12)return deny("PASSWORD_TOO_SHORT",400);
    const result=await auth.signup(b.email,b.password,cfg.origin+"/gia-dinh");
    return result==="accepted"?json({data:{checkEmail:true}}):deny(result==="limited"?"RATE_LIMIT":"SIGNUP_FAILED",result==="limited"?429:400);
   }
   const session=await auth.login(b.email,b.password);if(!session)return deny("LOGIN_FAILED",401);
   const res=json({data:{signedIn:true}});
   res.cookies.set(cookie,session.token,{httpOnly:true,secure:true,sameSite:"strict",path:"/",maxAge:session.maxAge});return res;
  }
  if(method==="POST"&&p==="auth/logout"){
   try{if(token)await auth.logout(token);}catch{return clear(deny("LOGOUT_PROVIDER_UNAVAILABLE",503));}
   return clear(json({data:{signedOut:true}}));
  }
  if(!token)return deny("AUTH_REQUIRED",401);
  if(method==="GET"&&p==="auth/session"){
   return await auth.verifyIdentity(token)?json({data:{signedIn:true}}):clear(deny("AUTH_REQUIRED",401));
  }
  const path=target(method,parts);if(!path)return deny("NOT_FOUND",404);
  let payload:string|undefined;
  if(method==="POST"||method==="PATCH"){try{payload=JSON.stringify(await body(req));}catch{return deny("INVALID_BODY",400);}}
  const upstream=await fetch(cfg.api+"/v1/"+path,{method,headers:{Authorization:"Bearer "+token,Accept:"application/json",...(payload?{"Content-Type":"application/json"}:{})},...(payload?{body:payload}:{}),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
  if(!upstream.headers.get("content-type")?.startsWith("application/json"))return deny("FAMILY_UNAVAILABLE",503);
  const result=json(await upstream.json(),upstream.status);return upstream.status===401?clear(result):result;
 }catch{return deny("FAMILY_UNAVAILABLE",503);}
}
export {handle as GET,handle as POST,handle as PATCH,handle as DELETE};
