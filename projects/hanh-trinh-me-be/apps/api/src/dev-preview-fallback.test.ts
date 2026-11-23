import {test} from "node:test";
import assert from "node:assert/strict";
import {listDevArticles,getDevArticle} from "../../../apps/web/lib/dev-preview.js";
test("preview reading room falls back to bundled 72 development articles when API URI is invalid",async()=>{
 const oldUrl=process.env.CONTENT_API_INTERNAL_URL;
 const oldToken=process.env.DEV_CONTENT_PREVIEW_TOKEN;
 process.env.CONTENT_API_INTERNAL_URL="invalid:///unsupported";
 process.env.DEV_CONTENT_PREVIEW_TOKEN="ci-only-not-a-real-production-secret-token";
 try{
   const index=await listDevArticles();
   assert.equal(index.source,"snapshot");
   assert.equal(index.articles.length,72);
   assert(index.articles.every(a=>a.status==="draft"));
   const detail=await getDevArticle("ngu-an-toan-cho-tre-so-sinh");
   assert.equal(detail.source,"snapshot");
   assert(detail.data.sources.some(s=>s.url.includes("cdc.gov")));
   assert.equal(detail.data.status,"draft");
   await assert.rejects(()=>getDevArticle("not-a-real-article"));
 }finally{
   if(oldUrl===undefined)delete process.env.CONTENT_API_INTERNAL_URL;
   else process.env.CONTENT_API_INTERNAL_URL=oldUrl;
   if(oldToken===undefined)delete process.env.DEV_CONTENT_PREVIEW_TOKEN;
   else process.env.DEV_CONTENT_PREVIEW_TOKEN=oldToken;
 }
});
