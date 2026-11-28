import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const catalog=JSON.parse(readFileSync(new URL("../apps/web/app/hoc-cung-con/learning-catalog.json",import.meta.url),"utf8"));
test("learning catalog draft, 7 age bands, 5 categories, unique ids and complete sources",()=>{
 assert.equal(catalog.status,"draft");assert.equal(catalog.reviewedAt,null);assert.equal(catalog.groups.length,7);assert.equal(catalog.categories.length,5);assert.equal(catalog.lessons.length,21);
 assert.equal(new Set(catalog.lessons.map(x=>x.id)).size,21);
 const ages=new Set(catalog.groups.map(x=>x.id)),cats=new Set(catalog.categories.map(x=>x.id));
 for(const age of ages)assert.equal(catalog.lessons.filter(x=>x.age===age).length,3);
 for(const cat of cats)assert(catalog.lessons.some(x=>x.category===cat));
 for(const l of catalog.lessons){assert.equal(l.status,"draft");assert(ages.has(l.age));assert(cats.has(l.category));for(const k of ["title","goal","knowledge","practice","reflection"])assert(typeof l[k]==="string"&&l[k].trim().length>=15);assert(l.sourceIds.length>=1);for(const id of l.sourceIds){assert(catalog.sources[id]);assert.equal(new URL(catalog.sources[id].url).protocol,"https:");}}
 console.log("AGE_LEARNING_CATALOG_PASS");
});
