import type {Pool,PoolClient} from "pg";
import type {
 Article,ArticleQuery,ArticleSummary,PreviewSearchArticle,EditorialOverview,KnowledgeRepository,Page,
 ResearchCard,ResearchQuery,SourceReference,Stage,Topic
} from "./contracts.js";
import type {
 ArticleEditorSummary,EditableArticle,EditorialActor,EditorialDecision,EditorialEvent,
 EditorialRecord,EditorialRepository,EditorialApproval
} from "./editorial-contracts.js";
import {EditorialError,validateEditable} from "./editorial-contracts.js";

/** Canonical search normalizer shared by mock seed import and PostgreSQL queries. */
export function normalizeSearch(input:string):string{
 return input.toLocaleLowerCase("vi-VN").normalize("NFD")
   .replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").trim();
}
const json=<T>(value:T):T=>structuredClone(value);
type PgQuery=Pick<PoolClient,"query">;
interface ArticleRow{
 slug:string;stage_slug:string;sort_order:number;status:Article["status"];
 payload:Article;revision:number;last_editor_id:string;submitted_revision:number|null;
 editorial_approval:EditorialApproval|null;medical_approval:EditorialApproval|null;updated_at:Date|null
}
interface EventRow{
 sequence:number;action:EditorialEvent["action"];actor_id:string;role:EditorialActor["role"];
 revision:number;happened_at:Date;note:string|null;
}
const ARTICLE_FIELDS="slug,stage_slug,sort_order,status,payload,revision,last_editor_id,submitted_revision,editorial_approval,medical_approval,updated_at";
function asRecord(row:ArticleRow,events:EditorialEvent[]):EditorialRecord{
 return {
   article:json(row.payload),revision:row.revision,lastEditorId:row.last_editor_id,
   submittedRevision:row.submitted_revision,editorialApproval:row.editorial_approval,
   medicalApproval:row.medical_approval,events,updatedAt:row.updated_at?.toISOString()||null
 };
}
function toSummary(row:ArticleRow):ArticleEditorSummary{
 const {sections,sources,...summary}=row.payload;
 return json({...summary,revision:row.revision,submittedRevision:row.submitted_revision,
   editorialApproved:row.editorial_approval?.revision===row.revision,
   medicalApproved:row.medical_approval?.revision===row.revision,
   updatedAt:row.updated_at?.toISOString()||null});
}
export class PostgresEditorialRepository implements EditorialRepository {
 readonly provider="postgres" as const;
 constructor(private readonly pool:Pool){}
 async assertReady(){
   const r=await this.pool.query<{count:string}>("SELECT count(*)::text AS count FROM knowledge_stages");
   if(Number(r.rows[0]?.count)===0)throw new Error("PostgreSQL has no seed data; run db:seed");
 }
 async close(){await this.pool.end();}
 async listStages():Promise<Stage[]>{
   const r=await this.pool.query<{slug:string;title:string;icon:string;range:string;description:string;order:number}>(
     'SELECT slug,title,icon,range_label AS range,description,sort_order AS "order" FROM knowledge_stages ORDER BY sort_order,slug');
   return r.rows.map(x=>json(x));
 }
 async getStage(slug:string):Promise<Stage|null>{
   const r=await this.pool.query<Stage>('SELECT slug,title,icon,range_label AS range,description,sort_order AS "order" FROM knowledge_stages WHERE slug=$1',[slug]);
   return r.rows[0]?json(r.rows[0]):null;
 }
 async listArticles(query:ArticleQuery={}):Promise<Page<ArticleSummary>>{
   const {q="",stage="",status,page=1,limit=12}=query;
   if(!Number.isInteger(page)||page<1||!Number.isInteger(limit)||limit<1||limit>50)throw new RangeError("INVALID_PAGINATION");
   const conditions:string[]=[];const parameters:unknown[]=[];
   if(stage){parameters.push(stage);conditions.push("stage_slug=$"+parameters.length);}
   if(status){parameters.push(status);conditions.push("status=$"+parameters.length);}
   if(q.trim()){
     // Treat literal '%' and '_' as text, not patterns.
     const escaped=normalizeSearch(q).replace(/[\\%_]/g,"\\$&");
     parameters.push("%"+escaped+"%");
     conditions.push("search_text LIKE $"+parameters.length+" ESCAPE '\\'");
   }
   const where=conditions.length?" WHERE "+conditions.join(" AND "):"";
   const count=await this.pool.query<{total:string}>("SELECT count(*)::text AS total FROM knowledge_articles"+where,parameters);
   const limitIdx=parameters.length+1,offsetIdx=parameters.length+2;
   const rows=await this.pool.query<{payload:Article}>(`SELECT payload FROM knowledge_articles${where}
     ORDER BY sort_order,slug LIMIT $${limitIdx} OFFSET $${offsetIdx}`,[...parameters,limit,(page-1)*limit]);
   return {data:rows.rows.map(({payload})=>{const {sections,sources,...summary}=payload;return json(summary);}),
     meta:{total:Number(count.rows[0].total),page,limit}};
 }
 async listPreviewSearchArticles():Promise<PreviewSearchArticle[]>{
   // One bounded query against the canonical primary; 73rd row signals inventory drift.
   const r=await this.pool.query<{payload:Article}>("SELECT payload FROM knowledge_articles ORDER BY sort_order,slug LIMIT 73");
   return r.rows.map(({payload:{slug,stage,title,summary,status,tags,sections}})=>json({slug,stage,title,summary,status,tags,sections}));
 }
 async getArticle(slug:string):Promise<Article|null>{
   const r=await this.pool.query<{payload:Article}>("SELECT payload FROM knowledge_articles WHERE slug=$1",[slug]);
   return r.rows[0]?json(r.rows[0].payload):null;
 }
 async listTopics(stageSlug?:string):Promise<Topic[]>{
   const sql=stageSlug?
    "SELECT t.data FROM knowledge_topics t JOIN knowledge_topic_stages ts ON ts.topic_id=t.id WHERE ts.stage_slug=$1 ORDER BY (t.data->>'order')::int,t.id":
    "SELECT data FROM knowledge_topics ORDER BY (data->>'order')::int,id";
   const r=await this.pool.query<{data:Topic}>(sql,stageSlug?[stageSlug]:[]);
   return r.rows.map(x=>json(x.data));
 }
 async listSources(stageSlug?:string):Promise<SourceReference[]>{
   const sql=stageSlug?
     "SELECT s.data FROM knowledge_sources s JOIN knowledge_source_stages ss ON ss.source_id=s.id WHERE ss.stage_slug=$1 ORDER BY s.id":
     "SELECT data FROM knowledge_sources ORDER BY id";
   const r=await this.pool.query<{data:SourceReference}>(sql,stageSlug?[stageSlug]:[]);
   return r.rows.map(x=>json(x.data));
 }
 async listResearchCards(query:ResearchQuery={}):Promise<ResearchCard[]>{
   const where:string[]=[];const params:unknown[]=[];
   if(query.stage){params.push(query.stage);where.push("stage_slug=$"+params.length);}
   if(query.topicId){params.push(query.topicId);where.push("topic_id=$"+params.length);}
   const r=await this.pool.query<{data:ResearchCard}>(`SELECT data FROM knowledge_research_cards${where.length?" WHERE "+where.join(" AND "):""} ORDER BY id`,params);
   return r.rows.map(x=>json(x.data));
 }
 async getOverview():Promise<EditorialOverview>{
   const r=await this.pool.query<{
      stages:string;articles:string;drafts:string;published:string;topics:string;sources:string;cards:string
   }>(`SELECT
      (SELECT count(*) FROM knowledge_stages)::text AS stages,
      (SELECT count(*) FROM knowledge_articles)::text AS articles,
      (SELECT count(*) FROM knowledge_articles WHERE status='draft')::text AS drafts,
      (SELECT count(*) FROM knowledge_articles WHERE status='published')::text AS published,
      (SELECT count(*) FROM knowledge_topics)::text AS topics,
      (SELECT count(*) FROM knowledge_sources)::text AS sources,
      (SELECT count(*) FROM knowledge_research_cards)::text AS cards`);
   const x=r.rows[0];
   const last=await this.readSetting("seededAt");
   return {provider:"postgres",stages:Number(x.stages),articles:Number(x.articles),
     drafts:Number(x.drafts),published:Number(x.published),topics:Number(x.topics),sources:Number(x.sources),
     researchCards:Number(x.cards),lastSeededAt:last||""};
 }
 private async readSetting(key:string):Promise<string>{
   const r=await this.pool.query<{value:string}>("SELECT value FROM app_settings WHERE key=$1",[key]);
   return r.rows[0]?.value||"";
 }
 async getDisclaimer(){return this.readSetting("disclaimer");}
 async listEditorialArticles():Promise<ArticleEditorSummary[]>{
   const r=await this.pool.query<ArticleRow>(`SELECT ${ARTICLE_FIELDS} FROM knowledge_articles ORDER BY sort_order,slug`);
   return r.rows.map(toSummary);
 }
 private async findRecord(query:PgQuery,slug:string,locked=false):Promise<EditorialRecord|null>{
   const r=await query.query<ArticleRow>(`SELECT ${ARTICLE_FIELDS} FROM knowledge_articles WHERE slug=$1${locked?" FOR UPDATE":""}`,[slug]);
   if(!r.rows[0])return null;
   const ev=await query.query<EventRow>("SELECT sequence,action,actor_id,role,revision,happened_at,note FROM editorial_events WHERE article_slug=$1 ORDER BY sequence",[slug]);
   return asRecord(r.rows[0],ev.rows.map(x=>({
     sequence:x.sequence,action:x.action,actorId:x.actor_id,role:x.role,
     revision:x.revision,at:x.happened_at.toISOString(),...(x.note?{note:x.note}:{})
   })));
 }
 async getEditorialArticle(slug:string):Promise<EditorialRecord|null>{
   return this.findRecord(this.pool,slug);
 }
 private assertRevision(record:EditorialRecord,expectedRevision:number){
   if(!Number.isInteger(expectedRevision)||expectedRevision<1)throw new EditorialError("INVALID_REVISION",400);
   if(record.revision!==expectedRevision)throw new EditorialError("REVISION_CONFLICT",409);
 }
 private async transaction(slug:string,action:(r:EditorialRecord)=>Promise<{
    changedArticle:boolean;newRevision:boolean;event:{action:EditorialEvent["action"];actor:EditorialActor;note?:string}
   }>):Promise<EditorialRecord>{
   const client=await this.pool.connect();
   try{
     await client.query("BEGIN");
     const rec=await this.findRecord(client,slug,true);
     if(!rec)throw new EditorialError("ARTICLE_NOT_FOUND",404);
     const outcome=await action(rec);
     const now=new Date().toISOString();
     await client.query(`UPDATE knowledge_articles SET status=$2,payload=$3::jsonb,search_text=$4,revision=$5,
       last_editor_id=$6,submitted_revision=$7,editorial_approval=$8::jsonb,
       medical_approval=$9::jsonb,updated_at=$10::timestamptz WHERE slug=$1`,[
       slug,rec.article.status,JSON.stringify(rec.article),
       normalizeSearch([rec.article.title,rec.article.summary,...rec.article.tags].join(" ")),
       rec.revision,rec.lastEditorId,rec.submittedRevision,
       rec.editorialApproval?JSON.stringify(rec.editorialApproval):null,
       rec.medicalApproval?JSON.stringify(rec.medicalApproval):null,now
     ]);
     if(outcome.newRevision)await client.query(`INSERT INTO editorial_revisions(article_slug,revision,snapshot,editor_id)
       VALUES($1,$2,$3::jsonb,$4)`,[slug,rec.revision,JSON.stringify(rec.article),rec.lastEditorId]);
     const event=outcome.event;
     await client.query(`INSERT INTO editorial_events(article_slug,sequence,action,actor_id,role,revision,note)
       VALUES($1,$2,$3,$4,$5,$6,$7)`,[
       slug,rec.events.length+1,event.action,event.actor.id,event.actor.role,rec.revision,event.note||null
     ]);
     const updated=await this.findRecord(client,slug);
     await client.query("COMMIT");
     return updated!;
   }catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
 }
 async editArticle(slug:string,expectedRevision:number,patch:EditableArticle,actor:EditorialActor){
   if(actor.role!=="writer"&&actor.role!=="editor")throw new EditorialError("ROLE_FORBIDDEN",403);
   validateEditable(patch);
   const safe:EditableArticle=json({title:patch.title,summary:patch.summary,
     readMinutes:patch.readMinutes,tags:patch.tags,sections:patch.sections,sources:patch.sources});
   return this.transaction(slug,async rec=>{
     this.assertRevision(rec,expectedRevision);
     if(rec.article.status==="archived")throw new EditorialError("ARCHIVED_ARTICLE",409);
     Object.assign(rec.article,safe);
     rec.article.title=safe.title.trim();rec.article.summary=safe.summary.trim();
     rec.article.status="draft";rec.revision++;rec.lastEditorId=actor.id;
     rec.submittedRevision=null;rec.editorialApproval=null;rec.medicalApproval=null;
     return {changedArticle:true,newRevision:true,event:{action:"edit",actor}};
   });
 }
 async submitArticle(slug:string,expectedRevision:number,actor:EditorialActor){
   if(actor.role!=="writer"&&actor.role!=="editor")throw new EditorialError("ROLE_FORBIDDEN",403);
   return this.transaction(slug,async rec=>{
     this.assertRevision(rec,expectedRevision);
     if(rec.article.status!=="draft")throw new EditorialError("NOT_A_DRAFT",409);
     validateEditable(rec.article);
     rec.article.status="in_review";rec.submittedRevision=rec.revision;
     rec.editorialApproval=null;rec.medicalApproval=null;
     return {changedArticle:true,newRevision:false,event:{action:"submit",actor}};
   });
 }
 async reviewArticle(slug:string,expectedRevision:number,decision:EditorialDecision,actor:EditorialActor,note?:string){
   const role=decision==="medical_approve"?"reviewer":"editor";
   if(actor.role!==role)throw new EditorialError("ROLE_FORBIDDEN",403);
   if(!["editorial_approve","medical_approve","request_changes"].includes(decision))
     throw new EditorialError("INVALID_DECISION",422);
   if(decision==="request_changes"&&(!note||note.trim().length<5||note.length>1000))
     throw new EditorialError("REVIEW_NOTE_REQUIRED",422);
   return this.transaction(slug,async rec=>{
     this.assertRevision(rec,expectedRevision);
     if(rec.article.status!=="in_review"||rec.submittedRevision!==rec.revision)
       throw new EditorialError("NOT_SUBMITTED_REVISION",409);
     if(rec.lastEditorId===actor.id)throw new EditorialError("SELF_REVIEW_FORBIDDEN",403);
     if(decision==="request_changes"){
       rec.article.status="draft";rec.submittedRevision=null;
       rec.editorialApproval=null;rec.medicalApproval=null;
     }else{
       const approval={revision:rec.revision,actorId:actor.id,at:new Date().toISOString()};
       if(decision==="editorial_approve")rec.editorialApproval=approval;
       else rec.medicalApproval=approval;
     }
     // No publish transition; any approval here is from an unverified demo role.
     return {changedArticle:true,newRevision:false,event:{action:decision,actor,note:note?.trim()}};
   });
 }
}
