import articles from "../../../packages/content/articles.json";
import topics from "../../../packages/content/mock/topics.json";
import sources from "../../../packages/content/mock/sources.json";
import researchCards from "../../../packages/content/mock/research-cards.json";
import manifest from "../../../packages/content/mock/manifest.json";
import {MockKnowledgeRepository} from "../../../packages/data/src/mock-repository";
import {ApiKnowledgeRepository} from "../../../packages/data/src/http-repository";
import {PublicKnowledgeRepository} from "../../../packages/data/src/public-repository";
import type {KnowledgeRepository,MockContentDataset} from "../../../packages/data/src/contracts";

/**
 * Switching the Web data provider does NOT change any route or page components.
 * HTTP mode fails closed on unavailable API: no fallback to private draft seed.
 * Database credentials only belong in the Fastify backend, never Next.js.
 */
let cached:{key:string;repository:KnowledgeRepository}|undefined;
export function getWebRepository():KnowledgeRepository{
 const mode=process.env.WEB_CONTENT_PROVIDER||"mock";
 const key=mode+"|"+(process.env.CONTENT_API_INTERNAL_URL||"")+"|"+process.env.NODE_ENV;
 if(cached?.key===key)return cached.repository;
 let repository:KnowledgeRepository;
 if(mode==="mock"){
   repository=new MockKnowledgeRepository({
     ...articles,topics,sources,researchCards,seededAt:manifest.generatedAt
   } as unknown as MockContentDataset);
 }else if(mode==="api"){
   const base=process.env.CONTENT_API_INTERNAL_URL;
   if(!base)throw new Error("WEB_CONTENT_PROVIDER=api requires CONTENT_API_INTERNAL_URL");
   repository=new ApiKnowledgeRepository(base,{
     publishedOnly:process.env.NODE_ENV==="production"
   });
 }else throw new Error("WEB_CONTENT_PROVIDER must be mock or api");
 if(process.env.NODE_ENV==="production")repository=new PublicKnowledgeRepository(repository);
 cached={key,repository};
 return repository;
}
