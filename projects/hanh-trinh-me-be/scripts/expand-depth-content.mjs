/**
 * Reproducible long-form editorial expansion. Source of truth for additions:
 *   packages/content/mock/depth-briefs/<stage>.json
 * Usage:
 *   node scripts/expand-depth-content.mjs
 *   node scripts/expand-depth-content.mjs --check
 *
 * This script is editorial DRAFT ONLY and never changes publication status.
 * Historical briefs are retained for reproducibility of the initial expansion.
 * After S04-AZ-04 revisions, committed edited articles and revision ledger are canonical;
 * never regenerate removed shared sections or overwrite later editorial changes.
 */
import assert from "node:assert/strict";
import {readFileSync,writeFileSync} from "node:fs";

const root=new URL("../",import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),"utf8"));
const articleFile=new URL("packages/content/articles.json",root);
const data=read("packages/content/articles.json");
const guides=read("packages/content/mock/stage-guides.json");
const deepPilot=read("packages/content/mock/deep-articles.json");
const stageNames=guides.guides.map(g=>g.slug);
const records=stageNames.flatMap(stage=>{
 const file=read("packages/content/mock/depth-briefs/"+stage+".json");
 assert.equal(file.stage,stage,"Incorrect stage in editorial brief");
 assert.equal(file.status,"draft-awaiting-clinical-review","No content can bypass review");
 return file.records.map(b=>({...b,stage}));
});
const bySlug=new Map(records.map(x=>[x.slug,x]));
assert.equal(records.length,64,"All 64 additional drafts must be authored");
assert.equal(bySlug.size,64,"Long-form briefs must be unique");
const byStage=new Map(guides.guides.map(x=>[x.slug,x]));
const headings={
 context:"Bối cảnh và điều cần hiểu",
 steps:"Chuẩn bị những việc có thể kiểm soát",
 example:"Tình huống thực tế để hình dung",
 pitfalls:"Những điều cần thận trọng",
 questions:"Câu hỏi hữu ích khi cần trao đổi",
 followup:"Theo dõi và điều chỉnh tiếp"
};
const originalPilot=new Set(deepPilot.articles.map(a=>a.slug));
assert.equal(originalPilot.size,8,"Keep the eight previously authored longform drafts");
const terms=Object.keys(headings);
const revisionProgress=read("docs/life-course-quality-progress.json");
const inventory=read("apps/web/app/hoc-cung-con/life-course-inventory.json");
const revised=new Map();
for(const rows of Object.values(revisionProgress)){
 if(!Array.isArray(rows))continue;
 for(const e of rows){
  if(!e.key?.startsWith("legacy:")||!Array.isArray(e.sourceChecks))continue;
  assert(!revised.has(e.key.slice(7)),"Duplicate legacy revision "+e.key);
  revised.set(e.key.slice(7),e);
 }
}
const canonical=url=>url.replace(/\/+$/,"").toLowerCase();
function checkRevision(article,e){
 const ref=inventory.refs.find(x=>x.kind==="legacy"&&x.id===article.slug);
 const progress=revisionProgress.items.find(x=>x.key===e.key);
 assert.equal(article.status,"draft");
 assert(!article.lastReviewed,"No implied clinical approval");
 assert.equal(e.expertReviewed,false);
 assert.equal(progress?.status,"revised-draft");
 assert.equal(progress?.expertReviewed,false);
 assert(ref&&ref.status==="draft","Missing draft inventory "+article.slug);
 assert.equal(ref.sectionCount,article.sections.length,"Inventory section count "+article.slug);
 assert.equal(ref.sourceCount,article.sources.length,"Inventory source count "+article.slug);
 assert(article.sections.some(s=>s.heading===e.addedSection),"Missing edited section "+article.slug);
 for(const h of e.removedSharedSections||[])assert(!article.sections.some(s=>s.heading===h),"Removed shared section restored "+article.slug);
 assert(e.sourceChecks.length>0&&e.sourceChecks.every(s=>article.sources.some(x=>canonical(x.url)===canonical(s.url))),"Revision source missing "+article.slug);
 assert(article.sections.length>=10&&wordCount(article)>=minWords,"Revised draft below longform threshold "+article.slug);
 assert.equal(new Set(article.sections.map(s=>s.heading)).size,article.sections.length,"Duplicate heading "+article.slug);
 assert(article.sections.every(s=>s.paragraphs.length&&s.paragraphs.every(p=>p.trim())),"Empty section "+article.slug);
 assert(article.sources.length>=2&&article.readMinutes>=5,"Incomplete longform metadata "+article.slug);
}

const wordCount=article=>article.sections.flatMap(s=>s.paragraphs).join(" ").trim().split(/\s+/).length;
const minWords=900;
function additions(article){
 const b=bySlug.get(article.slug);
 const guide=byStage.get(article.stage);
 assert(guide && b && b.stage===article.stage,"Missing, or wrong-stage brief for "+article.slug);
 for(const field of terms){
  assert(typeof b[field]==="string" && b[field].trim().split(/\s+/).length>=65,
    "Under-researched detail section "+field+" / "+article.slug);
 }
 const tailored=terms.map(key=>({heading:headings[key],paragraphs:[b[key]]}));
 const stageContext=[
  {heading:"Kết nối với chặng "+guide.headline,paragraphs:[
   guide.overview,
   guide.focus.slice(0,2).map(([title,detail])=>title+": "+detail).join(" ")
  ]},
  {heading:"Gợi ý bổ sung để tìm hiểu và trao đổi",paragraphs:[
   guide.focus.slice(2).map(([title,detail])=>title+": "+detail).join(" "),
   guide.steps.join(" "),
   guide.faqs.map(([q,a])=>q+" "+a).join(" ")
  ]}
 ];
 return [...tailored,...stageContext];
}
let changed=0;
for(const article of data.articles){
 const revision=revised.get(article.slug);
 if(revision){checkRevision(article,revision);continue;}
 if(originalPilot.has(article.slug))continue;
 assert.equal(article.status,"draft","Refuse to edit a published article");
 const added=additions(article);
 if(article.sections.length===4){
  article.sections=[...article.sections.slice(0,2),...added,...article.sections.slice(2)];
  changed++;
 }else{
  assert.equal(article.sections.length,12,"Unexpected CMS article structure for "+article.slug);
  assert.deepEqual(article.sections.slice(2,10),added,
   "Committed longform draft differs from source brief: "+article.slug);
 }
 assert.equal(new Set(article.sections.map(s=>s.heading)).size,article.sections.length,
   "Duplicate section heading "+article.slug);
 const words=wordCount(article);
 assert(words>=minWords,"Draft below 900 Vietnamese words "+article.slug+" "+words);
 article.readMinutes=Math.max(5,Math.ceil(words/190));
 assert(article.sources.length>=2,"Need two named source links: "+article.slug);
}
assert.equal(data.articles.length,72);
assert(data.articles.every(a=>a.status==="draft"),"Draft visibility must be unchanged");
assert(data.articles.every(a=>wordCount(a)>=minWords && a.sections.length>=10),"Not all 72 articles are long-form");
if(changed)data.version="2026-11-24-longform-72-v1";
if(process.argv.includes("--check")){
 assert.equal(changed,0,"Long-form source briefs have not yet been generated and committed");
 console.log("PASS 72/72 long-form drafts; 64 historical briefs retained, "+revised.size+" editorial revisions validated, all >=900 words and draft");
}else{
 if(changed)writeFileSync(articleFile,JSON.stringify(data,null,2)+"\n");
 console.log("Generated "+changed+" long-form expansions. Total 72/72 authored drafts.");
}
