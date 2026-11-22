import {test} from "node:test";
import assert from "node:assert/strict";
import {createDbPool} from "./db/connection.js";
import {migrateDatabase} from "./db/migrate.js";
import {seedDatabase} from "./db/seed.js";
import {loadSeedDataset} from "./seed-data.js";
import {PostgresEditorialRepository} from "../../../packages/data/src/postgres-repository.js";
import {buildApp} from "./app.js";

const keys={
 writer:"test-db-writer-key-0123456789ABCDE",
 editor:"test-db-editor-key-0123456789ABCDE",
 reviewer:"test-db-reviewer-key-0123456789ABCDE"
};
const endpoint="/v1/admin/articles/lam-quen-nhip-sinh-hoat-so-sinh";
const auth=(role:keyof typeof keys)=>({authorization:"Bearer "+keys[role]});
const req=(role:keyof typeof keys,method:"GET"|"PUT"|"POST",url:string,payload?:object)=>({
 method,url,headers:auth(role),...(payload?{payload}:{})
});
test("real PostgreSQL migrations, idempotent imports, interface parity and editor transaction",async()=>{
 if(!process.env.DATABASE_URL)throw new Error("DATABASE_URL required for postgres integration test");
 if(process.env.NODE_ENV==="production")throw new Error("Integration test must never target production mode");
 const pool=createDbPool();
 const seed=loadSeedDataset();
 const repo=new PostgresEditorialRepository(pool);
 try{
   // Already run via CI CLI: verify application doesn't alter or rerun tracked migrations.
   assert.equal(await migrateDatabase(pool),0);
   await seedDatabase(pool,seed);
   await seedDatabase(pool,seed);
   await repo.assertReady();
   const overview=await repo.getOverview();
   assert.deepEqual([overview.stages,overview.articles,overview.topics,overview.sources,overview.researchCards],
     [12,72,13,45,12]);
   assert.equal(overview.provider,"postgres");
   assert.equal(overview.drafts,72);
   assert.equal((await repo.listStages()).length,12);
   assert.equal((await repo.listTopics("so-sinh")).length,2);
   assert.equal((await repo.listSources()).length,45);
   assert.equal((await repo.listResearchCards({stage:"so-sinh"})).length,1);
   const noAccents=await repo.listArticles({q:"SO SINH",limit:50});
   const accents=await repo.listArticles({q:"sơ sinh",limit:50});
   assert(noAccents.meta.total>0);
   assert.equal(noAccents.meta.total,accents.meta.total);
   const attempt=await repo.listArticles({q:"%' OR 1=1 --",limit:50});
   assert.equal(attempt.meta.total,0,"Queries must be parameterized and wildcard escaped");
   assert.equal((await repo.listArticles({stage:"so-sinh"})).meta.total,6);
   const original=await repo.getEditorialArticle("lam-quen-nhip-sinh-hoat-so-sinh");
   assert(original);assert.equal(original.revision,1);
   assert.equal((await repo.listEditorialArticles()).length,72);
   const app=buildApp(repo,keys);
   try{
     const health=await app.inject("/health");
     assert.equal(health.json().provider,"postgres");
     assert.equal((await app.inject("/v1/articles?limit=4")).json().data.length,4);
     assert.equal((await app.inject("/v1/topics")).json().data.length,13);
     assert.equal((await app.inject(endpoint)).statusCode,401);
     assert.equal((await app.inject(req("writer","GET",endpoint))).statusCode,200);
     const patch={
       title:"Bài thử nghiệm PostgreSQL revision 2",summary:"Bài viết được cập nhật vào PostgreSQL thật qua API có kiểm soát phiên bản.",
       readMinutes:4,tags:original.article.tags,sections:original.article.sections,sources:original.article.sources
     };
     const writes=await Promise.all([
       app.inject(req("writer","PUT",endpoint,{expectedRevision:1,content:patch})),
       app.inject(req("writer","PUT",endpoint,{expectedRevision:1,content:patch}))
     ]);
     assert.deepEqual(writes.map(r=>r.statusCode).sort(),[200,409],"Row locks + CAS must reject a stale writer");
     const edited=(await repo.getEditorialArticle("lam-quen-nhip-sinh-hoat-so-sinh"))!;
     assert.equal(edited.revision,2);assert.equal(edited.article.title,patch.title);
     // Re-import must NOT overwrite revised article or reset workflow.
     await seedDatabase(pool,seed);
     assert.equal((await repo.getEditorialArticle("lam-quen-nhip-sinh-hoat-so-sinh"))?.revision,2);
     const snapshots=await pool.query<{revision:number}>(
       "SELECT revision FROM editorial_revisions WHERE article_slug=$1 ORDER BY revision",["lam-quen-nhip-sinh-hoat-so-sinh"]);
     assert.deepEqual(snapshots.rows.map(x=>x.revision),[1,2]);
     const submitted=await app.inject(req("writer","POST",endpoint+"/submit",{expectedRevision:2}));
     assert.equal(submitted.statusCode,200,submitted.body);
     assert.equal(submitted.json().data.article.status,"in_review");
     const editorReview=await app.inject(req("editor","POST",endpoint+"/review",{expectedRevision:2,decision:"editorial_approve"}));
     assert.equal(editorReview.statusCode,200,editorReview.body);
     const medicalReview=await app.inject(req("reviewer","POST",endpoint+"/review",{expectedRevision:2,decision:"medical_approve"}));
     assert.equal(medicalReview.statusCode,200,medicalReview.body);
     assert.equal(medicalReview.json().data.article.status,"in_review","Simulated approvals must not publish content");
     assert.equal(medicalReview.json().data.medicalApproval.revision,2);
     const changes=await app.inject(req("editor","POST",endpoint+"/review",{
       expectedRevision:2,decision:"request_changes",note:"Cần biên tập lại theo kết quả kiểm tra nguồn."
     }));
     assert.equal(changes.statusCode,200,changes.body);
     assert.equal(changes.json().data.article.status,"draft");
     assert.equal(changes.json().data.medicalApproval,null);
     assert.equal(changes.json().data.events.length,5);
     const history=await pool.query<{action:string}>(
       "SELECT action FROM editorial_events WHERE article_slug=$1 ORDER BY sequence",["lam-quen-nhip-sinh-hoat-so-sinh"]);
     assert.deepEqual(history.rows.map(e=>e.action),["edit","submit","editorial_approve","medical_approve","request_changes"]);
     await assert.rejects(()=>pool.query("UPDATE knowledge_articles SET status='published' WHERE slug=$1",["lam-quen-nhip-sinh-hoat-so-sinh"]),/check constraint|violates/i);
     assert.equal((await repo.getArticle("lam-quen-nhip-sinh-hoat-so-sinh"))?.status,"draft");
   }finally{await app.close();}
 }catch(e){await pool.end().catch(()=>{});throw e;}
});
