import {test} from "node:test";
import assert from "node:assert/strict";
import type {KnowledgeRepository} from "../../../packages/data/src/contracts.js";
import {MockKnowledgeRepository} from "../../../packages/data/src/mock-repository.js";
import {ApiKnowledgeRepository} from "../../../packages/data/src/http-repository.js";
import {PublicKnowledgeRepository} from "../../../packages/data/src/public-repository.js";
import {ResilientWebKnowledgeRepository} from "../../web/lib/repository.js";
import {loadSeedDataset} from "./seed-data.js";

test("when upstream is asleep, public Web shows 12 stage cards but never any draft content",async()=>{
 const request=async()=>new Response("Cold start upstream",{status:502});
 const upstream=new ApiKnowledgeRepository("https://api.example.invalid",{publishedOnly:true,fetcher:request as typeof fetch});
 const safe=new PublicKnowledgeRepository(new MockKnowledgeRepository(loadSeedDataset()));
 const repo:KnowledgeRepository=new ResilientWebKnowledgeRepository(upstream,safe);
 assert.equal((await repo.listStages()).length,12);
 assert.equal((await repo.listArticles()).meta.total,0);
 assert.equal(await repo.getArticle("ngu-an-toan-cho-tre-so-sinh"),null);
 assert.equal((await repo.listSources()).length,loadSeedDataset().sources.length);
 assert.deepEqual(await repo.listResearchCards(),[]);
 await assert.rejects(()=>repo.getOverview(),/disabled|available publicly/);
});
