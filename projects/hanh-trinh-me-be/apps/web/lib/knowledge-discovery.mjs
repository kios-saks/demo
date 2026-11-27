/** UX-05: deterministic, bounded read-only discovery over the validated inventory. */
import {knowledgeGroups,knowledgeKinds} from "./knowledge-index.mjs";
export const discoveryPageSize=24;
export function parseDiscoveryParams(params,atlas){
 const pick=(key,valid)=>{const values=new Set(params.getAll(key).slice(0,64));return valid.filter(id=>values.has(id));};
 const stages=pick("stage",atlas.stages.map(s=>s.id));
 const group=stages.length?"":knowledgeGroups.find(g=>g.id===params.get("group"))?.id||"";
 const raw=params.get("page")||"1";
 const page=/^[1-9][0-9]{0,5}$/.test(raw)?Number(raw):1;
 return {group,stages:stages.length?stages:(knowledgeGroups.find(g=>g.id===group)?.stages||[]),topics:pick("topic",atlas.pillars.map(p=>p.id)),kinds:pick("kind",knowledgeKinds),page};
}
export function discoveryHref(state,page=1){
 const params=new URLSearchParams();
 if(state.group)params.set("group",state.group);else for(const id of state.stages)params.append("stage",id);
 for(const id of state.topics)params.append("topic",id);
 for(const id of state.kinds)params.append("kind",id);
 if(page>1)params.set("page",String(page));
 return "/kham-pha"+(params.size?"?"+params.toString():"");
}
export function filterDiscovery(entries,state,omit=""){
 return entries.filter(x=>(omit==="stage"||!state.stages.length||state.stages.includes(x.stage))&&(omit==="topic"||!state.topics.length||state.topics.includes(x.pillar))&&(omit==="kind"||!state.kinds.length||state.kinds.includes(x.kind)));
}
export function discoveryFacets(entries,state,atlas){
 const counts=(key,dimension,ids)=>{const pool=filterDiscovery(entries,state,dimension);return Object.fromEntries(ids.map(id=>[id,pool.filter(x=>x[key]===id).length]));};
 return {stage:counts("stage","stage",atlas.stages.map(s=>s.id)),topic:counts("pillar","topic",atlas.pillars.map(p=>p.id)),kind:counts("kind","kind",knowledgeKinds)};
}
export function paginateDiscovery(entries,state,atlas){
 const matches=filterDiscovery(entries,state);
 // Interleave stage queues in taxonomy order to represent the entire life course on page one.
 const queues=atlas.stages.map(s=>matches.filter(x=>x.stage===s.id)),ordered=[];
 for(let i=0;queues.some(q=>i<q.length);i++)for(const q of queues)if(q[i])ordered.push(q[i]);
 const pages=Math.max(1,Math.ceil(ordered.length/discoveryPageSize)),page=Math.min(state.page,pages);
 return {total:ordered.length,pages,page,items:ordered.slice((page-1)*discoveryPageSize,page*discoveryPageSize)};
}
