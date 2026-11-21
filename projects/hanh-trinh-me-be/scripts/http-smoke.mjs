import assert from "node:assert/strict";
const base = "http://localhost:3000", api = "http://localhost:4000";
async function ready(url, ms=50000) {
  const started=Date.now();
  while(Date.now()-started < ms){
    try { const r=await fetch(url,{signal:AbortSignal.timeout(1500)});if(r.ok)return; }catch{}
    await new Promise(resolve=>setTimeout(resolve,750));
  }
  throw new Error("Server did not become healthy: "+url);
}
await Promise.all([ready(base),ready(api+"/health")]);
async function get(url) {const res=await fetch(url,{signal:AbortSignal.timeout(15000)});assert.equal(res.status,200,url);return res;}
const health=await (await get(api+"/health")).json();assert.equal(health.ok,true);
const stages=await (await get(api+"/v1/stages")).json();assert.equal(stages.data.length,12);
const articles=await (await get(api+"/v1/articles?stage=so-sinh")).json();assert.equal(articles.meta.total,2);
for(const [url,needle] of [["/","Hành Trình"],["/so-sinh","Trẻ sơ sinh"],["/bai-viet/lam-quen-nhip-sinh-hoat-so-sinh","BẢN NHÁP"],["/tim-kiem?q=thay","Tìm điều"],["/robots.txt","/bai-viet/"],["/sitemap.xml","/so-sinh"]]){
  const body=await (await get(base+url)).text();
  assert(body.includes(needle),url+" expected text "+needle);
  console.log("PASS HTTP 200 + content:",url);
}
console.log("PASS API + web integration smoke.");
