import {createHash,timingSafeEqual} from "node:crypto";
import type {FastifyInstance,FastifyReply} from "fastify";
import {MediaError} from "./media-storage.js";
import type {MediaService} from "./media-service.js";
import {safeMediaFailure} from "./media-diagnostics.js";
const eq=(input:unknown,secret:string|undefined)=>typeof input==="string"&&input.length<=4096&&typeof secret==="string"&&secret.length>=24&&timingSafeEqual(createHash("sha256").update(input).digest(),createHash("sha256").update(secret).digest());
const no=(reply:FastifyReply)=>reply.code(404).send({error:"NOT_FOUND"});
const privacy=(reply:FastifyReply)=>reply.header("Cache-Control","private, no-store").header("X-Robots-Tag","noindex, nofollow");
function adminRole(value:unknown){
 const {MEDIA_DEV_EDITOR_TOKEN:e,MEDIA_DEV_REVIEWER_TOKEN:r,DEV_CONTENT_PREVIEW_TOKEN:p}=process.env;
 if(!e||!r||e.length<32||r.length<32||e===r||e===p||r===p||typeof value!=="string"||!value.startsWith("Bearer "))return null;
 const token=value.slice(7);return eq(token,e)?"editor":eq(token,r)?"reviewer":null;
}
const body=(value:unknown):Record<string,unknown>=>{if(!value||typeof value!=="object"||Array.isArray(value))throw new MediaError(400,"INVALID_PAYLOAD");return value as Record<string,unknown>;};
async function respond(reply:FastifyReply,task:()=>Promise<unknown>){
 try{return {data:await task()};}catch(e){if(e instanceof MediaError)return reply.code(e.status).send({error:e.code});return reply.code(503).send({error:"MEDIA_UNAVAILABLE"});}
}
async function imageReply(reply:FastifyReply,task:()=>Promise<{bytes:Buffer;mime:string;id:string}>){
 try{const data=await task();return reply.header("Content-Type",data.mime).header("X-Content-Type-Options","nosniff").header("Content-Security-Policy","default-src 'none'; sandbox").header("X-Media-Asset",data.id).send(data.bytes);}
 catch(e){
  const status=e instanceof MediaError?e.status:503;
  if(status>=500)console.warn("MEDIA_BINARY_FAILURE",JSON.stringify({status,kind:safeMediaFailure(e)}));
  return reply.code(status).send({error:e instanceof MediaError?e.code:"MEDIA_UNAVAILABLE"});
 }
}
export function registerMedia(app:FastifyInstance,service?:MediaService){
 app.get<{Params:{slug:string}}>("/v1/dev-preview/media/:slug",async(req,reply)=>{
   privacy(reply);if(!eq(req.headers["x-preview-token"],process.env.DEV_CONTENT_PREVIEW_TOKEN))return no(reply);
   if(!service)return reply.code(503).send({error:"MEDIA_DISABLED"});
   return respond(reply,()=>service.active(req.params.slug));
 });
 app.get<{Params:{slug:string;slot:string};Querystring:{revision?:string}}>("/v1/dev-preview/media/:slug/:slot",async(req,reply)=>{
   privacy(reply);if(!eq(req.headers["x-preview-token"],process.env.DEV_CONTENT_PREVIEW_TOKEN))return no(reply);
   if(!service)return reply.code(503).send({error:"MEDIA_DISABLED"});
   return imageReply(reply,()=>service.activeImage(req.params.slug,req.params.slot,req.query.revision));
 });
 app.get<{Params:{file:string}}>("/v1/dev-preview/media-catalog/:file",async(req,reply)=>{
   privacy(reply);if(!eq(req.headers["x-preview-token"],process.env.DEV_CONTENT_PREVIEW_TOKEN))return no(reply);
   if(!service)return reply.code(503).send({error:"MEDIA_DISABLED"});
   return imageReply(reply,()=>service.catalogImage(req.params.file));
 });
 app.get("/v1/dev-media-admin/session",async(req,reply)=>{
   privacy(reply);const role=adminRole(req.headers.authorization);if(!role)return no(reply);
   if(!service)return reply.code(503).send({error:"MEDIA_DISABLED"});
   return {data:{role}};
 });
 app.get("/v1/dev-media-admin/catalog",async(req,reply)=>{
   privacy(reply);if(!adminRole(req.headers.authorization))return no(reply);
   if(!service)return reply.code(503).send({error:"MEDIA_DISABLED"});
   return respond(reply,()=>service.adminCatalog());
 });
 app.get<{Params:{slug:string;slot:string;revision:string}}>("/v1/dev-media-admin/:slug/image/:slot/:revision",async(req,reply)=>{
   privacy(reply);if(!adminRole(req.headers.authorization))return no(reply);
   if(!service)return reply.code(503).send({error:"MEDIA_DISABLED"});
   if(!/^[1-9][0-9]{0,8}$/.test(req.params.revision))return no(reply);
   return imageReply(reply,()=>service.revisionImage(req.params.slug,req.params.slot,Number(req.params.revision)));
 });
 app.get<{Params:{slug:string}}>("/v1/dev-media-admin/:slug",async(req,reply)=>{
   privacy(reply);if(!adminRole(req.headers.authorization))return no(reply);
   if(!service)return reply.code(503).send({error:"MEDIA_DISABLED"});
   return respond(reply,()=>service.history(req.params.slug));
 });
 app.post<{Params:{slug:string}}>("/v1/dev-media-admin/:slug/preview",async(req,reply)=>{
   privacy(reply);if(!adminRole(req.headers.authorization))return no(reply);
   if(!service)return reply.code(503).send({error:"MEDIA_DISABLED"});
   return respond(reply,()=>{const b=body(req.body);return service.preview(req.params.slug,b.slot,b.revision);});
 });
 app.post<{Params:{slug:string}}>("/v1/dev-media-admin/:slug/upload",{bodyLimit:3*1024*1024},async(req,reply)=>{
   privacy(reply);if(adminRole(req.headers.authorization)!=="editor")return no(reply);
   if(!service)return reply.code(503).send({error:"MEDIA_DISABLED"});
   return respond(reply,()=>service.upload(req.params.slug,body(req.body)));
 });
 app.post<{Params:{slug:string}}>("/v1/dev-media-admin/:slug/review",async(req,reply)=>{
   privacy(reply);if(adminRole(req.headers.authorization)!=="reviewer")return no(reply);
   if(!service)return reply.code(503).send({error:"MEDIA_DISABLED"});
   return respond(reply,()=>service.review(req.params.slug,body(req.body)));
 });
}
