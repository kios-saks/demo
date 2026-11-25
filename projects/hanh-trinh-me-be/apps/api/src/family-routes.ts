import type {FastifyInstance,FastifyRequest,FastifyReply} from "fastify";
import {FamilyError,type FixtureFamilyService} from "./family-service.js";
import {authConfig,createSupabaseAuth} from "../../../packages/auth/src/supabase-auth.js";
type Awaitable<T>=T|Promise<T>;
export type FamilyRepository = { [K in keyof FixtureFamilyService]: FixtureFamilyService[K] extends (...args:infer A)=>infer R ? (...args:A)=>Awaitable<R> : never };
export interface FamilyDependencies {
 // Established provider adapter must verify signature/issuer/audience/expiry and account status.
 // The route never trusts identity or role supplied in JSON or headers other than verified Bearer.
 verifyIdentity:(token:string)=>Promise<string|null>;
 service:FamilyRepository;
}
// Compose a real provider with a future durable repository; server startup remains disabled.
export function createSupabaseFamilyDependencies(service:FamilyRepository,env:Record<string,string|undefined>):FamilyDependencies|null{
 const config=authConfig(env);if(!config)return null;
 return {service,verifyIdentity:createSupabaseAuth(config).verifyIdentity};
}
export function registerFamilyRoutes(app:FastifyInstance,deps:FamilyDependencies){
 const {service,verifyIdentity}=deps;
 const run=(fn:(id:string,req:FastifyRequest)=>unknown)=>async(req:FastifyRequest,reply:FastifyReply)=>{
  reply.header("Cache-Control","private, no-store").header("X-Robots-Tag","noindex, nofollow");
  const auth=req.headers.authorization;
  if(typeof auth!=="string"||!/^Bearer [^\s]{1,8192}$/.test(auth))return reply.code(401).send({error:"AUTH_REQUIRED"});
  let id:string|null;
  try{id=await verifyIdentity(auth.slice(7));}catch{return reply.code(503).send({error:"AUTH_UNAVAILABLE"});}
  if(!id)return reply.code(401).send({error:"AUTH_REQUIRED"});
  try{return {data:await fn(id,req)};}catch(e){
   if(e instanceof FamilyError)return reply.code(e.status).send({error:e.code});
   return reply.code(500).send({error:"FAMILY_ERROR"});
  }
 };
 const body=(req:FastifyRequest,keys:string[]):Record<string,unknown>=>{
  const b=req.body;if(!b||typeof b!=="object"||Array.isArray(b)||Object.keys(b).some(k=>!keys.includes(k)))throw new FamilyError(400,"INVALID_BODY");
  return b as Record<string,unknown>;
 };
 const param=(req:FastifyRequest,key:string)=>(req.params as Record<string,string>)[key];
 app.post("/v1/account/onboard",run((id,r)=>{const b=body(r,["displayName","consentVersion"]);return service.onboard(id,b.displayName,b.consentVersion);}));
 app.get("/v1/account/me",run(id=>service.me(id)));
 app.post("/v1/families",run((id,r)=>service.create(id,body(r,["name"]).name)));
 app.get("/v1/families",run(id=>service.list(id)));
 app.get("/v1/families/:familyId",run((id,r)=>service.get(id,param(r,"familyId"))));
 app.patch("/v1/families/:familyId/journey",run((id,r)=>{const b=body(r,["stage","revision"]);return service.updateJourney(id,param(r,"familyId"),b.stage,b.revision);}));
 app.get("/v1/families/:familyId/members",run((id,r)=>service.members(id,param(r,"familyId"))));
 app.post("/v1/families/:familyId/invitations",run((id,r)=>{const b=body(r,["accountId","role"]);return service.invite(id,param(r,"familyId"),b.accountId,b.role);}));
 app.post("/v1/family-invitations/accept",run((id,r)=>service.accept(id,body(r,["token"]).token)));
 app.delete("/v1/families/:familyId/members/:accountId",run(async(id,r)=>{await service.revoke(id,param(r,"familyId"),param(r,"accountId"));return {revoked:true};}));
}
