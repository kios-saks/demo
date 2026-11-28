import {readBackend} from "./backend-reader";
import {createHash} from "node:crypto";
const security={"Cache-Control":"private, no-store, max-age=0","X-Robots-Tag":"noindex, nofollow, noarchive","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","Content-Security-Policy":"default-src 'none'; sandbox","Vary":"Authorization"};
const maxBody=3*1024*1024;
const maxImage=2*1024*1024;
const validSlug=(x:string)=>/^[a-z0-9-]{1,160}$/.test(x)&&x!=="session"&&x!=="catalog";
function fail(status:number,error:string){return Response.json({error},{status,headers:security});}
export function adminPath(method:string,parts:string[]):string|null{
 if(method==="GET"&&parts.length===1&&(parts[0]==="session"||parts[0]==="catalog"))return parts[0];
 if(!validSlug(parts[0]||""))return null;
 if(method==="GET"&&parts.length===1)return parts[0];
 if(method==="POST"&&parts.length===2&&["upload","review"].includes(parts[1]))return parts.join("/");
 if(method==="GET"&&parts.length===4&&parts[1]==="image"&&["cover","inline"].includes(parts[2])&&/^[1-9][0-9]{0,8}$/.test(parts[3]))return parts.join("/");
 return null;
}
async function bounded(body:ReadableStream<Uint8Array>|null,max:number){
 if(!body)throw Error("EMPTY_BODY");
 const reader=body.getReader(),chunks:Uint8Array[]=[];let size=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw Error("TOO_LARGE");}chunks.push(value);}}finally{reader.releaseLock();}
 return Buffer.concat(chunks);
}
export async function mediaAdminProxy(request:Request,parts:string[]):Promise<Response>{
 if(process.env.WEB_MEDIA_ADMIN_ENABLED!=="true")return fail(404,"NOT_FOUND");
 const path=adminPath(request.method,parts),auth=request.headers.get("authorization");
 if(!path||!auth||!/^Bearer [^\s]{32,512}$/.test(auth)||request.headers.get("sec-fetch-site")==="cross-site")return fail(404,"NOT_FOUND");
 const origin=process.env.CONTENT_API_INTERNAL_URL;
 if(!origin)return fail(503,"MEDIA_UNAVAILABLE");
 try{
  const url=new URL(origin);
  if(!["http:","https:"].includes(url.protocol)||url.username||url.password||url.search||url.hash)return fail(503,"MEDIA_UNAVAILABLE");
  let body:string|undefined;
  if(request.method==="POST"){
   if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))return fail(415,"INVALID_PAYLOAD");
   if(Number(request.headers.get("content-length")||0)>maxBody)return fail(413,"TOO_LARGE");
   try{body=(await bounded(request.body,maxBody)).toString("utf8");JSON.parse(body);}catch{return fail(400,"INVALID_OR_OVERSIZED_PAYLOAD");}
  }
  const endpoint=url.origin+"/v1/dev-media-admin/"+path;
  const read=request.method==="GET";
  // Never replay writes; a failed write response does not prove it failed.
  const res=read
   ?await readBackend(endpoint,{authorization:auth},{accept:parts[1]==="image"?/^image\/(webp|svg\+xml|png|jpeg)(?:;|$)/i:/^application\/json(?:;|$)/i,maxBytes:parts[1]==="image"?maxImage:maxBody})
   :await fetch(endpoint,{method:request.method,headers:{authorization:auth,"Content-Type":"application/json"},body,cache:"no-store",redirect:"error",signal:AbortSignal.timeout(90000)});
  const mime=res.headers.get("content-type")?.split(";")[0]||"";
  if(res.ok&&parts[1]==="image"){
   const id=res.headers.get("x-media-asset")||"";
   if(!["image/webp","image/svg+xml","image/png","image/jpeg"].includes(mime)||!/^[a-f0-9]{64}$/.test(id))return fail(503,"MEDIA_INTEGRITY");
   const bytes=await bounded(res.body,maxImage);
   if(createHash("sha256").update(bytes).digest("hex")!==id)return fail(503,"MEDIA_INTEGRITY");
   return new Response(new Uint8Array(bytes),{headers:{...security,"Content-Type":mime,"X-Media-Asset":id}});
  }
  if(mime!=="application/json")return fail(503,"MEDIA_UNAVAILABLE");
  const data=JSON.parse((await bounded(res.body,maxBody)).toString("utf8"));
  return Response.json(data,{status:res.status,headers:security});
 }catch{return fail(503,"MEDIA_UNAVAILABLE");}
}
