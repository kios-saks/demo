import {readBackend} from "./backend-reader";
import {createHash} from "node:crypto";
import {requirePreviewLogin,safeMediaPath} from "./dev-preview";

export type DynamicMedia={slot:"cover"|"inline";revision:number;assetId:string;width:number;height:number;alt:string;caption:string;afterSection:number|null;anchorHeading:string|null;reviewStatus:"dev_approved"|"dev_context_only"};
export const dynamicMediaEnabled=()=>process.env.WEB_DYNAMIC_MEDIA==="true";
const slugOk=(v:string)=>/^[a-z0-9-]{1,160}$/.test(v);
export function articleMediaUrl(slug:string,slot:"cover"|"inline",revision?:number){
 if(!slugOk(slug)||!["cover","inline"].includes(slot)||revision!==undefined&&(!Number.isSafeInteger(revision)||revision<1))throw Error("Invalid media reference");
 return "/api/dev-media/"+slug+"/"+slot+(revision===undefined?"":"?revision="+revision);
}
export function catalogMediaUrl(src:unknown){
 const path=safeMediaPath(src);if(!path)return null;
 return dynamicMediaEnabled()?"/api/dev-media/catalog/"+path.slice(7):path;
}
async function upstream(path:string){
 const origin=process.env.CONTENT_API_INTERNAL_URL,token=process.env.DEV_CONTENT_PREVIEW_TOKEN;
 if(!origin||!token||token.length<24)throw Error("MEDIA_CONFIG");
 const url=new URL(origin);
 if(!["https:","http:"].includes(url.protocol)||url.username||url.password||url.search||url.hash)throw Error("MEDIA_ORIGIN");
 return readBackend(url.origin+"/v1/dev-preview/"+path,{"x-preview-token":token},{accept:/^(application\/json|image\/(webp|svg\+xml|png|jpeg))(?:;|$)/i,maxBytes:2*1024*1024});
}
export async function activeMedia(slug:string):Promise<DynamicMedia[]>{
 if(!slugOk(slug))throw Error("Invalid slug");
 const res=await upstream("media/"+slug);
 if(!res.ok)throw Error("MEDIA_METADATA_UNAVAILABLE");
 const payload:unknown=await res.json();
 if(!payload||typeof payload!=="object"||!("data" in payload)||!Array.isArray(payload.data)||payload.data.length!==2||payload.data.some(x=>!x||typeof x!=="object"))throw Error("MEDIA_COVERAGE");
 const data=payload.data as DynamicMedia[];
 if(new Set(data.map(x=>x.slot)).size!==2)throw Error("MEDIA_COVERAGE");
 for(const x of data){
  if(!["cover","inline"].includes(x.slot)||!Number.isSafeInteger(x.revision)||x.revision<1||!/^([a-f0-9]{64})$/.test(x.assetId)||!Number.isInteger(x.width)||!Number.isInteger(x.height)||x.width<1||x.height<1||x.width>8192||x.height>8192||typeof x.alt!=="string"||typeof x.caption!=="string"||!["dev_approved","dev_context_only"].includes(x.reviewStatus))throw Error("MEDIA_METADATA_INVALID");
 }
 // Drop signed URL and other fields: never embed or forward them to the browser.
 return data.map(({slot,revision,assetId,width,height,alt,caption,afterSection,anchorHeading,reviewStatus})=>({slot,revision,assetId,width,height,alt,caption,afterSection,anchorHeading,reviewStatus}));
}
const headers={"Cache-Control":"private, no-store, max-age=0","X-Robots-Tag":"noindex, nofollow, noarchive","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; sandbox","Referrer-Policy":"no-referrer","Vary":"Cookie, Authorization"};
export async function proxyMedia(request:Request,key:string,slot:string):Promise<Response>{
 const denied=requirePreviewLogin(request);if(denied)return denied;
 if(!dynamicMediaEnabled())return new Response("Not found",{status:404,headers});
 const revision=new URL(request.url).searchParams.get("revision");
 let path:string;
 if(key==="catalog"){
  if(revision!==null||!safeMediaPath("/media/"+slot))return new Response("Not found",{status:404,headers});
  path="media-catalog/"+slot;
 }else{
  if(!slugOk(key)||!["cover","inline"].includes(slot)||revision!==null&&!/^[1-9][0-9]{0,8}$/.test(revision))return new Response("Not found",{status:404,headers});
  path="media/"+key+"/"+slot+(revision===null?"":"?revision="+revision);
 }
 try{
  const res=await upstream(path);
  if(!res.ok)return new Response("Media unavailable",{status:[404,409].includes(res.status)?res.status:503,headers});
  const mime=res.headers.get("content-type")?.split(";")[0]||"",id=res.headers.get("x-media-asset")||"";
  if(!["image/webp","image/svg+xml","image/png","image/jpeg"].includes(mime)||!/^[a-f0-9]{64}$/.test(id))throw Error("MEDIA_RESPONSE");
  const length=Number(res.headers.get("content-length")||0);if(length>2097152)throw Error("MEDIA_SIZE");
  const reader=res.body?.getReader();if(!reader)throw Error("MEDIA_BODY");
  const chunks:Uint8Array[]=[];let size=0;
  try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2097152){await reader.cancel();throw Error("MEDIA_SIZE");}chunks.push(value);}}finally{reader.releaseLock();}
  const bytes=Buffer.concat(chunks);if(createHash("sha256").update(bytes).digest("hex")!==id)throw Error("MEDIA_CHECKSUM");
  return new Response(new Uint8Array(bytes),{headers:{...headers,"Content-Type":mime,"X-Media-Asset":id}});
 }catch{console.warn("DEV_DYNAMIC_MEDIA_UNAVAILABLE");return new Response("Media unavailable",{status:503,headers});}
}
