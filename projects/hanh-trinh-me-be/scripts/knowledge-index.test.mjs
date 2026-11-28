import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildKnowledgeIndex,knowledgeGroups,filterKnowledge,findKnowledgeReference,compatibilityHref,knowledgeHref} from "../apps/web/lib/knowledge-index.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const path="apps/web/app/hoc-cung-con/";
const inv=read(path+"life-course-inventory.json"),atlas=read(path+"life-course-atlas.json"),bundle=read(path+"life-course-articles.json"),lessons=read(path+"learning-catalog.json"),legacy=read("packages/content/articles.json");
const build=(i=inv,l=legacy.articles)=>buildKnowledgeIndex(i,atlas,l,bundle.articles,lessons.lessons);
test("UX01: 219 stable identities, exact matrix and compatibility links",()=>{
 const rows=build();assert.equal(rows.length,219);assert.equal(new Set(rows.map(r=>r.key)).size,219);
 for(const [kind,count] of [["legacy",72],["lesson",21],["article",126]])assert.equal(rows.filter(r=>r.kind===kind).length,count);
 assert.deepEqual(knowledgeGroups.flatMap(g=>g.stages).sort(),atlas.stages.map(s=>s.id).sort());
 const selected=knowledgeGroups.flatMap(g=>filterKnowledge(rows,g.id,""));assert.equal(selected.length,219);assert.equal(new Set(selected.map(x=>x.key)).size,219);
 assert.equal(filterKnowledge(rows,"","").length,219);assert.equal(filterKnowledge(rows,"senior","baby").length,19);
 for(const r of rows){const ref=findKnowledgeReference(inv,r.kind,r.id);assert(ref);assert.equal(r.status,"draft");assert.equal(r.href,knowledgeHref(r.kind,r.id));const dest=compatibilityHref(ref);if(r.kind==="legacy")assert.equal(dest,ref.href);else assert.equal(dest,"/hoc-cung-con?stage="+ref.stage+"#"+(r.kind==="article"?"az-":"lesson-")+r.id);}
 assert.equal(findKnowledgeReference(inv,"other","x"),undefined);assert.equal(findKnowledgeReference(inv,"legacy","../x"),undefined);assert.throws(()=>knowledgeHref("article","//other"));
 console.log("UX01_INVENTORY_219_PASS");
});
test("UX01: reject missing, duplicate, corrupt or published inventory",()=>{
 assert.throws(()=>build(inv,legacy.articles.slice(1)));
 assert.throws(()=>build(inv,[...legacy.articles.slice(1),legacy.articles[1]]));
 assert.throws(()=>build(inv,legacy.articles.map((a,i)=>i===0?{...a,status:"published"}:a)));
 const changed=structuredClone(inv);changed.refs[0].originalStage="wrong";assert.throws(()=>build(changed));
 const invalid=structuredClone(inv);invalid.cells[0].refs.push(invalid.cells[0].refs[0]);assert.throws(()=>build(invalid));
});
