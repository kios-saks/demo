import test from "node:test";
import assert from "node:assert/strict";
import type {Pool} from "pg";
import {PrivateMediaStorage,digest,MAX_MEDIA_BYTES} from "./media-storage.js";
import {MediaService} from "./media-service.js";

const bytes=Buffer.from("synthetic immutable hero bytes");
const id=digest(bytes),path=id+".webp",mime="image/webp";
const origin="https://example.supabase.co",key="synthetic-server-key";
const signed=origin+"/storage/v1/object/sign/mebe-draft-media/"+path+"?token=synthetic";
const authenticated=origin+"/storage/v1/object/authenticated/mebe-draft-media/"+path;
test("private hero direct read uses one authenticated GET, same bytes and digest, no redirect or completed cache",async()=>{
 // Node fetch types omit the browser cache option; record it explicitly for this assertion.
 const calls:{url:string;init?:RequestInit & {cache?:string}}[]=[];
 const storage=new PrivateMediaStorage(origin,key,async(input,init)=>{calls.push({url:String(input),init});return new Response(new Uint8Array(bytes));});
 for(let i=0;i<2;i++){
  const result=await storage.verifiedBytes(path,id,mime,"authenticated");
  assert.deepEqual(result,{bytes,mime,id});
 }
 assert.equal(calls.length,2);
 for(const c of calls){
  assert.equal(c.url,authenticated);assert.equal(c.init?.redirect,"error");assert.equal(c.init?.cache,"no-store");
  const h=new Headers(c.init?.headers);assert.equal(h.get("authorization"),"Bearer "+key);assert.equal(h.get("apikey"),key);
  assert.equal(c.init?.method??"GET","GET");
 }
});
test("direct private read rejects corrupt, oversized, forbidden and invalid paths",async()=>{
 for(const response of [()=>new Response("wrong bytes"),()=>new Response(null,{headers:{"content-length":String(MAX_MEDIA_BYTES+1)}}),()=>new Response(null,{status:403})]){
  const storage=new PrivateMediaStorage(origin,key,async()=>response());
  await assert.rejects(()=>storage.verifiedBytes(path,id,mime,"authenticated"));
 }
 let calls=0;const storage=new PrivateMediaStorage(origin,key,async()=>{calls++;return new Response();});
 await assert.rejects(()=>storage.verifiedBytes("../"+path,id,mime,"authenticated"));
 await assert.rejects(()=>storage.verifiedBytes(id+".exe",id,mime,"authenticated"));
 assert.equal(calls,0);
});
test("catalog hero fast path is scoped to exact Combined DEV service, original signed delivery remains for all other media",async()=>{
 const keys=["MEBE_COMBINED_DEV","RENDER","RENDER_SERVICE_ID"] as const,old=keys.map(k=>process.env[k]);
 const calls:string[]=[];
 const storage=new PrivateMediaStorage(origin,key,async(input,init)=>{
  const u=String(input);calls.push(u);
  if(init?.method==="POST")return new Response(JSON.stringify({signedURL:signed}));
  return new Response(new Uint8Array(bytes));
 });
 const pool={query:async(_sql:string,params:string[])=>({rowCount:1,rows:[{object_path:path,id,mime_type:mime}]})} as unknown as Pool;
 const service=new MediaService(pool,storage);
 try{
  process.env.MEBE_COMBINED_DEV="true";process.env.RENDER="true";process.env.RENDER_SERVICE_ID="srv-dc19cibl550s73drji5g";
  assert.deepEqual(await service.catalogImage("lifestyle-hero.webp"),{bytes,mime,id});
  assert.deepEqual(calls,[authenticated]);calls.length=0;
  await service.catalogImage("lifestyle-other.webp");
  assert.equal(calls.length,2);assert.equal(calls[1],signed);calls.length=0;
  process.env.RENDER_SERVICE_ID="different-service";
  await service.catalogImage("lifestyle-hero.webp");
  assert.equal(calls.length,2);assert.equal(calls[1],signed);
 }finally{keys.forEach((k,i)=>{if(old[i]===undefined)delete process.env[k];else process.env[k]=old[i];});}
});
