import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const web=process.env.MEBE_UX05_ORIGIN||"https://hanh-trinh-me-be-web-jn5v.onrender.com";
const read=name=>JSON.parse(readFileSync(new URL("../apps/web/app/hoc-cung-con/"+name+".json",import.meta.url),"utf8"));
const inv=read("life-course-inventory"),atlas=read("life-course-atlas");
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on("pageerror",e=>errors.push(e.message));
 const count=()=>page.locator("[data-knowledge-count]"),rows=()=>page.locator("[data-knowledge-entry]");
 const keys=()=>rows().evaluateAll(xs=>xs.map(x=>x.dataset.knowledgeEntry));
 const go=async path=>{const res=await page.goto(web+path,{waitUntil:"domcontentloaded",timeout:90000});assert.equal(res.status(),200,path);assert.match(res.headers()["cache-control"]||"",/no-store/);assert.match(res.headers()["x-robots-tag"]||"",/noindex/);await page.locator("[data-discovery-v2]").waitFor();};
 const totals=async n=>assert.equal(await count().getAttribute("data-knowledge-count"),String(n));
 await go("/kham-pha");await totals(219);assert.equal(await rows().count(),24);assert.equal(await count().getAttribute("data-discovery-pages"),"10");
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:844});
  await page.waitForFunction(m=>document.querySelector("[data-discovery-v2]").dataset.discoveryEnhanced===(m?"mobile":"desktop"),width<=768);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"overflow "+width);
  assert.equal(await page.locator("[data-discovery-open]").isVisible(),width<=768);
  assert.equal(await page.locator(".discovery-sidebar").isVisible(),width>768);
  if(width<=768){const m=await page.evaluate(()=>({row:document.querySelector("[data-knowledge-entry]").getBoundingClientRect().top,nav:document.querySelector(".mobile-reader-nav").getBoundingClientRect().top}));assert(m.row<m.nav,"first result should begin before bottom nav "+width);}
 }
 await page.setViewportSize({width:390,height:844});const open=page.locator("[data-discovery-open]");await open.waitFor();await open.click();
 const sheet=page.locator("#discovery-sheet"),form=sheet.locator("form");
 assert(await sheet.evaluate(x=>x.open));assert.equal(await form.count(),1);assert.equal(await form.locator("input[name=kind]:checked").count(),0);for(const kind of ["legacy","article","lesson"]){assert.equal(Number(await form.locator('label:has(input[name=kind][value="'+kind+'"]) small').textContent()),inv.refs.filter(x=>x.kind===kind).length);}assert(await sheet.locator("[data-discovery-close]").evaluate(x=>document.activeElement===x));
 await form.locator("details").nth(0).locator("summary").click();await form.locator('[name=stage][value=baby]').check();await form.locator('[name=stage][value=preteen]').check();
 await page.keyboard.press("Escape");await sheet.waitFor({state:"hidden"});await page.waitForFunction(()=>document.activeElement===document.querySelector("[data-discovery-open]"));await open.click();
 assert.equal(await form.locator('[name=stage]:checked').count(),0,"cancel discards draft selection");
 await form.locator('[name=stage][value=baby]').check();await form.locator('[name=stage][value=preteen]').check();
 await form.locator("details").nth(1).locator("summary").click();await form.locator('[name=topic][value=health]').check();await form.locator('[name=topic][value=body]').check();
 await form.locator("details").nth(2).locator("summary").click();await form.locator('[name=kind][value=article]').check();await form.locator('[name=kind][value=lesson]').check();
 const expected=inv.refs.filter(x=>["baby","preteen"].includes(x.stage)&&["health","body"].includes(x.pillar)&&["article","lesson"].includes(x.kind)).map(x=>x.kind+":"+x.id).sort();
 await Promise.all([page.waitForURL(u=>u.searchParams.getAll("stage").length===2,{waitUntil:"domcontentloaded",timeout:90000}),form.locator('button[type=submit]').click()]);await totals(expected.length);assert.deepEqual((await keys()).sort(),expected);
 const filteredUrl=page.url();await page.reload({waitUntil:"domcontentloaded",timeout:90000});await totals(expected.length);assert.deepEqual((await keys()).sort(),expected);
 await open.click();assert.equal(await form.locator('[name=stage]:checked').count(),2);assert.equal(await form.locator('[name=topic]:checked').count(),2);assert.equal(await form.locator('[name=kind]:checked').count(),2);await page.keyboard.press("Escape");await sheet.waitFor({state:"hidden"});
 await Promise.all([page.waitForURL(web+"/kham-pha",{waitUntil:"domcontentloaded",timeout:90000}),page.locator(".discovery-chips [data-discovery-clear]").click()]);await totals(219);
 await page.goBack({waitUntil:"domcontentloaded",timeout:90000});assert.equal(page.url(),filteredUrl);await totals(expected.length);await page.goForward({waitUntil:"domcontentloaded",timeout:90000});await totals(219);
 // Real pagination links; union verified independently by UX-01 regression over all pages.
 await Promise.all([page.waitForURL(u=>u.searchParams.get("page")==="2",{waitUntil:"domcontentloaded",timeout:90000}),page.locator('.discovery-pagination a[data-discovery-page="2"]').first().click()]);assert.equal(await count().getAttribute("data-discovery-current-page"),"2");assert.equal(await rows().count(),24);
 await go("/kham-pha?group=senior&page=2");await totals(32);assert.equal(await rows().count(),8);
 await go("/kham-pha?group=senior&stage=baby");await totals(19);
 const empty=inv.cells.find(c=>!c.refs.length);await go("/kham-pha?stage="+empty.stage+"&topic="+empty.pillar);await totals(0);assert.equal(await rows().count(),0);assert(await page.locator("[data-discovery-empty]").isVisible());
 await go("/kham-pha?stage=invalid&topic=invalid&kind=invalid&page=999999");await totals(219);assert.equal(await count().getAttribute("data-discovery-current-page"),"10");
 await page.setViewportSize({width:1440,height:844});await go("/kham-pha");await page.locator(".discovery-sidebar").waitFor();assert(await page.locator("#discovery-inline").evaluate(x=>x.open));assert.equal(await page.locator('#discovery-filter input[name=topic]').count(),16);
 assert.deepEqual(errors,[]);
 console.log("UX05_DISCOVERY_BROWSER_PASS",JSON.stringify({refs:219,widths:5,limit:24,filters:true,facets:true,history:true,empty:true,pagination:true,mobileSheet:true,focusReturn:true,desktopSidebar:true}));
}finally{await browser.close();}
