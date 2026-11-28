import assert from "node:assert/strict";

// Wait for the actual SSR stage document, not an early aria-pressed node.
export async function selectCourseStage(page,web,stage){
  const button=page.locator('[data-life-stage="'+stage.id+'"]');
  if(await page.locator('[data-course-compat-v3="1"]').count()){
   // Native GET stage navigation: aria-pressed is parsed near the beginning
   // of the streamed SSR document, before all A–Z article nodes are parsed.
   // Arm the navigation wait before clicking; require the actual target URL
   // and a completed document, independently of the expected article count.
   const [navigation]=await Promise.all([
    page.waitForNavigation({waitUntil:"load",timeout:90000}),
    button.click()
   ]);
   assert(navigation,"SSR stage navigation response "+stage.id);
   assert.equal(navigation.status(),200,"SSR stage HTTP "+stage.id);
   const target=new URL(page.url());
   assert.equal(target.origin,new URL(web).origin);
   assert.equal(target.pathname,"/hoc-cung-con");
   assert.equal(target.searchParams.get("stage"),stage.id);
   await page.locator('[data-course-compat-v3="1"][data-course-stage="'+stage.id+'"][data-course-ready="1"]').waitFor();
   assert.equal(await page.evaluate(()=>document.readyState),"complete");
   console.log("UX09_STAGE_SSR_READY",JSON.stringify({stage:stage.id,status:navigation.status(),readyState:"complete"}));
  }else{
   await button.click();
  }
  await page.waitForFunction(id=>document.querySelector('[data-life-stage="'+id+'"]')?.getAttribute("aria-pressed")==="true",stage.id);
}
