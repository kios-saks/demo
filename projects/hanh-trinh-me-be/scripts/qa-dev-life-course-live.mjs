// Post-deploy acceptance only; never a pre-deploy required check.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {chromium} from "playwright";
const web="https://hanh-trinh-me-be-web-jn5v.onrender.com";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const inv=read("apps/web/app/hoc-cung-con/life-course-inventory.json");
const atlas=read("apps/web/app/hoc-cung-con/life-course-atlas.json");
const bundle=read("apps/web/app/hoc-cung-con/life-course-articles.json");
const lessons=read("apps/web/app/hoc-cung-con/learning-catalog.json");
const legacy=read("packages/content/articles.json").articles;
const sorted=x=>[...x].sort();
const same=(actual,expected,label)=>assert.deepEqual(sorted(actual),sorted(expected),label);
const health=await fetch(web+"/api/health",{signal:AbortSignal.timeout(90000)}).then(r=>r.json());
assert.equal(health.ok,true);assert.equal(health.mode,"combined-dev");assert.equal(health.backend,"ready");
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 const res=await page.goto(web+"/hoc-cung-con",{waitUntil:"domcontentloaded",timeout:90000});
 assert.equal(res.status(),200);
 assert.match((await page.locator('meta[name="robots"]').getAttribute("content"))||"",/noindex/i);
 await page.locator("[data-life-stage]").first().waitFor();
 assert.equal(await page.locator("[data-life-stage]").count(),12);
 assert.match(await page.locator("[data-life-coverage]").innerText(),/219/);
 assert.ok(!(await page.locator("body").innerText()).includes("Bản biên tập DEV"),"No internal workflow wording");
 assert.equal(await page.locator('nav a[href="/gia-dinh-demo"]').count(),0,"Synthetic family hidden from navigation");
 assert.match(await page.locator(".learn-note").innerText(),/chưa được thẩm định chuyên môn/i);
 same(await page.locator("[data-learning-lesson]").evaluateAll(xs=>xs.map(x=>x.dataset.learningLesson)),lessons.lessons.map(x=>x.id),"21 lesson ids");
 for(const l of lessons.lessons){
  const node=page.locator('[data-learning-lesson="'+l.id+'"]');
  await node.locator("summary").click();
  assert.ok((await node.innerText()).includes(l.knowledge),"Lesson body "+l.id);
  await node.locator("summary").click();
 }
 const seenRefs=[],seenArticles=[];
 for(const stage of atlas.stages){
  await page.locator('[data-life-stage="'+stage.id+'"]').click();
  await page.waitForFunction(id=>document.querySelector('[data-life-stage="'+id+'"]')?.getAttribute("aria-pressed")==="true",stage.id);
  const expected=inv.refs.filter(x=>x.stage===stage.id);
  const href=x=>x.kind==="legacy"?x.href:x.kind==="article"?"#az-"+x.id:"#lesson-"+x.id;
  const links=await page.locator("[data-life-refs] a").evaluateAll(xs=>xs.map(x=>x.getAttribute("href")));
  same(links,expected.map(href),"Stage references "+stage.id);
  assert.ok(!/\bdraft\b|cần rà soát|nhóm cần biên tập|không hiển thị bài giả/i.test(await page.locator("[data-life-coverage], [data-life-refs], .life-pillars").allTextContents().then(x=>x.join(" "))),"No internal workflow labels "+stage.id);seenRefs.push(...expected.map(x=>x.kind+":"+x.id));
  const articles=bundle.articles.filter(x=>x.stage===stage.id);
  same(await page.locator("[data-life-article]").evaluateAll(xs=>xs.map(x=>x.dataset.lifeArticle)),articles.map(x=>x.id),"Stage articles "+stage.id);
  for(const a of articles){
   const node=page.locator('[data-life-article="'+a.id+'"]');
   await node.locator("summary").click();
   assert.equal(await node.locator("details section").count(),a.sections.length,"Sections "+a.id);
   const body=await node.innerText();for(const s of a.sections)assert.ok(body.includes(s.body),"Article section "+a.id+" / "+s.heading);
   await node.locator("summary").click();seenArticles.push(a.id);
  }
  console.log("PASS DEV stage",stage.id,expected.length,articles.length);
 }
 assert.equal(new Set(seenRefs).size,219);assert.equal(new Set(seenArticles).size,126);
 assert.deepEqual(errors,[]);
 // Legacy server pages: verify the revised article body, source links, noindex and live media.
 const esc=s=>s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
 for(let i=0;i<legacy.length;i+=3)await Promise.all(legacy.slice(i,i+3).map(async a=>{
  const r=await fetch(web+"/bai-viet/"+encodeURIComponent(a.slug),{signal:AbortSignal.timeout(90000),redirect:"manual",cache:"no-store"});
  assert.equal(r.status,200,a.slug);assert.match(r.headers.get("x-robots-tag")||"",/noindex/i);
  const html=await r.text();assert.ok(html.includes('data-current-article="'+a.slug+'"'),a.slug);
  assert.ok(html.includes('data-media-source="supabase"'),"Live media "+a.slug);
  for(const s of a.sections)assert.ok(html.includes(esc(s.heading)),"Legacy heading "+a.slug);
  assert.ok(html.includes(esc(a.sections.at(-1).paragraphs.at(-1))),"Legacy revised body "+a.slug);
  assert.ok(html.includes('id="article-sources"'),"Legacy sources "+a.slug);
  assert.ok(!/Minh họa DEV|Tranh minh họa ngữ cảnh DEV|đang biên tập, chưa thẩm định/.test(html),"Reader caption copy "+a.slug);
  assert.ok(html.includes("Chưa được thẩm định y khoa"),"Medical limitation retained "+a.slug);
 }));
 assert.equal(legacy.length,72);
 console.log("DEV_LIFE_COURSE_219_PASS",JSON.stringify({legacy:72,lessons:21,articles:126,refs:219,stages:12}));
}finally{await browser.close();}
