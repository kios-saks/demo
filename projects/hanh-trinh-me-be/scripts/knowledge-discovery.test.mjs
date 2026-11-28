import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {parseDiscoveryParams,discoveryHref,filterDiscovery,discoveryFacets,paginateDiscovery} from "../apps/web/lib/knowledge-discovery.mjs";
const read=name=>JSON.parse(readFileSync(new URL("../apps/web/app/hoc-cung-con/"+name+".json",import.meta.url),"utf8"));
const atlas=read("life-course-atlas"),inv=read("life-course-inventory"),entries=inv.refs.map(x=>({...x,key:x.kind+":"+x.id}));
const state=q=>parseDiscoveryParams(new URLSearchParams(q),atlas);
test("UX05 matrix all 192 cells, no lost identities or fabricated content",()=>{
 const seen=[];let cells=0,nonpriority=0;
 for(const s of atlas.stages)for(const p of atlas.pillars){
  const st=state("stage="+s.id+"&topic="+p.id),actual=filterDiscovery(entries,st),cell=inv.cells.find(x=>x.stage===s.id&&x.pillar===p.id);
  assert(cell);assert.deepEqual(actual.map(x=>x.key).sort(),[...cell.refs].sort(),cell.id);seen.push(...actual.map(x=>x.key));cells++;if(!cell.applicable)nonpriority++;
  for(const kind of ["legacy","article","lesson"]){const st2=state("stage="+s.id+"&topic="+p.id+"&kind="+kind);assert.deepEqual(filterDiscovery(entries,st2).map(x=>x.key),actual.filter(x=>x.kind===kind).map(x=>x.key));}
 }
 assert.equal(cells,192);assert.equal(nonpriority,19);assert.equal(seen.length,219);assert.equal(new Set(seen).size,219);
 console.log("UX05_MATRIX_PASS",JSON.stringify({cells,nonpriority,kindCases:576,refs:seen.length}));
});
test("UX05 repeated selections OR across choices AND across dimensions; facet counts",()=>{
 const st=state("stage=baby&stage=preteen&topic=body&topic=health&kind=lesson&kind=article");
 const expected=entries.filter(x=>["baby","preteen"].includes(x.stage)&&["body","health"].includes(x.pillar)&&["lesson","article"].includes(x.kind));
 assert.deepEqual(filterDiscovery(entries,st),expected);
 const f=discoveryFacets(entries,st,atlas);for(const s of atlas.stages)assert.equal(f.stage[s.id],entries.filter(x=>x.stage===s.id&&st.topics.includes(x.pillar)&&st.kinds.includes(x.kind)).length);
 for(const p of atlas.pillars)assert.equal(f.topic[p.id],entries.filter(x=>x.pillar===p.id&&st.stages.includes(x.stage)&&st.kinds.includes(x.kind)).length);
 for(const k of ["legacy","article","lesson"])assert.equal(f.kind[k],entries.filter(x=>x.kind===k&&st.stages.includes(x.stage)&&st.topics.includes(x.pillar)).length);
 assert.deepEqual(state(discoveryHref(st,2).split("?")[1]),{...st,page:2});
 assert.equal(filterDiscovery(entries,state("group=senior")).length,32);assert.equal(filterDiscovery(entries,state("group=senior&stage=baby")).length,19);
 assert.deepEqual(state("stage=invalid&stage=baby&stage=baby&kind=unknown&page=-1&q=private"),state("stage=baby"));
 assert(!discoveryHref(state("q=synthetic-sentinel&topic=invalid")).includes("sentinel"));
 console.log("UX05_FILTER_SEMANTICS_PASS");
});
test("UX05 pages exactly 219, stable, all stages represented, clamp and empty",()=>{
 const all=state(""),first=paginateDiscovery(entries,all,atlas);assert.equal(first.pages,10);assert.equal(first.items.length,24);assert.equal(new Set(first.items.map(x=>x.stage)).size,12);
 const keys=[];for(let page=1;page<=first.pages;page++){const result=paginateDiscovery(entries,{...all,page},atlas);assert.equal(result.page,page);assert(result.items.length<=24);keys.push(...result.items.map(x=>x.key));}
 assert.equal(keys.length,219);assert.deepEqual(keys.sort(),entries.map(x=>x.key).sort());
 assert.equal(paginateDiscovery(entries,state("page=999999"),atlas).page,10);
 const empty=inv.cells.find(c=>!c.refs.length);assert(empty);const result=paginateDiscovery(entries,state("stage="+empty.stage+"&topic="+empty.pillar+"&page=99"),atlas);assert.equal(result.total,0);assert.equal(result.page,1);assert.equal(result.pages,1);assert.deepEqual(result.items,[]);
 console.log("UX05_PAGINATION_PASS",JSON.stringify({refs:219,pages:10,limit:24}));
});
