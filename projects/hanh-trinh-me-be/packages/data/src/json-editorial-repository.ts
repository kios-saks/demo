import {mkdir,rename,writeFile,unlink} from "node:fs/promises";
import {existsSync,readFileSync} from "node:fs";
import {dirname} from "node:path";
import {randomUUID} from "node:crypto";
import {MockKnowledgeRepository} from "./mock-repository.js";
import type {MockContentDataset} from "./contracts.js";
import {EditorialError,validateEditable} from "./editorial-contracts.js";
import type {
 ArticleEditorSummary,EditableArticle,EditorialActor,EditorialDecision,EditorialRecord,EditorialRepository
} from "./editorial-contracts.js";
const clone=<T>(x:T):T=>structuredClone(x);
type StoredState={format:1;records:Record<string,EditorialRecord>};

/**
 * Local editable JSON mock. NOT a production database: one node process,
 * no multi-instance locking, no real accounts or verified professional credentials.
 */
export class JsonMockEditorialRepository extends MockKnowledgeRepository implements EditorialRepository {
 private records=new Map<string,EditorialRecord>();
 private pending:Promise<unknown>=Promise.resolve();
 constructor(dataset:MockContentDataset,private readonly persistencePath:string|null=null){
   super(dataset);
   for(const a of this.seed.articles){
     this.records.set(a.slug,{
       article:clone(a),revision:1,lastEditorId:"seed-import",submittedRevision:null,
       editorialApproval:null,medicalApproval:null,events:[],updatedAt:null
     });
   }
   if(persistencePath&&existsSync(persistencePath)){
     const state=JSON.parse(readFileSync(persistencePath,"utf8")) as StoredState;
     if(state.format!==1||!state.records||typeof state.records!=="object")throw new Error("Incompatible editorial JSON snapshot");
     for(const [slug,rec] of Object.entries(state.records)){
       const seed=this.records.get(slug);
       if(!seed||rec.article?.slug!==slug||rec.article.stage!==seed.article.stage||
          !Number.isInteger(rec.revision)||rec.revision<1||rec.article.status==="published")
         throw new Error("Invalid editorial JSON snapshot entry: "+slug);
       validateEditable(rec.article);
       if(!Array.isArray(rec.events))throw new Error("Invalid editorial audit history");
       this.records.set(slug,clone(rec));
     }
   }
   for(const rec of this.records.values())this.syncArticle(rec);
 }
 private syncArticle(rec:EditorialRecord){
   const i=this.seed.articles.findIndex(a=>a.slug===rec.article.slug);
   if(i>=0)this.seed.articles[i]=clone(rec.article);
 }
 async listEditorialArticles():Promise<ArticleEditorSummary[]>{
   return [...this.records.values()].sort((a,b)=>a.article.order-b.article.order).map(rec=>{
     const {sections,sources,...summary}=rec.article;
     return clone({...summary,revision:rec.revision,submittedRevision:rec.submittedRevision,
       editorialApproved:rec.editorialApproval?.revision===rec.revision,
       medicalApproved:rec.medicalApproval?.revision===rec.revision,updatedAt:rec.updatedAt});
   });
 }
 async getEditorialArticle(slug:string):Promise<EditorialRecord|null>{
   return clone(this.records.get(slug)||null);
 }
 private async transaction(slug:string,action:(record:EditorialRecord)=>void):Promise<EditorialRecord>{
   const run=async()=>{
     const old=this.records.get(slug);
     if(!old)throw new EditorialError("ARTICLE_NOT_FOUND",404);
     const updated=clone(old);
     action(updated);
     if(this.persistencePath){
       const state:StoredState={format:1,records:Object.fromEntries([...this.records].map(([key,r])=>[key,key===slug?updated:r]))};
       await mkdir(dirname(this.persistencePath),{recursive:true,mode:0o700});
       const temp=this.persistencePath+"."+randomUUID()+".tmp";
       try{
         await writeFile(temp,JSON.stringify(state,null,2)+"\n",{mode:0o600,flag:"wx"});
         await rename(temp,this.persistencePath);
       }catch(err){await unlink(temp).catch(()=>{});throw err;}
     }
     this.records.set(slug,updated);
     this.syncArticle(updated);
     return clone(updated);
   };
   const result=this.pending.then(run);
   this.pending=result.then(()=>{},()=>{});
   return result;
 }
 private assertRevision(r:EditorialRecord,revision:number){
   if(!Number.isInteger(revision)||revision<1)throw new EditorialError("INVALID_REVISION",400);
   if(r.revision!==revision)throw new EditorialError("REVISION_CONFLICT",409);
 }
 private event(r:EditorialRecord,actor:EditorialActor,action: "edit"|"submit"|"editorial_approve"|"medical_approve"|"request_changes",note?:string){
   const at=new Date().toISOString();
   r.updatedAt=at;
   r.events.push({sequence:r.events.length+1,action,revision:r.revision,at,actorId:actor.id,role:actor.role,...(note?{note}: {})});
 }
 async editArticle(slug:string,expectedRevision:number,patch:EditableArticle,actor:EditorialActor){
   if(actor.role!=="writer"&&actor.role!=="editor")throw new EditorialError("ROLE_FORBIDDEN",403);
   validateEditable(patch);
   const safe:EditableArticle=clone({title:patch.title,summary:patch.summary,readMinutes:patch.readMinutes,tags:patch.tags,sections:patch.sections,sources:patch.sources});
   return this.transaction(slug,r=>{
     this.assertRevision(r,expectedRevision);
     if(r.article.status==="archived")throw new EditorialError("ARCHIVED_ARTICLE",409);
     Object.assign(r.article,safe);
     r.article.title=safe.title.trim();r.article.summary=safe.summary.trim();
     r.article.status="draft";
     r.revision++;
     r.lastEditorId=actor.id;r.submittedRevision=null;
     r.editorialApproval=null;r.medicalApproval=null;
     this.event(r,actor,"edit");
   });
 }
 async submitArticle(slug:string,expectedRevision:number,actor:EditorialActor){
   if(actor.role!=="writer"&&actor.role!=="editor")throw new EditorialError("ROLE_FORBIDDEN",403);
   return this.transaction(slug,r=>{
     this.assertRevision(r,expectedRevision);
     if(r.article.status!=="draft")throw new EditorialError("NOT_A_DRAFT",409);
     validateEditable(r.article);
     r.article.status="in_review";r.submittedRevision=r.revision;
     r.editorialApproval=null;r.medicalApproval=null;
     this.event(r,actor,"submit");
   });
 }
 async reviewArticle(slug:string,expectedRevision:number,decision:EditorialDecision,actor:EditorialActor,note?:string){
   const requiredRole=decision==="medical_approve"?"reviewer":"editor";
   if(actor.role!==requiredRole)throw new EditorialError("ROLE_FORBIDDEN",403);
   if(!["editorial_approve","medical_approve","request_changes"].includes(decision))
     throw new EditorialError("INVALID_DECISION",422);
   if(decision==="request_changes"&&(!note||note.trim().length<5||note.length>1000))
     throw new EditorialError("REVIEW_NOTE_REQUIRED",422);
   return this.transaction(slug,r=>{
     this.assertRevision(r,expectedRevision);
     if(r.article.status!=="in_review"||r.submittedRevision!==r.revision)
       throw new EditorialError("NOT_SUBMITTED_REVISION",409);
     if(r.lastEditorId===actor.id)throw new EditorialError("SELF_REVIEW_FORBIDDEN",403);
     if(decision==="request_changes"){
       r.article.status="draft";r.submittedRevision=null;
       r.editorialApproval=null;r.medicalApproval=null;
     }else{
       const approval={revision:r.revision,actorId:actor.id,at:new Date().toISOString()};
       if(decision==="editorial_approve")r.editorialApproval=approval;
       else r.medicalApproval=approval;
     }
     this.event(r,actor,decision,note?.trim());
     // Never auto-publish: simulated review is not a verified medical credential.
   });
 }
}