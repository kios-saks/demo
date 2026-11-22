import Fastify from "fastify";
import cors from "@fastify/cors";
import type { KnowledgeRepository, EditorialStatus } from "../../../packages/data/src/contracts.js";
import { createKnowledgeRepository } from "./repository.js";
import { registerAdmin } from "./admin.js";
import type { DemoTokens } from "./admin.js";

export function buildApp(repository:KnowledgeRepository=createKnowledgeRepository(),tokens?:DemoTokens) {
  const app=Fastify({logger:false});
  if("close" in repository && typeof repository.close==="function")
    app.addHook("onClose",async()=>{await (repository as KnowledgeRepository & {close:()=>Promise<void>}).close();});
  void app.register(cors,{origin:process.env.CORS_ORIGIN?.split(",")||["http://localhost:3000"]});
  void registerAdmin(app,repository,tokens);
  app.get("/health",async()=>({ok:true,version:"0.4.0",provider:repository.provider}));
  app.get("/v1/disclaimer",async()=>({data:await repository.getDisclaimer()}));
  app.get("/v1/stages",async()=>({data:await repository.listStages()}));
  app.get<{Params:{slug:string}}>("/v1/stages/:slug",async(req,reply)=>{
    const stage=await repository.getStage(req.params.slug);
    return stage?{data:stage}:reply.code(404).send({error:"STAGE_NOT_FOUND"});
  });
  app.get<{Querystring:{q?:string;stage?:string;status?:string;page?:string;limit?:string}}>("/v1/articles",async(req,reply)=>{
    const {q="",stage="",status,page="1",limit="12"}=req.query;
    const parsedPage=Number(page),parsedLimit=Number(limit);
    if(!Number.isInteger(parsedPage)||parsedPage<1||!Number.isInteger(parsedLimit)||parsedLimit<1||parsedLimit>50)
      return reply.code(400).send({error:"INVALID_PAGINATION",message:"1<=limit<=50; page>=1"});
    const statuses=["draft","in_review","published","archived"];
    if(status && !statuses.includes(status))return reply.code(400).send({error:"INVALID_STATUS"});
    const isProd=process.env.NODE_ENV==="production";
    // Public production API must never surface unapproved articles, even if status=draft is requested.
    if(isProd&&status&&status!=="published")return reply.code(403).send({error:"DRAFT_REQUIRES_EDITORIAL_AUTH"});
    const result=await repository.listArticles({q,stage,status:isProd?"published":status as EditorialStatus|undefined,page:parsedPage,limit:parsedLimit});
    return result;
  });
  app.get<{Params:{slug:string}}>("/v1/articles/:slug",async(req,reply)=>{
    const article=await repository.getArticle(req.params.slug);
    if(!article||(process.env.NODE_ENV==="production"&&article.status!=="published"))
      return reply.code(404).send({error:"ARTICLE_NOT_FOUND"});
    return {data:article,disclaimer:await repository.getDisclaimer()};
  });
  app.get<{Querystring:{stage?:string}}>("/v1/topics",async(req)=>({data:await repository.listTopics(req.query.stage)}));
  app.get<{Querystring:{stage?:string}}>("/v1/sources",async(req)=>({data:await repository.listSources(req.query.stage)}));
  // Research drafts are demonstration-only and are not public production API.
  app.get<{Querystring:{stage?:string;topicId?:string}}>("/v1/research-cards",async(req,reply)=>
    process.env.NODE_ENV==="production"
      ?reply.code(404).send({error:"NOT_FOUND"})
      :{data:await repository.listResearchCards(req.query)}
  );
  app.get("/v1/editorial/overview",async(_req,reply)=>
    process.env.NODE_ENV==="production"
      ?reply.code(404).send({error:"NOT_FOUND"})
      :{data:await repository.getOverview()}
  );
  return app;
}
