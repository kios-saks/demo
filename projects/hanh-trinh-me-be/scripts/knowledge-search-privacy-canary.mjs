import assert from "node:assert/strict";
const base="https://hanh-trinh-me-be-web-jn5v.onrender.com";
const run=process.env.GITHUB_RUN_ID,attempt=process.env.GITHUB_RUN_ATTEMPT||"1";
assert(/^\d+$/.test(run||"")&&/^\d+$/.test(attempt));
const markers={get:"ux02syntheticget"+run+"x"+attempt,post:"ux02syntheticpost"+run+"x"+attempt};
const checks=[];
for(const method of ["GET","POST"]){
 const marker=markers[method.toLowerCase()],path=method==="GET"?"/tim-kiem?q="+encodeURIComponent(marker):"/api/dev-search";
 const started=new Date().toISOString();
 const res=await fetch(base+path,{method,cache:"no-store",redirect:"error",signal:AbortSignal.timeout(90000),...(method==="POST"?{headers:{"Content-Type":"application/x-www-form-urlencoded",Origin:base},body:new URLSearchParams({q:marker})}:{})});
 assert.equal(res.status,200);assert.match(res.headers.get("cache-control")||"",/no-store/);assert.equal(res.headers.get("referrer-policy"),"no-referrer");assert.match(res.headers.get("x-robots-tag")||"",/noindex/);
 const html=await res.text();assert(html.includes("data-search-empty"));assert(html.includes('data-search-fulltext="72"'));
 checks.push({method,marker,status:res.status,started,finished:new Date().toISOString(),requestId:res.headers.get("rndr-id")||null});
}
console.log("UX02_PRIVACY_CANARY_HTTP_PASS",JSON.stringify({run,attempt,checks}));
