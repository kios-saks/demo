// Read-only smoke checks for the existing DEV services. No credentials are printed.
import assert from "node:assert/strict";
const web="https://hanh-trinh-me-be-web-jn5v.onrender.com";
const api="https://hanh-trinh-me-be-api-jn5v.onrender.com";
const knownDraft="lam-quen-nhip-sinh-hoat-so-sinh";
let failed=0,passed=0,skipped=0;
async function check(label,fn){
 try{await fn();passed++;console.log("PASS",label);}
 catch(e){failed++;console.error("FAIL",label,e instanceof Error?e.message.split("\n")[0]:"unknown error");}
}
async function request(base,path,headers={}){
 // Never retry writes; this smoke runner issues only GET requests.
 const r=await fetch(base+path,{method:"GET",headers,redirect:"manual",cache:"no-store",signal:AbortSignal.timeout(90000)});
 return r;
}
async function json(base,path,status=200,headers={}){
 const r=await request(base,path,headers);assert.equal(r.status,status,"Unexpected HTTP status: "+path);
 assert.match(r.headers.get("content-type")||"",/application\/json/i,"Expected JSON: "+path);return r.json();
}
async function denied(base,path,allowed=[404],headers={}){
 const r=await request(base,path,headers);assert.ok(allowed.includes(r.status),"Access denial expected: "+path+"; HTTP "+r.status);
 await r.body?.cancel();
}
await check("API health and readiness",async()=>{
 const h=await json(api,"/health");assert.equal(h.ok,true);
 const ready=await json(api,"/health/ready");assert.equal(ready.ok,true);
});
await check("Web health",async()=>{assert.equal((await json(web,"/api/health")).ok,true);});
await check("Public API has 12 stages",async()=>{assert.equal((await json(api,"/v1/stages")).data.length,12);});
await check("Public API hides draft corpus",async()=>{
 const v=await json(api,"/v1/articles");assert.equal(v.meta.total,0);assert.deepEqual(v.data,[]);
 await denied(api,"/v1/articles?status=draft",[403]);await denied(api,"/v1/articles/"+knownDraft,[404]);
});
await check("Guest cannot read DEV preview or media administration",async()=>{
 await denied(api,"/v1/dev-preview/articles");await denied(api,"/v1/dev-preview/articles/"+knownDraft);
 await denied(api,"/v1/dev-media-admin/session");await denied(web,"/api/media-admin/session");
 await denied(web,"/dev-review");await denied(web,"/bai-viet/"+knownDraft);
});
await check("Web public home and stage",async()=>{
 for(const path of ["/","/so-sinh"]){const r=await request(web,path);assert.equal(r.status,200);const html=await r.text();assert.ok(!html.includes("Làm quen nhịp sinh hoạt của trẻ sơ sinh"),"Unexpected draft title");}
});
const token=process.env.MEBE_QA_PREVIEW_TOKEN;
if(!token){skipped++;console.log("SKIP authenticated read-only preview (MEBE_QA_PREVIEW_TOKEN not provided)");}
else {
 await check("Authenticated DEV preview pagination and article detail",async()=>{
  const headers={"x-preview-token":token};
  const first=await json(api,"/v1/dev-preview/articles?page=1&limit=50",200,headers);
  const second=await json(api,"/v1/dev-preview/articles?page=2&limit=50",200,headers);
  assert.equal(first.meta.total,72);assert.equal(second.meta.total,72);
  const items=[...first.data,...second.data];assert.equal(items.length,72);assert.equal(new Set(items.map(x=>x.slug)).size,72);
  const detail=await json(api,"/v1/dev-preview/articles/"+knownDraft,200,headers);
  assert.equal(detail.data.slug,knownDraft);assert.ok(detail.data.sections.length>=10);assert.ok(detail.data.sources.length>0);
 });
}
console.log(JSON.stringify({passed,failed,skipped}));
if(failed)process.exitCode=1;
