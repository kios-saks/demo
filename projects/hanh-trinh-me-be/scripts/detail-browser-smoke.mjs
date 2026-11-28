import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const web=process.env.MEBE_UX06_ORIGIN||"https://hanh-trinh-me-be-web-jn5v.onrender.com";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const prefix="apps/web/app/hoc-cung-con/";
const inv=read(prefix+"life-course-inventory.json"),bundle=read(prefix+"life-course-articles.json"),lessons=read(prefix+"learning-catalog.json"),legacy=read("packages/content/articles.json").articles;
const href=r=>"/kien-thuc/"+r.kind+"/"+r.id+"/doc";
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on("pageerror",e=>{const diagnostic={path:new URL(page.url()).pathname,width:page.viewportSize()?.width,error:e.message};errors.push(diagnostic);console.error("UX06_PAGE_ERROR",JSON.stringify(diagnostic));});
 const ids=new Set();
 // Real HTTP source integrity: every identity, redirect, heading, paragraph and source URL.
 for(let i=0;i<inv.refs.length;i+=6)await Promise.all(inv.refs.slice(i,i+6).map(async ref=>{
  const res=await page.request.get(web+href(ref),{timeout:90000});assert.equal(res.status(),200,ref.id);assert.match(res.headers()["cache-control"]||"",/no-store/);assert.match(res.headers()["x-robots-tag"]||"",/noindex/);assert.equal(res.headers()["referrer-policy"],"no-referrer");
  const html=await res.text();assert(html.includes('data-detail-kind="'+ref.kind+'"')&&html.includes('data-detail-id="'+ref.id+'"'),ref.id);assert(html.includes("data-detail-limitation")&&html.includes("data-detail-related")&&html.includes('href="#article-sources"'),ref.id);
  let content,urls;
  if(ref.kind==="legacy"){const a=legacy.find(a=>a.slug===ref.id);content=[a.title,a.summary,...a.sections.flatMap(s=>[s.heading,...s.paragraphs])];urls=a.sources.filter(s=>s.url.startsWith("https:")).map(s=>s.url);assert.equal(new URL(res.url()).pathname,"/bai-viet/"+ref.id);assert(html.includes("infographic-transcript"),ref.id);}
  else if(ref.kind==="article"){const a=bundle.articles.find(a=>a.id===ref.id);content=[a.title,a.summary,...a.sections.flatMap(s=>[s.heading,s.body]),...a.practice,a.limits];urls=[...a.sourceIds,...a.sections.flatMap(s=>s.sourceIds)].map(id=>bundle.sources[id].url);}
  else {const l=lessons.lessons.find(l=>l.id===ref.id);content=[l.title,l.goal,l.knowledge,l.practice,l.reflection];urls=l.sourceIds.map(id=>lessons.sources[id].url);}
  for(const t of content)assert(html.includes(esc(t)),ref.id+" content");for(const u of urls)assert(html.includes('href="'+esc(u)+'"'),ref.id+" source");
  ids.add(ref.kind+":"+ref.id);
 }));
 assert.equal(ids.size,219);console.log("UX06_HTTP_INTEGRITY_PASS",JSON.stringify({refs:219,legacy:72,articles:126,lessons:21}));
 // UX09: the exact caption-source link from the two live axe failures must
 // remain visibly distinguishable at rest, not only on hover/focus.
 const captionRef=inv.refs.find(r=>r.kind==="legacy");
 await page.goto(web+href(captionRef),{waitUntil:"load",timeout:90000});
 for(const width of [320,1440]){
  await page.setViewportSize({width,height:844});
  const captions=page.locator('figcaption > a[href$="#article-sources"]');
  assert(await captions.count()>0,"expected real legacy caption source link");
  for(const link of await captions.all()){
   assert(await link.isVisible());
   assert((await link.evaluate(el=>getComputedStyle(el).textDecorationLine)).includes("underline"),"caption source link "+width);
  }
 }
 console.log("UX09_CAPTION_LINK_PASS",JSON.stringify({widths:[320,1440],underline:true}));
 const samples=inv.refs.filter(r=>r.kind!=="legacy"&&inv.refs.find(x=>x.kind===r.kind&&x.stage===r.stage)?.id===r.id);
 const refs=[...inv.refs.filter(r=>r.kind==="legacy"),...samples];let legacyViews=0,sampleViews=0;
 for(const ref of refs){
  await page.setViewportSize({width:390,height:844});
  const response=await page.goto(web+href(ref),{waitUntil:"domcontentloaded",timeout:90000});assert.equal(response.status(),200,ref.id);
  await page.locator("[data-detail-v2]").waitFor();assert.equal(await page.locator("h1").count(),1,ref.id);
  assert.equal(await page.locator("[data-detail-kind]").getAttribute("data-detail-kind"),ref.kind);
  const toc=page.locator(".mobile-toc");assert(await toc.isVisible());if(await toc.getAttribute("open")===null)await toc.locator("summary").click();
  const anchors=await toc.locator("a").evaluateAll(xs=>xs.map(x=>x.getAttribute("href")));
  assert(anchors.length>=4);for(const target of anchors){assert.equal(await page.locator(target).count(),1,ref.id+" "+target);}
  await toc.locator('a[href="#article-sources"]').click();assert.equal(new URL(page.url()).hash,"#article-sources");
  assert(await page.locator("#article-sources").isVisible());
  // Reset the mobile TOC and use computed geometry and actual media sizes.
  await toc.locator("summary").click();
  const images=await page.locator(".article-content figure img").evaluateAll(async xs=>Promise.all(xs.map(async (img,index)=>{
   img.loading="eager";
   try{await img.decode();}catch(e){throw Error("MEDIA_DECODE_FAILED figure="+index+" complete="+img.complete+" width="+img.naturalWidth);}
   return {w:img.naturalWidth,h:img.naturalHeight};
  }))).catch(e=>{console.error("UX09_MEDIA_DECODE_FAILURE",JSON.stringify({kind:ref.kind,id:ref.id,width:390}));throw e;});
  if(ref.kind==="legacy")assert(images.length>=2,ref.id+" media");assert(images.every(x=>x.w>0&&x.h>0));
  for(const width of [390,768,1024,1440]){
   await page.setViewportSize({width,height:844});await page.evaluate(()=>document.fonts.ready);
   const metrics=await page.evaluate(()=>{const article=document.querySelector(".article-content");return {overflow:document.documentElement.scrollWidth>innerWidth+1,bodySize:parseFloat(getComputedStyle(article.querySelector("section p")||article).fontSize),images:[...article.querySelectorAll("figure img")].map(img=>{const r=img.getBoundingClientRect();return {fit:getComputedStyle(img).objectFit,ratio:Math.abs(r.width/r.height-img.naturalWidth/img.naturalHeight),w:r.width,h:r.height};}),source:document.querySelector("#article-sources").getBoundingClientRect().width,article:article.getBoundingClientRect().width};});
   assert(!metrics.overflow,ref.id+" overflow "+width);assert(metrics.bodySize>=16,ref.id+" typography");
   assert(metrics.images.every(x=>x.fit==="contain"&&x.w>0&&x.h>0&&x.ratio<0.035),ref.id+" media ratio "+width);
   assert(metrics.source<=metrics.article+1,ref.id+" sources");
   assert.equal(await page.locator(".desktop-toc").isVisible(),width>768);
   assert.equal(await page.locator(".mobile-toc").isVisible(),width<=768);
   if(ref.kind==="legacy")legacyViews++;else sampleViews++;
  }
  console.log("UX06_DETAIL_VISUAL_PASS",JSON.stringify({kind:ref.kind,id:ref.id,widths:4}));
 }
 assert.equal(legacyViews,288);assert(sampleViews===samples.length*4);
 // Deep-link, old hash fallback, native back, reload, and share link path.
 const sample=samples[0],detail=href(sample);
 await page.goto(web+"/kham-pha?stage="+sample.stage+"&kind="+sample.kind);const entry=page.locator('[data-knowledge-entry="'+sample.kind+":"+sample.id+'"] a');await entry.click();await page.waitForURL(web+detail);
 await page.locator("[data-detail-link]").waitFor();assert.equal(await page.locator("[data-detail-link]").getAttribute("href"),detail);
 await page.reload({waitUntil:"domcontentloaded"});assert.equal(await page.locator("[data-detail-id]").getAttribute("data-detail-id"),sample.id);
 await page.goBack({waitUntil:"domcontentloaded"});assert.equal(new URL(page.url()).pathname,"/kham-pha");assert.equal(new URL(page.url()).searchParams.get("stage"),sample.stage);
 const old=await page.request.get(web+"/kien-thuc/"+sample.kind+"/"+sample.id,{maxRedirects:0});assert.equal(old.status(),307);assert.match(old.headers()["location"],/#(?:az|lesson)-/);
 await page.goto(web+old.headers()["location"],{waitUntil:"domcontentloaded"});await page.locator("#"+(sample.kind==="article"?"az-":"lesson-")+sample.id+" details[open]").waitFor();
 assert.equal((await page.request.get(web+"/kien-thuc/article/no-such-item/doc")).status(),404);
 assert.deepEqual(errors,[]);console.log("UX06_DETAIL_BROWSER_PASS",JSON.stringify({refs:219,legacyViews,azLessonSamples:samples.length,sampleViews,widths:4,deepLink:true,history:true,oldHash:true,sourceIntegrity:true,mediaContain:true}));
}finally{await browser.close();}
