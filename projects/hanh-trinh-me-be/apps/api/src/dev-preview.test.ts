import {test} from "node:test";
import assert from "node:assert/strict";
import {buildApp} from "./app.js";
import {JsonMockEditorialRepository} from "../../../packages/data/src/json-editorial-repository.js";
import {loadSeedDataset} from "./seed-data.js";
const token="this-is-just-a-test-preview-token-of-sufficient-length";
test("private dev preview returns all 72 draft articles with authenticated read-only token",async()=>{
 const old=process.env.DEV_CONTENT_PREVIEW_TOKEN,prev=process.env.NODE_ENV;
 process.env.DEV_CONTENT_PREVIEW_TOKEN=token;
 process.env.NODE_ENV="production";
 const api=buildApp(new JsonMockEditorialRepository(loadSeedDataset()));
 try{
   assert.equal((await api.inject("/v1/articles")).json().meta.total,0);
   assert.equal((await api.inject("/v1/dev-preview/articles")).statusCode,404);
   assert.equal((await api.inject({url:"/v1/dev-preview/articles",headers:{"x-preview-token":"bad"}})).statusCode,404);
   const headers={"x-preview-token":token};
   const first=await api.inject({url:"/v1/dev-preview/articles?page=1&limit=50",headers});
   const second=await api.inject({url:"/v1/dev-preview/articles?page=2&limit=50",headers});
   assert.equal(first.statusCode,200);
   assert.equal(first.json().meta.total,72);
   assert.equal(first.json().data.length,50);
   assert.equal(second.json().data.length,22);
   assert.equal(first.headers["x-robots-tag"],"noindex, nofollow");
   const detail=await api.inject({url:"/v1/dev-preview/articles/ngu-an-toan-cho-tre-so-sinh",headers});
   assert.equal(detail.statusCode,200);
   assert.equal(detail.json().data.status,"draft");
   assert(detail.json().data.sources.length>=2);
   assert.equal((await api.inject({url:"/v1/dev-preview/articles?page=-1",headers})).statusCode,400);
   assert.equal((await api.inject({url:"/v1/dev-preview/articles/unknown",headers})).statusCode,404);
 }finally{
   await api.close();
   if(old===undefined)delete process.env.DEV_CONTENT_PREVIEW_TOKEN;
   else process.env.DEV_CONTENT_PREVIEW_TOKEN=old;
   if(prev===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=prev;
 }
});
