import Fastify from "fastify";
import {registerFamilyRoutes,type FamilyDependencies} from "./family-routes.js";
import {timingSafeEqual} from "node:crypto";
import cors from "@fastify/cors";
import type { KnowledgeRepository, EditorialStatus } from "../../../packages/data/src/contracts.js";
import { createKnowledgeRepository } from "./repository.js";
import { registerAdmin } from "./admin.js";
import type { DemoTokens } from "./admin.js";
import {registerMedia} from "./media-routes.js";
import type {MediaService} from "./media-service.js";

export function buildApp(repository:KnowledgeRepository=createKnowledgeRepository(),tokens?:DemoTokens,media?:MediaService,family?:FamilyDependencies) {
  const app=Fastify({logger:false});
  if("close" in repository && typeof repository.close==="function")
    app.addHook("onClose",async()=>{await (repository as KnowledgeRepository & {close:()=>Promise<void>}).close();});
  void app.register(cors,{origin:process.env.CORS_ORIGIN?.split(",")||["http://localhost:3000"]});
  void registerAdmin(app,repository,tokens);
  registerMedia(app,media);
  // No default fixture or live adapter: existing server startup does not register family routes.
  if(family)registerFamilyRoutes(app,family);
  if(media)app.addHook("onClose",async()=>media.close());
  app.get("/health",async()=>({ok:true,version:"0.4.1",provider:repository.provider}));
  app.get("/health/ready",async(_req,reply)=>{
    try{
      // Check the selected data adapter without exposing DB URLs or credentials.
      if("assertReady" in repository && typeof repository.assertReady==="function")
        await (repository as KnowledgeRepository & {assertReady:()=>Promise<void>}).assertReady();
      else await repository.listStages();
      return {ok:true};
    }catch{
      return reply.code(503).send({ok:false,error:"DEPENDENCY_UNAVAILABLE"});
    }
  });
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

  /**
   * Development reading room: source-linked drafts, never reachable through
   * normal production endpoints. A long random token is required for every read.
   * This feature is read-only: no CMS roles, writes or publishing permissions.
   */
  const previewAuthorized=(value:string|string[]|undefined)=>{
    const secret=process.env.DEV_CONTENT_PREVIEW_TOKEN;
    if(!secret||secret.length<24||typeof value!=="string")return false;
    const expected=Buffer.from(secret,"utf8"),actual=Buffer.from(value,"utf8");
    return actual.length===expected.length&&timingSafeEqual(actual,expected);
  };
  app.get("/v1/dev-preview/search-corpus",async(req,reply)=>{
    if(!previewAuthorized(req.headers["x-preview-token"]))return reply.code(404).send({error:"NOT_FOUND"});
    reply.header("Cache-Control","private, no-store");reply.header("X-Robots-Tag","noindex, nofollow");
    try{
      if(Object.keys(req.query as object).length||!repository.listPreviewSearchArticles)return reply.code(400).send({error:"INVALID_SEARCH_CORPUS_REQUEST"});
      const data=await repository.listPreviewSearchArticles();
      if(data.length!==72||new Set(data.map(a=>a.slug)).size!==72||data.some(a=>a.status!=="draft"||!Array.isArray(a.sections)||!a.sections.length||a.sections.some(s=>typeof s.heading!=="string"||!Array.isArray(s.paragraphs)||!s.paragraphs.length||s.paragraphs.some(p=>typeof p!=="string"))))throw Error("Invalid corpus");
      return {data:data.map(({slug,stage,title,summary,status,tags,sections})=>({slug,stage,title,summary,status,tags,sections:sections.map(({heading,paragraphs})=>({heading,paragraphs}))}))};
    }catch{return reply.code(503).send({error:"SEARCH_CORPUS_UNAVAILABLE"});}
  });
  app.get<{Querystring:{q?:string;stage?:string;page?:string;limit?:string}}>(
    "/v1/dev-preview/articles",async(req,reply)=>{
      if(!previewAuthorized(req.headers["x-preview-token"]))
        return reply.code(404).send({error:"NOT_FOUND"});
      reply.header("Cache-Control","private, no-store");
      reply.header("X-Robots-Tag","noindex, nofollow");
      const {q="",stage="",page="1",limit="50"}=req.query;
      const n=Number(page),size=Number(limit);
      if(!Number.isInteger(n)||n<1||!Number.isInteger(size)||size<1||size>50)
        return reply.code(400).send({error:"INVALID_PAGINATION"});
      return repository.listArticles({q,stage,page:n,limit:size});
    }
  );
  app.get<{Params:{slug:string}}>("/v1/dev-preview/articles/:slug",async(req,reply)=>{
    if(!previewAuthorized(req.headers["x-preview-token"]))
      return reply.code(404).send({error:"NOT_FOUND"});
    reply.header("Cache-Control","private, no-store");
    reply.header("X-Robots-Tag","noindex, nofollow");
    const article=await repository.getArticle(req.params.slug);
    return article?{data:article,disclaimer:await repository.getDisclaimer()}
      :reply.code(404).send({error:"ARTICLE_NOT_FOUND"});
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
