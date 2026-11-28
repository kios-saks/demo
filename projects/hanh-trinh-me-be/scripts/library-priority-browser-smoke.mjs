import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||"playwright");
const origin=process.env.MEBE_UX09_ORIGIN||"https://hanh-trinh-me-be-web-jn5v.onrender.com";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const expected=read("packages/content/articles.json").articles.map(a=>a.slug).sort();
const heroAsset=read("packages/content/mock/lifestyle-media.json").assets.hero;
const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,390,768,1024,1440]){
  const page=await browser.newPage({viewport:{width,height:844}});
  try{
   const response=await page.goto(origin+"/thu-vien",{waitUntil:"load",timeout:90000});
   assert.equal(response.status(),200);
   assert.match(response.headers()["x-robots-tag"]||"",/noindex/);
   assert.match(response.headers()["cache-control"]||"",/no-store/);
   const hero=page.locator("img.catalog-image");assert.equal(await hero.count(),1);
   assert.equal(await hero.getAttribute("loading"),"eager");
   assert.equal(await hero.getAttribute("fetchpriority"),"high");
   assert.equal(await page.locator("img[fetchpriority=high]").count(),1);
   const cards=page.locator("[data-article-card]");
   assert.equal(await cards.count(),72);
   const ids=await cards.evaluateAll(xs=>xs.map(x=>x.dataset.articleCard));
   assert.equal(new Set(ids).size,72);
   assert.deepEqual([...ids].sort(),expected,"all original catalog slugs");
   const images=page.locator(".catalog-hero ~ section img, [data-article-card] img");
   const attributes=await images.evaluateAll(xs=>xs.map(x=>[x.getAttribute("loading"),x.getAttribute("fetchpriority"),x.getAttribute("decoding"),x.getAttribute("width"),x.getAttribute("height")]));
   assert(attributes.length>=72);
   for(const [loading,priority,decoding,w,h] of attributes){
    assert.equal(loading,"lazy");assert.equal(priority,"low");assert.equal(decoding,"async");assert(Number(w)>0&&Number(h)>0);
   }
   await hero.evaluate(async el=>{await el.decode();});
   assert.deepEqual(await hero.evaluate(el=>[el.naturalWidth,el.naturalHeight]),[heroAsset.width,heroAsset.height]);
   const src=await hero.getAttribute("src");
   assert([heroAsset.src,"/api/dev-media/catalog/lifestyle-hero.webp"].includes(src),"original hero path");
   if(width===390){
    const asset=await page.request.get(origin+src,{timeout:90000,maxRedirects:0});
    assert.equal(asset.status(),200);
    assert.match(asset.headers()["content-type"]||"",/^image\/webp/);
    assert.equal(createHash("sha256").update(await asset.body()).digest("hex"),heroAsset.sha256,"exact original hero bytes");
    if(src.startsWith("/api/dev-media/")){
     assert.equal(asset.headers()["x-media-asset"],heroAsset.sha256);
     assert.match(asset.headers()["cache-control"]||"",/no-store/);
     assert.match(asset.headers()["x-robots-tag"]||"",/noindex/);
     assert.equal(asset.headers()["x-content-type-options"],"nosniff");
     assert.match(asset.headers()["content-security-policy"]||"",/sandbox/);
    }
    console.log("UX09_HERO_INTEGRITY_PASS",JSON.stringify({width:heroAsset.width,height:heroAsset.height,sha256:true,original:true,dynamic:src.startsWith("/api/dev-media/")}));
   }
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }finally{await page.close();}
 }
 console.log("UX09_LIBRARY_PRIORITY_PASS",JSON.stringify({widths:5,legacy:72,hero:"eager/high",secondary:"lazy/low/async"}));
}finally{await browser.close();}
