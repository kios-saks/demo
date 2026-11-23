import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const root=new URL("../packages/content/",import.meta.url);
const read=file=>JSON.parse(readFileSync(new URL(file,root),"utf8"));
const d=read("articles.json"),sources=read("mock/sources.json"),manifest=read("mock/manifest.json");
const stages=new Set(d.stages.map(x=>x.slug));
const canonical=url=>url.replace(/\/+$/,"").toLowerCase();
const sourced=new Set(sources.map(x=>canonical(x.url)));
assert.equal(stages.size,12);
assert.equal(d.articles.length,72);
assert(sourced.size>=40,"At least 40 distinct source URLs required");
assert.equal(manifest.publicationAllowed,false,"Dev content must not auto-publish");
const slugs=new Set();const coverage={};let totalWords=0;
for(const a of d.articles){
 assert(!slugs.has(a.slug),"Duplicate article slug: "+a.slug);slugs.add(a.slug);
 assert(stages.has(a.stage),"Unknown stage: "+a.stage);
 assert(a.status==="draft","No auto-publish for health content");
 assert(a.title.length>15 && a.summary.length>35, "Article title/summary too short: "+a.slug);
 assert(a.sections.length>=4, "Article not yet expanded: "+a.slug);
 assert(a.sources.length>=2, "Need article-specific source links: "+a.slug);
 assert(a.sources.every(s=>/^https:\/\//.test(s.url)&&sourced.has(canonical(s.url))),"Unknown article source: "+a.slug);
 assert(new Set(a.sources.map(s=>s.url)).size===a.sources.length,"Repeated source: "+a.slug);
 const body=a.sections.flatMap(s=>s.paragraphs).join(" ");
 assert(body.length>=280,"Article body too short: "+a.slug);
 totalWords+=body.trim().split(/\s+/).length;
 coverage[a.stage]=(coverage[a.stage]||0)+1;
}
for(const s of stages)assert.equal(coverage[s],6,"Each stage needs exactly six guides: "+s);
console.log("OK verified editorial coverage:",slugs.size,"draft guides,",sourced.size,"unique sources",totalWords,"Vietnamese words");

// Visual pilot: six distinct licensed-original cover assets + three sourced infographics.
let covers=0,infographics=0;
const allPaths=new Set();
for(const a of d.articles){
 if(!a.media)continue;
 const validate=(asset)=>{
   assert(/^\\/media\\/[a-z0-9-]+\\.svg$/.test(asset.src),"Unsafe media URL: "+a.slug);
   assert(asset.alt.length>=20,"Illustration needs accessible alt text");
   assert(asset.license==="original" && asset.credit==="Hành Trình Mẹ & Bé","Unknown media license");
   assert(existsSync(new URL("../apps/web/public"+asset.src,import.meta.url)),"Missing media asset: "+asset.src);
   allPaths.add(asset.src);
 };
 if(a.media.cover){covers++;validate(a.media.cover)}
 assert(a.media.highlights.length===3,"Pilot article needs three carefully edited takeaways");
 for(const item of a.media.inline||[]){
   validate(item);infographics++;
   assert(item.afterSection>=0 && item.afterSection<a.sections.length,"Invalid inline visual position");
   assert(a.sources.some(s=>s.url===item.sourceUrl),"Infographic must cite article's own authoritative source");
 }
}
assert.equal(covers,6,"Expected six independent illustrated covers");
assert.equal(infographics,3,"Expected three source-specific infographics");
assert.equal(allPaths.size,9,"Duplicate visual asset");
console.log("OK visual pilot: six SVG covers, three source-linked infographics");
