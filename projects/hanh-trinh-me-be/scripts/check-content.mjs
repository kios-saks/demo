import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../packages/content/",import.meta.url);
const read=file=>JSON.parse(readFileSync(new URL(file,root),"utf8"));
const d=read("articles.json"),sources=read("mock/sources.json"),manifest=read("mock/manifest.json");
const stages=new Set(d.stages.map(x=>x.slug));
const sourced=new Set(sources.map(x=>x.url));
assert.equal(stages.size,12);
assert.equal(d.articles.length,72);
assert.equal(sourced.size,sources.length,"Duplicate source URLs");
assert.equal(manifest.publicationAllowed,false,"Dev content must not auto-publish");
const slugs=new Set();const coverage={};let totalWords=0;
for(const a of d.articles){
 assert(!slugs.has(a.slug),"Duplicate article slug: "+a.slug);slugs.add(a.slug);
 assert(stages.has(a.stage),"Unknown stage: "+a.stage);
 assert(a.status==="draft","No auto-publish for health content");
 assert(a.title.length>15 && a.summary.length>35, "Article title/summary too short: "+a.slug);
 assert(a.sections.length>=4, "Article not yet expanded: "+a.slug);
 assert(a.sources.length>=2, "Need article-specific source links: "+a.slug);
 assert(a.sources.every(s=>/^https:\/\//.test(s.url)&&sourced.has(s.url)),"Unknown article source: "+a.slug);
 assert(new Set(a.sources.map(s=>s.url)).size===a.sources.length,"Repeated source: "+a.slug);
 const body=a.sections.flatMap(s=>s.paragraphs).join(" ");
 assert(body.length>=280,"Article body too short: "+a.slug);
 totalWords+=body.trim().split(/\s+/).length;
 coverage[a.stage]=(coverage[a.stage]||0)+1;
}
for(const s of stages)assert.equal(coverage[s],6,"Each stage needs exactly six guides: "+s);
console.log("OK verified editorial coverage:",slugs.size,"draft guides,",sourced.size,"unique sources",totalWords,"Vietnamese words");
