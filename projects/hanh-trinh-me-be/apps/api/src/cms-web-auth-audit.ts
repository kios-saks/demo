import {createHash} from "node:crypto";
const web="https://hanh-trinh-me-be-web-jn5v.onrender.com";
const slug="lam-quen-nhip-sinh-hoat-so-sinh";
const pause=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
// DEV only, existing server-side credentials; GET requests, no token/body logging.
export async function auditCmsWebProxy(){
 if(process.env.RENDER!=="true"||process.env.RENDER_SERVICE_ID!=="srv-dc19bt7f3r2c73c2515g"||process.env.MEDIA_DEV_ENABLED!=="true")return;
 const editor=process.env.MEDIA_DEV_EDITOR_TOKEN,reviewer=process.env.MEDIA_DEV_REVIEWER_TOKEN;
 if(!editor||!reviewer||editor.length<32||reviewer.length<32||editor===reviewer){console.error("DEV_CMS_SMOKE_FAIL",JSON.stringify({step:"CONFIG"}));return;}
 const started=Date.now();let step="READY",status=0;
 async function get(path:string,token?:string){
  for(let attempt=0;attempt<3;attempt++){
   const r=await fetch(web+"/api/media-admin/"+path,{headers:token?{authorization:"Bearer "+token}:{},method:"GET",redirect:"error",cache:"no-store",signal:AbortSignal.timeout(45000)} as RequestInit & {cache:"no-store"});
   status=r.status;
   if(![502,503,504].includes(r.status)||attempt===2)return r;
   await r.body?.cancel();await pause(3000*(attempt+1));
  }
  throw Error("UNAVAILABLE");
 }
 async function data<T>(path:string,token:string):Promise<T>{
  const r=await get(path,token);
  if(!r.ok||!(r.headers.get("content-type")||"").startsWith("application/json")||!(r.headers.get("cache-control")||"").includes("no-store"))throw Error("RESPONSE");
  return ((await r.json()) as {data:T}).data;
 }
 try{
  // Give the platform a short opportunity to route requests to the ready API.
  await pause(8000);
  step="EDITOR_SESSION";if((await data<{role?:string}>("session",editor)).role!=="editor")throw Error("ROLE");
  step="REVIEWER_SESSION";if((await data<{role?:string}>("session",reviewer)).role!=="reviewer")throw Error("ROLE");
  step="CATALOG";const c=await data<{progress?:{total:number;missing:number};items:{slug:string;active_revision:number;active_asset_id:string}[]}>("catalog",reviewer);
  if(c.progress?.total!==72||c.progress?.missing!==0||!Array.isArray(c.items)||c.items.length!==72)throw Error("CATALOG");
  const item=c.items.find((x:{slug:string})=>x.slug===slug);if(!item||!Number.isSafeInteger(item.active_revision)||item.active_revision<1)throw Error("REVISION");
  step="HISTORY";const h=await data<{revisions:unknown[];active:{slot:string;revision:number}[]}>(slug,reviewer);
  if(!Array.isArray(h.revisions)||!Array.isArray(h.active)||!h.active.some((x:{slot:string;revision:number})=>x.slot==="cover"&&x.revision===item.active_revision))throw Error("HISTORY");
  step="IMAGE";const image=await get(slug+"/image/cover/"+item.active_revision,reviewer);
  const digest=image.headers.get("x-media-asset")||"";
  if(image.status!==200||!/^([a-f0-9]{64})$/.test(digest)||digest!==item.active_asset_id||!(image.headers.get("cache-control")||"").includes("no-store")||!(image.headers.get("content-type")||"").startsWith("image/"))throw Error("IMAGE");
  const bytes=Buffer.from(await image.arrayBuffer());
  if(bytes.length>2097152||createHash("sha256").update(bytes).digest("hex")!==digest)throw Error("CHECKSUM");
  step="GUEST_DENIAL";for(const path of ["session","catalog",slug+"/image/cover/"+item.active_revision]){const r=await get(path);if(r.status!==404)throw Error("AUTH");await r.body?.cancel();}
  console.log("DEV_CMS_SMOKE_PASS",JSON.stringify({editor:200,reviewer:200,articles:72,history:200,verifiedImages:1,guestDenials:3,elapsedMs:Date.now()-started}));
 }catch{console.error("DEV_CMS_SMOKE_FAIL",JSON.stringify({step,status,elapsedMs:Date.now()-started}));}
}
