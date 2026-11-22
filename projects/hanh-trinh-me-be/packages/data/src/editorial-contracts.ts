import type {Article, ArticleSection, ArticleSource, ArticleSummary, KnowledgeRepository} from "./contracts.js";

export type DemoRole="writer"|"editor"|"reviewer";
export interface EditorialActor {id:string;role:DemoRole}
export type EditorialDecision="editorial_approve"|"medical_approve"|"request_changes";
export type EditorialAction="edit"|"submit"|"editorial_approve"|"medical_approve"|"request_changes";
export interface EditorialApproval {actorId:string;revision:number;at:string}
export interface EditorialEvent {sequence:number;action:EditorialAction;actorId:string;role:DemoRole;revision:number;at:string;note?:string}
export interface EditorialRecord {
 article:Article;
 revision:number;
 lastEditorId:string;
 submittedRevision:number|null;
 editorialApproval:EditorialApproval|null;
 medicalApproval:EditorialApproval|null;
 events:EditorialEvent[];
 updatedAt:string|null;
}
export type EditableArticle=Pick<Article,"title"|"summary"|"readMinutes"|"tags"|"sections"|"sources">;
export type ArticleEditorSummary=ArticleSummary & {
 revision:number; submittedRevision:number|null;
 editorialApproved:boolean;medicalApproved:boolean;updatedAt:string|null
};
export interface EditorialRepository extends KnowledgeRepository {
 listEditorialArticles():Promise<ArticleEditorSummary[]>;
 getEditorialArticle(slug:string):Promise<EditorialRecord|null>;
 editArticle(slug:string,expectedRevision:number,patch:EditableArticle,actor:EditorialActor):Promise<EditorialRecord>;
 submitArticle(slug:string,expectedRevision:number,actor:EditorialActor):Promise<EditorialRecord>;
 reviewArticle(slug:string,expectedRevision:number,decision:EditorialDecision,actor:EditorialActor,note?:string):Promise<EditorialRecord>;
}
export class EditorialError extends Error {
 constructor(public readonly code:string,public readonly statusCode:number,message=code){super(message);}
}
export function validateEditable(value:unknown):asserts value is EditableArticle {
 if(!value||typeof value!=="object"||Array.isArray(value))throw new EditorialError("INVALID_ARTICLE",422);
 const a=value as Record<string,unknown>;
 const trimmed=(v:unknown,min:number,max:number)=>typeof v==="string"&&v.trim().length>=min&&v.trim().length<=max;
 if(!trimmed(a.title,5,180)||!trimmed(a.summary,15,1000))
   throw new EditorialError("INVALID_TITLE_OR_SUMMARY",422);
 if(!Number.isInteger(a.readMinutes)||(a.readMinutes as number)<1||(a.readMinutes as number)>90)
   throw new EditorialError("INVALID_READ_MINUTES",422);
 if(!Array.isArray(a.tags)||a.tags.length>15||a.tags.some(t=>!trimmed(t,1,60)))
   throw new EditorialError("INVALID_TAGS",422);
 if(!Array.isArray(a.sections)||a.sections.length<1||a.sections.length>30 ||
    a.sections.some((s:ArticleSection)=>!s||!trimmed(s.heading,2,150)||!Array.isArray(s.paragraphs)||
      s.paragraphs.length<1||s.paragraphs.length>30||s.paragraphs.some(p=>!trimmed(p,3,5000))))
   throw new EditorialError("INVALID_SECTIONS",422);
 if(!Array.isArray(a.sources)||a.sources.length<1||a.sources.length>30||
    a.sources.some((s:ArticleSource)=>!s||!trimmed(s.name,3,250)||typeof s.url!=="string"||
      !/^https:\/\/[^\s]+$/i.test(s.url) || s.url.length>2000))
   throw new EditorialError("INVALID_SOURCES",422);
}