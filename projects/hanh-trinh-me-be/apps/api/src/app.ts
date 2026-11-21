import Fastify from "fastify";
import cors from "@fastify/cors";
import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync(new URL("../../../packages/content/articles.json", import.meta.url), "utf8"));
export function buildApp() {
 const app=Fastify();
 void app.register(cors,{origin:process.env.CORS_ORIGIN?.split(",")||["http://localhost:3000"]});
 app.get("/health",async()=>({ok:true,version:"0.1.0"}));
 app.get("/v1/stages",async()=>({data:data.stages}));
 app.get<{Params:{slug:string}}>("/v1/stages/:slug",async(req,reply)=>data.stages.find((s:{slug:string})=>s.slug===req.params.slug)||reply.code(404).send({error:"NOT_FOUND"}));
 app.get<{Querystring:{q?:string;stage?:string;page?:string;limit?:string}}>("/v1/articles",async(req,reply)=>{
 const {q="",stage="",page="1",limit="12"}=req.query;const p=Number(page),n=Number(limit);
 if(!Number.isInteger(p)||p<1||!Number.isInteger(n)||n<1||n>50)return reply.code(400).send({error:"INVALID_PAGINATION"});
 const matches=data.articles.filter((a:{stage:string;title:string;summary:string})=>(!stage||a.stage===stage)&&(!q||[a.title,a.summary].join(" ").toLocaleLowerCase("vi-VN").includes(q.toLocaleLowerCase("vi-VN"))));
 return {data:matches.slice((p-1)*n,p*n).map((a:{sections:unknown;sources:unknown})=>{const {sections,sources,...rest}=a;return rest;}),meta:{total:matches.length,page:p,limit:n}};
 });
 app.get<{Params:{slug:string}}>("/v1/articles/:slug",async(req,reply)=>{const article=data.articles.find((a:{slug:string})=>a.slug===req.params.slug);return article?{data:article,disclaimer:data.disclaimer}:reply.code(404).send({error:"NOT_FOUND"});});
 return app;
}