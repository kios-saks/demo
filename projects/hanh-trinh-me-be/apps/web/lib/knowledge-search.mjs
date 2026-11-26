/** UX-02 pure, server-side, deterministic search. No query telemetry. */
import {buildKnowledgeIndex,knowledgeKinds} from "./knowledge-index.mjs";
export const normalizeKnowledge=value=>String(value??"").normalize("NFD").replace(/\p{M}/gu,"").replace(/[đĐ]/g,"d").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const words=s=>s.split(" ").filter(Boolean);
const normalizeParts=xs=>normalizeKnowledge(xs.flat(Infinity).filter(x=>typeof x==="string").join(" "));
const synonyms=[
 ["an dam","an bo sung","thuc an bo sung"],
 ["day thi","tuoi day thi","thay doi co the"],
 ["ai","tri tue nhan tao"],
 ["tai chinh","quan ly tien","quan ly chi tieu"],
 ["tuoi gia","nguoi cao tuoi","lao hoa","tuoi cao"]
];
const phrase=(text,q)=>(" "+text+" ").includes(" "+q+" ");
export function createSearchIndex(inventory,atlas,legacy,articles,lessons){
 const entries=buildKnowledgeIndex(inventory,atlas,legacy,articles,lessons);
 const payload=new Map();
 for(const [kind,items] of [["legacy",legacy],["article",articles],["lesson",lessons]])for(const item of items)payload.set(kind+":"+(kind==="legacy"?item.slug:item.id),item);
 return entries.map(entry=>{
  const item=payload.get(entry.key),stage=atlas.stages.find(s=>s.id===entry.stage),pillar=atlas.pillars.find(p=>p.id===entry.pillar);
  const originalStage=entry.kind==="legacy"?item.stage:"";
  // Metadata and body must come from the same live corpus projection.
  if(entry.kind==="legacy"&&(!Array.isArray(item.sections)||!item.sections.length||item.sections.some(s=>typeof s.heading!=="string"||!Array.isArray(s.paragraphs)||!s.paragraphs.length||s.paragraphs.some(p=>typeof p!=="string"))))throw Error("Incomplete legacy body");
  const body=entry.kind==="lesson"?[item.knowledge,item.practice,item.reflection]:entry.kind==="article"?[(item.sections||[]).flatMap(s=>[s.heading,s.body]),item.practice,item.limits]:item.sections.flatMap(s=>[s.heading,s.paragraphs]);
  return {...entry,originalStage,stageLabel:stage.age+" · "+stage.title,topicLabel:pillar.title,
   fields:{title:normalizeKnowledge(entry.title),meta:normalizeParts([entry.summary,item.tags||[],pillar.title,stage.age,stage.title]),body:normalizeParts(body)}};
 });
}
export function parseSearchParams(params,atlas,legacyStages=[]){
 const valid=(key,values)=>{const value=params.get(key)||"";return values.includes(value)?value:"";};
 return {q:(params.get("q")||"").trim().slice(0,240),stage:valid("stage",[...atlas.stages.map(s=>s.id),...legacyStages]),topic:valid("topic",atlas.pillars.map(p=>p.id)),kind:valid("kind",knowledgeKinds)};
}
function oneEdit(a,b){
 if(a===b)return true;if(Math.abs(a.length-b.length)>1)return false;
 if(a.length===b.length){const diff=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])diff.push(i);return diff.length===1||(diff.length===2&&diff[1]===diff[0]+1&&a[diff[0]]===b[diff[1]]&&a[diff[1]]===b[diff[0]]);}
 if(a.length>b.length)[a,b]=[b,a];let i=0,j=0,edits=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;}else{j++;if(++edits>1)return false;}}return true;
}
function matchScore(fields,q){
 const tokens=[...new Set(words(q))],title=fields.title,meta=fields.meta,body=fields.body;
 const all=(text)=>tokens.every(t=>phrase(text,t));
 if(title===q)return 1000;
 if(phrase(title,q))return 850;
 if(all(title))return 750;
 if(all(title+" "+meta))return 500+tokens.filter(t=>phrase(title,t)).length/Math.max(1,tokens.length)*100;
 if(all(title+" "+meta+" "+body))return 250+tokens.filter(t=>phrase(title+" "+meta,t)).length/Math.max(1,tokens.length)*100;
 // Fuzzy: one missing token, one edit against title. Short words require >=2 other exact title tokens.
 const missing=tokens.filter(t=>!phrase(title+" "+meta,t));
 if(missing.length===1){
  const token=missing[0],rest=tokens.filter(t=>t!==token),titleHits=rest.filter(t=>phrase(title,t)).length;
  const long=token.length>=5&&words(title).some(t=>t.length>=4&&oneEdit(token,t));
  const short=token.length===4&&rest.length>=2&&titleHits===rest.length&&words(title).some(t=>t.length>=3&&oneEdit(token,t));
  if(long||short)return 100+titleHits/Math.max(1,rest.length)*30;
 }
 return 0;
}
export function searchKnowledge(index,filters={}){
 const raw=String(filters.q||"").trim(),q=normalizeKnowledge(raw);
 if(raw&&!q)return [];
 const variants=new Set([q]);
 const concise=q.replace(/^(lam sao de|lam the nao de|cach|toi muon tim hieu ve) /,"").replace(/ (nhu the nao|la gi|can lam gi)$/,"").trim();
 if(concise&&concise!==q)variants.add(concise);
 for(const group of synonyms)for(const from of group)if(phrase(q,from))for(const to of group)if(to!==from)variants.add((" "+q+" ").replace(" "+from+" "," "+to+" ").trim());
 const matches=[];
 for(const row of index){
  if(filters.stage&&row.stage!==filters.stage&&row.originalStage!==filters.stage)continue;
  if(filters.topic&&row.pillar!==filters.topic)continue;
  if(filters.kind&&row.kind!==filters.kind)continue;
  let score=q?matchScore(row.fields,q):1;
  if(q)for(const alt of variants)if(alt!==q){const value=matchScore(row.fields,alt);if(value)score=Math.max(score,Math.min(value-30,820));}
  if(score)matches.push({row,score});
 }
 return matches.sort((a,b)=>b.score-a.score||(a.row.key<b.row.key?-1:a.row.key>b.row.key?1:0)).map(x=>x.row);
}
