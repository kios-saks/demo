import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const root=new URL("../packages/content/",import.meta.url);
const read=file=>JSON.parse(readFileSync(new URL(file,root),"utf8"));
const d=read("articles.json"),sources=read("mock/sources.json"),manifest=read("mock/manifest.json"),infographicBriefs=read("mock/infographic-cards.json"),stageGuides=read("mock/stage-guides.json"),deepArticles=read("mock/deep-articles.json");
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


assert.equal(stageGuides.editorialStatus,"draft","DEV guides must not be marked published");
assert.equal(stageGuides.guides.length,12,"All 12 stages need a reader guide");
const knownStages=new Set();
for(const g of stageGuides.guides){
 assert(stages.has(g.slug)&&!knownStages.has(g.slug),"Unknown or duplicate stage guide: "+g.slug);
 knownStages.add(g.slug);
 assert(g.headline.length>12&&g.overview.length>130,"Stage guide is too shallow: "+g.slug);
 assert(g.focus.length===4&&g.focus.every(([name,description])=>name.length>3&&description.length>35),"Stage focus incomplete: "+g.slug);
 assert(g.steps.length===4&&g.steps.every(step=>step.length>35),"Stage checklist incomplete: "+g.slug);
 assert(g.faqs.length===2&&g.faqs.every(([question,answer])=>question.length>10&&answer.length>45),"Stage FAQ incomplete: "+g.slug);
 assert(g.sources.length===2&&g.sources.every(([name,url])=>name.length>5&&/^https:\/\/(www\.)?(who\.int|cdc\.gov|nhs\.uk|unicef\.org)\//.test(url)),"Unsupported stage reference: "+g.slug);
}
console.log("OK 12 stage guides: four topics, four steps, two FAQ answers and two source links each");


assert.equal(deepArticles.status,"draft-clinical-review-required","Deep editorial drafts must never be auto-published");
assert.equal(deepArticles.articles.length,8,"Editorial pilot must retain eight detailed articles");
const deepSlugs=new Set();
for(const item of deepArticles.articles){
 assert(!deepSlugs.has(item.slug),"Duplicate detailed article: "+item.slug);
 deepSlugs.add(item.slug);
 const article=d.articles.find(a=>a.slug===item.slug);
 assert(article,"Unknown detailed article: "+item.slug);
 assert.equal(article.status,"draft","Deep guide cannot auto-publish: "+item.slug);
 assert(article.sections.length>=10,"Detailed guide lacks topic sections: "+item.slug);
 assert(new Set(article.sections.map(s=>s.heading)).size===article.sections.length,"Duplicated heading: "+item.slug);
 const words=article.sections.flatMap(s=>s.paragraphs).join(" ").trim().split(/\s+/).length;
 assert(words>=item.minWords,"Detailed guide below editorial threshold: "+item.slug+" ("+words+")");
 assert(article.sources.length>=2,"Detailed guide needs sources: "+item.slug);
 assert(article.readMinutes>=5,"Reading time not updated: "+item.slug);
}
console.log("OK eight detailed article drafts, 10+ sections and at least 900–1000 words each");

// Long-form coverage: require all 72 drafts to be substantive and independently referenceable.
const articleWordCount=a=>a.sections.flatMap(section=>section.paragraphs).join(" ").trim().split(/\s+/).length;
const fullDepth=d.articles.filter(a=>a.sections.length>=10&&articleWordCount(a)>=900&&a.sources.length>=2&&a.readMinutes>=5);
assert.equal(fullDepth.length,72,"Every article must have 10+ sections, >=900 words, named sources, and reading time");
for(const a of d.articles){
 assert.equal(new Set(a.sections.map(section=>section.heading)).size,a.sections.length,"Unique chapter headings: "+a.slug);
 assert(a.sections.every(section=>section.paragraphs.length>0 && section.paragraphs.every(p=>p.trim().length>0)),"Empty section: "+a.slug);
 assert(!a.lastReviewed,"No article may claim a clinical review");
}
const minLongWords=Math.min(...fullDepth.map(articleWordCount));
const maxLongWords=Math.max(...fullDepth.map(articleWordCount));
console.log("OK full editorial depth: 72/72 drafts with 10+ sections, "+minLongWords+"–"+maxLongWords+" words each (not clinically approved)");

// Full coverage: 72 original covers, 3 custom infographics and 24 generated source-linked diagrams.
assert.equal(infographicBriefs.editorialStatus,"draft");
assert.equal(infographicBriefs.cards.length,24);
const infographicMap=new Map(infographicBriefs.cards.map(b=>[b.articleSlug,b]));
assert.equal(infographicMap.size,24,"Duplicate infographic brief");
const infographicStageCounts={};
for(const b of infographicBriefs.cards){
 const article=d.articles.find(a=>a.slug===b.articleSlug);
 assert(article,"Infographic brief points to missing article: "+b.articleSlug);
 assert(article.sources.some(s=>s.url===b.sourceUrl),"Infographic brief source not in article: "+b.articleSlug);
 assert(Array.isArray(b.points)&&b.points.length===3&&b.points.every(p=>p.length>=18&&p.length<=85),"Invalid infographic points: "+b.articleSlug);
 infographicStageCounts[article.stage]=(infographicStageCounts[article.stage]||0)+1;
}
for(const stage of stages)assert.equal(infographicStageCounts[stage],2,"Need two generated infographics per stage: "+stage);
let covers=0,infographics=0,generated=0,curated=0,generatedInfographics=0;
const allPaths=new Set();
for(const a of d.articles){
 assert(a.media?.cover,"Every article requires a cover: "+a.slug);
 const validate=(asset)=>{
   assert(asset.src.startsWith("/media/") && /^[a-z0-9-]+[.]svg$/.test(asset.src.slice(7)),"Unsafe media URL: "+a.slug);
   assert(asset.alt.length>=20,"Illustration needs accessible alt text");
   assert(asset.license==="original" && asset.credit==="Hành Trình Mẹ & Bé","Unknown media license");
   assert(existsSync(new URL("../apps/web/public"+asset.src,import.meta.url)),"Missing media asset: "+asset.src);
   allPaths.add(asset.src);
 };
 if(a.media.cover){covers++;validate(a.media.cover);if(a.media.cover.src.includes("/auto-cover-"))generated++;else curated++;}
 if(a.media.highlights)assert(a.media.highlights.length===3,"Curated takeaways must contain three items");
 for(const item of a.media.inline||[]){
   validate(item);infographics++;
   if(item.src.startsWith("/media/auto-infographic-")){
     generatedInfographics++;
     const brief=infographicMap.get(a.slug);
     assert(brief,"Unexpected generated infographic: "+a.slug);
     assert.equal(item.src,"/media/auto-infographic-"+a.slug+".svg");
     assert.equal(item.sourceUrl,brief.sourceUrl);
     assert.deepEqual(item.points,brief.points,"Infographic text transcription mismatch: "+a.slug);
   }
   assert(item.afterSection>=0 && item.afterSection<a.sections.length,"Invalid inline visual position");
   assert(a.sources.some(s=>s.url===item.sourceUrl),"Infographic must cite article's own authoritative source");
 }
}
assert.equal(covers,72,"Expected a cover for every article");
assert.equal(generated,66,"Expected 66 generated illustrated covers");
assert.equal(curated,6,"Expected six curated illustrated covers");
assert.equal(infographics,27,"Expected three curated and 24 generated infographics");
assert.equal(generatedInfographics,24,"Expected 24 generated infographic SVGs");
assert.equal(allPaths.size,99,"Each illustration must be unique");
console.log("OK illustrated coverage: 72 unique SVG covers, 27 source-linked infographics (24 generated)");
