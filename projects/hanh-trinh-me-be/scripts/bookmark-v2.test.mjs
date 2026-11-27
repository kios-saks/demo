import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const inv=JSON.parse(readFileSync(new URL("../apps/web/app/hoc-cung-con/life-course-inventory.json",import.meta.url),"utf8")),keys=inv.refs.map(r=>r.kind+":"+r.id),known=new Set(keys);
const module={exports:{}};runInNewContext(readFileSync(new URL("../apps/web/public/bookmark-v2.js",import.meta.url),"utf8"),{module},{timeout:1000});
const {read:load,change,oldKey,newKey}=module.exports;
function storage(initial={}){
 const map=new Map(Object.entries(initial));let writes=0,failRead=false,failWrite=false;
 return {map,get writes(){return writes},blockRead(){failRead=true},blockWrite(){failWrite=true},getItem(k){if(failRead)throw Error("blocked");return map.get(k)??null},setItem(k,v){if(failWrite)throw Error("quota");writes++;map.set(k,v)}};
}
const equal=(a,b)=>assert.deepEqual(Array.from(a).sort(),Array.from(b).sort());
test("all 219 canonical bookmarks, idempotent save/remove",()=>{
 const s=storage();for(const key of keys){change(s,known,key,true);const n=s.writes;change(s,known,key,true);assert.equal(s.writes,n);}
 equal(load(s,known).keys,keys);assert.equal(load(s,known).unavailable,0);
 assert.equal(JSON.parse(s.map.get(oldKey)).length,72);assert.equal(JSON.parse(s.map.get(newKey)).length,147);
 for(const key of keys){change(s,known,key,false);const n=s.writes;change(s,known,key,false);assert.equal(s.writes,n);}
 assert.equal(load(s,known).keys.length,0);console.log("UX07_BOOKMARK_219_PASS",JSON.stringify({refs:219,save:219,remove:219,idempotent:438}));
});
test("lossless lazy migration and rollback, duplicates and unavailable IDs",()=>{
 const legacy=keys.filter(k=>k.startsWith("legacy:")).map(k=>k.slice(7)),raw=JSON.stringify([...legacy,legacy[0],"unknown-old-slug"]),s=storage({[oldKey]:raw});
 equal(load(s,known).keys,legacy.map(k=>"legacy:"+k));assert.equal(s.writes,0);assert.equal(s.map.get(oldKey),raw);assert.equal(load(s,known).unavailable,1);
 const newId=keys.find(k=>k.startsWith("article:"));change(s,known,newId,true);assert.equal(s.map.get(oldKey),raw);
 change(s,known,"legacy:"+legacy[0],false);assert(!JSON.parse(s.map.get(oldKey)).includes(legacy[0]));assert(JSON.parse(s.map.get(oldKey)).includes("unknown-old-slug"));
 s.setItem(oldKey,JSON.stringify([legacy[0],legacy[1]]));equal(load(s,known).keys,["legacy:"+legacy[0],"legacy:"+legacy[1],newId]);
 console.log("UX07_MIGRATION_ROLLBACK_PASS",JSON.stringify({legacy:72,lossless:true,noMigrationWrites:true,rollback:true}));
});
test("corrupt/blocked/quota storage never overwritten or reported successful",()=>{
 const key=keys[0],other=keys.find(k=>k.startsWith("lesson:"));
 for(const [bucket,raw] of [[oldKey,"{"],[newKey,"{}"],[oldKey,'["invalid id"]'],[newKey,'["legacy:abc"]']]){
  const s=storage({[bucket]:raw});assert.throws(()=>load(s,known));assert.throws(()=>change(s,known,key,true));assert.equal(s.map.get(bucket),raw);assert.equal(s.writes,0);
 }
 const s=storage();change(s,known,key,true);const before=[...s.map];s.blockWrite();assert.throws(()=>change(s,known,other,true));assert.throws(()=>change(s,known,key,false));assert.deepEqual([...s.map],before);
 const blocked=storage();blocked.blockRead();assert.throws(()=>load(blocked,known));assert.throws(()=>change(blocked,known,key,true));
 assert.throws(()=>change(storage(),known,"lesson:unknown",true));console.log("UX07_STORAGE_FAIL_CLOSED_PASS");
});