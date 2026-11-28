import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";

const root=new URL("../",import.meta.url);
const read=path=>readFileSync(new URL(path,root),"utf8");
const content=JSON.parse(read("packages/content/articles.json"));
const media=new Set();
for(const article of content.articles){
 media.add(article.media.cover.src);
 for(const item of article.media.inline||[])media.add(item.src);
}
assert.equal(media.size,99,"Expected all 72 covers and 27 infographic assets");

// Original 1200x675 covers, 1200x640 curated infographics and 1200x720
// generated infographics must retain their own viewBoxes and full visibility.
const checked={covers:0,infographics:0};
for(const publicUrl of media){
 const path="apps/web/public"+publicUrl;
 assert(existsSync(new URL(path,root)),"Missing media: "+publicUrl);
 const xml=read(path);
 const header=xml.match(/<svg\b[^>]*>/)?.[0];
 assert(header,"Invalid SVG header: "+publicUrl);
 const width=Number(header.match(/\bwidth="(\d+)"/)?.[1]);
 const height=Number(header.match(/\bheight="(\d+)"/)?.[1]);
 const viewBox=header.match(/\bviewBox="([^"]+)"/)?.[1];
 assert.equal(width,1200,"Unexpected SVG width: "+publicUrl);
 const isCover=publicUrl.includes("cover-");
 const expectedHeight=isCover?675:publicUrl.includes("auto-infographic-")?720:640;
 assert.equal(height,expectedHeight,"Unexpected SVG ratio: "+publicUrl);
 assert.equal(viewBox,"0 0 "+width+" "+height,"SVG viewBox clips native canvas: "+publicUrl);
 checked[isCover?"covers":"infographics"]++;
}
assert.equal(checked.covers,72);
assert.equal(checked.infographics,27);

const styles=[
 "apps/web/app/globals.css",
 "apps/web/app/ui-ux-pro-max.css",
 "apps/web/public/dev-review-pro.css",
 "apps/web/public/reader-ecosystem.css",
 "apps/web/lib/dev-preview.ts"
];
for(const path of styles){
 const css=read(path);
 assert(!/object-fit\s*:\s*cover\b/.test(css),"Image cropping CSS found in "+path);
}
const publicStyles=read("apps/web/app/ui-ux-pro-max.css");
assert(publicStyles.includes(".journey-card-image{position:relative;display:block;aspect-ratio:16/9"),"Stage preview frame must match 16:9");
assert(publicStyles.includes(".journey-card-image img{width:100%;height:100%;display:block;object-fit:contain}"),"Stage image must be fully visible");
assert(publicStyles.includes(".article-card-visual{aspect-ratio:16/9;height:auto;object-fit:contain}"),"Article thumbnails must match 16:9");
assert(publicStyles.includes(".stage-head .stage-image{width:100%;height:auto;aspect-ratio:auto;object-fit:contain"),"Stage hero must retain source dimensions");
assert(publicStyles.includes(".hero-editorial-image{width:100%;height:auto;aspect-ratio:auto;max-height:none;object-fit:contain"),"Home hero must not crop");
const readerStyles=read("apps/web/public/dev-review-pro.css");
assert(readerStyles.includes(".item img.thumb,.item>.thumb-empty{width:100%;height:auto;aspect-ratio:16/9;object-fit:contain"),"DEV article thumbnails must match 16:9");
assert(readerStyles.includes(".stage-tile img,.stage-tile .thumb-empty{width:100%;height:auto;object-fit:contain;aspect-ratio:16/9"),"DEV stage previews must be fully visible");
const readerShell=read("apps/web/lib/dev-preview.ts");
assert(readerShell.includes(".article-cover img{width:100%;height:auto;display:block;aspect-ratio:auto;object-fit:contain"),"DEV full covers must preserve source ratio");
assert(readerShell.includes(".infographic-figure img{width:100%;height:auto;"),"DEV infographics must preserve their own heights");
console.log("PASS image ratios: "+checked.covers+" 16:9 covers, "+checked.infographics+" uncropped infographics, 5 CSS sources without cropping");

const briefs=JSON.parse(read("packages/content/mock/editorial-visual-briefs.json"));
const info=JSON.parse(read("packages/content/mock/infographic-cards.json"));
const curated=JSON.parse(read("packages/content/mock/editorial-curated-infographics.json"));
const allInfo=new Map(info.cards.map(c=>[c.articleSlug,c]));
for(const [slug,c] of Object.entries(curated))allInfo.set(slug,c);
assert.equal(Object.keys(briefs.coverBriefs).length,72);
assert.equal(new Set(Object.values(briefs.coverBriefs).map(v=>JSON.stringify(v))).size,72,"Every article must have a distinct scene brief");
assert.equal(Object.keys(briefs.navigation).length,19);
const artworks=new Set();
function validateEditorial(name,width,height){
 const svg=read("apps/web/public/media/editorial-"+name+".svg");
 assert(svg.includes('width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'"'),"Wrong artwork dimensions "+name);
 assert(!/\bDEV\b|<script|<foreignObject|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(svg),"Unexpected environment label or remote dependency "+name);
 if(!name.startsWith("infographic-")){
  assert(!/<text\b/.test(svg),"Cover should not repeat titles or logos "+name);
  const body=svg.slice(svg.indexOf(">")+1);
  assert(!artworks.has(body),"Duplicate scene "+name);artworks.add(body);
 }
 assert(Buffer.byteLength(svg)<50000,"Oversize SVG "+name);
 return svg;
}
for(const a of content.articles){
 assert(briefs.coverBriefs[a.slug],"Missing brief "+a.slug);
 validateEditorial("cover-"+a.slug,1200,675);
 if(a.media.inline?.length){
  const c=allInfo.get(a.slug);assert(c,"Missing infographic brief "+a.slug);
  const svg=validateEditorial("infographic-"+a.slug,720,c.points.length===4?1320:1100);
  assert(svg.includes("Chưa thẩm định y khoa."),"Required editorial disclaimer");
  assert(svg.includes("Nguồn:"),"Required source label");
  assert(a.sources.some(s=>s.url===a.media.inline[0].sourceUrl),"Infographic source must belong to article");
 }
}
for(const name of Object.keys(briefs.navigation))validateEditorial(name,1200,675);
assert.equal(artworks.size,91);
assert.equal(allInfo.size,27);
console.log("PASS: 118 original editorial assets; 91 distinct text-free scenes and 27 portrait diagrams, source references retained, SVG < 50 KB each.");
