import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const root=new URL("../",import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const manifest=read("packages/content/mock/lifestyle-media.json");
const articles=new Map(read("packages/content/articles.json").articles.map(a=>[a.slug,a]));
const briefs=read("packages/content/mock/editorial-visual-briefs.json");
const keys=new Set([...Object.keys(briefs.navigation),...Object.keys(briefs.coverBriefs).map(s=>"cover-"+s),...Object.keys(briefs.coverBriefs).map(s=>"inline-"+s)]);
function dimensions(b){
 assert(b.length>=30&&b.toString("ascii",0,4)==="RIFF"&&b.toString("ascii",8,12)==="WEBP","Invalid WebP header");
 assert(b.readUInt32LE(4)+8===b.length,"Truncated or extra WebP bytes");
 const type=b.toString("ascii",12,16);
 if(type==="VP8X"){assert(!(b[20]&2),"Animated images are not accepted");return [b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1]}
 if(type==="VP8L"){assert(b[20]===47,"Invalid lossless WebP");const bits=b.readUInt32LE(21);return [(bits&16383)+1,((bits>>>14)&16383)+1]}
 if(type==="VP8 "){assert(b[23]===157&&b[24]===1&&b[25]===42,"Invalid lossy WebP");return [b.readUInt16LE(26)&16383,b.readUInt16LE(28)&16383]}
 throw new Error("Unsupported WebP chunk");
}
assert.equal(manifest.version,1);
let count=0;const hashes=new Set();
for(const [key,a] of Object.entries(manifest.assets)){
 assert(keys.has(key),"Unknown lifestyle slot: "+key);
 assert(["approved","pending"].includes(a.reviewStatus),"Unknown review status");
 assert(a.src==="/media/lifestyle-"+key+".webp","Unsafe asset path");
 if(key.startsWith("inline-")){assert(Number.isInteger(a.afterSection)&&a.afterSection>=0,"Missing article anchor");assert(typeof a.anchorHeading==="string"&&a.anchorHeading.length>0,"Missing exact section heading");assert(typeof a.caption==="string"&&a.caption.length>=15,"Missing contextual caption");assert.equal(articles.get(key.slice(7))?.sections[a.afterSection]?.heading,a.anchorHeading,"Inline asset must match exact article section");}
 assert(typeof a.alt==="string"&&a.alt.trim().length>=10,"Missing descriptive alt text");
 assert(["ai-generated","licensed","commissioned"].includes(a.origin),"Missing asset origin");
 assert(typeof a.provenance==="string"&&a.provenance.trim().length>=12,"Missing provenance");
 assert(typeof a.usageRights==="string"&&a.usageRights.trim().length>=12,"Missing rights record");
 if(a.reviewStatus!=="approved")continue;
 assert(typeof a.editorialReview==="string"&&a.editorialReview.trim().length>=12,"Missing editorial review");
 const b=readFileSync(new URL("apps/web/public"+a.src,root));
 const [w,h]=dimensions(b);
 assert(w>=960&&w<=1920&&Math.abs(w-h*16/9)<=1,"Expected 16:9 with width 960–1920");
 assert.equal(a.width,w);assert.equal(a.height,h);
 assert(b.length<=200000,"WebP exceeds 200 KB");
 const hash=createHash("sha256").update(b).digest("hex");
 assert.equal(a.sha256,hash,"Asset checksum mismatch");
 assert(!hashes.has(hash),"Duplicate lifestyle asset");hashes.add(hash);count++;
}
console.log("PASS lifestyle asset registry: "+count+" approved local WebP assets; fallback available for remaining slots");

const context=read("packages/content/mock/contextual-inline-illustrations.json");
const contextHashes=new Set();
for(const [slug,a] of Object.entries(context.assets)){
 assert(articles.has(slug),"Unknown context illustration "+slug);
 assert.equal(a.kind,"editorial-context-vector");
 assert.equal(a.reviewStatus,"dev-context-only");
 assert.equal(a.src,"/media/editorial-inline-context-"+slug+".svg");
 assert.equal(articles.get(slug).sections[a.afterSection]?.heading,a.anchorHeading);
 assert(a.alt.length>=20&&a.caption.length>=20);
 const s=readFileSync(new URL("apps/web/public"+a.src,root),"utf8");
 assert(s.includes('width="1200" height="675" viewBox="0 0 1200 675"'));
 assert(!/<(?:text|script|foreignObject)\b|https?:\/\/(?!www\.w3\.org\/2000\/svg)|\bon\w+=/i.test(s),"Unexpected SVG content");
 assert(Buffer.byteLength(s)<50000);
 const h=createHash("sha256").update(s).digest("hex");
 assert(!contextHashes.has(h),"Duplicate context SVG");contextHashes.add(h);
}
for(const slug of articles.keys())assert(manifest.assets["inline-"+slug]?.reviewStatus==="approved"||context.assets[slug]?.reviewStatus==="dev-context-only","Missing dedicated contextual image "+slug);
console.log("PASS dedicated context media coverage: "+articles.size+"/72; photos and original vector illustrations counted separately.");
