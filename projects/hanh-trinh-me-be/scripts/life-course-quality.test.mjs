import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const b=read("../apps/web/app/hoc-cung-con/life-course-articles.json"),i=read("../apps/web/app/hoc-cung-con/life-course-inventory.json"),p=read("../docs/life-course-quality-progress.json"),a=read("../docs/life-course-quality-audit-2026-11-25.json"),r=read("../docs/life-course-source-review-04a.json");
test("quality baseline and editorial batch preserve inventory and draft gates",()=>{
 assert.equal(a.stats.items,219);assert.equal(a.stats.sourceUrls,131);assert.equal(a.stats.invalidSources,0);assert.equal(a.stats.withoutSources,0);
 assert.equal(p.items.length,219);assert.equal(new Set(p.items.map(x=>x.key)).size,219);
 assert.equal(r.checked.length+r.pendingBaseline.length,131);assert.equal(new Set([...r.checked,...r.pendingBaseline].map(x=>x.url)).size,131);
 for(const e of p.upgraded){const x=b.articles.find(y=>"article:"+y.id===e.key);assert(x);assert.equal(x.status,"draft");assert.equal(x.editorialRevision.expertReviewed,false);assert(x.sections.length>=6);assert(x.practice.length>=4);assert(e.after>=500&&e.after>e.before*1.5);assert(x.editorialRevision.claimChecks.length>=2);for(const c of x.editorialRevision.claimChecks){assert(x.sourceIds.includes(c.sourceId));assert(b.sources[c.sourceId]);}const ref=i.refs.find(y=>y.kind==="article"&&y.id===x.id);assert.equal(ref.sourceCount,x.sourceIds.length);assert.equal(ref.sectionCount,x.sections.length);}
 assert.equal(i.stats.unique,219);assert.equal(i.stats.gaps,0);assert.equal(i.stats.partial,173);
 console.log("LIFE_COURSE_QUALITY_04A_PASS: baseline, draft gates, 3 revisions, source review ledger");
});
