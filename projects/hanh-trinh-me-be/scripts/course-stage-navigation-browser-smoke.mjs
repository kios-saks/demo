import assert from "node:assert/strict";
import http from "node:http";
import {selectCourseStage} from "./course-stage-navigation.mjs";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const expected=Array.from({length:16},(_,i)=>"article-"+(i+1)),stage={id:"midlife"};
let missing=false,release=null,seenRequest=false;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,"http://localhost"),id=url.searchParams.get("stage")||"";
 res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"});
 res.write('<!doctype html><html><body><section data-course-compat-v3="1" data-course-stage="'+id+'"><form action="/hoc-cung-con" method="get"><button name="stage" value="midlife" data-life-stage="midlife" aria-pressed="'+(id==="midlife")+'">Midlife</button></form>');
 const end=()=>res.end('<script>document.querySelector("section").dataset.courseReady="1"</script></section></body></html>');
 if(!id){end();return;}
 seenRequest=true;
 for(const a of expected.slice(0,3))res.write('<article data-life-article="'+a+'">body</article>');
 // Flush enough bytes for Chromium to parse the first part while the response is open.
 res.write("<!--"+"x".repeat(8192)+"-->");
 release=()=>{for(const a of expected.slice(3,missing?15:16))res.write('<article data-life-article="'+a+'">body</article>');end();release=null;};
});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const web="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const ids=()=>page.locator("[data-life-article]").evaluateAll(xs=>xs.map(x=>x.dataset.lifeArticle));
 async function run(incomplete){
  missing=incomplete;seenRequest=false;
  await page.goto(web+"/hoc-cung-con",{waitUntil:"load"});
  let settled=false;
  const navigation=selectCourseStage(page,web,stage).finally(()=>{settled=true;});
  // Attach rejection handling immediately, including when a fixture assertion fails.
  navigation.catch(()=>{});
  try{
   await page.locator('[data-life-stage="midlife"][aria-pressed="true"]').waitFor({timeout:15000});
   assert(seenRequest);assert.equal((await ids()).length,3);
   assert.equal(await page.evaluate(()=>document.readyState),"loading");
   assert.equal(settled,false,"helper must not finish during partial SSR");
  }finally{if(release)release();}
  await navigation;
  assert.equal(await page.evaluate(()=>document.readyState),"complete");
  const actual=await ids();
  if(incomplete){
   assert.equal(actual.length,15);
   assert.throws(()=>assert.deepEqual([...actual].sort(),[...expected].sort(),"Stage articles midlife"),{code:"ERR_ASSERTION"});
  }else assert.deepEqual([...actual].sort(),[...expected].sort());
 }
 await run(false);await run(true);
 console.log("UX09_SSR_SYNC_FIXTURE_PASS",JSON.stringify({partial:3,complete:16,missingRejected:15,readyState:true}));
}finally{if(release)release();if(browser)await browser.close();await new Promise(r=>server.close(r));}
