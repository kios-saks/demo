import assert from "node:assert/strict";
const web="http://127.0.0.1:3000",api="http://127.0.0.1:4000";
async function ready(url){
 for(let n=0;n<100;n++){
   try{const r=await fetch(url,{signal:AbortSignal.timeout(1000)});if(r.ok)return;}catch{}
   await new Promise(r=>setTimeout(r,500));
 }
 throw new Error("Server failed to start: "+url);
}
await ready(api+"/health");
await ready(web+"/");
const health=await (await fetch(api+"/health")).json();
assert.equal(health.provider,"mock");
const stages=await (await fetch(api+"/v1/stages")).json();
assert.equal(stages.data.length,12);
const articleRequest=await fetch(api+"/v1/articles/lam-quen-nhip-sinh-hoat-so-sinh");
assert.equal(articleRequest.status,404,"Production API blocks drafts");
const disclaimer=await fetch(api+"/v1/disclaimer");
assert.equal(disclaimer.status,200);
const homepage=await (await fetch(web+"/")).text();
assert(homepage.includes("Trẻ sơ sinh"),"Web reads stages from API");
assert(!homepage.includes("Làm quen nhịp sinh hoạt của trẻ sơ sinh"),"Web must not render private draft");
const stage=await fetch(web+"/so-sinh");
assert.equal(stage.status,200);
const detail=await fetch(web+"/bai-viet/lam-quen-nhip-sinh-hoat-so-sinh");
assert.equal(detail.status,404,"Web blocks draft details");
const editorial=await fetch(web+"/bien-tap");
assert.equal(editorial.status,404,"Editorial overview must not be public");
const source=await fetch(web+"/nguon-tham-khao");
assert.equal(source.status,200);
console.log("PASS: Web API mode SSR; production hides all draft content; never falls back to private JSON.");
