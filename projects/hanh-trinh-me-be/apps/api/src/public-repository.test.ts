import {test} from "node:test";
import assert from "node:assert/strict";
import {MockKnowledgeRepository} from "../../../packages/data/src/mock-repository.js";
import {PublicKnowledgeRepository} from "../../../packages/data/src/public-repository.js";
import {loadSeedDataset} from "./seed-data.js";
test("production policy excludes draft content and all editorial details for mock provider",async()=>{
 const repo=new PublicKnowledgeRepository(new MockKnowledgeRepository(loadSeedDataset()));
 assert.equal((await repo.listStages()).length,12);
 assert.equal((await repo.listArticles({status:"draft",limit:50})).meta.total,0);
 assert.equal((await repo.listArticles()).data.length,0);
 assert.equal(await repo.getArticle("lam-quen-nhip-sinh-hoat-so-sinh"),null);
 assert.equal((await repo.listResearchCards()).length,0);
 await assert.rejects(()=>repo.getOverview(),/disabled/);
 assert.equal((await repo.listSources()).length,45);
});
test("production policy preserves valid published content",async()=>{
 const sample=loadSeedDataset(),one=sample.articles[0];
 sample.articles[0]={...one,status:"published"};
 const repo=new PublicKnowledgeRepository(new MockKnowledgeRepository(sample));
 const result=await repo.listArticles({status:"draft",limit:50});
 assert.equal(result.meta.total,1);
 assert.equal(result.data[0].slug,one.slug);
 assert.equal((await repo.getArticle(one.slug))?.status,"published");
});
