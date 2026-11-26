import type {
 Article, ArticleQuery, ArticleSummary, PreviewSearchArticle, EditorialOverview, KnowledgeRepository,
 MockContentDataset, Page, ResearchCard, ResearchQuery, SourceReference, Stage, Topic
} from "./contracts.js";

/** Normalize Vietnamese accents and đ for forgiving in-memory demo search. */
function normalize(input:string):string {
 return input.toLocaleLowerCase("vi-VN").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").trim();
}
const clone=<T>(obj:T):T=>structuredClone(obj);

/**
 * Pure, read-only and deterministic. Tests can inject a different dataset.
 * No DB connection and no persistence. Returned objects are defensive copies.
 */
export class MockKnowledgeRepository implements KnowledgeRepository {
 readonly provider="mock" as const;
 protected readonly seed:MockContentDataset;
 constructor(dataset:MockContentDataset) {
   this.seed=clone(dataset);
   this.validate();
 }
 private validate() {
   const stageIds=new Set(this.seed.stages.map(s=>s.slug));
   const topicIds=new Set(this.seed.topics.map(t=>t.id));
   const sourceIds=new Set(this.seed.sources.map(s=>s.id));
   const articleIds=new Set(this.seed.articles.map(a=>a.slug));
   const cardIds=new Set(this.seed.researchCards.map(c=>c.id));
   if(stageIds.size!==this.seed.stages.length||topicIds.size!==this.seed.topics.length||
      sourceIds.size!==this.seed.sources.length||articleIds.size!==this.seed.articles.length||
      cardIds.size!==this.seed.researchCards.length)throw new Error("Duplicate seed identifier");
   for (const a of this.seed.articles) {
     if(!stageIds.has(a.stage))throw new Error("Unknown article stage: "+a.stage);
     if(a.status!=="draft"&&a.status!=="published"&&a.status!=="in_review"&&a.status!=="archived")throw new Error("Invalid editorial status");
   }
   for(const t of this.seed.topics)for(const slug of t.stageSlugs)
     if(!stageIds.has(slug))throw new Error("Unknown topic stage: "+slug);
   for(const s of this.seed.sources) {
     if(!/^https:\/\//.test(s.url))throw new Error("Source must use HTTPS: "+s.id);
     for(const slug of s.stageSlugs)if(!stageIds.has(slug))throw new Error("Unknown source stage");
   }
   for(const c of this.seed.researchCards) {
     if(!stageIds.has(c.stageSlug)||!topicIds.has(c.topicId))throw new Error("Unknown card topic or stage: "+c.id);
     if(!c.sourceIds.length||c.sourceIds.some(id=>!sourceIds.has(id)))throw new Error("Unknown source for card: "+c.id);
     if(c.status!=="draft"||c.medicalApproval||c.reviewedAt!==null)throw new Error("Mock research card must be unapproved draft");
   }
 }
 async listStages():Promise<Stage[]>{return clone([...this.seed.stages].sort((a,b)=>a.order-b.order));}
 async getStage(slug:string):Promise<Stage|null>{return clone(this.seed.stages.find(s=>s.slug===slug)||null);}
 async listArticles(query:ArticleQuery={}):Promise<Page<ArticleSummary>> {
   const {q="",stage="",status,page=1,limit=12}=query;
   if(!Number.isInteger(page)||page<1||!Number.isInteger(limit)||limit<1||limit>50)throw new RangeError("INVALID_PAGINATION");
   const search=normalize(q);
   const articles=this.seed.articles.filter(a=>
     (!stage||a.stage===stage)&&(!status||a.status===status)&&
     (!search||normalize([a.title,a.summary,...a.tags].join(" ")).includes(search))
   ).sort((a,b)=>a.order-b.order);
   const selected=articles.slice((page-1)*limit,page*limit).map(({sections,sources,...summary})=>summary);
   return {data:clone(selected),meta:{total:articles.length,page,limit}};
 }
 async listPreviewSearchArticles():Promise<PreviewSearchArticle[]>{
   return clone(this.seed.articles.slice(0,73).map(({slug,stage,title,summary,status,tags,sections})=>({slug,stage,title,summary,status,tags,sections})));
 }
 async getArticle(slug:string):Promise<Article|null>{return clone(this.seed.articles.find(a=>a.slug===slug)||null);}
 async listTopics(stageSlug?:string):Promise<Topic[]>{return clone(this.seed.topics.filter(t=>!stageSlug||t.stageSlugs.includes(stageSlug)).sort((a,b)=>a.order-b.order));}
 async listSources(stageSlug?:string):Promise<SourceReference[]>{return clone(this.seed.sources.filter(s=>!stageSlug||s.stageSlugs.includes(stageSlug)));}
 async listResearchCards(query:ResearchQuery={}):Promise<ResearchCard[]>{return clone(this.seed.researchCards.filter(c=>(!query.stage||c.stageSlug===query.stage)&&(!query.topicId||c.topicId===query.topicId)));}
 async getOverview():Promise<EditorialOverview>{
   return {provider:"mock",stages:this.seed.stages.length,articles:this.seed.articles.length,
     drafts:this.seed.articles.filter(a=>a.status==="draft").length,
     published:this.seed.articles.filter(a=>a.status==="published").length,
     topics:this.seed.topics.length,sources:this.seed.sources.length,researchCards:this.seed.researchCards.length,lastSeededAt:this.seed.seededAt};
 }
 async getDisclaimer():Promise<string>{return this.seed.disclaimer;}
}
