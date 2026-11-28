import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const web=process.env.MEBE_UX04_ORIGIN||"https://hanh-trinh-me-be-web-jn5v.onrender.com";
const inv=JSON.parse(readFileSync(new URL("../apps/web/app/hoc-cung-con/life-course-inventory.json",import.meta.url),"utf8"));
const legacy=inv.refs.find(x=>x.kind==="legacy");
const lesson=inv.refs.find(x=>x.kind==="lesson"),article=inv.refs.find(x=>x.kind==="article");
const expected=[["/","Trang chủ"],["/kham-pha","Khám phá"],["/hanh-trinh","Hành trình"],["/da-luu","Cá nhân"]];
const stages=[...new Set(inv.refs.filter(x=>x.kind==="legacy").map(x=>x.originalStage))];
const routes=[["/","/"],["/kham-pha","/kham-pha"],["/kham-pha?group=senior","/kham-pha"],["/tim-kiem","/kham-pha"],["/thu-vien","/kham-pha"],...stages.map(x=>["/"+x,"/kham-pha"]),[legacy.href,"/kham-pha"],["/kien-thuc/"+article.kind+"/"+article.id,"/kham-pha"],["/kien-thuc/"+lesson.kind+"/"+lesson.id,"/kham-pha"],["/hoc-cung-con","/kham-pha"],["/hanh-trinh","/hanh-trinh"],["/da-luu","/da-luu"],["/nguon-tham-khao","/kham-pha"]];
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 let phase="routes";page.on("pageerror",e=>{const u=new URL(page.url());const diagnostic={path:u.pathname,width:page.viewportSize()?.width,phase,error:e.message};errors.push(diagnostic);console.error("UX04_PAGE_ERROR",JSON.stringify(diagnostic));});
 for(const [path,active] of routes){
  await page.setViewportSize({width:390,height:844});
  const res=await page.goto(web+path,{waitUntil:"domcontentloaded",timeout:90000});assert.equal(res.status(),200,path);
  assert.match(res.headers()["x-robots-tag"]||"",/noindex/,path);assert.match(res.headers()["x-robots-tag"]||"",/nofollow/,path);
  assert.match(res.headers()["cache-control"]||"",/no-store/,path);assert.equal(res.headers()["referrer-policy"],"no-referrer",path);
  await page.locator('[data-reader-shell="v2"]').waitFor();assert.equal(await page.locator("main").count(),1,path);
  for(const mode of ["desktop","mobile"]){
   const nav=page.locator('[data-shell-nav="'+mode+'"]');assert.equal(await nav.count(),1);
   const items=await nav.locator("a").evaluateAll(xs=>xs.map(x=>[x.getAttribute("href"),x.textContent.trim()]));assert.deepEqual(items,expected,path+" "+mode);
   assert.equal(await nav.locator('[aria-current="page"]').count(),1);assert.equal(await nav.locator('[aria-current="page"]').getAttribute("href"),active,path);
  }
  assert.equal(await page.locator('header nav a[href="/gia-dinh"],header nav a[href="/gia-dinh-demo"],header nav a[href="/admin"],header nav a[href="/bien-tap"],[data-shell-nav] a[href="/nguon-tham-khao"]').count(),0);
  assert.equal(await page.locator('footer a[href="/nguon-tham-khao"]').count(),1);
  if(path==="/")assert.equal(await page.locator("[data-shell-breadcrumb]").count(),0);
  else{const crumbs=page.locator("[data-shell-breadcrumb]");assert.equal(await crumbs.count(),1,path);assert.equal(await crumbs.locator("a").first().getAttribute("href"),"/");assert.equal(await crumbs.locator('[aria-current="page"]').count(),1);}
  for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:844});await page.evaluate(()=>document.fonts.ready);
   const mobile=width<=768,nav=page.locator('[data-shell-nav="'+(mobile?"mobile":"desktop")+'"]'),hidden=page.locator('[data-shell-nav="'+(mobile?"desktop":"mobile")+'"]');
   assert(await nav.isVisible(),path+" nav "+width);assert(!(await hidden.isVisible()),path+" hidden "+width);
   const m=await page.evaluate(()=>{const nav=document.querySelector('[data-shell-nav="mobile"]'),visible=getComputedStyle(nav).display!=="none";return {overflow:document.documentElement.scrollWidth>innerWidth+1,bottom:visible?nav.getBoundingClientRect().bottom:innerHeight,height:visible?nav.getBoundingClientRect().height:0,padding:parseFloat(getComputedStyle(document.querySelector('[data-reader-shell="v2"]')).paddingBottom)||0,targets:[...document.querySelectorAll("[data-shell-nav] a")].filter(el=>el.getBoundingClientRect().height>0).map(el=>el.getBoundingClientRect().height)}});
   assert(!m.overflow,path+" overflow "+width);assert(m.targets.every(h=>h>=44),path+" touch target "+width);
   if(mobile){assert(Math.abs(m.bottom-844)<=1,path+" bottom anchor");assert(m.padding>=m.height,path+" bottom padding");}
  }
  console.log("UX04_ROUTE_PASS",JSON.stringify({path,active,widths:5}));
 }
 // Dedicated DEV source directory: no React hydration and native filter retains URL.
 phase="source-directory";
 await page.setViewportSize({width:390,height:844});
 await page.goto(web+"/nguon-tham-khao",{waitUntil:"domcontentloaded",timeout:90000});
 if(await page.locator('[data-source-catalog-v2="1"]').count()){
  const count=page.locator("[data-source-count]");assert.equal(Number(await count.getAttribute("data-source-count")),await page.locator("[data-source-id]").count());
  const allIds=await page.locator("[data-source-id]").evaluateAll(xs=>xs.map(x=>x.dataset.sourceId));assert.equal(new Set(allIds).size,allIds.length);
  assert.equal(await page.locator('script[src*="/_next/"]').count(),0,"Source directory must not hydrate React");
  const select=page.locator("#source-stage"),stage=await select.locator("option").nth(1).getAttribute("value");assert(stage);
  await select.selectOption(stage);
  await Promise.all([page.waitForURL(u=>u.pathname==="/nguon-tham-khao"&&u.searchParams.get("stage")===stage,{waitUntil:"domcontentloaded",timeout:90000}),page.locator('form[action="/nguon-tham-khao"] button').click()]);
  assert.equal(await select.inputValue(),stage);assert.equal(Number(await count.getAttribute("data-source-count")),await page.locator("[data-source-id]").count());
  assert((await page.locator("[data-source-id]").evaluateAll(xs=>xs.map(x=>x.dataset.sourceId))).every(id=>allIds.includes(id)));
  for(const width of [390,1440])for(let i=0;i<3;i++){
   await page.setViewportSize({width,height:844});const res=await page.goto(web+"/nguon-tham-khao",{waitUntil:"load",timeout:90000});assert.equal(res.status(),200);
   assert(await page.locator("[data-source-catalog-v2]").isVisible());assert.equal(await page.locator('script[src*="/_next/"]').count(),0);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  console.log("UX06_SOURCE_DIRECTORY_SSR_PASS",JSON.stringify({reloads:6,widths:2,filter:true,noReact:true}));
 }
 // Keyboard and skip-link behavior on raw home and React reader.
 phase="keyboard";for(const path of ["/","/hoc-cung-con"]){
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:844});await page.goto(web+path,{waitUntil:"domcontentloaded",timeout:90000});
   await page.locator('[data-reader-shell="v2"]').waitFor();await page.keyboard.press("Tab");
   assert(await page.locator(".shell-v2-skip").evaluate(el=>document.activeElement===el),"skip first "+path);
   assert(await page.locator(".shell-v2-skip").evaluate(el=>el.getBoundingClientRect().top>=0));
   await page.keyboard.press("Enter");assert(await page.locator("main").evaluate(el=>document.activeElement===el),"skip target "+path);
   const nav=page.locator('[data-shell-nav="'+(width<=768?"mobile":"desktop")+'"]'),links=nav.locator("a");
   await links.nth(1).focus();await page.keyboard.press("Tab");assert(await links.nth(2).evaluate(el=>document.activeElement===el));
   await page.keyboard.press("Shift+Tab");assert(await links.nth(1).evaluate(el=>document.activeElement===el));
   assert(await links.nth(1).evaluate(el=>getComputedStyle(el).outlineStyle!=="none"),"focus outline");
   const footer=page.locator('footer a[href="/nguon-tham-khao"]');await footer.focus();
   await page.waitForFunction(()=>{const el=document.activeElement,r=el.getBoundingClientRect(),n=document.querySelector(".shell-v2-mobile"),h=document.querySelector(".shell-v2-header"),bottom=getComputedStyle(n).display!=="none"?n.getBoundingClientRect().top:innerHeight,top=getComputedStyle(h).position==="sticky"?h.getBoundingClientRect().bottom:0;return r.bottom<=bottom+1&&r.top>=top-1},null,{timeout:5000});
  }
 }
 // Browser back/forward and private search DOM replacement preserve current shell.
 phase="history";
 await page.setViewportSize({width:390,height:844});await page.goto(web+"/");
 await page.locator('[data-shell-nav="mobile"] a[href="/kham-pha"]').click();await page.waitForURL(web+"/kham-pha");
 await page.locator('[data-shell-nav="mobile"] a[href="/hanh-trinh"]').click();await page.waitForURL(web+"/hanh-trinh");
 await page.locator('[data-shell-nav="mobile"] a[href="/da-luu"]').click();await page.waitForURL(web+"/da-luu");
 await page.goBack();assert.equal(await page.locator('[data-shell-nav="mobile"] [aria-current="page"]').getAttribute("href"),"/hanh-trinh");
 await page.goForward();assert.equal(await page.locator('[data-shell-nav="mobile"] [aria-current="page"]').getAttribute("href"),"/da-luu");
 phase="private-search";await page.goto(web+"/tim-kiem#q=AI");await page.locator("[data-private-search-ready]").waitFor();assert.equal(await page.locator('[data-shell-nav="mobile"] [aria-current="page"]').getAttribute("href"),"/kham-pha");assert.equal(await page.locator("[data-shell-breadcrumb]").count(),1);
 const missing=await page.request.get(web+"/kien-thuc/article/no-such-item",{maxRedirects:0});assert.equal(missing.status(),404);
 assert.deepEqual(errors,[]);
 console.log("UX04_SHELL_BROWSER_PASS",JSON.stringify({destinations:4,routes:routes.length,widths:5,keyboard:true,skip:true,active:true,breadcrumbs:true,focusVisible:true,bottomPadding:true,history:true,privateSearch:true}));
}finally{await browser.close();}
