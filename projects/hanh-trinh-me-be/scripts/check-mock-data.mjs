import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
function read(path){return JSON.parse(readFileSync(new URL("../packages/content/"+path,import.meta.url),"utf8"))}
const manifest=read("mock/manifest.json"),articles=read("articles.json"),topics=read("mock/topics.json"),sources=read("mock/sources.json"),cards=read("mock/research-cards.json");
assert.equal(manifest.clinicalClaimsVerified,false);
assert.equal(manifest.publicationAllowed,false);
assert.equal(manifest.schemaVersion,1);
assert.equal(sources.length,45);assert.equal(topics.length,13);assert.equal(cards.length,12);
const stageIds=new Set(articles.stages.map(s=>s.slug)),sourceIds=new Set(sources.map(s=>s.id)),topicIds=new Set(topics.map(t=>t.id));
assert.equal(stageIds.size,articles.stages.length);
assert.equal(sourceIds.size,sources.length);assert.equal(topicIds.size,topics.length);
const seen=new Set();
for(const t of topics){for(const id of t.stageSlugs)assert(stageIds.has(id),"Unknown topic stage "+id)}
for(const s of sources){
 assert(s.id&&s.publisher&&s.title);
 assert(/^2026-11-2[12]$/.test(s.accessedAt),"Source access date must be audited");
 assert(/^https:\/\//.test(s.url),"Non-HTTPS source");
 assert(s.clinicalApproval===false,"Source is not professional endorsement");
 assert(["url-and-curated-metadata-only","original-Vietnamese-editorial-synthesis-with-link"].includes(s.usage),"Unexpected source usage");
 for(const id of s.stageSlugs)assert(stageIds.has(id));
}
for(const c of cards){
 assert(!seen.has(c.id),"Duplicate card id");seen.add(c.id);
 assert(stageIds.has(c.stageSlug),"Unknown card stage");
 assert(topicIds.has(c.topicId),"Unknown card topic");
 assert(c.sourceIds.length>0);
 for(const id of c.sourceIds)assert(sourceIds.has(id),"Unresolved source reference "+id);
 assert(c.status==="draft"&&c.reviewedAt===null&&c.reviewer===null&&!c.medicalApproval);
 assert(c.originalSummary===true);
 assert(c.title&&c.summary&&c.practicePrompt&&c.readerQuestion);
}
assert.equal(new Set(cards.map(c=>c.stageSlug)).size,articles.stages.length,"One research card per stage expected");
console.log("OK structured research mock:",sources.length,"sources",topics.length,"topics",cards.length,"draft cards");
