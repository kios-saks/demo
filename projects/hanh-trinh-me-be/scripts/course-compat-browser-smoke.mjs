import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const web=process.env.MEBE_UX09_ORIGIN||"https://hanh-trinh-me-be-web-jn5v.onrender.com";
const read=p=>JSON.parse(readFileSync(new URL("../apps/web/app/hoc-cung-con/"+p,import.meta.url),"utf8"));
const inv=read("life-course-inventory.json"),atlas=read("life-course-atlas.json"),bundle=read("life-course-articles.json"),catalog=read("learning-catalog.json");
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on("pageerror",e=>errors.push(e.message));
 const go=async(path)=>{const r=await page.goto(web+path,{waitUntil:"load",timeout:90000});assert.equal(r.status(),200);assert.match(r.headers()["content-security-policy"]||"",/script-src 'self'/);assert.match(r.headers()["x-robots-tag"]||"",/noindex/);await page.locator('[data-course-ready="1"]').waitFor();assert.equal(await page.locator('script[src*="/_next/"]').count(),0);return r;};
 const sorted=x=>[...x].sort();
 await go("/hoc-cung-con");assert.equal(await page.locator("[data-life-stage]").count(),12);assert.equal(await page.locator("[data-course-ref]").count(),219);assert.equal(await page.locator("[data-life-article]").count(),0);assert.equal(await page.locator("[data-learning-lesson]").count(),21);
 for(const l of catalog.lessons){const a=page.locator('[data-learning-lesson="'+l.id+'"]');assert((await a.textContent()).includes(l.knowledge));}
 const allRefs=[],allArticles=[];
 for(const s of atlas.stages){await go("/hoc-cung-con?stage="+s.id);assert.equal(await page.locator("[data-life-pillar]").count(),16);const refs=inv.refs.filter(x=>x.stage===s.id),articles=bundle.articles.filter(x=>x.stage===s.id);
 const actual=await page.locator("[data-course-ref]").evaluateAll(xs=>xs.map(x=>x.dataset.courseRef));assert.deepEqual(sorted(actual),sorted(refs.map(r=>r.kind+":"+r.id)));allRefs.push(...actual);
 const ids=await page.locator("[data-life-article]").evaluateAll(xs=>xs.map(x=>x.dataset.lifeArticle));assert.deepEqual(sorted(ids),sorted(articles.map(a=>a.id)));allArticles.push(...ids);
 for(const a of articles){const node=page.locator('[data-life-article="'+a.id+'"]');const body=await node.textContent();for(const sec of a.sections)assert(body.includes(sec.body),a.id);}
 const pillar=refs[0]?.pillar;if(pillar){await page.locator('[data-life-pillar="'+pillar+'"]').click();assert.equal(await page.locator("[data-course-ref]:visible").count(),refs.filter(r=>r.pillar===pillar).length);await page.locator("[data-course-all-pillars]").click();assert.equal(await page.locator("[data-course-ref]:visible").count(),refs.length);}
 }
 assert.equal(new Set(allRefs).size,219);assert.equal(new Set(allArticles).size,126);
 await go("/hoc-cung-con");await page.locator('[data-life-stage="'+atlas.stages[0].id+'"]').click();await page.locator('[data-life-stage="'+atlas.stages[0].id+'"][aria-pressed="true"]').waitFor();await page.goBack({waitUntil:"load"});await page.locator('[data-course-ready="1"]').waitFor();assert.equal(await page.locator('[data-life-stage][aria-pressed="true"]').count(),0);
 for(const kind of ["article","lesson"]){const r=inv.refs.find(r=>r.kind===kind),h=(kind==="article"?"az-":"lesson-")+r.id;await page.goto(web+"/hoc-cung-con#"+h);await page.locator("#"+h+" details[open]").waitFor();assert.equal(new URL(page.url()).hash,"#"+h);await page.reload();await page.locator("#"+h+" details[open]").waitFor();}
 await go("/hoc-cung-con");const group=catalog.groups.find(g=>catalog.lessons.some(l=>l.age===g.id));await page.locator('[data-learning-age="'+group.id+'"]').click();assert.equal(await page.locator("[data-learning-lesson]:visible").count(),catalog.lessons.filter(l=>l.age===group.id).length);await page.locator("[data-course-lesson-all]").click();await page.locator("[data-course-search]").fill(catalog.lessons[0].title);assert(await page.locator('[data-learning-lesson="'+catalog.lessons[0].id+'"]').isVisible());
 for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert(await page.locator("[data-course-ref] a").first().evaluate(el=>el.getBoundingClientRect().height>=44));}
 assert.deepEqual(errors,[]);console.log("UX09_COURSE_SSR_PASS",JSON.stringify({refs:219,articles:126,lessons:21,stages:12,pillars:16,hash:true,history:true,filter:true,widths:5,noNext:true,csp:true}));
}finally{await browser.close();}
