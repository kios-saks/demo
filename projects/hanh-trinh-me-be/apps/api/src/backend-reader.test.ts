import {test} from "node:test";
import assert from "node:assert/strict";
import {createBackendReader} from "../../web/lib/backend-reader.js";
const origin="https://example.invalid";
const ok=(data:unknown)=>Response.json(data);
function fixture(handler:(path:string,headers:Headers)=>Response|Promise<Response>){
 let clock=0;const calls:string[]=[];
 const reader=createBackendReader({now:()=>clock,sleep:async(ms)=>{clock+=ms;},fetcher:async(input,init)=>{
  const url=new URL(String(input));calls.push(url.pathname);return handler(url.pathname,new Headers(init?.headers));
 }});
 return {reader,calls,elapsed:()=>clock};
}
test("Web first: transient 502 then readiness 503, recovery to real JSON",async()=>{
 let n=0,r=0;const f=fixture(path=>path==="/health/ready"?++r===1?new Response("wait",{status:503}):ok({ok:true}):++n===1?new Response("cold",{status:502}):ok({data:[1]}));
 assert.deepEqual(await (await f.reader(origin+"/v1/articles")).json(),{data:[1]});assert.equal(n,2);assert.equal(r,2);
});
test("API first: no unnecessary readiness probe",async()=>{
 const f=fixture(()=>ok({data:[]}));
 await f.reader(origin+"/v1/articles");assert.deepEqual(f.calls,["/v1/articles"]);
});
test("concurrent identical GETs coalesce and both bodies remain readable; no completed cache",async()=>{
 let release!:()=>void;const gate=new Promise<void>(r=>{release=r;});let n=0;
 const f=fixture(async()=>{n++;await gate;return ok({data:1});});
 const a=f.reader(origin+"/v1/articles",{authorization:"Bearer fixture-a"}),b=f.reader(origin+"/v1/articles",{authorization:"Bearer fixture-a"});release();
 const [x,y]=await Promise.all([a,b]);assert.equal(n,1);assert.deepEqual(await x.json(),await y.json());
 await f.reader(origin+"/v1/articles",{authorization:"Bearer fixture-a"});assert.equal(n,2);
});
test("different credentials never share response; denied statuses are not retried",async()=>{
 const f=fixture((_p,h)=>h.get("authorization")==="Bearer fixture-a"?ok({role:"editor"}):new Response("denied",{status:403}));
 const [a,b]=await Promise.all([f.reader(origin+"/session",{authorization:"Bearer fixture-a"}),f.reader(origin+"/session",{authorization:"Bearer fixture-b"})]);
 assert.equal(a.status,200);assert.equal(b.status,403);assert.equal(f.calls.length,2);
 for(const code of [401,404,409,429]){const x=fixture(()=>new Response("no",{status:code}));assert.equal((await x.reader(origin+"/a")).status,code);assert.equal(x.calls.length,1);}
});
test("different paths share one readiness flight",async()=>{
 const seen=new Set<string>();let probes=0;
 const f=fixture(path=>{if(path==="/health/ready"){probes++;return ok({ok:true});}if(!seen.has(path)){seen.add(path);return new Response("cold",{status:503});}return ok({path});});
 await Promise.all([f.reader(origin+"/a"),f.reader(origin+"/b")]);assert.equal(probes,1);
});
test("200 HTML wake page and network errors are not accepted as JSON",async()=>{
 let n=0;const f=fixture(path=>{if(path==="/health/ready")return ok({ok:true});n++;if(n===1)throw new TypeError("network");if(n===2)return new Response("<html>waking</html>",{headers:{"content-type":"text/html"}});return ok({ok:true});});
 assert.equal(((await (await f.reader(origin+"/a")).json()) as {ok:boolean}).ok,true);assert.equal(n,3);
});
test("permanently unavailable upstream exhausts bounded deadline and clears flight",async()=>{
 const f=fixture(()=>new Response("unavailable",{status:503}));
 await assert.rejects(()=>f.reader(origin+"/a",{}, {budgetMs:1500,attemptMs:500}),/temporarily unavailable/);
 assert.equal(f.elapsed(),1500);
 const old=f.calls.length;await assert.rejects(()=>f.reader(origin+"/a",{}, {budgetMs:1500,attemptMs:500}));assert.ok(f.calls.length>old);
});
test("oversized body is not retried",async()=>{
 const f=fixture(()=>ok({data:"x".repeat(1024)}));await assert.rejects(()=>f.reader(origin+"/a",{},{maxBytes:100}),/too large/);assert.equal(f.calls.length,1);
});

test("programming errors are not retried as network errors",async()=>{
 const f=fixture(()=>{throw new Error("fixture assertion");});
 await assert.rejects(()=>f.reader(origin+"/a"),/fixture assertion/);assert.equal(f.calls.length,1);
});


test("explicit startup wake shares readiness flight with recovering reads and never forwards auth",async()=>{
 let clock=0,probes=0,calls=0,release!:()=>void;
 const gate=new Promise<void>(r=>{release=r;});
 const events:{event:string;data:Record<string,string|number>}[]=[];
 const reader=createBackendReader({now:()=>clock,sleep:async(ms)=>{clock+=ms;},
  fetcher:async()=>++calls===1?new Response("cold",{status:502}):ok({data:1}),
  readinessFetcher:async(input,init)=>{probes++;assert.equal(String(input),origin+"/health/ready");const h=new Headers(init?.headers);assert.equal(h.get("authorization"),null);assert.equal(h.get("x-preview-token"),null);await gate;return ok({ok:true});},
  diagnostic:(event,data)=>events.push({event,data})});
 const startup=reader.ready(origin),other=reader.ready(origin),read=reader(origin+"/a",{authorization:"Bearer fixture-secret"});
 await Promise.resolve();release();
 await Promise.all([startup,other,read]);assert.equal(probes,1);assert.equal(calls,2);
 assert.ok(events.some(e=>e.event==="BACKEND_WAKE_READY"));assert.ok(!JSON.stringify(events).includes("fixture-secret"));
});
test("readiness diagnostics distinguish upstream 502 and DNS without logging request data",async()=>{
 let clock=0,n=0;const events:{event:string;data:Record<string,string|number>}[]=[];
 const reader=createBackendReader({now:()=>clock,sleep:async(ms)=>{clock+=ms;},fetcher:async()=>{n++;if(n===1)return new Response("gateway",{status:502});if(n===2)throw new TypeError("fixture secret",{cause:{code:"ENOTFOUND"}});return ok({ok:true});},diagnostic:(event,data)=>events.push({event,data})});
 await reader.ready(origin);assert.equal(n,3);
 assert.ok(events.some(e=>e.data.kind==="HTTP_502"&&e.data.status===502));
 assert.ok(events.some(e=>e.data.kind==="DNS"));assert.ok(!JSON.stringify(events).includes("fixture secret"));
});


test("DEV media burst queues 72 unique reads, reserves content capacity and coalesces identical keys",async()=>{
 let active=0,peak=0,calls=0,release!:()=>void;
 const gate=new Promise<void>(r=>{release=r;});
 const reader=createBackendReader({mediaLaneEnabled:()=>true,fetcher:async(input)=>{
  const u=new URL(String(input));if(!u.pathname.includes("/media/"))return ok({content:true});
  calls++;active++;peak=Math.max(peak,active);await gate;active--;return ok({path:u.pathname});
 }});
 const headers={"x-preview-token":"synthetic-test-token"};
 const paths=Array.from({length:72},(_,i)=>origin+"/v1/dev-preview/media/article-"+i+"/cover");
 const reads=paths.map(p=>reader(p,headers));
 const duplicate=reader(paths[0],headers);
 try{
  assert.deepEqual(await (await reader(origin+"/v1/dev-preview/articles",headers)).json(),{content:true});
  assert.equal(active,6);assert.equal(calls,6);
 }finally{release();}
 const results=await Promise.all([...reads,duplicate]);
 assert.equal(calls,72);assert.equal(peak,6);
 for(let i=0;i<72;i++)assert.deepEqual(await results[i].json(),{path:new URL(paths[i]).pathname});
 assert.deepEqual(await results[72].json(),{path:new URL(paths[0]).pathname});
 await reader(paths[0],headers);assert.equal(calls,73);
 console.log("UX09_MEDIA_BURST_PASS",JSON.stringify({unique:72,peak:6,coalesced:true,contentReserved:true}));
});
test("DEV media queue rejects excess and deadline-expired waiters, then recovers",async()=>{
 let release!:()=>void,started=0;
 const gate=new Promise<void>(r=>{release=r;});
 const events:{event:string;data:Record<string,string|number>}[]=[];
 const reader=createBackendReader({mediaLaneEnabled:()=>true,diagnostic:(event,data)=>events.push({event,data}),fetcher:async()=>{started++;await gate;return ok({ok:true});}});
 const h={"x-preview-token":"synthetic-secret"},url=(i:number)=>origin+"/v1/dev-preview/media/a-"+i+"/cover";
 const active=Array.from({length:6},(_,i)=>reader(url(i),h));
 const queued=Array.from({length:80},(_,i)=>reader(url(i+6),h));
 try{
  await assert.rejects(reader(url(86),h),/QUEUE_FULL/);
  assert.equal(started,6);
 }finally{release();}
 await Promise.all([...active,...queued]);
 assert.equal(started,86);
 assert.ok(events.some(e=>e.data.kind==="QUEUE_FULL"));
 assert.ok(!JSON.stringify(events).includes("synthetic-secret"));
 assert.ok(!JSON.stringify(events).includes("/v1/"));
 let unlock!:()=>void;const hold=new Promise<void>(r=>{unlock=r;});let n=0;
 const limited=createBackendReader({mediaLaneEnabled:()=>true,fetcher:async()=>{n++;await hold;return ok({ok:true});}});
 const occupied=Array.from({length:6},(_,i)=>limited(url(i),h));
 try{await assert.rejects(limited(url(6),h,{budgetMs:20}),/QUEUE_TIMEOUT/);assert.equal(n,6);}
 finally{unlock();}
 await Promise.all(occupied);await limited(url(6),h);assert.equal(n,7);
});
test("media lane remains disabled outside designated DEV; original unique request limit holds",async()=>{
 let release!:()=>void;const gate=new Promise<void>(r=>{release=r;});
 const reader=createBackendReader({mediaLaneEnabled:()=>false,fetcher:async()=>{await gate;return ok({ok:true});}});
 const requests=Array.from({length:32},(_,i)=>reader(origin+"/v1/dev-preview/media/a-"+i+"/cover",{"x-preview-token":"test"}));
 try{await assert.rejects(reader(origin+"/v1/dev-preview/media/overflow/cover",{"x-preview-token":"test"}),/temporarily unavailable/);}
 finally{release();}
 await Promise.all(requests);
});
