import type {Article,ArticleQuery,ArticleSummary,EditorialOverview,KnowledgeRepository,Page,ResearchCard,ResearchQuery,SourceReference,Stage,Topic} from "./contracts.js";

/**
 * Fail-closed release gate, regardless of storage provider.
 * Production readers may only see content explicitly marked published.
 * This decorator does not grant editorial access or promote draft articles.
 */
export class PublicKnowledgeRepository implements KnowledgeRepository{
 constructor(private readonly source:KnowledgeRepository){}
 get provider():KnowledgeRepository["provider"]{return this.source.provider;}
 listStages():Promise<Stage[]>{return this.source.listStages();}
 getStage(slug:string):Promise<Stage|null>{return this.source.getStage(slug);}
 async listArticles(query:ArticleQuery={}):Promise<Page<ArticleSummary>>{
   const result=await this.source.listArticles({...query,status:"published"});
   const safe=result.data.filter(x=>x.status==="published");
   return {...result,data:safe,meta:{...result.meta,
      total:safe.length===result.data.length?result.meta.total:safe.length}};
 }
 async getArticle(slug:string):Promise<Article|null>{
   const result=await this.source.getArticle(slug);
   return result?.status==="published"?result:null;
 }
 listTopics(stage?:string):Promise<Topic[]>{return this.source.listTopics(stage);}
 listSources(stage?:string):Promise<SourceReference[]>{return this.source.listSources(stage);}
 async listResearchCards(_query:ResearchQuery={}):Promise<ResearchCard[]>{return [];}
 async getOverview():Promise<EditorialOverview>{throw new Error("Editorial overview disabled in public release");}
 getDisclaimer():Promise<string>{return this.source.getDisclaimer();}
}
