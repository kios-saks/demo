import {test} from "node:test";
import assert from "node:assert/strict";
import {Pool} from "pg";
import {migrateDatabase} from "./db/migrate.js";
import {seedDatabase} from "./db/seed.js";
import {loadSeedDataset} from "./seed-data.js";
import {parseDatabaseConfig} from "./db/config.js";
import {createDatabaseRepository} from "./repository.js";
import type {ConnectionProviderFactory} from "./db/providers.js";
import {buildApp} from "./app.js";

test("Docker+Supabase-target dual routing: primary only writes; secondary has drift signal",async()=>{
 const docker=process.env.DOCKER_DATABASE_URL,secondary=process.env.SUPABASE_DATABASE_URL;
 if(!docker||!secondary)throw new Error("CI dual database target URLs are required");
 if(process.env.NODE_ENV==="production")throw new Error("Never run destructive CI tests on production");
 const seed=loadSeedDataset();
 // CI uses a second isolated PostgreSQL 16 container to simulate Supabase wire protocol.
 // This proves routing/concurrency but does NOT claim access to a real Supabase project.
 for(const uri of [docker,secondary]){
   const pool=new Pool({connectionString:uri});
   try{
     assert.equal(await migrateDatabase(pool),3);
     assert.equal(await migrateDatabase(pool),0,"Migration replay must be idempotent");
     const media=await pool.query("SELECT to_regclass('media_assets') AS assets,to_regclass('media_revisions') AS revisions,to_regclass('article_media') AS active,to_regclass('media_review_events') AS events");
     for(const name of Object.values(media.rows[0]))assert.ok(name,"Media schema must exist on both targets");
     await seedDatabase(pool,seed);
   }
   finally{await pool.end();}
 }
 const factory:ConnectionProviderFactory=(target,uri)=>({target,open:()=>new Pool({connectionString:uri,max:3})});
 const config=parseDatabaseConfig({DATABASE_MODE:"both",DATABASE_PRIMARY:"docker",
   DOCKER_DATABASE_URL:docker,SUPABASE_DATABASE_URL:secondary});
 const routed=createDatabaseRepository(config,factory);
 try{
   await routed.assertReady();
   const initial=await routed.inspect();
   assert.equal(initial.mode,"both");
   assert.equal(initial.primary,"docker");assert.equal(initial.secondary,"supabase");
   assert.deepEqual(initial.probes.map(x=>x.articles),[72,72]);
   assert.equal(initial.inSync,true,"Unmodified initial seeds match");
   assert.equal(initial.writePolicy,"primary-only");
   const a=(await routed.getEditorialArticle("lam-quen-nhip-sinh-hoat-so-sinh"))!;
   const updated=await routed.editArticle(a.article.slug,a.revision,{
     title:"Thử nghiệm chọn DB chính Docker",summary:"Bản sửa này chỉ được ghi trên database primary của hệ thống để kiểm tra routing.",
     readMinutes:a.article.readMinutes,tags:a.article.tags,sections:a.article.sections,sources:a.article.sources
   },{id:"demo-writer",role:"writer"});
   assert.equal(updated.revision,2);
   assert.equal((await routed.getArticle(a.article.slug))?.title,"Thử nghiệm chọn DB chính Docker");
   const after=await routed.inspect();
   assert.equal(after.inSync,false);
   assert.equal(after.probes[0].ready,true);
   assert.equal(after.probes[1].ready,true);
   // Directly verify observer has no mirrored write.
   const other=new Pool({connectionString:secondary});
   try{
     const r=await other.query<{revision:number}>("SELECT revision FROM knowledge_articles WHERE slug=$1",[a.article.slug]);
     assert.equal(r.rows[0].revision,1);
   }finally{await other.end();}
   const api=buildApp(routed);
   try{
     const health=(await api.inject("/health")).json();
     assert.equal(health.provider,"postgres");
     assert.equal((await api.inject("/v1/articles?stage=so-sinh")).json().meta.total,6);
   }finally{await api.close();}
 }catch(err){await routed.close().catch(()=>{});throw err;}
 const reverse=createDatabaseRepository(parseDatabaseConfig({
   DATABASE_MODE:"both",DATABASE_PRIMARY:"supabase",
   DOCKER_DATABASE_URL:docker,SUPABASE_DATABASE_URL:secondary
 }),factory);
 try{
   await reverse.assertReady();
   const a=await reverse.getEditorialArticle("lam-quen-nhip-sinh-hoat-so-sinh");
   assert.equal(a?.revision,1,"Switch primary changes read source, without copying data");
   assert.equal((await reverse.inspect()).inSync,false);
 }finally{await reverse.close();}
});
