import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const web=process.env.MEBE_UX01_ORIGIN||"https://hanh-trinh-me-be-web-jn5v.onrender.com";
const inv=JSON.parse(readFileSync(new URL("../apps/web/app/hoc-cung-con/life-course-inventory.json",import.meta.url),"utf8"));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 const hub=await page.goto(web+"/kham-pha",{waitUntil:"domcontentloaded",timeout:90000});
 assert.equal(hub.status(),200);assert.match(hub.headers()["x-robots-tag"]||"",/noindex/);
 assert.equal(await page.locator("[data-knowledge-group]").count(),6);
 assert.equal(await page.locator("[data-knowledge-stage]").count(),12);
 const paginated=await page.locator('[data-discovery-v2="1"]').count()===1;
 const seen=[];
 const collect=async()=>seen.push(...await page.locator("[data-knowledge-entry]").evaluateAll(xs=>xs.map(x=>x.dataset.knowledgeEntry)));
 await collect();
 if(paginated){
  const count=page.locator("[data-knowledge-count]");assert.equal(await count.getAttribute("data-knowledge-count"),"219");const pages=Number(await count.getAttribute("data-discovery-pages"));assert.equal(pages,10);
  for(let n=2;n<=pages;n++){await page.goto(web+"/kham-pha?page="+n,{waitUntil:"domcontentloaded",timeout:90000});assert.equal(await page.locator("[data-discovery-current-page]").getAttribute("data-discovery-current-page"),String(n));await collect();}
  await page.goto(web+"/kham-pha");
 }
 assert.equal(seen.length,219);assert.equal(new Set(seen).size,219);
 assert.deepEqual(seen.sort(),inv.refs.map(r=>r.kind+":"+r.id).sort());
 assert.equal(await page.locator('nav a[href="/gia-dinh-demo"], nav a[href="/hoc-cung-con"]').count(),0);
 for(const width of [390,768,1440]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"hub overflow "+width);}
 await page.goto(web+"/kham-pha?stage=baby");assert.equal(await page.locator("[data-knowledge-entry]").count(),19);
 for(let i=0;i<inv.refs.length;i+=8)await Promise.all(inv.refs.slice(i,i+8).map(async r=>{
  const res=await page.request.get(web+"/kien-thuc/"+r.kind+"/"+r.id,{maxRedirects:0,timeout:90000});
  assert.equal(res.status(),307,r.id);
  assert.equal(res.headers()["location"],r.kind==="legacy"?r.href:"/hoc-cung-con?stage="+r.stage+"#"+(r.kind==="article"?"az-":"lesson-")+r.id,r.id);
 }));
 const samples=inv.refs.filter(r=>r.kind!=="legacy"&&inv.refs.find(x=>x.stage===r.stage&&x.kind===r.kind)?.id===r.id);
 for(const r of samples){
  const target=(r.kind==="article"?"az-":"lesson-")+r.id;
  await page.goto(web+"/hoc-cung-con#"+target,{waitUntil:"domcontentloaded",timeout:90000});
  await page.locator("#"+target+" details[open]").waitFor();
  await page.reload({waitUntil:"domcontentloaded"});await page.locator("#"+target+" details[open]").waitFor();
 }
 const last=samples.at(-1);
 await page.goto(web+"/hoc-cung-con");await page.locator("[data-life-stage]").first().waitFor();
 assert.equal(await page.locator("[data-life-stage][aria-pressed=true]").count(),0);
 await page.goto(web+"/kien-thuc/"+last.kind+"/"+last.id);await page.locator("#"+(last.kind==="article"?"az-":"lesson-")+last.id+" details[open]").waitFor();
 assert.equal((await page.request.get(web+"/kien-thuc/article/unknown-item",{maxRedirects:0})).status(),404);
 assert.deepEqual(errors,[]);
 console.log("UX01_HUB_BROWSER_PASS",JSON.stringify({refs:219,groups:6,stages:12,aliases:219,hashSamples:samples.length}));
}finally{await browser.close();}
