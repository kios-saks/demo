import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const a=JSON.parse(readFileSync(new URL("../apps/web/app/hoc-cung-con/life-course-atlas.json",import.meta.url),"utf8"));
test("life-course atlas covers twelve editorial stages and sixteen pillars without fabricated school data",()=>{
 assert.equal(a.status,"editorial-roadmap");assert.equal(a.stages.length,12);assert.equal(a.pillars.length,16);
 assert.equal(new Set(a.stages.map(s=>s.id)).size,12);assert.equal(new Set(a.pillars.map(p=>p.id)).size,16);
 const ids=new Set(a.pillars.map(p=>p.id));for(const s of a.stages){assert(s.priorities.length>=4);assert(s.applicable.length>0);assert(s.applicable.every(p=>ids.has(p)));}
 assert.equal(a.directory.status,"planned");assert.equal(a.directory.schools,undefined);assert(a.directory.sources.length>=3);
 console.log("LIFE_COURSE_ATLAS_PASS");
});
