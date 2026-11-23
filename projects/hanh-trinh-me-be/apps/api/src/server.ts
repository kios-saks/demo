import {loadLocalEnv} from "./db/connection.js";
import {RoutedEditorialRepository} from "../../../packages/data/src/routed-repository.js";
import {createKnowledgeRepository} from "./repository.js";
import {buildApp} from "./app.js";

loadLocalEnv();
const repo=createKnowledgeRepository();
const app=buildApp(repo);
try{
 // Bind HTTP before probing external PostgreSQL. Render Free cold starts must
 // not crash the process solely because the Shared Pooler is slow to respond.
 // /health is liveness; /health/ready independently checks database readiness.
 await app.listen({port:Number(process.env.PORT||4000),host:"0.0.0.0"});
 console.log("API_HTTP_LISTENING");
 if(repo instanceof RoutedEditorialRepository){
   try{
     await repo.assertReady();
     const status=await repo.inspect();
     // No database URLs, passwords or secrets in diagnostic logs.
     console.log("Database route:",status.mode,"primary:",status.primary,"secondary:",status.secondary||"none");
     if(status.inSync===false)console.warn("Secondary database differs from primary; secondary is read-only");
   }catch(error){
     // Transient PostgreSQL warmup failures must not terminate a listening API.
     // The Render readiness probe will retry independently until the DB recovers.
     const candidate=error&&typeof error==="object"&&"code" in error?String(error.code):"UNKNOWN";
     const code=/^[A-Z0-9_]{2,48}$/.test(candidate)?candidate:"UNKNOWN";
     console.warn("ME_BE_DATABASE_INITIAL_CHECK_FAILED",code);
   }
 }
}catch(error){
 // Fastify's logger is disabled for this demo, so emit ONLY an allowlisted
 // driver error code. Do not print exception messages: some include DB URI.
 const candidate=error&&typeof error==="object"&&"code" in error?String(error.code):"UNKNOWN";
 const code=/^[A-Z0-9_]{2,48}$/.test(candidate)?candidate:"UNKNOWN";
 console.error("ME_BE_BACKEND_STARTUP_FAILED",code);
 await app.close();
 process.exitCode=1;
}
for(const signal of ["SIGINT","SIGTERM"] as const)
 process.once(signal,()=>{void app.close().finally(()=>{process.exitCode=0;})});
