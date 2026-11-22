import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {MockKnowledgeRepository} from "../../../packages/data/src/mock-repository.js";
import {JsonMockEditorialRepository} from "../../../packages/data/src/json-editorial-repository.js";
import type {MockContentDataset,KnowledgeRepository} from "../../../packages/data/src/contracts.js";

/** Composition root: future PostgreSQL adapter will implement the same contracts. */
export function createKnowledgeRepository():KnowledgeRepository{
 if(process.env.CONTENT_PROVIDER && process.env.CONTENT_PROVIDER!=="mock")
   throw new Error("CONTENT_PROVIDER=postgres is not implemented; refusing to silently use mock");
 const read=(path:string)=>JSON.parse(readFileSync(new URL("../../../packages/content/"+path,import.meta.url),"utf8"));
 const base=read("articles.json");
 const manifest=read("mock/manifest.json");
 const data:MockContentDataset={
   version:base.version,disclaimer:base.disclaimer,stages:base.stages,
   articles:base.articles,topics:read("mock/topics.json"),sources:read("mock/sources.json"),
   researchCards:read("mock/research-cards.json"),seededAt:manifest.generatedAt
 };
 if(process.env.NODE_ENV==="production")return new MockKnowledgeRepository(data);
 const path=fileURLToPath(new URL("../../../.local/editorial-state.json",import.meta.url));
 return new JsonMockEditorialRepository(data,path);
}
