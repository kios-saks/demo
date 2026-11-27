import {renderKnowledgeDetail} from "../apps/web/lib/knowledge-detail";
import {escapeHtml as esc} from "../apps/web/lib/dev-preview";
import detailBundle from "../apps/web/app/hoc-cung-con/life-course-articles.json";
import detailLessons from "../apps/web/app/hoc-cung-con/learning-catalog.json";
import test from "node:test";
import assert from "node:assert/strict";
import {renderKnowledgeHub,resolveKnowledgeLink} from "../apps/web/lib/knowledge-hub";
import {openDevReader} from "../apps/web/lib/open-dev-reader";
import {requirePreviewLogin} from "../apps/web/lib/dev-preview";
import {mediaAdminProxy} from "../apps/web/lib/media-admin-proxy";
import {createHash} from "node:crypto";
import {GET as article} from "../apps/web/app/dev-review/[slug]/route";
import {proxyMedia,articleMediaUrl,activeMedia} from "../apps/web/lib/dynamic-media";
import {renderReaderLibrary} from "../apps/web/lib/reader-library";
import dataset from "../packages/content/articles.json";
import inventory from "../apps/web/app/hoc-cung-con/life-course-inventory.json";
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
 let invalidMediaEnvelope=false;
 const json=(data:unknown)=>Response.json(data);
 globalThis.fetch=(async(input:any,init:any)=>{
  assert.equal(init.headers["x-preview-token"],token);assert.equal(init.cache,"no-store");
  const u=new URL(String(input));assert.equal(u.origin,"http://localhost:4000");
  const [, , ,kind,slug,slot]=u.pathname.split("/");
  if(kind==="articles"&&!slug){const page=Number(u.searchParams.get("page"));return json({data:dataset.articles.slice((page-1)*50,page*50),meta:{total:72}});}
  const a=dataset.articles.find(x=>x.slug===slug);
  if(kind==="articles"&&a)return json({data:a,disclaimer:"DEV"});
  if(kind==="media"&&a&&!slot){
   if(invalidMediaEnvelope)return json({data:null});
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
  invalidMediaEnvelope=true;
  await assert.rejects(activeMedia(slug),/MEDIA_COVERAGE/);
  invalidMediaEnvelope=false;
  console.log("UX05_MEDIA_ENVELOPE_FAIL_CLOSED_PASS");
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
  const modeKeys=["MEBE_COMBINED_DEV","RENDER","RENDER_SERVICE_ID"] as const;
  const oldMode=modeKeys.map(k=>process.env[k]);
  try {
   process.env.MEBE_COMBINED_DEV="true";process.env.RENDER="true";process.env.RENDER_SERVICE_ID="srv-other";
   assert.equal(openDevReader(),false);
   assert.equal(requirePreviewLogin(request("/dev-review",false))?.status,404);
   process.env.RENDER_SERVICE_ID="srv-dc19cibl550s73drji5g";
   assert.equal(openDevReader(),true);
   assert.equal(requirePreviewLogin(request("/dev-review",false)),null);
   assert.equal(requirePreviewLogin(new Request("http://localhost/dev-review",{method:"POST"}))?.status,404);
   const hub=await renderKnowledgeHub(request("/kham-pha",false));assert.equal(hub.status,200);assert.match(hub.headers.get("x-robots-tag")||"",/noindex/);const hubHtml=await hub.text();assert.match(hubHtml,/data-knowledge-count="219"/);assert.match(hubHtml,/data-discovery-pages="10"/);assert.equal((hubHtml.match(/data-knowledge-entry=/g)||[]).length,24);assert.equal((hubHtml.match(/data-knowledge-group=/g)||[]).length,6);
   const ids=(html:string)=>Array.from(html.matchAll(/data-knowledge-entry="([^"]+)"/g),m=>m[1]);
   const seen=ids(hubHtml);
   for(let n=2;n<=10;n++){
    const response=await renderKnowledgeHub(request("/kham-pha?page="+n,false));
    assert.equal(response.status,200);assert.match(response.headers.get("cache-control")||"",/no-store/);assert.match(response.headers.get("x-robots-tag")||"",/noindex/);
    const page=await response.text();assert.ok(page.includes('data-discovery-current-page="'+n+'"'));assert.match(page,/data-knowledge-count="219"/);assert.equal(ids(page).length,n===10?3:24);
    assert.ok(!page.includes('href="/gia-dinh-demo"'));seen.push(...ids(page));
   }
   assert.equal(seen.length,219);assert.equal(new Set(seen).size,219);assert.deepEqual(seen.sort(),inventory.refs.map(r=>r.kind+":"+r.id).sort());
   console.log("UX05_DYNAMIC_READER_PAGINATION_PASS",JSON.stringify({refs:219,pages:10,limit:24}));assert.ok(hubHtml.includes('href="/kham-pha"'));assert.ok(!hubHtml.includes('href="/gia-dinh-demo"'));
   const filtered=await renderKnowledgeHub(request("/kham-pha?stage=baby",false));assert.equal((await filtered.text()).match(/data-knowledge-entry=/g)?.length,19);
   // Test all canonical detail links, retaining exact existing content and sources.
   const verified=new Set<string>();
   for(const ref of inventory.refs){
    const path="/kien-thuc/"+ref.kind+"/"+ref.id+"/doc";
    const response=renderKnowledgeDetail(request(path,false),ref.kind,ref.id);
    assert.match(response.headers.get("cache-control")||"",/no-store/);assert.match(response.headers.get("x-robots-tag")||"",/noindex/);
    let markup:string,parts:string[],urls:string[];
    if(ref.kind==="legacy"){
     assert.equal(response.status,307,ref.id);assert.equal(response.headers.get("location"),"/bai-viet/"+ref.id);
     const original=dataset.articles.find(a=>a.slug===ref.id)!;
     const page=await article(request("/dev-review/"+ref.id,false),{params:Promise.resolve({slug:ref.id})});assert.equal(page.status,200,ref.id);
     markup=await page.text();parts=[original.title,original.summary,...original.sections.flatMap(s=>[s.heading,...s.paragraphs])];urls=original.sources.filter(s=>s.url.startsWith("https:")).map(s=>s.url);
     assert.equal((markup.match(/data-media-source="supabase"/g)||[]).length,2,ref.id);
     assert.ok(markup.includes('data-media-revision="'));assert.ok(markup.includes('infographic-transcript'),ref.id);
    }else if(ref.kind==="article"){
     assert.equal(response.status,200,ref.id);markup=await response.text();const a=detailBundle.articles.find(x=>x.id===ref.id)!;
     parts=[a.title,a.summary,...a.sections.flatMap(s=>[s.heading,s.body]),...a.practice,a.limits];
     const map=detailBundle.sources as Record<string,{url:string}>;urls=[...a.sourceIds,...a.sections.flatMap(s=>s.sourceIds)].map(id=>map[id].url);
    }else{
     assert.equal(response.status,200,ref.id);markup=await response.text();const l=detailLessons.lessons.find(x=>x.id===ref.id)!;
     parts=[l.title,l.goal,l.knowledge,l.practice,l.reflection];const map=detailLessons.sources as Record<string,{url:string}>;urls=l.sourceIds.map(id=>map[id].url);
    }
    assert.ok(markup.includes('data-detail-kind="'+ref.kind+'"')&&markup.includes('data-detail-id="'+ref.id+'"'),ref.id);
    assert.ok(markup.includes('data-bookmark-v2="1"'),ref.id);
    assert.ok(markup.includes(ref.kind==="legacy"?'data-save-slug="'+ref.id+'"':'data-bookmark-key="'+ref.kind+":"+ref.id+'"'),ref.id);
    assert.ok(markup.includes('data-detail-share')&&markup.includes('data-detail-copy'),ref.id);
    assert.ok(markup.includes('data-detail-limitation')&&markup.includes('data-detail-related')&&markup.includes('href="#article-sources"'),ref.id);
    assert.ok(markup.includes('href="'+path+'"'),ref.id);
    for(const text of parts)assert.ok(markup.includes(esc(text)),ref.id+" missing exact content");
    for(const url of urls)assert.ok(markup.includes('href="'+esc(url)+'"'),ref.id+" missing source");
    assert.ok(!markup.includes("secret.invalid"));verified.add(ref.kind+":"+ref.id);
   }
   assert.equal(verified.size,219);
   assert.equal(renderKnowledgeDetail(request("/kien-thuc/article/not-found/doc",false),"article","not-found").status,404);
   assert.equal(renderKnowledgeDetail(new Request("http://localhost/kien-thuc/article/not-found/doc",{method:"POST"}),"article","not-found").status,404);
   console.log("UX06_DETAIL_INTEGRITY_PASS",JSON.stringify({refs:219,legacy:72,articles:126,lessons:21,mediaSlots:144}));
   assert.equal(resolveKnowledgeLink(request("/kien-thuc/legacy/"+slug,false),"legacy",slug).headers.get("location"),"/bai-viet/"+slug);
   assert.equal(resolveKnowledgeLink(request("/kien-thuc/article/no-such-item",false),"article","no-such-item").status,404);
   const personalResponse=await renderReaderLibrary(request("/da-luu",false),{mode:"saved"});assert.equal(personalResponse.status,200);
   const personalHtml=await personalResponse.text();
   assert.match(personalHtml,/data-bookmark-library="1"/);
   assert.deepEqual([...personalHtml.matchAll(/data-bookmark-item="([^"]+)"/g)].map(m=>m[1]).sort(),inventory.refs.map(x=>x.kind+":"+x.id).sort());
   assert.equal((personalHtml.match(/data-bookmark-key=/g)||[]).length,219);
   console.log("UX07_BOOKMARK_MARKUP_PASS",JSON.stringify({refs:219,personal:219,detail:219}));
   const openList=await renderReaderLibrary(request("/dev-review",false));
   assert.equal(openList.status,200);assert.match(openList.headers.get("x-robots-tag")||"",/noindex/);
   const openArticle=await article(request("/dev-review/"+slug,false),{params:Promise.resolve({slug})});
   assert.equal(openArticle.status,200);assert.match(await openArticle.text(),/Chưa được thẩm định y khoa/);
   assert.equal((await proxyMedia(request(articleMediaUrl(slug,"cover"),false),slug,"cover")).status,200);
   assert.equal((await mediaAdminProxy(request("/api/media-admin/session",false),["session"])).status,404);
   process.env.MEBE_COMBINED_DEV="false";assert.equal(openDevReader(),false);
   for(const ref of inventory.refs){assert.equal(renderKnowledgeDetail(request("/kien-thuc/"+ref.kind+"/"+ref.id+"/doc",false),ref.kind,ref.id).status,404);assert.equal(renderKnowledgeDetail(request("/kien-thuc/"+ref.kind+"/"+ref.id+"/doc",true),ref.kind,ref.id).status,404);}console.log("UX06_DETAIL_GATE_PASS",JSON.stringify({refs:219,guest:true,authenticated:true}));
   assert.equal((await renderKnowledgeHub(request("/kham-pha",false))).status,404);assert.equal((await renderKnowledgeHub(request("/kham-pha",true))).status,404);assert.equal(resolveKnowledgeLink(request("/kien-thuc/legacy/"+slug,false),"legacy",slug).status,404);
   assert.equal(requirePreviewLogin(request("/dev-review",false))?.status,404);
   process.env.MEBE_COMBINED_DEV="true";process.env.RENDER="false";assert.equal(openDevReader(),false);
   assert.equal(requirePreviewLogin(request("/dev-review",false))?.status,404);
   console.log("DEV_LINK_ACCESS_SCOPED_PASS");
  }finally{modeKeys.forEach((k,i)=>{if(oldMode[i]===undefined)delete process.env[k];else process.env[k]=oldMode[i];});}
  console.log("DYNAMIC_READER_72_ARTICLES_144_SLOTS_VERIFIED");
 }finally{globalThis.fetch=fetchOld;keys.forEach((k,i)=>{if(old[i]===undefined)delete process.env[k];else process.env[k]=old[i];});}
});
