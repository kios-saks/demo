import assert from "node:assert/strict";
const base="http://localhost:3000",api="http://localhost:4000";
async function ready(url,ms=60000){
 const started=Date.now();
 while(Date.now()-started<ms){
   try{const r=await fetch(url,{signal:AbortSignal.timeout(1500)});if(r.ok)return;}catch{}
   await new Promise(resolve=>setTimeout(resolve,500));
 }
 throw new Error("Server did not become healthy: "+url);
}
await Promise.all([ready(base),ready(api+"/health")]);
async function check(path,expected,needle){
 const r=await fetch(base+path,{signal:AbortSignal.timeout(15000)});
 assert.equal(r.status,expected,base+path);
 if(needle)assert((await r.text()).includes(needle),path+" missing "+needle);
 console.log("PASS Web HTTP",expected,path);
}
const health=await (await fetch(api+"/health")).json();
assert.equal(health.ok,true);
const stages=await (await fetch(api+"/v1/stages")).json();
assert.equal(stages.data.length,12);
const articles=await (await fetch(api+"/v1/articles")).json();
assert.equal(articles.meta.total,0,"No unreviewed article may be exposed on production API");
await check("/search",404);
await check("/",200,"Hành Trình");
await check("/so-sinh",200,"Trẻ sơ sinh");
await check("/bai-viet/lam-quen-nhip-sinh-hoat-so-sinh",404);
await check("/tim-kiem?q=thay",200,"Hôm nay bạn muốn tìm hiểu");
await check("/robots.txt",200,"/bai-viet/");
await check("/sitemap.xml",200,"/so-sinh");
await check("/nguon-tham-khao",200,"WHO");
await check("/goc-nghien-cuu",404);
await check("/bien-tap",404);
await check("/admin",404);
const home=await (await fetch(base+"/")).text();
assert(!home.includes("Làm quen nhịp sinh hoạt của trẻ sơ sinh"));
const role=await fetch(api+"/v1/admin/articles");
assert([401,503,404].includes(role.status),"CMS must be protected");
console.log("PASS public release: no drafts, no internal editorial previews.");
