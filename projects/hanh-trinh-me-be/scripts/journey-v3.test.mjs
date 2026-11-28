import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const atlas=read("apps/web/app/hoc-cung-con/life-course-atlas.json"),inventory=read("apps/web/app/hoc-cung-con/life-course-inventory.json"),guides=read("packages/content/mock/stage-guides.json").guides;
const stages=atlas.stages.map(x=>x.id),topics=atlas.pillars.map(x=>x.id),keys=inventory.refs.map(x=>x.kind+":"+x.id),known=new Set(keys);
const legacyMap={};for(const r of inventory.refs.filter(x=>x.kind==="legacy"))(legacyMap[r.originalStage]??=new Set()).add(r.stage);
for(const key of Object.keys(legacyMap))legacyMap[key]=[...legacyMap[key]];
const c={stages,topics,legacyMap,groupMap:{prenatal:["prenatal"],child:["baby","toddler","preschool"],school:["school","preteen","teen"],young:["adult"],adult:["early-adult","midlife"],senior:["older","later-life"]},checkKeys:guides.flatMap(g=>g.steps.map((_,i)=>g.slug+"-"+i))};
const module={exports:{}};runInNewContext(readFileSync(new URL("../apps/web/public/journey-v3.js",import.meta.url),"utf8"),{module},{timeout:1000});const a=module.exports,prefix="mebe.reader.v1.";
function storage(initial={}){const map=new Map(Object.entries(initial).map(([k,v])=>[prefix+k,JSON.stringify(v)]));let writes=0;const blocked={get:false,set:false,remove:new Set()};return {map,blocked,get writes(){return writes},getItem:k=>{if(blocked.get)throw Error("blocked");return map.get(k)??null},setItem(k,v){if(blocked.set)throw Error("quota");writes++;map.set(k,v)},removeItem(k){if(blocked.remove.has(k))throw Error("blocked");map.delete(k)}};}
const eq=(x,y)=>assert.deepEqual(Array.from(x),Array.from(y));
test("all 4096 stage subsets, canonical ordering, lazy migration, explicit empty",()=>{
 const s=storage();eq(a.interests(s,c),[]);assert.equal(s.writes,0);
 for(let mask=0;mask<4096;mask++){const selected=stages.filter((_,i)=>mask&(1<<i));a.saveInterests(s,c,[...selected].reverse());eq(a.interests(s,c),selected);}
 for(const guide of guides){const x=storage({stage:guide.slug,checklist:{[guide.slug+"-0"]:true}}),before=[...x.map];eq(a.interests(x,c),stages.filter(id=>legacyMap[guide.slug].includes(id)));assert.deepEqual([...x.map],before);a.saveInterests(x,c,[]);eq(a.interests(x,c),[]);assert.equal(a.checklist(x)[guide.slug+"-0"],true);}
 for(const [group,ids] of Object.entries(c.groupMap)){const x=storage({homeGroup:group});eq(a.interests(x,c),stages.filter(id=>ids.includes(id)));assert.equal(x.writes,0);}
 const combined=storage({stage:"thieu-nien",homeGroup:"senior"});eq(a.interests(combined,c),["preteen","teen","older","later-life"]);
 console.log("UX08_INTEREST_MIGRATION_PASS",JSON.stringify({subsets:4096,legacyStages:12,legacyGroups:6,noMigrationWrites:true,explicitEmpty:true}));
});
test("all 192 stage-topic cells and general recommendations deterministic",()=>{
 const rows=inventory.refs.map(x=>({key:x.kind+":"+x.id,stage:x.stage,topic:x.pillar}));for(const stage of stages)for(const topic of ["",...topics]){
  const selected=a.recommend(rows,stage,topic);assert(selected.length<=3);assert.equal(new Set(selected).size,selected.length);eq(selected,a.recommend(rows,stage,topic));
  const eligible=rows.filter(x=>x.stage===stage&&(!topic||x.topic===topic));assert.equal(selected.length,Math.min(3,eligible.length));assert(selected.every(id=>eligible.some(x=>x.key===id)));
 }
 const s=storage();for(const id of c.checkKeys)a.changeCheck(s,c,id,true);assert.equal(Object.keys(a.checklist(s)).length,48);a.saveInterests(s,c,[]);assert.equal(Object.keys(a.checklist(s)).length,48);a.resetCheck(s,c,"thieu-nien");assert.equal(Object.keys(a.checklist(s)).length,44);
 console.log("UX08_RECOMMEND_CHECKLIST_PASS",JSON.stringify({cells:192,general:12,checkKeys:48,progressPreserved:true}));
});
test("history default off, explicit expansion, all 219 IDs, no duplicate and clear",()=>{
 const s=storage();for(const id of keys)a.record(s,known,id);assert.equal(s.writes,0);eq(a.historyRead(s,known).keys,[]);
 const old=keys.find(k=>k.startsWith("legacy:")),other=keys.find(k=>k.startsWith("article:")),legacy=storage({historyEnabled:true,history:[old.slice(7)]});a.record(legacy,known,other);assert.equal(legacy.writes,0);eq(a.historyRead(legacy,known).keys,[old]);
 a.setConsent(legacy,known,true);eq(a.historyRead(legacy,known).keys,[old]);assert.equal(a.consent(legacy).full,true);
 a.setConsent(s,known,true);for(const id of keys)a.record(s,known,id);eq(a.historyRead(s,known).keys,[...keys].reverse());a.record(s,known,keys[0]);assert.equal(a.historyRead(s,known).keys.length,219);assert.equal(a.historyRead(s,known).keys[0],keys[0]);
 a.clearHistory(s);eq(a.historyRead(s,known).keys,[]);assert.equal(a.consent(s).full,true);a.record(s,known,keys[0]);a.setConsent(s,known,false);eq(a.historyRead(s,known).keys,[]);assert.equal(s.map.has(prefix+"historyV3"),false);a.record(s,known,keys[0]);assert.equal(s.map.has(prefix+"historyV3"),false);
 console.log("UX08_HISTORY_219_PASS",JSON.stringify({refs:219,defaultOff:true,explicitExpansion:true,clear:true,optOut:true}));
});
test("corrupt and unavailable storage never silently overwritten",()=>{
 const s=storage({interestsV3:["unknown"],checklist:{bad:"bad"}});assert.throws(()=>a.interests(s,c));assert.throws(()=>a.changeCheck(s,c,c.checkKeys[0],true));assert.equal(s.writes,0);
 const bad=storage({historyEnabled:true,historyAll:true,historyV3:"broken"});assert.throws(()=>a.record(bad,known,keys[0]));assert.equal(bad.writes,0);
 const quota=storage({stage:"so-sinh",checklist:{"so-sinh-0":true}}),before=[...quota.map];quota.blocked.set=true;assert.throws(()=>a.saveInterests(quota,c,["baby"]));assert.throws(()=>a.changeCheck(quota,c,"so-sinh-0",false));assert.deepEqual([...quota.map],before);
 quota.blocked.get=true;assert.throws(()=>a.interests(quota,c));assert.throws(()=>a.historyRead(quota,known));
 const partial=storage({historyEnabled:true,historyAll:true,historyV3:[keys[0]]});partial.blocked.remove.add(prefix+"historyV3");assert.throws(()=>a.setConsent(partial,known,false));assert.equal(a.consent(partial).enabled,false);eq(a.historyRead(partial,known).keys,[]);assert.throws(()=>a.setConsent(partial,known,true));assert.equal(a.consent(partial).enabled,false);
 console.log("UX08_STORAGE_PRIVACY_PASS");
});
