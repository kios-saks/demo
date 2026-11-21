import { readFileSync } from "node:fs";
import { MockKnowledgeRepository } from "../../../packages/data/src/mock-repository.js";
import type { MockContentDataset } from "../../../packages/data/src/contracts.js";

/** Composition root: change only this function when PostgreSQL adapter exists. */
export function createKnowledgeRepository() {
  if(process.env.CONTENT_PROVIDER && process.env.CONTENT_PROVIDER!=="mock")
    throw new Error("CONTENT_PROVIDER=postgres is not implemented; refusing to silently use mock");
  const read=(path:string)=>JSON.parse(readFileSync(new URL("../../../packages/content/"+path,import.meta.url),"utf8"));
  const base=read("articles.json");
  const manifest=read("mock/manifest.json");
  const dataset:MockContentDataset={
    version:base.version,disclaimer:base.disclaimer,stages:base.stages,
    articles:base.articles,topics:read("mock/topics.json"),sources:read("mock/sources.json"),
    researchCards:read("mock/research-cards.json"),seededAt:manifest.generatedAt
  };
  return new MockKnowledgeRepository(dataset);
}
