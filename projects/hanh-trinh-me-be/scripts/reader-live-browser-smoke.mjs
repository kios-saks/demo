import assert from "node:assert/strict";
import {chromium} from "playwright";
const origin="https://hanh-trinh-me-be-web-jn5v.onrender.com";
const browser=await chromium.launch({headless:true});
try {
 const guest=await browser.newContext();
 const res=await guest.request.get(origin+"/bai-viet/ngu-an-toan-cho-tre-so-sinh");
 assert.equal(res.status(),200,"DEV link must open without invitation");
 assert.match(res.headers()["x-robots-tag"]||"",/noindex/);
 assert.match(await res.text(),/Chưa được thẩm định y khoa/);
 assert.equal((await guest.request.get(origin+"/api/media-admin/session")).status(),404,"Guest CMS access must remain denied");
 assert.equal((await guest.request.get(origin+"/api/media-admin/catalog")).status(),404);
 await guest.close();
 console.log("PASS live link access and CMS guest denial");
 const ctx=await browser.newContext({viewport:{width:390,height:844}});
 const page=await ctx.newPage();
 const errors=[];page.on("pageerror",()=>errors.push(true));
 await page.goto(origin+"/hanh-trinh");
 await page.locator("[data-journey-save]").waitFor({state:"visible"});
 await page.locator("[data-clear-reader]").click();
 await page.locator("[data-journey-select]").selectOption("so-sinh");
 await page.locator("[data-journey-save]").click();
 const plan=page.locator('[data-journey-plan="so-sinh"]');
 await plan.waitFor({state:"visible"});
 assert.equal(await page.locator("[data-journey-plan]:visible").count(),1);
 const boxes=plan.locator("[data-checklist-key]"),n=await boxes.count();
 assert(n>0);
 assert.equal(await plan.locator("[data-save-slug]").count(),6);
 await boxes.first().check();
 assert.equal(await plan.locator("[data-journey-progress]").textContent(),"1/"+n+" việc đã đánh dấu");
 const key=await boxes.first().getAttribute("data-checklist-key");
 for(const peer of await page.locator('[data-checklist-key="'+key+'"]').all())assert(await peer.isChecked());
 const bookmark=plan.locator("[data-save-slug]").first();
 await bookmark.click();assert.equal(await bookmark.getAttribute("aria-pressed"),"true");
 await page.reload();await plan.waitFor({state:"visible"});
 assert(await boxes.first().isChecked());assert.equal(await bookmark.getAttribute("aria-pressed"),"true");
 assert.equal(await plan.locator("[data-journey-progress]").textContent(),"1/"+n+" việc đã đánh dấu");
 for(const width of [390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"Journey horizontal overflow");
  console.log("PASS live responsive "+width);
 }
 await plan.locator("[data-checklist-reset]").click();assert(!(await boxes.first().isChecked()));
 assert.equal(await plan.locator("[data-journey-progress]").textContent(),"0/"+n+" việc đã đánh dấu");
 await page.locator("[data-clear-reader]").click();
 assert.equal(await page.locator("[data-journey-select]").inputValue(),"");
 assert(!(await plan.isVisible()));assert.equal(errors.length,0);
 console.log("PASS LIVE_PERSONAL_JOURNEY: stage, checklist, progress, persistence, bookmark, reset, clear, responsive, open reader and CMS denial");
 await ctx.close();
} catch { console.error("FAIL live browser: assertion or navigation failed (assertion details suppressed)");process.exitCode=1; }
finally {await browser.close();}
