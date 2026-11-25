import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const a=load("../apps/web/app/hoc-cung-con/life-course-atlas.json"),i=load("../apps/web/app/hoc-cung-con/life-course-inventory.json"),b=load("../apps/web/app/hoc-cung-con/life-course-articles.json"),legacy=load("../packages/content/articles.json"),lessons=load("../apps/web/app/hoc-cung-con/learning-catalog.json");
test("all existing content is inventoried once; complete 192-cell matrix and actual stats",()=>{
 assert.equal(i.cells.length,a.stages.length*a.pillars.length);
 assert.equal(new Set(i.cells.map(c=>c.id)).size,192);
 assert.equal(i.refs.length,legacy.articles.length+lessons.lessons.length+b.articles.length);
 const keys=new Set(i.refs.map(r=>r.kind+":"+r.id));assert.equal(keys.size,i.refs.length);
 for(const item of legacy.articles)assert(keys.has("legacy:"+item.slug));for(const item of lessons.lessons)assert(keys.has("lesson:"+item.id));for(const item of b.articles)assert(keys.has("article:"+item.id));
 for(const r of i.refs){assert.equal(r.status,"draft");const c=i.cells.filter(c=>c.refs.includes(r.kind+":"+r.id));assert.equal(c.length,1);assert.equal(c[0].stage,r.stage);assert.equal(c[0].pillar,r.pillar);}
 assert.equal(i.stats.unique,i.refs.length);assert.equal(i.stats.applicable,i.cells.filter(c=>c.applicable).length);assert.equal(i.stats.partial,i.cells.filter(c=>c.status==="partial-draft").length);assert.equal(i.stats.gaps,i.cells.filter(c=>c.status==="gap").length);assert.equal(i.stats.partial+i.stats.gaps,i.stats.applicable);
 for(const c of i.cells){assert(c.topic.length>8);assert(c.acceptance.length>20);assert(c.refs.every(r=>keys.has(r)));assert.equal(c.status,!c.applicable?"not-priority":c.refs.length?"partial-draft":"gap");}
});
test("deep draft articles: 4 sections, practical checklist, limitations, valid claim sources",()=>{
 assert.equal(b.status,"draft");assert.equal(b.reviewedAt,null);assert.equal(b.articles.length,11);
 for(const x of b.articles){assert.equal(x.status,"draft");assert(x.sections.length>=4);assert(x.practice.length>=3);assert(x.limits.length>=40);assert(x.sourceIds.length>=1);assert(x.sections.some(s=>s.sourceIds.length>0));for(const s of x.sections){assert(s.body.length>=150);for(const id of s.sourceIds)assert(x.sourceIds.includes(id));}for(const id of x.sourceIds){assert(b.sources[id]);assert.equal(new URL(b.sources[id].url).protocol,"https:");}}
 console.log("LIFE_COURSE_INVENTORY_CONTENT_PASS");
});
