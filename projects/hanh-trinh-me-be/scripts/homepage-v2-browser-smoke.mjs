import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const web=process.env.MEBE_UX03_ORIGIN||"https://hanh-trinh-me-be-web-jn5v.onrender.com";
const inv=JSON.parse(readFileSync(new URL("../apps/web/app/hoc-cung-con/life-course-inventory.json",import.meta.url),"utf8"));
const groups={prenatal:["prenatal"],child:["baby","toddler","preschool"],school:["school","preteen","teen"],young:["adult"],adult:["early-adult","midlife"],senior:["older","later-life"]};
const browser=await chromium.launch({headless:true});
const prefix="mebe.reader.v1.";
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],requests=[];
 page.on("pageerror",e=>errors.push(e.message));page.on("request",r=>requests.push({url:r.url(),method:r.method()}));
 const home=async()=>{const res=await page.goto(web+"/",{waitUntil:"domcontentloaded",timeout:90000});assert.equal(res.status(),200);assert.match(res.headers()["x-robots-tag"]||"",/noindex/);assert.match(res.headers()["cache-control"]||"",/no-store/);await page.locator('[data-home-v2="1"]').waitFor();await page.locator("[data-home-save]").waitFor();};
 const general=()=>page.locator("[data-home-general] [data-home-entry]:visible");
 await home();
 assert.equal(await page.locator("[data-home-group]").count(),6);
 assert.equal(await general().count(),6);
 assert.equal(await page.locator("[data-home-personal-group]:visible").count(),0);
 assert.equal(await page.locator("[data-home-recent]:visible").count(),0);
 assert.equal(await page.locator("[data-history-opt-in]").isChecked(),false);
 assert.equal(await page.evaluate(k=>localStorage.getItem(k+"homeGroup"),prefix),null);
 assert.equal(await page.evaluate(k=>localStorage.getItem(k+"history"),prefix),null);
 const groupKeys=await page.locator("[data-home-group]").evaluateAll(xs=>xs.map(x=>x.dataset.homeGroup));assert.deepEqual(groupKeys,Object.keys(groups));
 const catalog=new Set(inv.refs.map(x=>x.kind+":"+x.id));assert((await page.locator("[data-home-entry]").evaluateAll(xs=>xs.map(x=>x.dataset.homeEntry))).every(key=>catalog.has(key)));
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:844});await page.evaluate(()=>document.fonts.ready);
  const layout=await page.evaluate(()=>{const root=document.querySelector("[data-home-v2]"),form=root.querySelector("form"),age=root.querySelector(".home-v2-groups"),nav=document.querySelector(".mobile-reader-nav"),navTop=nav&&getComputedStyle(nav).display!=="none"?nav.getBoundingClientRect().top:innerHeight;return {overflow:document.documentElement.scrollWidth>innerWidth+1,searchBottom:form.getBoundingClientRect().bottom,ageBottom:age.getBoundingClientRect().bottom,visibleBottom:navTop,targets:[...root.querySelectorAll("[data-home-group],form button")].map(el=>el.getBoundingClientRect().height),modals:root.querySelectorAll("dialog[open],[aria-modal=true]").length}});
  assert(!layout.overflow,"homepage overflow "+width);assert.equal(layout.modals,0);assert(layout.targets.every(h=>h>=44),"touch target "+width);
  if(width===390){assert(layout.searchBottom<=layout.visibleBottom,"search below fold");assert(layout.ageBottom<=layout.visibleBottom,"age group below fold: "+JSON.stringify(layout));console.log("UX03_MOBILE_FOLD",JSON.stringify(layout));}
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('[data-home-group="senior"]').click();await page.locator("[data-knowledge-entry]").first().waitFor();if(await page.locator('[data-discovery-v2="1"]').count()){assert.equal(await page.locator("[data-knowledge-count]").getAttribute("data-knowledge-count"),"32");assert.equal(await page.locator("[data-knowledge-entry]").count(),24);await page.goto(web+"/kham-pha?group=senior&page=2");assert.equal(await page.locator("[data-knowledge-entry]").count(),8);}else assert.equal(await page.locator("[data-knowledge-entry]").count(),32);
 assert.equal(await page.evaluate(k=>localStorage.getItem(k+"homeGroup"),prefix),null);
 await home();
 await page.locator("[data-home-group-select]").selectOption("school");
 assert.equal(await general().count(),6,"selection before Save must not personalize");
 await page.locator("[data-home-save]").click();
 assert.equal(await general().count(),0);assert.equal(await page.locator('[data-home-personal-group="school"]:visible').count(),1);
 assert((await page.locator('[data-home-personal-group="school"] [data-home-entry]').evaluateAll(xs=>xs.map(x=>x.dataset.homeEntryStage))).every(s=>groups.school.includes(s)));
 await home();assert.equal(await page.locator("[data-home-group-select]").inputValue(),"school");
 await page.locator("[data-home-group-select]").selectOption("senior");await page.locator("[data-home-save]").click();assert.equal(await page.locator('[data-home-personal-group="senior"]:visible').count(),1);
 await page.locator("[data-home-reset]").click();assert.equal(await general().count(),6);assert.equal(await page.evaluate(k=>localStorage.getItem(k+"homeGroup"),prefix),null);
 const legacy="an-dam-khi-nao-bat-dau";
 await page.goto(web+"/bai-viet/"+legacy,{waitUntil:"domcontentloaded",timeout:90000});await home();assert.equal(await page.locator("[data-home-recent]:visible").count(),0);assert.equal(await page.evaluate(k=>localStorage.getItem(k+"history"),prefix),null);
 await page.locator("[data-history-opt-in]").check();
 await page.goto(web+"/bai-viet/"+legacy,{waitUntil:"domcontentloaded",timeout:90000});await page.locator("[data-current-article]").waitFor();await home();
 const recent=page.locator("[data-home-recent] a");await recent.waitFor();assert.equal(await recent.getAttribute("href"),"/bai-viet/"+legacy);assert.equal(await recent.textContent(),inv.refs.find(x=>x.kind==="legacy"&&x.id===legacy).title);
 await page.locator("[data-history-opt-in]").uncheck();assert.equal(await page.locator("[data-home-recent]:visible").count(),0);assert.equal(await page.evaluate(k=>localStorage.getItem(k+"history"),prefix),null);
 await page.locator("[data-home-group-select]").selectOption("child");await page.locator("[data-home-save]").click();await page.goto(web+"/da-luu");await page.locator("[data-clear-reader]").click();await home();assert.equal(await general().count(),6);
 const tasks=[["feeding",'[data-search-entry="legacy:an-dam-khi-nao-bat-dau"]'],["puberty",'[data-search-entry="lesson:day-thi-thay-doi"]'],["ai",'[data-search-entry="lesson:ai-co-the-sai"]'],["finance",'[data-search-entry="lesson:tai-chinh-tu-lap"]'],["aging",'[data-search-entry][data-search-stage="older"],[data-search-entry][data-search-stage="later-life"]']];
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:844});
  for(const [id,selector] of tasks){
   await home();const before=requests.length;await page.locator('[data-home-topic="'+id+'"]').click();await page.locator("[data-private-search-ready]").waitFor();const row=page.locator(selector).first();await row.waitFor();
   const key=await row.getAttribute("data-search-entry");assert(catalog.has(key));const [kind,slug]=key.split(":");
   await row.locator("a").first().click();
   if(kind==="legacy"){await page.waitForURL(u=>u.pathname==="/bai-viet/"+slug);await page.locator("[data-current-article]").waitFor();}
   else{const target=(kind==="article"?"az-":"lesson-")+slug;await page.waitForURL(u=>u.pathname==="/hoc-cung-con"&&u.hash==="#"+target);await page.locator("#"+target+" details[open]").waitFor();}
   assert(!requests.slice(before).some(x=>new URL(x.url).searchParams.has("q")),"query in network URL");
   assert(requests.slice(before).some(x=>x.method==="POST"&&new URL(x.url).pathname==="/api/dev-search"));
   console.log("UX03_TASK_PASS",JSON.stringify({width,id,key,actions:2}));
  }
 }
 await home();const post=page.waitForRequest(r=>r.method()==="POST"&&new URL(r.url()).pathname==="/api/dev-search");await page.locator("#home-v2-q").fill("dậy thì");await page.locator(".home-v2-search button").click();const req=await post;assert.equal(new URL(req.url()).search,"");assert.equal(new URLSearchParams(req.postData()).get("q"),"dậy thì");await page.locator("[data-private-search-ready]").waitFor();await page.goBack();await page.locator("[data-home-v2]").waitFor();
 assert.deepEqual(errors,[]);
 console.log("UX03_HOMEPAGE_BROWSER_PASS",JSON.stringify({refs:219,groups:6,widths:4,aboveFold390:true,taskFlows:10,maxActions:2,privatePost:true,optIn:true,history:true,clear:true}));
}finally{await browser.close();}
