/** Read-only UX-01 index. Server-side only; no editorial state changes. */
export const knowledgeGroups=[
 {id:"prenatal",label:"Chuẩn bị đón bé",stages:["prenatal"]},
 {id:"child",label:"0–5 tuổi",stages:["baby","toddler","preschool"]},
 {id:"school",label:"6–17 tuổi",stages:["school","preteen","teen"]},
 {id:"young",label:"18–22 tuổi",stages:["adult"]},
 {id:"adult",label:"23–59 tuổi",stages:["early-adult","midlife"]},
 {id:"senior",label:"60+ tuổi",stages:["older","later-life"]}
];
export const knowledgeKinds=["legacy","article","lesson"];
const validId=x=>typeof x==="string"&&/^[a-z0-9-]{1,160}$/.test(x);
export function knowledgeHref(kind,id){
 if(!knowledgeKinds.includes(kind)||!validId(id))throw Error("Invalid knowledge identity");
 return "/kien-thuc/"+kind+"/"+id;
}
export function compatibilityHref(ref){
 knowledgeHref(ref.kind,ref.id);
 if(!validId(ref.stage))throw Error("Invalid knowledge stage");
 if(ref.kind==="legacy")return "/bai-viet/"+ref.id;
 return "/hoc-cung-con?stage="+encodeURIComponent(ref.stage)+"#"+(ref.kind==="article"?"az-":"lesson-")+ref.id;
}
export function findKnowledgeReference(inventory,kind,id){
 if(!knowledgeKinds.includes(kind)||!validId(id))return undefined;
 return inventory.refs.find(r=>r.kind===kind&&r.id===id);
}
export function filterKnowledge(entries,group,stage){
 const g=knowledgeGroups.find(x=>x.id===group);
 const allowed=stage&&knowledgeGroups.some(x=>x.stages.includes(stage))?[stage]:g?.stages;
 return allowed?entries.filter(x=>allowed.includes(x.stage)):entries;
}
export function buildKnowledgeIndex(inventory,atlas,legacy,articles,lessons){
 const fail=message=>{throw Error("Knowledge inventory: "+message)};
 const stages=new Set(atlas.stages.map(x=>x.id)),pillars=new Set(atlas.pillars.map(x=>x.id));
 const grouped=knowledgeGroups.flatMap(x=>x.stages);
 if(stages.size!==12||pillars.size!==16||grouped.length!==12||new Set(grouped).size!==12||grouped.some(x=>!stages.has(x)))fail("taxonomy");
 if(inventory.cells.length!==192||new Set(inventory.cells.map(x=>x.id)).size!==192||inventory.cells.filter(x=>x.applicable).length!==173||inventory.cells.filter(x=>!x.applicable).length!==19)fail("matrix");
 const cellRefs=new Map();
 for(const c of inventory.cells){
  if(!stages.has(c.stage)||!pillars.has(c.pillar)||c.id!==c.stage+"--"+c.pillar)fail("cell");
  for(const key of c.refs){if(cellRefs.has(key))fail("duplicate cell mapping");cellRefs.set(key,c);}
 }
 const payload=new Map();
 for(const [kind,items,count] of [["legacy",legacy,72],["article",articles,126],["lesson",lessons,21]]){
  if(items.length!==count)fail("count "+kind);
  for(const item of items){
   const id=kind==="legacy"?item.slug:item.id,key=kind+":"+id;
   if(!validId(id)||payload.has(key)||item.status!=="draft")fail("identity/status "+key);
   payload.set(key,item);
  }
 }
 if(inventory.refs.length!==219||payload.size!==219||cellRefs.size!==219)fail("total");
 const seen=new Set();
 return inventory.refs.map(r=>{
  const key=r.kind+":"+r.id,item=payload.get(key),cell=cellRefs.get(key);
  if(!item||seen.has(key)||r.status!=="draft"||!cell||cell.stage!==r.stage||cell.pillar!==r.pillar||!stages.has(r.stage)||!pillars.has(r.pillar))fail("reference "+key);
  if(r.kind==="legacy"&&(item.stage!==r.originalStage||r.href!==compatibilityHref(r)))fail("legacy mapping "+key);
  if(r.kind==="article"&&(item.stage!==r.stage||item.pillar!==r.pillar))fail("article mapping "+key);
  if(r.kind==="lesson"&&item.age!==r.stage)fail("lesson mapping "+key);
  const summary=r.kind==="lesson"?item.goal:item.summary;
  if(typeof item.title!=="string"||!item.title||typeof summary!=="string"||!summary)fail("metadata "+key);
  seen.add(key);
  return {key,kind:r.kind,id:r.id,stage:r.stage,pillar:r.pillar,title:item.title,summary,href:knowledgeHref(r.kind,r.id),status:"draft"};
 });
}
