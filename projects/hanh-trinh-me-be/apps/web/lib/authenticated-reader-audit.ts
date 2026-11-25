import {GET as renderArticle} from "../app/dev-review/[slug]/route";
import {renderReaderLibrary} from "./reader-library";
import {proxyMedia,dynamicMediaEnabled} from "./dynamic-media";
import {listDevArticles} from "./dev-preview";

// Bounded, read-only smoke using the existing DEV server credential.
// No token, body, URL with credentials, or article content is logged.
let running=false;
export async function auditAuthenticatedReader(){
 if(running||process.env.RENDER!=="true"||!dynamicMediaEnabled()||process.env.WEB_MEDIA_ADMIN_ENABLED!=="true")return;
 running=true;
 const token=process.env.DEV_CONTENT_PREVIEW_TOKEN;
 if(!token||token.length<24){console.error("DEV_AUTH_SMOKE_FAIL",JSON.stringify({step:"CONFIG"}));return;}
 const auth="Basic "+Buffer.from("editor:"+token).toString("base64");
 const req=(path:string,authorized=true)=>new Request("https://reader-audit.invalid"+path,{headers:authorized?{authorization:auth}:{}});
 const slug="lam-quen-nhip-sinh-hoat-so-sinh";
 const started=Date.now();
 for(let attempt=1;attempt<=2;attempt++){
 let step="CATALOG";
 try{
  const list=await listDevArticles();
  if(list.source!=="supabase"||list.articles.length!==72||new Set(list.articles.map(a=>a.slug)).size!==72||new Set(list.articles.map(a=>a.stage)).size!==12)throw Error("CATALOG");
  step="LIBRARY";
  const library=await renderReaderLibrary(req("/dev-review"));
  if(library.status!==200)throw Error("LIBRARY");
  const lib=await library.text();
  if(!lib.includes("/api/dev-media/"+slug+"/cover"))throw Error("LIBRARY_COVER");
  step="ARTICLE";
  const article=await renderArticle(req("/dev-review/"+slug),{params:Promise.resolve({slug})});
  if(article.status!==200)throw Error("ARTICLE");
  const html=await article.text();
  if((html.match(/data-media-source="supabase"/g)||[]).length!==2)throw Error("MEDIA_COVERAGE");
  let images=0;
  for(const slot of ["cover","inline"]){
   step="IMAGE_"+slot.toUpperCase();
   const prefix="/api/dev-media/"+slug+"/"+slot+"?revision=";
   const pos=html.indexOf(prefix);if(pos<0)throw Error("IMAGE_PATH");
   const revision=html.slice(pos+prefix.length).match(/^[1-9][0-9]*/)?.[0];if(!revision)throw Error("REVISION");
   const img=await proxyMedia(req(prefix+revision),slug,slot);
   if(img.status!==200||!img.headers.get("x-media-asset")||!(img.headers.get("cache-control")||"").includes("no-store")||!(img.headers.get("content-type")||"").startsWith("image/"))throw Error("IMAGE");
   await img.arrayBuffer();images++;
  }
  step="GUEST_DENIAL";
  const denied=await Promise.all([renderReaderLibrary(req("/dev-review",false)),renderArticle(req("/dev-review/"+slug,false),{params:Promise.resolve({slug})}),proxyMedia(req("/api/dev-media/"+slug+"/cover",false),slug,"cover")]);
  if(denied.some(r=>r.status!==404))throw Error("GUEST_DENIAL");
  console.log("DEV_AUTH_SMOKE_PASS",JSON.stringify({articles:72,stages:12,library:200,article:200,verifiedImages:images,guestDenials:3,elapsedMs:Date.now()-started}));
  return;
 }catch{
  if(attempt===1&&["CATALOG","LIBRARY","ARTICLE","IMAGE_COVER","IMAGE_INLINE"].includes(step)){
   console.warn("DEV_AUTH_SMOKE_RETRY",JSON.stringify({step,attempt,elapsedMs:Date.now()-started}));
   await new Promise(resolve=>setTimeout(resolve,5000));continue;
  }
  console.error("DEV_AUTH_SMOKE_FAIL",JSON.stringify({step,attempt,elapsedMs:Date.now()-started}));
 }
 }
}
