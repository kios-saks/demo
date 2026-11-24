import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {GET as article} from "../apps/web/app/dev-review/[slug]/route";
import {proxyMedia,articleMediaUrl} from "../apps/web/lib/dynamic-media";
import {renderReaderLibrary} from "../apps/web/lib/reader-library";
import dataset from "../packages/content/articles.json";
import photos from "../packages/content/mock/lifestyle-media.json";
import vectors from "../packages/content/mock/contextual-inline-illustrations.json";
const hash=(b:Buffer)=>createHash("sha256").update(b).digest("hex");
test("dynamic rendering of every article, access control, current revision and no rebuild",async()=>{
 const token="p".repeat(40);
 const keys=["WEB_DYNAMIC_MEDIA","DEV_CONTENT_PREVIEW_TOKEN","CONTENT_API_INTERNAL_URL"] as const;
 const old=keys.map(k=>process.env[k]);const fetchOld=globalThis.fetch;
 process.env.WEB_DYNAMIC_MEDIA="true";process.env.DEV_CONTENT_PREVIEW_TOKEN=token;process.env.CONTENT_API_INTERNAL_URL="http://localhost:4000";
 const auth={authorization:"Basic "+Buffer.from("editor:"+token).toString("base64")};
 const request=(path:string,authorized=true)=>new Request("http://localhost:3000"+path,{headers:authorized?auth:{}});
 let revision=1;const fixture=Buffer.from("controlled integration image bytes");
 let image=fixture;
 const json=(data:unknown)=>Response.json(data);
 globalThis.fetch=(async(input:any,init:any)=>{
  assert.equal(init.headers["x-preview-token"],token);assert.equal(init.cache,"no-store");
  const u=new URL(String(input));assert.equal(u.origin,"http://localhost:4000");
  const [, , ,kind,slug,slot]=u.pathname.split("/");
  if(kind==="articles"&&!slug){const page=Number(u.searchParams.get("page"));return json({data:dataset.articles.slice((page-1)*50,page*50),meta:{total:72}});}
  const a=dataset.articles.find(x=>x.slug===slug);
  if(kind==="articles"&&a)return json({data:a,disclaimer:"DEV"});
  if(kind==="media"&&a&&!slot){
   const p=(photos.assets as Record<string,any>)["inline-"+slug],v=(vectors.assets as Record<string,any>)[slug],entry=p?.reviewStatus==="approved"?p:v;
   assert.ok(entry);const i=entry.afterSection;
   return json({data:[{slot:"cover",revision,assetId:hash(image),width:1200,height:675,alt:"cover",caption:"cover",afterSection:null,anchorHeading:null,reviewStatus:"dev_approved",url:"https://secret.invalid/sign?token=secret"},{slot:"inline",revision:1,assetId:hash(fixture),width:1200,height:675,alt:entry.alt,caption:entry.caption,afterSection:i,anchorHeading:a.sections[i].heading,reviewStatus:"dev_context_only",url:"https://secret.invalid/sign?token=secret"}]});
  }
  if(kind==="media"&&a&&slot==="cover"){if(u.searchParams.has("revision")&&Number(u.searchParams.get("revision"))!==revision)return new Response("",{status:409});return new Response(new Uint8Array(image),{headers:{"Content-Type":"image/webp","X-Media-Asset":hash(image)}});}
  if(kind==="media"&&a&&slot==="inline")return new Response(new Uint8Array(fixture),{headers:{"Content-Type":"image/webp","X-Media-Asset":hash(fixture)}});
  if(kind==="media-catalog")return new Response(new Uint8Array(fixture),{headers:{"Content-Type":"image/svg+xml","X-Media-Asset":hash(fixture)}});
  return new Response("",{status:404});
 }) as typeof fetch;
 try{
  assert.equal(dataset.articles.length,72);
  const slug=dataset.articles[0].slug;
  assert.equal((await proxyMedia(request("/api/dev-media/"+slug+"/cover",false),slug,"cover")).status,404);
  for(const a of dataset.articles){
   const response=await article(request("/dev-review/"+a.slug),{params:Promise.resolve({slug:a.slug})});
   assert.equal(response.status,200,a.slug);const html=await response.text();
   assert.equal((html.match(/data-media-source="supabase"/g)||[]).length,2,a.slug);
   assert.ok(html.includes(articleMediaUrl(a.slug,"cover",1)));assert.ok(html.includes(articleMediaUrl(a.slug,"inline",1)));assert.ok(!html.includes("secret.invalid"));
   for(const slot of ["cover","inline"]){const r=await proxyMedia(request("/api/dev-media/"+a.slug+"/"+slot+"?revision=1"),a.slug,slot);assert.equal(r.status,200);assert.match(r.headers.get("cache-control")||"",/no-store/);}
  }
  const list=await renderReaderLibrary(request("/dev-review"));assert.equal(list.status,200);const html=await list.text();for(const a of dataset.articles)assert.ok(html.includes(articleMediaUrl(a.slug,"cover")));
  const oldImage=await proxyMedia(request(articleMediaUrl(slug,"cover")),slug,"cover");
  revision=2;image=Buffer.from("new revision served without Web rebuild");
  const changed=await proxyMedia(request(articleMediaUrl(slug,"cover")),slug,"cover");assert.notEqual(oldImage.headers.get("x-media-asset"),changed.headers.get("x-media-asset"));assert.equal(await changed.text(),image.toString());
  assert.equal((await proxyMedia(request(articleMediaUrl(slug,"cover",1)),slug,"cover")).status,409);
  const refreshed=await article(request("/dev-review/"+slug),{params:Promise.resolve({slug})});assert.ok((await refreshed.text()).includes(articleMediaUrl(slug,"cover",2)));
  assert.equal((await proxyMedia(request("/api/dev-media/catalog/editorial-hero.svg"),"catalog","editorial-hero.svg")).status,200);
  assert.equal((await proxyMedia(request("/api/dev-media/catalog/editorial-hero.svg",false),"catalog","editorial-hero.svg")).status,404);
  console.log("DYNAMIC_READER_72_ARTICLES_144_SLOTS_VERIFIED");
 }finally{globalThis.fetch=fetchOld;keys.forEach((k,i)=>{if(old[i]===undefined)delete process.env[k];else process.env[k]=old[i];});}
});
