import articles from "../../../packages/content/articles.json";
import topics from "../../../packages/content/mock/topics.json";
import sources from "../../../packages/content/mock/sources.json";
import researchCards from "../../../packages/content/mock/research-cards.json";
import manifest from "../../../packages/content/mock/manifest.json";
import {MockKnowledgeRepository} from "../../../packages/data/src/mock-repository";
import type {KnowledgeRepository,MockContentDataset} from "../../../packages/data/src/contracts";

/** Server-side composition root. Swap for an API client when using PostgreSQL. */
let instance:KnowledgeRepository|undefined;
export function getWebRepository():KnowledgeRepository {
 if(!instance) instance=new MockKnowledgeRepository({
   ...articles,topics,sources,researchCards,seededAt:manifest.generatedAt
 } as unknown as MockContentDataset);
 return instance;
}
