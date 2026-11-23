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

const ciToken=process.env.CI_DEV_PREVIEW_TOKEN;
assert(ciToken&&ciToken.length>=24,"Only CI can set a development preview token");
const guest=await fetch(web+"/dev-review");
assert.equal(guest.status,401,"Guests cannot view draft library");
const bad=await fetch(web+"/dev-review",{headers:{authorization:"Basic "+Buffer.from("editor:bad").toString("base64")}});
assert.equal(bad.status,401,"Wrong credentials cannot view library");
const publicDraftApi=await fetch(api+"/v1/dev-preview/articles");
assert.equal(publicDraftApi.status,404,"Direct backend preview requires a secret");
const apiDraft=await fetch(api+"/v1/dev-preview/articles?page=1&limit=50",{headers:{"x-preview-token":ciToken}});
assert.equal(apiDraft.status,200);
assert.equal((await apiDraft.json()).meta.total,72);
const headers={authorization:"Basic "+Buffer.from("editor:"+ciToken).toString("base64")};
const overview=await fetch(web+"/dev-review",{headers});
assert.equal(overview.status,200,"Authenticated Web preview should load");
assert.equal(overview.headers.get("x-robots-tag"),"noindex, nofollow, noarchive");
const overviewHtml=await overview.text();
assert(overviewHtml.includes("/media/cover-family-planning.svg"),"Dev library hero has editorial illustration");
assert(overviewHtml.includes("72 bài biên tập"),"Dev library displays curated content count");
assert(overviewHtml.includes("/dev-review/ngu-an-toan-cho-tre-so-sinh"),"Indexed source-linked article must appear");
const detailDev=await fetch(web+"/dev-review/ngu-an-toan-cho-tre-so-sinh",{headers});
assert.equal(detailDev.status,200,"Authenticated dev preview article loads");
const detailBody=await detailDev.text();
assert(detailBody.includes("Giấc ngủ an toàn"));
assert(detailBody.includes("cdc.gov"),"Specific cited source must be rendered");
assert(detailBody.includes("/media/cover-safe-sleep.svg"),"Article must include its own cover illustration");
assert(detailBody.includes("/media/infographic-safe-sleep.svg"),"Inline cited educational infographic must be rendered");
assert.equal(detailDev.headers.get("x-robots-tag"),"noindex, nofollow, noarchive");
assert(detailBody.includes("Nội dung dev, chưa thẩm định chuyên môn."));
console.log("PASS: password-gated 72-article dev reading room; guest denied, draft API protected, real sources rendered.");
