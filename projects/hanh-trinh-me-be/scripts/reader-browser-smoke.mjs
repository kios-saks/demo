import assert from "node:assert/strict";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const web="http://localhost:3000";
const invite=process.env.CI_READER_INVITE_TOKEN;
assert(invite,"CI invite required");
const browser=await chromium.launch({headless:true});
async function layout(page,width){
 await page.setViewportSize({width,height:900});
 await page.waitForLoadState("domcontentloaded");
 await page.locator(".reader-brand").waitFor();
 const visualMetrics=await page.evaluate(async()=>Promise.all([...document.querySelectorAll('img[src*="/media/editorial-"],img[src*="/media/lifestyle-"]')].map(async img=>{img.loading="eager";await img.decode();const r=img.getBoundingClientRect();return {src:img.getAttribute("src"),w:img.naturalWidth,h:img.naturalHeight,renderedWidth:r.width,renderedHeight:r.height}})));
 assert(visualMetrics.length>0,"Editorial images must render");
 for(const image of visualMetrics){assert(image.w>0&&image.h>0,"Broken image "+image.src);if(image.renderedWidth>0)assert(Math.abs(image.renderedWidth/image.renderedHeight-image.w/image.h)<.03,"Wrong rendered aspect ratio "+image.src);if(image.src.includes("infographic"))assert(image.h>image.w,"Portrait infographic");}
 const metrics=await page.evaluate(()=>({
   viewport:innerWidth,width:document.documentElement.scrollWidth,
   nav:getComputedStyle(document.querySelector(".mobile-reader-nav")).display,
   groups:document.querySelector(".home-stage-groups")?getComputedStyle(document.querySelector(".home-stage-groups")).gridTemplateColumns.split(" ").length:null,
   images:[...document.querySelectorAll(".home-hero-image,.group-image,.item .thumb,.article-cover img,.editorial-stage-image,.infographic-figure img,.contextual-photo img")].map(img=>getComputedStyle(img).objectFit)
 }));
 assert(metrics.width<=metrics.viewport+1,"Horizontal overflow at "+width+": "+JSON.stringify(metrics));
 assert.equal(metrics.nav==="none",width>768,"Responsive navigation "+width);
 if(metrics.groups!==null)assert.equal(metrics.groups,width<=768?2:3,"Responsive stage columns "+width);
 assert(metrics.images.every(fit=>fit==="contain"),"Cover image cropped at "+width);
}
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto(web+"/tham-gia#"+invite);
 await page.waitForURL(web+"/");
 await page.locator("[data-journey-save]").waitFor({state:"visible"});
 for(const width of [390,768,1024,1440]){
   await layout(page,width);
   assert.equal(await page.locator("[data-stage-group]").count(),6);
   assert.equal(await page.locator("[data-stage-link]").count(),12);
   assert((await page.locator("[data-article-card]").count())<=6);
   console.log("PASS homepage responsive",width);
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('[data-stage-group="so-sinh"] summary').click();
 await page.locator('[data-stage-link="so-sinh"]').click();
 await page.waitForURL(web+"/so-sinh");
 await page.getByText("Hiển thị 6/72 bài viết",{exact:true}).waitFor();
 assert.equal(await page.locator("[data-article-card]").count(),6);
 await layout(page,390);
 const save=page.locator('[data-save-slug="ngu-an-toan-cho-tre-so-sinh"]');
 await save.click();
 assert.equal(await save.getAttribute("aria-pressed"),"true");
 const check=page.locator("[data-checklist-key]").first();
 await check.check();
 await page.reload();
 await check.waitFor({state:"visible"});
 assert(await check.isChecked(),"Checklist persisted");
 await page.locator("[data-checklist-reset]").click();
 assert(!(await check.isChecked()),"Checklist reset");
 await page.locator('.mobile-reader-nav a[href="/da-luu"]').click();
 await page.waitForURL(web+"/da-luu");
 const saved=page.locator('[data-saved-item="ngu-an-toan-cho-tre-so-sinh"]');
 await saved.waitFor({state:"visible"});
 await saved.locator("a").click();
 await page.waitForURL(web+"/bai-viet/ngu-an-toan-cho-tre-so-sinh");
 for(const width of [390,768,1024,1440]){
   await layout(page,width);
   assert(await page.locator(".infographic-transcript").first().isVisible(),"Readable infographic transcript");
   const toc=page.locator(".mobile-toc");
   assert.equal(await toc.isVisible(),width<=768);
   console.log("PASS article responsive",width);
 }
 await page.setViewportSize({width:390,height:844});
 const toc=page.locator(".mobile-toc");
 assert.equal(await toc.getAttribute("open"),null);
 await toc.locator("summary").click();
 assert.notEqual(await toc.getAttribute("open"),null);
 await page.goto(web+"/tim-kiem?q=giac%20ngu");
 await page.locator('[data-article-card="ngu-an-toan-cho-tre-so-sinh"]').waitFor();
 await page.goto(web+"/hanh-trinh");
 await page.locator("[data-journey-select]").selectOption("so-sinh");
 await page.locator("[data-journey-save]").click();
 await page.locator("[data-history-opt-in]").check();
 await page.goto(web+"/bai-viet/ngu-an-toan-cho-tre-so-sinh");
 await page.locator("[data-share-article]").waitFor({state:"visible"});
 await page.goto(web+"/hanh-trinh");
 await page.locator('[data-history-item="ngu-an-toan-cho-tre-so-sinh"]').waitFor({state:"visible"});
 await page.goto(web+"/");
 assert.equal(await page.locator("[data-journey-select]").inputValue(),"so-sinh");
 await page.locator("[data-recent-link]").waitFor({state:"visible"});
 await page.goto(web+"/hanh-trinh");
 await page.locator("[data-clear-reader]").click();
 assert.equal(await page.locator("[data-journey-select]").inputValue(),"");
 assert(!(await page.locator("[data-history-opt-in]").isChecked()));
 await page.goto(web+"/da-luu");
 assert(!(await page.locator('[data-saved-item="ngu-an-toan-cho-tre-so-sinh"]').isVisible()));
 assert.deepEqual(errors,[],"No browser JavaScript errors");
 const guest=await browser.newContext();
 const response=await guest.request.get(web+"/bai-viet/ngu-an-toan-cho-tre-so-sinh");
 assert.equal(response.status(),404);
 await guest.close();
 await context.close();
 console.log("PASS reader browser flow: invitation, responsive home and reading, 12 stages, search, local bookmark, checklist, opt-in history, clear data, guest denial");
}finally{await browser.close()}
