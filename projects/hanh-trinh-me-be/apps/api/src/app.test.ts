import {test} from "node:test";
import assert from "node:assert/strict";
import {buildApp} from "./app.js";
import {loadSeedDataset} from "./seed-data.js";
import {createKnowledgeRepository} from "./repository.js";
import {MockKnowledgeRepository} from "../../../packages/data/src/mock-repository.js";

test("provider is mock and documented public routes remain compatible",async()=>{
 const app=buildApp();
 try {
   const health=await app.inject({method:"GET",url:"/health"});
   assert.equal(health.statusCode,200);
   assert.equal(health.json().provider,"mock");
   assert.equal((await app.inject("/v1/stages")).json().data.length,12);
   assert.equal((await app.inject("/v1/articles?limit=3")).json().data.length,3);
   assert.equal((await app.inject("/v1/articles?stage=so-sinh")).json().meta.total,6);
   assert.equal((await app.inject("/v1/articles/unknown")).statusCode,404);
   assert.equal((await app.inject("/v1/stages/unknown")).statusCode,404);
   assert.equal((await app.inject("/v1/articles?page=-1")).statusCode,400);
   assert.equal((await app.inject("/v1/articles?limit=51")).statusCode,400);
   assert.equal((await app.inject("/v1/articles?limit=NaN")).statusCode,400);
   assert.equal((await app.inject("/v1/articles?status=unreviewed")).statusCode,400);
 }finally{await app.close();}
});

test("new structured mock topic, source, and research endpoints",async()=>{
 const app=buildApp();
 try {
   const topics=(await app.inject("/v1/topics")).json().data;
   const sources=(await app.inject("/v1/sources")).json().data;
   const cards=(await app.inject("/v1/research-cards")).json().data;
   assert.equal(topics.length,13);assert.equal(sources.length,loadSeedDataset().sources.length);assert.equal(cards.length,12);
   assert.equal((await app.inject("/v1/topics?stage=so-sinh")).json().data.length,2);
   assert.equal((await app.inject("/v1/research-cards?stage=so-sinh")).json().data.length,1);
   assert.equal((await app.inject("/v1/editorial/overview")).json().data.drafts,72);
   assert(cards.every((x:{status:string;medicalApproval:boolean})=>x.status==="draft"&&!x.medicalApproval));
 }finally{await app.close();}
});

test("repository search supports Vietnamese with or without accents, and pagination",async()=>{
 const repo=createKnowledgeRepository();
 assert(repo instanceof MockKnowledgeRepository);
 const a=await repo.listArticles({q:"SO SINH",page:1,limit:50});
 const b=await repo.listArticles({q:"sơ sinh",page:1,limit:50});
 assert(a.meta.total>0);
 assert.equal(a.meta.total,b.meta.total);
 const first=await repo.listArticles({page:1,limit:2});
 const second=await repo.listArticles({page:2,limit:2});
 assert.notEqual(first.data[0].slug,second.data[0].slug);
 assert.equal(first.meta.total,72);
});

test("mock repository does not persist mutations of returned objects",async()=>{
 const repo=createKnowledgeRepository();
 const x=await repo.getArticle("lam-quen-nhip-sinh-hoat-so-sinh");
 assert(x);
 x.title="MUTATED";
 const y=await repo.getArticle("lam-quen-nhip-sinh-hoat-so-sinh");
 assert(y);assert.notEqual(y.title,"MUTATED");
 const sources=await repo.listSources();
 sources[0].publisher="MUTATED";
 assert.notEqual((await repo.listSources())[0].publisher,"MUTATED");
});

test("production API blocks draft content and internal mock endpoints",async()=>{
 const prev=process.env.NODE_ENV;
 process.env.NODE_ENV="production";
 const app=buildApp();
 try {
   assert.equal((await app.inject("/v1/articles?status=draft")).statusCode,403);
   assert.equal((await app.inject("/v1/articles")).json().meta.total,0);
   assert.equal((await app.inject("/v1/articles/lam-quen-nhip-sinh-hoat-so-sinh")).statusCode,404);
   assert.equal((await app.inject("/v1/editorial/overview")).statusCode,404);
   assert.equal((await app.inject("/v1/research-cards")).statusCode,404);
 }finally {
   await app.close();
   if(prev===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=prev;
 }
});
