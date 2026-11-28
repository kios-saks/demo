import {ApiKnowledgeRepository} from "../../../packages/data/src/http-repository";
import type {Stage,Article,ArticleSummary} from "../../../packages/data/src/contracts";

/** Persistent public knowledge only. Never store access tokens or medical profiles here. */
export interface ContentStorage {
 getItem(key:string):Promise<string|null>;
 setItem(key:string,value:string):Promise<void>;
 removeItem(key:string):Promise<void>;
}
export interface OfflineIndex {
 stages:Stage[];
 articles:ArticleSummary[];
 savedAt:number;
}
interface CacheRecord<T> {version:1;savedAt:number;value:T}
const TTL_MS=72*60*60*1000;
const MAX_ARTICLE_PAGES=10;
/**
 * Phone-safe HTTP + offline cache adapter. Fails closed in release: no bundled
 * draft fallback and no caching of unapproved drafts.
 */
export class MobileContentSync {
 readonly repo:ApiKnowledgeRepository;
 private readonly key:string;
 constructor(
   baseUrl:string,
   private readonly store:ContentStorage,
   private readonly publicOnly:boolean,
   fetcher?:typeof fetch,
   private readonly now:()=>number=Date.now
 ){
   const uri=new URL(baseUrl);
   if(publicOnly && uri.protocol!=="https:")throw new Error("Public Mobile content API requires HTTPS");
   this.repo=new ApiKnowledgeRepository(baseUrl,{fetcher,publishedOnly:publicOnly});
   this.key="mebe-knowledge-v1-"+encodeURIComponent(uri.origin)+(publicOnly?"-public":"-preview");
 }
 private async read<T>(key:string):Promise<T|null>{
   try{
     const raw=await this.store.getItem(key);
     if(!raw)return null;
     const obj=JSON.parse(raw) as Partial<CacheRecord<T>>;
     if(obj.version!==1||typeof obj.savedAt!=="number"||!Number.isFinite(obj.savedAt)
        ||obj.savedAt>this.now()||this.now()-obj.savedAt>TTL_MS||obj.value===undefined)
       return null;
     return obj.value;
   }catch{return null;}
 }
 private async save<T>(key:string,value:T):Promise<void>{
   await this.store.setItem(key,JSON.stringify({version:1,savedAt:this.now(),value}));
 }
 private safeArticles<T extends {status:string}>(items:T[]):T[]{
   return this.publicOnly?items.filter(a=>a.status==="published"):items;
 }
 async cachedIndex():Promise<OfflineIndex|null>{
   const cache=await this.read<{stages:Stage[];articles:ArticleSummary[]}>(this.key+":index");
   if(!cache||!Array.isArray(cache.stages)||!Array.isArray(cache.articles))return null;
   return {stages:cache.stages,articles:this.safeArticles(cache.articles),savedAt:this.now()};
 }
 async refreshIndex():Promise<OfflineIndex>{
   const stages=await this.repo.listStages();
   const articles:ArticleSummary[]=[];
   for(let page=1;page<=MAX_ARTICLE_PAGES;page++){
     const response=await this.repo.listArticles({page,limit:50});
     articles.push(...this.safeArticles(response.data));
     if(response.data.length===0||page*50>=response.meta.total)break;
   }
   const snapshot={stages,articles};
   await this.save(this.key+":index",snapshot).catch(()=>{});
   return {...snapshot,savedAt:this.now()};
 }
 async loadArticle(slug:string):Promise<Article|null>{
   const key=this.key+":article:"+slug;
   const fallback=await this.read<Article>(key);
   const safeFallback=fallback?.slug===slug&&(!this.publicOnly||fallback.status==="published")
      ?fallback:null;
   try{
     const article=await this.repo.getArticle(slug);
     if(!article||this.publicOnly&&article.status!=="published"){
       await this.store.removeItem(key).catch(()=>{});
       return null;
     }
     await this.save(key,article).catch(()=>{});
     return article;
   }catch(error){
     if(safeFallback)return safeFallback;
     throw error;
   }
 }
}
