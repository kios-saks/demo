import type {
 Article,ArticleQuery,ArticleSummary,EditorialOverview,KnowledgeRepository,Page,
 ResearchCard,ResearchQuery,SourceReference,Stage,Topic
} from "./contracts.js";

export interface ApiRepositoryOptions {
 readonly fetcher?:typeof fetch;
 /** When rendering a public production site, NEVER show draft content. */
 readonly publishedOnly?:boolean;
}
/**
 * HTTP adapter to the existing KnowledgeRepository contract.
 * Works for server-rendered Web and native clients; never handles a DB credential.
 */
export class ApiKnowledgeRepository implements KnowledgeRepository {
 readonly provider="api" as const;
 private readonly base:string;
 private readonly fetcher:typeof fetch;
 private readonly publicOnly:boolean;
 constructor(baseUrl:string,options:ApiRepositoryOptions={}){
   const parsed=new URL(baseUrl);
   if(!["http:","https:"].includes(parsed.protocol)||parsed.username||parsed.password||
      parsed.search||parsed.hash||parsed.pathname!=="/")
     throw new Error("CONTENT_API_INTERNAL_URL must be an HTTP(S) origin without credentials");
   this.base=parsed.origin;
   this.fetcher=options.fetcher||fetch;
   this.publicOnly=options.publishedOnly===true;
 }
 private async request<T>(path:string,notFoundIsNull=false):Promise<T|null>{
   const response=await this.fetcher(this.base+path,{
     method:"GET",headers:{"accept":"application/json"},cache:"no-store"
   });
   if(response.status===404&&notFoundIsNull)return null;
   if(!response.ok)throw new Error("Knowledge API request failed: HTTP "+response.status);
   return response.json() as Promise<T>;
 }
 private query(path:string,params:Record<string,string|number|undefined>):string{
   const query=new URLSearchParams();
   for(const [key,value] of Object.entries(params))
     if(value!==undefined&&value!=="")query.set(key,String(value));
   return path+(query.size?"?"+query.toString():"");
 }
 async listStages():Promise<Stage[]>{
   const res=await this.request<{data:Stage[]}>("/v1/stages");
   return res!.data;
 }
 async getStage(slug:string):Promise<Stage|null>{
   const res=await this.request<{data:Stage}>("/v1/stages/"+encodeURIComponent(slug),true);
   return res?.data||null;
 }
 async listArticles(query:ArticleQuery={}):Promise<Page<ArticleSummary>>{
   // Force published status at the transport boundary, regardless of caller arguments.
   const params={...query,status:this.publicOnly?"published":query.status};
   const response=await this.request<Page<ArticleSummary>>(this.query("/v1/articles",params));
   if(!this.publicOnly)return response!;
   const published=response!.data.filter(x=>x.status==="published");
   return {...response!,data:published,meta:{...response!.meta,total:published.length}};
 }
 async getArticle(slug:string):Promise<Article|null>{
   const response=await this.request<{data:Article}>("/v1/articles/"+encodeURIComponent(slug),true);
   const article=response?.data||null;
   return this.publicOnly&&article?.status!=="published"?null:article;
 }
 async listTopics(stageSlug?:string):Promise<Topic[]>{
   const result=await this.request<{data:Topic[]}>(this.query("/v1/topics",{stage:stageSlug}));
   return result!.data;
 }
 async listSources(stageSlug?:string):Promise<SourceReference[]>{
   const result=await this.request<{data:SourceReference[]}>(this.query("/v1/sources",{stage:stageSlug}));
   return result!.data;
 }
 async listResearchCards(query:ResearchQuery={}):Promise<ResearchCard[]>{
   if(this.publicOnly)return [];
   const response=await this.request<{data:ResearchCard[]}>(
      this.query("/v1/research-cards",{stage:query.stage,topicId:query.topicId})
   );
   return response!.data;
 }
 async getOverview():Promise<EditorialOverview>{
   if(this.publicOnly)throw new Error("Editorial overview is not available publicly");
   const result=await this.request<{data:EditorialOverview}>("/v1/editorial/overview");
   return result!.data;
 }
 async getDisclaimer():Promise<string>{
   const result=await this.request<{data:string}>("/v1/disclaimer");
   return result!.data;
 }
}
