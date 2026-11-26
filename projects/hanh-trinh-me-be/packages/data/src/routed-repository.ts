import {createHash} from "node:crypto";
import type {Article,ArticleQuery,ArticleSummary,EditorialOverview,Page,ResearchCard,ResearchQuery,SourceReference,Stage,Topic} from "./contracts.js";
import type {ArticleEditorSummary,EditableArticle,EditorialActor,EditorialDecision,EditorialRecord,EditorialRepository} from "./editorial-contracts.js";
import type {DatabaseTarget,DatabaseMode} from "./database-target.js";

export interface ManagedEditorialRepository extends EditorialRepository {
 assertReady():Promise<void>;
 close():Promise<void>;
}
export interface DatabaseProbe {
 target:DatabaseTarget;
 ready:boolean;
 articles?:number;
 fingerprint?:string;
}
export interface DatabaseHealth {
 mode:Exclude<DatabaseMode,"mock">;
 primary:DatabaseTarget;
 secondary:DatabaseTarget|null;
 probes:DatabaseProbe[];
 inSync:boolean|null;
 /** Secondary is read-only; never automatic dual write or silent failover. */
 writePolicy:"primary-only";
}
/**
 * Delegates ALL reads and writes exclusively to primary.
 * Standby is inspected read-only; out-of-sync data cannot silently become canonical.
 */
export class RoutedEditorialRepository implements ManagedEditorialRepository {
 readonly provider="postgres" as const;
 constructor(
   readonly mode:Exclude<DatabaseMode,"mock">,
   readonly primary:DatabaseTarget,
   private readonly source:ManagedEditorialRepository,
   readonly secondary:DatabaseTarget|null=null,
   private readonly observer:ManagedEditorialRepository|null=null
 ){
   if(Boolean(secondary)!==Boolean(observer))throw new Error("Secondary target must have an observer");
   if(secondary===primary)throw new Error("Primary and secondary targets must differ");
 }
 async assertReady():Promise<void>{
   await this.source.assertReady();
   if(this.observer)await this.observer.assertReady();
 }
 async close():Promise<void>{
   const items=[this.source,...(this.observer?[this.observer]:[])];
   const results=await Promise.allSettled(items.map(x=>x.close()));
   const failure=results.find(x=>x.status==="rejected");
   if(failure&&failure.status==="rejected")throw failure.reason;
 }
 private async probe(target:DatabaseTarget,repo:ManagedEditorialRepository):Promise<DatabaseProbe>{
   try{
     await repo.assertReady();
     const list=await repo.listEditorialArticles();
     const snapshot=list.map(x=>[x.slug,x.revision,x.status,x.title].join(":")).sort().join("|");
     return {target,ready:true,articles:list.length,
       fingerprint:createHash("sha256").update(snapshot).digest("hex").slice(0,16)};
   }catch{return {target,ready:false};}
 }
 async inspect():Promise<DatabaseHealth>{
   const probes=await Promise.all([
     this.probe(this.primary,this.source),
     ...(this.observer&&this.secondary?[this.probe(this.secondary,this.observer)]:[])
   ]);
   const inSync=probes.length===1?null:
     probes.every(x=>x.ready)?probes[0].fingerprint===probes[1].fingerprint:false;
   return {mode:this.mode,primary:this.primary,secondary:this.secondary,probes,inSync,writePolicy:"primary-only"};
 }
 listStages():Promise<Stage[]>{return this.source.listStages();}
 getStage(slug:string):Promise<Stage|null>{return this.source.getStage(slug);}
 listArticles(query?:ArticleQuery):Promise<Page<ArticleSummary>>{return this.source.listArticles(query);}
 listPreviewSearchArticles(){if(!this.source.listPreviewSearchArticles)throw Error("Preview search unsupported");return this.source.listPreviewSearchArticles();}
 getArticle(slug:string):Promise<Article|null>{return this.source.getArticle(slug);}
 listTopics(stageSlug?:string):Promise<Topic[]>{return this.source.listTopics(stageSlug);}
 listSources(stageSlug?:string):Promise<SourceReference[]>{return this.source.listSources(stageSlug);}
 listResearchCards(query?:ResearchQuery):Promise<ResearchCard[]>{return this.source.listResearchCards(query);}
 getOverview():Promise<EditorialOverview>{return this.source.getOverview();}
 getDisclaimer():Promise<string>{return this.source.getDisclaimer();}
 listEditorialArticles():Promise<ArticleEditorSummary[]>{return this.source.listEditorialArticles();}
 getEditorialArticle(slug:string):Promise<EditorialRecord|null>{return this.source.getEditorialArticle(slug);}
 editArticle(slug:string,revision:number,patch:EditableArticle,actor:EditorialActor):Promise<EditorialRecord>{
   return this.source.editArticle(slug,revision,patch,actor);
 }
 submitArticle(slug:string,revision:number,actor:EditorialActor):Promise<EditorialRecord>{
   return this.source.submitArticle(slug,revision,actor);
 }
 reviewArticle(slug:string,revision:number,decision:EditorialDecision,actor:EditorialActor,note?:string):Promise<EditorialRecord>{
   return this.source.reviewArticle(slug,revision,decision,actor,note);
 }
}
