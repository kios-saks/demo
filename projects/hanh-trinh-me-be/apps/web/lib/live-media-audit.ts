import {GET as renderArticle} from "../app/dev-review/[slug]/route";
import {renderReaderLibrary} from "./reader-library";
import {proxyMedia,dynamicMediaEnabled} from "./dynamic-media";
import {listDevArticles} from "./dev-preview";

export async function auditLiveMedia(){
 if(!dynamicMediaEnabled()||process.env.WEB_DYNAMIC_MEDIA_VERIFY_ON_START!=="true")return;
 const token=process.env.DEV_CONTENT_PREVIEW_TOKEN;
 if(!token||token.length<24){console.error("DYNAMIC_MEDIA_LIVE_AUDIT_FAILED","CONFIG");return;}
 const authorization="Basic "+Buffer.from("editor:"+token).toString("base64");
 const req=(path:string,auth=true)=>new Request("https://reader-audit.invalid"+path,{headers:auth?{authorization}:{}});
 let pages=0,slots=0,catalogCount=0;
 const catalog=new Set<string>();
 const collect=(html:string)=>{for(const m of html.matchAll(/src="(\/api\/dev-media\/catalog\/[a-z0-9-]+\.(?:svg|webp))"/g))catalog.add(m[1]);};
 let stage="CATALOG";
 try{
  console.log("DYNAMIC_MEDIA_LIVE_AUDIT_START");
  const list=await listDevArticles();
  if(list.source!=="supabase"||list.articles.length!==72)throw Error("CATALOG");
  const library=await renderReaderLibrary(req("/dev-review"));if(library.status!==200)throw Error("LIBRARY");
  const libraryHtml=await library.text();collect(libraryHtml);
  for(const a of list.articles)if(!libraryHtml.includes("/api/dev-media/"+a.slug+"/cover"))throw Error("LIBRARY_COVER");
  const stages=[...new Set(list.articles.map(a=>a.stage))];
  for(const stageSlug of stages){const page=await renderReaderLibrary(req("/dev-review/nhom/"+stageSlug),{mode:"stage",stage:stageSlug});if(page.status!==200)throw Error("STAGE");collect(await page.text());}
  stage="ARTICLES";
  for(const a of list.articles){
   const page=await renderArticle(req("/dev-review/"+a.slug),{params:Promise.resolve({slug:a.slug})});
   if(page.status!==200)throw Error("ARTICLE");
   const html=await page.text();collect(html);
   if((html.match(/data-media-source="supabase"/g)||[]).length!==2)throw Error("MEDIA_COVERAGE");
   for(const slot of ["cover","inline"]){
    const prefix="/api/dev-media/"+a.slug+"/"+slot+"?revision=";
    const pos=html.indexOf(prefix);if(pos<0)throw Error("IMAGE_PATH");
    const rev=html.slice(pos+prefix.length).match(/^[1-9][0-9]*/)?.[0];if(!rev)throw Error("REVISION");
    const image=await proxyMedia(req(prefix+rev),a.slug,slot);
    if(image.status!==200||!image.headers.get("x-media-asset")||!(image.headers.get("content-type")||"").startsWith("image/")||!(image.headers.get("cache-control")||"").includes("no-store"))throw Error("IMAGE");
    await image.arrayBuffer();slots++;
   }
   pages++;
   if(pages%12===0)console.log("DYNAMIC_MEDIA_LIVE_AUDIT_PROGRESS",JSON.stringify({pages,slots}));
  }
  stage="CATALOG_IMAGES";
  for(const path of catalog){const file=path.split("/").pop()!;const image=await proxyMedia(req(path),"catalog",file);if(image.status!==200)throw Error("CATALOG_IMAGE");await image.arrayBuffer();catalogCount++;}
  stage="AUTHORIZATION";
  const first=list.articles[0].slug;
  if((await proxyMedia(req("/api/dev-media/"+first+"/cover",false),first,"cover")).status!==404)throw Error("AUTH");
  console.log("DYNAMIC_MEDIA_LIVE_AUDIT_VERIFIED",JSON.stringify({pages,slots,catalogCount,stages:stages.length,unauthenticatedDenied:true}));
 }catch{console.error("DYNAMIC_MEDIA_LIVE_AUDIT_FAILED",JSON.stringify({stage,pages,slots,catalogCount}));}
}
