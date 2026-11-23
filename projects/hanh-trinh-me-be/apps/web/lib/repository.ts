import articles from "../../../packages/content/articles.json";
import topics from "../../../packages/content/mock/topics.json";
import sources from "../../../packages/content/mock/sources.json";
import researchCards from "../../../packages/content/mock/research-cards.json";
import manifest from "../../../packages/content/mock/manifest.json";
import {MockKnowledgeRepository} from "../../../packages/data/src/mock-repository";
import {ApiKnowledgeRepository} from "../../../packages/data/src/http-repository";
import {PublicKnowledgeRepository} from "../../../packages/data/src/public-repository";
import type {KnowledgeRepository,MockContentDataset,ArticleQuery,ResearchQuery} from "../../../packages/data/src/contracts";

/**
 * Switching the Web data provider does NOT change any route or page components.
 * HTTP mode falls back to a public-only local snapshot during Render Free sleep.
 * No draft article is ever surfaced via ordinary production routes.
 * Database credentials only belong in the Fastify backend, never Next.js.
 */
/** Read-only fallback for Render Free cold starts. Never expose draft articles. */
export class ResilientWebKnowledgeRepository implements KnowledgeRepository{
 readonly provider="api" as const;
 private fallbackUntil=0;
 constructor(
  private readonly primary:KnowledgeRepository,
  private readonly publicSnapshot:KnowledgeRepository,
  private readonly retryDelayMs=30000
 ){}
 private async read<T>(action:string,fn:(provider:KnowledgeRepository)=>Promise<T>):Promise<T>{
  if(Date.now()<this.fallbackUntil)return fn(this.publicSnapshot);
  try{
   const result=await fn(this.primary);
   this.fallbackUntil=0;
   return result;
  }catch{
   this.fallbackUntil=Date.now()+this.retryDelayMs;
   console.warn("WEB_PUBLIC_SNAPSHOT_FALLBACK",action);
   return fn(this.publicSnapshot);
  }
 }
 listStages(){return this.read("stages",r=>r.listStages());}
 getStage(slug:string){return this.read("stage",r=>r.getStage(slug));}
 listArticles(q:ArticleQuery={}){return this.read("articles",r=>r.listArticles(q));}
 getArticle(slug:string){return this.read("article",r=>r.getArticle(slug));}
 listTopics(stage?:string){return this.read("topics",r=>r.listTopics(stage));}
 listSources(stage?:string){return this.read("sources",r=>r.listSources(stage));}
 listResearchCards(q:ResearchQuery={}){return this.read("cards",r=>r.listResearchCards(q));}
 getOverview(){return this.read("overview",r=>r.getOverview());}
 getDisclaimer(){return this.read("disclaimer",r=>r.getDisclaimer());}
}

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
   const primary=new ApiKnowledgeRepository(base,{
     publishedOnly:process.env.NODE_ENV==="production",timeoutMs:10000
   });
   const safeSnapshot=new PublicKnowledgeRepository(new MockKnowledgeRepository({
     ...articles,topics,sources,researchCards,seededAt:manifest.generatedAt
   } as unknown as MockContentDataset));
   repository=new ResilientWebKnowledgeRepository(primary,safeSnapshot);
 }else throw new Error("WEB_CONTENT_PROVIDER must be mock or api");
 if(process.env.NODE_ENV==="production")repository=new PublicKnowledgeRepository(repository);
 cached={key,repository};
 return repository;
}
