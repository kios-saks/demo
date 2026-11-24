import test from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import {registerMedia} from "./media-routes.js";
import type {MediaService} from "./media-service.js";
import {readWebp,PrivateMediaStorage} from "./media-storage.js";

test("media read and write roles fail closed; preview cannot upload; reviewer cannot upload",async()=>{
 const keys=["DEV_CONTENT_PREVIEW_TOKEN","MEDIA_DEV_EDITOR_TOKEN","MEDIA_DEV_REVIEWER_TOKEN"] as const;
 const before=keys.map(k=>process.env[k]);
 const [p,e,r]=["p".repeat(40),"e".repeat(40),"r".repeat(40)];
 process.env[keys[0]]=p;process.env[keys[1]]=e;process.env[keys[2]]=r;
 const app=Fastify();
 let uploads=0,reviews=0;
 const service={active:async()=>[],history:async()=>({}),preview:async()=>({}),upload:async()=>{uploads++;return {};},review:async()=>{reviews++;return {};}} as unknown as MediaService;
 registerMedia(app,service);
 const url="/v1/dev-media-admin/article";
 try{
  assert.equal((await app.inject({url:"/v1/dev-preview/media/article"})).statusCode,404);
  assert.equal((await app.inject({url:"/v1/dev-preview/media/article",headers:{"x-preview-token":p}})).statusCode,200);
  for(const token of [p,r])assert.equal((await app.inject({method:"POST",url:url+"/upload",headers:{authorization:"Bearer "+token},payload:{}})).statusCode,404);
  assert.equal((await app.inject({method:"POST",url:url+"/review",headers:{authorization:"Bearer "+e},payload:{}})).statusCode,404);
  assert.equal((await app.inject({method:"POST",url:url+"/upload",headers:{authorization:"Bearer "+e},payload:{}})).statusCode,200);
  assert.equal((await app.inject({method:"POST",url:url+"/review",headers:{authorization:"Bearer "+r},payload:{}})).statusCode,200);
  assert.equal(uploads,1);assert.equal(reviews,1);
  process.env[keys[1]]=p;
  assert.equal((await app.inject({method:"POST",url:url+"/upload",headers:{authorization:"Bearer "+p},payload:{}})).statusCode,404);
 }finally{await app.close();keys.forEach((k,i)=>{if(before[i]===undefined)delete process.env[k];else process.env[k]=before[i];});}
});
test("image validation rejects arbitrary text, SVG and oversized payloads",()=>{
 for(const v of ["bad",Buffer.from("<svg/>").toString("base64"),"A".repeat(3000000)])assert.throws(()=>readWebp(v));
});
test("signed URL refuses external destination",async()=>{
 const fetcher=(async()=>new Response(JSON.stringify({signedURL:"https://evil.example/x?token=abc"}))) as typeof fetch;
 const storage=new PrivateMediaStorage("https://example.supabase.co","test",fetcher);
 await assert.rejects(()=>storage.signedUrl("a".repeat(64)+".webp"),/STORAGE_SIGN_FAILED/);
});
