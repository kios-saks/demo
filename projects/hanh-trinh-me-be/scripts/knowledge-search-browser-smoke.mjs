import assert from "node:assert/strict";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const web=process.env.MEBE_UX02_ORIGIN||"https://hanh-trinh-me-be-web-jn5v.onrender.com";
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 const response=await page.goto(web+"/tim-kiem",{waitUntil:"domcontentloaded",timeout:90000});
 assert.equal(response.status(),200);assert.match(response.headers()["x-robots-tag"]||"",/noindex/);assert.match(response.headers()["cache-control"]||"",/no-store/);assert.equal(response.headers()["referrer-policy"],"no-referrer");
 await page.locator("[data-unified-search]").waitFor();assert.equal(await page.locator("[data-search-entry]").count(),219);
 const ids=await page.locator("[data-search-entry]").evaluateAll(xs=>xs.map(x=>x.dataset.searchEntry));assert.equal(new Set(ids).size,219);
 for(const width of [390,768,1440]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"search overflow "+width);}
 await page.locator("#unified-q").fill("dậy thì");await Promise.all([page.waitForURL(/q=/),page.locator('form[role=search] button').click()]);
 const accented=await page.locator("[data-search-entry]").evaluateAll(xs=>xs.map(x=>x.dataset.searchEntry));assert(accented.length>0);
 await page.goto(web+"/tim-kiem?q=day+thi");assert.deepEqual(await page.locator("[data-search-entry]").evaluateAll(xs=>xs.map(x=>x.dataset.searchEntry)),accented);
 await page.goto(web+"/tim-kiem?stage=preteen&kind=lesson&topic=body");const filtered=page.locator("[data-search-entry]");assert(await filtered.count()>0);assert.equal(await page.locator('[data-search-entry]:not([data-search-stage="preteen"][data-search-kind="lesson"][data-search-topic="body"])').count(),0);
 await page.reload();assert.equal(await page.locator("#unified-stage").inputValue(),"preteen");assert.equal(await page.locator("#unified-kind").inputValue(),"lesson");assert.equal(await page.locator("#unified-topic").inputValue(),"body");
 await page.locator('a.clear-filter').click();assert.equal(await page.locator("[data-search-entry]").count(),219);await page.goBack();assert.equal(await page.locator("#unified-stage").inputValue(),"preteen");
 await page.goto(web+"/tim-kiem?q=zzzxxyyqqq");assert.equal(await page.locator("[data-search-empty]").count(),1);
 await page.goto(web+"/tim-kiem?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E");assert.equal(await page.locator("#unified-q").inputValue(),"<script>alert(1)</script>");
 await page.goto(web+"/tim-kiem?stage=so-sinh");assert(await page.locator("[data-search-entry]").count()>0);assert.equal(await page.locator('[data-search-entry]:not([data-search-kind="legacy"])').count(),0);
 assert.deepEqual(errors,[]);
 console.log("UX02_SEARCH_BROWSER_PASS",JSON.stringify({refs:219,widths:3,accentEquivalent:true,filters:true,history:true}));
}finally{await browser.close();}
