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
