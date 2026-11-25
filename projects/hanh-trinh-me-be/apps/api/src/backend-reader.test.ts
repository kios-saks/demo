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
 assert.equal((await (await f.reader(origin+"/a")).json()).ok,true);assert.equal(n,3);
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
