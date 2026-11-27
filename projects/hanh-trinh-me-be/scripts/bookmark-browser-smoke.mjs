import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const web=process.env.MEBE_UX07_ORIGIN||"https://hanh-trinh-me-be-web-jn5v.onrender.com";
const inv=JSON.parse(readFileSync(new URL("../apps/web/app/hoc-cung-con/life-course-inventory.json",import.meta.url),"utf8")),refs=inv.refs,keys=refs.map(r=>r.kind+":"+r.id),prefix="mebe.reader.v1.";
const href=r=>"/kien-thuc/"+r.kind+"/"+r.id+"/doc",key=r=>r.kind+":"+r.id;
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),errors=[],requests=[];
 page.on("pageerror",e=>{errors.push(e.message);console.error("UX07_PAGE_ERROR",JSON.stringify({path:new URL(page.url()).pathname,error:e.message}));});
 context.on("request",r=>requests.push({url:r.url(),method:r.method()}));
 const go=async(path,p=page)=>{const res=await p.goto(web+path,{waitUntil:"load",timeout:90000});assert.equal(res.status(),200,path);};
 const personal=async(p=page)=>{await go("/da-luu",p);await p.locator("[data-bookmark-library]").waitFor();await p.locator("[data-bookmark-filter]:enabled").waitFor();};
 const count=async(p=page)=>p.locator("[data-bookmark-item]:visible").count();
 const snapshot=()=>page.evaluate(prefix=>Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith(prefix)).map(k=>[k,localStorage.getItem(k)])),prefix);
 const button=(r,p=page)=>p.locator(r.kind==="legacy"?'[data-save-slug="'+r.id+'"]':'[data-bookmark-key="'+key(r)+'"]').first();
 await personal();assert.equal(await count(),0);assert.deepEqual(await snapshot(),{});
 const legacy=refs.filter(r=>r.kind==="legacy").map(r=>r.id),raw=JSON.stringify([...legacy,legacy[0],"unavailable-fixture"]);
 await page.evaluate(({prefix,raw})=>localStorage.setItem(prefix+"saved",raw),{prefix,raw});
 await personal();assert.equal(await count(),72);assert.equal((await snapshot())[prefix+"saved"],raw);assert.equal((await snapshot())[prefix+"savedV2"],undefined);
 assert.match(await page.locator("[data-bookmark-status]").textContent(),/1 mục cũ/);
 await page.evaluate(({prefix,keys})=>localStorage.setItem(prefix+"savedV2",JSON.stringify(keys.filter(k=>!k.startsWith("legacy:")))),{prefix,keys});
 await personal();assert.equal(await count(),219);
 assert.equal(new Set(await page.locator("[data-bookmark-item]:visible").evaluateAll(xs=>xs.map(x=>x.dataset.bookmarkItem))).size,219);
 for(const [kind,n] of [["legacy",72],["article",126],["lesson",21],["all",219]]){await page.locator("[data-bookmark-filter]").selectOption(kind);assert.equal(await count(),n);}
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert(await page.locator("[data-bookmark-filter]").evaluate(el=>el.getBoundingClientRect().height>=44));
 }
 const before=await snapshot();page.once("dialog",d=>d.dismiss());await page.locator("[data-clear-reader]").click();assert.deepEqual(await snapshot(),before);assert.equal(await count(),219);
 page.once("dialog",d=>d.accept());await page.locator("[data-clear-reader]").click();assert.equal(await count(),0);assert.deepEqual(await snapshot(),{});
 await page.setViewportSize({width:390,height:844});
 const samples=["legacy","article","lesson"].map(k=>refs.find(r=>r.kind===k));
 for(const r of samples){
  await go(href(r));const b=button(r);await b.waitFor({state:"visible"});assert.equal(await b.getAttribute("aria-pressed"),"false");
  const start=requests.length;await b.click();assert.equal(await b.getAttribute("aria-pressed"),"true");assert.equal(requests.length,start,"bookmark action sends no network request");
  assert.equal((await snapshot())[prefix+"history"],undefined,"history remains opt-in");
  await page.reload({waitUntil:"load"});assert.equal(await button(r).getAttribute("aria-pressed"),"true");
  await page.evaluate(()=>{window.__shareFixture=null;window.__copyFixture=null;Object.defineProperty(navigator,"share",{configurable:true,value:async data=>{window.__shareFixture=data}});Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async text=>{window.__copyFixture=text}}});history.replaceState(null,"",location.pathname+"?example=synthetic-fixture#private-fixture");});
  const expected=web+href(r);const n=requests.length;await page.locator("[data-detail-share]").click();assert.equal(await page.evaluate(()=>window.__shareFixture?.url),expected);
  await page.locator("[data-detail-copy]").click();assert.equal(await page.evaluate(()=>window.__copyFixture),expected);
  await page.evaluate(()=>{Object.defineProperty(navigator,"share",{configurable:true,value:undefined});Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw Error("clipboard denied")}}});});
  await page.locator("[data-detail-share]").click();await page.waitForFunction(expected=>document.querySelector("[data-detail-copy-status]").textContent===expected,expected);
  assert.equal(requests.length,n,"share and copy fixture sends no request");
  await personal();assert.equal(await page.locator('[data-bookmark-item="'+key(r)+'"]').isVisible(),true);
 }
 assert.equal(await count(),3);console.log("UX07_SHARE_CANONICAL_PASS",JSON.stringify({kinds:3,native:true,copy:true,manualFallback:true,noQuery:true,noNetwork:true}));
 const second=await context.newPage();await personal(second);assert.equal(await count(second),3);
 const lesson=samples[2],item=page.locator('[data-bookmark-item="'+key(lesson)+'"]');
 await item.locator("button").click();await second.locator('[data-bookmark-item="'+key(lesson)+'"]').waitFor({state:"hidden"});assert.equal(await count(),2);
 await page.locator('[data-bookmark-item="'+key(samples[1])+'"] a').click();await page.locator("[data-detail-v2]").waitFor();await page.goBack({waitUntil:"load"});assert.equal(new URL(page.url()).pathname,"/da-luu");
 // A history traversal can resolve before deferred scripts/pageshow finish.
 // Wait for the actual restored visible IDs, not a sleep or reduced assertion.
 const expectedBack=samples.slice(0,2).map(key).sort();
 try{await page.waitForFunction(expected=>JSON.stringify([...document.querySelectorAll("[data-bookmark-item]")].filter(el=>!el.hidden&&el.getClientRects().length).map(el=>el.dataset.bookmarkItem).sort())===JSON.stringify(expected),expectedBack);}
 catch(e){console.error("UX07_BACK_RESTORE_ERROR",JSON.stringify({path:new URL(page.url()).pathname,visible:await count(),filter:await page.locator("[data-bookmark-filter]").inputValue(),storage:await snapshot()}));throw e;}
 assert.equal(await count(),2);assert.deepEqual((await page.locator("[data-bookmark-item]:visible").evaluateAll(xs=>xs.map(x=>x.dataset.bookmarkItem))).sort(),expectedBack);
 await second.close();
 await go("/kham-pha?stage="+samples[1].stage+"&kind=article");
 const discover=page.locator('[data-knowledge-entry="'+key(samples[1])+'"] [data-bookmark-key]');assert.equal(await discover.getAttribute("aria-pressed"),"true");await discover.click();assert.equal(await discover.getAttribute("aria-pressed"),"false");
 await go("/tim-kiem#q=AI");await page.locator("[data-private-search-ready]").waitFor();const result=page.locator("[data-search-entry] [data-bookmark-key]").first();await result.waitFor({state:"visible"});const saved=await result.getAttribute("aria-pressed");await result.click();assert.notEqual(await result.getAttribute("aria-pressed"),saved);
 await page.evaluate(prefix=>localStorage.setItem(prefix+"savedV2","{broken"),prefix);await go("/da-luu");
 assert.match(await page.locator("[data-bookmark-count]").textContent(),/Không thể đọc/);assert.match(await page.locator("[data-bookmark-status]").textContent(),/Chưa thay đổi/);
 assert.equal((await snapshot())[prefix+"savedV2"],"{broken");
 page.once("dialog",d=>d.accept());await page.locator("[data-clear-reader]").click();assert.equal(await count(),0);
 await go(href(samples[1]));await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException("fixture","QuotaExceededError")};});
 await button(samples[1]).click();assert.equal(await button(samples[1]).getAttribute("aria-pressed"),"false");assert.match(await page.locator("[data-bookmark-feedback]").textContent(),/Không thể/);
 const blocked=await context.newPage();await blocked.addInitScript(()=>{Storage.prototype.getItem=function(){throw new DOMException("fixture","SecurityError")};});
 await go("/da-luu",blocked);assert.match(await blocked.locator("[data-bookmark-count]").textContent(),/Không thể đọc/);assert.equal(await blocked.locator("[data-bookmark-filter]").isDisabled(),true);await blocked.close();
 assert.deepEqual(errors,[]);console.log("UX07_BOOKMARK_BROWSER_PASS",JSON.stringify({refs:219,legacyMigration:72,kinds:3,widths:5,filter:true,reload:true,history:true,crossTab:true,confirmedClear:true,corrupt:true,blocked:true,quota:true,searchReplacement:true,noNetwork:true}));
 await context.close();
}finally{await browser.close();}
