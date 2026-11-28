import {createHash,timingSafeEqual} from "node:crypto";
import type {FastifyInstance,FastifyReply,FastifyRequest} from "fastify";
import {EditorialError} from "../../../packages/data/src/editorial-contracts.js";
import type {
 DemoRole,EditorialActor,EditorialDecision,EditorialRepository,EditableArticle
} from "../../../packages/data/src/editorial-contracts.js";
import type {KnowledgeRepository} from "../../../packages/data/src/contracts.js";

export interface DemoTokens {writer?:string;editor?:string;reviewer?:string}
function configuredTokens(tokens:DemoTokens):tokens is Record<DemoRole,string>{
 const values=[tokens.writer,tokens.editor,tokens.reviewer];
 return values.every(v=>typeof v==="string"&&v.length>=24)&&new Set(values).size===3;
}
function authenticate(value:string|undefined,tokens:Record<DemoRole,string>):EditorialActor|null{
 if(!value?.startsWith("Bearer "))return null;
 const raw=value.slice(7);
 if(!raw||raw.length>4096)return null;
 const input=createHash("sha256").update(raw).digest();
 for(const role of ["writer","editor","reviewer"] as const){
   const expected=createHash("sha256").update(tokens[role]).digest();
   if(timingSafeEqual(input,expected))return {id:"demo-"+role,role};
 }
 return null;
}
function isEditorialRepository(repo:KnowledgeRepository):repo is EditorialRepository {
 return "getEditorialArticle" in repo && "editArticle" in repo && "reviewArticle" in repo;
}
async function respond<T>(reply:FastifyReply,task:()=>Promise<T>){
 try{return {data:await task()}}
 catch(err){
   if(err instanceof EditorialError)return reply.code(err.statusCode).send({error:err.code});
   throw err;
 }
}
/**
 * Local-only role-key demonstration, NOT production identity/MFA.
 * Requests fail closed if env keys are missing or deployment is production.
 */
export async function registerAdmin(app:FastifyInstance,repo:KnowledgeRepository,configured:DemoTokens={
 writer:process.env.EDITORIAL_DEMO_WRITER_TOKEN,
 editor:process.env.EDITORIAL_DEMO_EDITOR_TOKEN,
 reviewer:process.env.EDITORIAL_DEMO_REVIEWER_TOKEN
}){
 const actors=new WeakMap<FastifyRequest,EditorialActor>();
 app.register(async function adminRoutes(admin){
   admin.addHook("onRequest",async(req,reply)=>{
     reply.header("Cache-Control","no-store");
     if(process.env.NODE_ENV==="production")return reply.code(404).send({error:"NOT_FOUND"});
     if(!isEditorialRepository(repo))return reply.code(503).send({error:"EDITORIAL_STORE_UNAVAILABLE"});
     if(!configuredTokens(configured))return reply.code(503).send({error:"EDITORIAL_DEMO_NOT_CONFIGURED"});
     const actor=authenticate(req.headers.authorization,configured);
     if(!actor)return reply.code(401).send({error:"UNAUTHORIZED"});
     actors.set(req,actor);
   });
   const user=(req:FastifyRequest)=>actors.get(req)!;
   const store=repo as EditorialRepository;
   admin.get("/session",async(req)=>({data:user(req)}));
   admin.get("/articles",async(_req,reply)=>respond(reply,()=>store.listEditorialArticles()));
   admin.get<{Params:{slug:string}}>("/articles/:slug",async(req,reply)=>respond(reply,async()=>{
     const rec=await store.getEditorialArticle(req.params.slug);
     if(!rec)throw new EditorialError("ARTICLE_NOT_FOUND",404);
     return rec;
   }));
   admin.get<{Params:{slug:string}}>("/articles/:slug/history",async(req,reply)=>respond(reply,async()=>{
     const rec=await store.getEditorialArticle(req.params.slug);
     if(!rec)throw new EditorialError("ARTICLE_NOT_FOUND",404);
     return rec.events;
   }));
   admin.put<{Params:{slug:string};Body:{expectedRevision:number;content:EditableArticle}}>("/articles/:slug",async(req,reply)=>respond(reply,async()=>{
     const payload=req.body;
     if(!payload||!payload.content)throw new EditorialError("INVALID_PAYLOAD",400);
     return store.editArticle(req.params.slug,payload.expectedRevision,payload.content,user(req));
   }));
   admin.post<{Params:{slug:string};Body:{expectedRevision:number}}>("/articles/:slug/submit",async(req,reply)=>respond(reply,async()=>{
     if(!req.body)throw new EditorialError("INVALID_PAYLOAD",400);
     return store.submitArticle(req.params.slug,req.body.expectedRevision,user(req));
   }));
   admin.post<{Params:{slug:string};Body:{expectedRevision:number;decision:EditorialDecision;note?:string}}>("/articles/:slug/review",async(req,reply)=>respond(reply,async()=>{
     if(!req.body||typeof req.body.decision!=="string")throw new EditorialError("INVALID_PAYLOAD",400);
     return store.reviewArticle(req.params.slug,req.body.expectedRevision,req.body.decision,user(req),req.body.note);
   }));
 },{prefix:"/v1/admin"});
}
