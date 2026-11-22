import {test} from "node:test";
import assert from "node:assert/strict";
import {ApiKnowledgeRepository} from "../../../packages/data/src/http-repository.js";
import {JsonMockEditorialRepository} from "../../../packages/data/src/json-editorial-repository.js";
import {loadSeedDataset} from "./seed-data.js";
import {buildApp} from "./app.js";

function client(publishedOnly=false){
 const backend=new JsonMockEditorialRepository(loadSeedDataset());
 const app=buildApp(backend);
 const fetcher:typeof fetch=async input=>{
   const u=new URL(String(input));
   const response=await app.inject({method:"GET",url:u.pathname+u.search});
   return new Response(response.body,{status:response.statusCode,headers:{"content-type":"application/json"}});
 };
 return {backend,app,client:new ApiKnowledgeRepository("http://localhost:4000",{fetcher,publishedOnly})};
}
test("HTTP KnowledgeRepository follows shared contract and sees CMS edits immediately",async()=>{
 const {backend,app,client:repo}=client();
 try{
   assert.equal(repo.provider,"api");
   assert.equal((await repo.listStages()).length,12);
   assert.equal((await repo.getStage("so-sinh"))?.title,"Trẻ sơ sinh");
   assert.equal(await repo.getStage("missing"),null);
   assert.equal((await repo.listArticles({stage:"so-sinh",limit:20})).meta.total,2);
   assert.equal((await repo.listTopics("so-sinh")).length,2);
   assert.equal((await repo.listSources()).length,13);
   assert.equal((await repo.listResearchCards()).length,12);
   assert.equal((await repo.getOverview()).articles,24);
   assert((await repo.getDisclaimer()).length>10);
   assert.equal(await repo.getArticle("non-existent"),null);
   const slug="lam-quen-nhip-sinh-hoat-so-sinh";
   const original=(await repo.getArticle(slug))!;
   const changed=await backend.editArticle(slug,1,{
     title:"Nội dung đã được CMS sửa qua API",summary:"Nội dung mới đã được lưu vào repository và đọc lại bằng HTTP adapter.",
     readMinutes:3,tags:original.tags,sections:original.sections,sources:original.sources
   },{id:"demo-writer",role:"writer"});
   assert.equal(changed.revision,2);
   assert.equal((await repo.getArticle(slug))?.title,changed.article.title);
   assert((await repo.listArticles({q:"Nội dung đã được CMS sửa",limit:50})).data.some(x=>x.slug===slug));
 }finally{await app.close()}
});
test("public API adapter strips all drafts even when upstream is a development server",async()=>{
 const {app,client:repo}=client(true);
 try{
   assert.equal((await repo.listStages()).length,12);
   assert.equal((await repo.listArticles({limit:50,status:"draft"})).meta.total,0);
   assert.deepEqual((await repo.listArticles()).data,[]);
   assert.equal(await repo.getArticle("lam-quen-nhip-sinh-hoat-so-sinh"),null);
   assert.deepEqual(await repo.listResearchCards(),[]);
   await assert.rejects(()=>repo.getOverview(),/not available publicly/);
 }finally{await app.close()}
});
test("API transport rejects invalid URL and avoids falling back to draft JSON",async()=>{
 assert.throws(()=>new ApiKnowledgeRepository("postgresql://user:pass@localhost/db"),/HTTP/);
 assert.throws(()=>new ApiKnowledgeRepository("https://someone:secret@api.example.com"),/HTTP/);
 const broken=new ApiKnowledgeRepository("https://api.example.com",{
   fetcher:async()=>new Response(JSON.stringify({error:"DB_OFFLINE"}),{status:503})
 });
 await assert.rejects(()=>broken.listStages(),/HTTP 503/);
});
