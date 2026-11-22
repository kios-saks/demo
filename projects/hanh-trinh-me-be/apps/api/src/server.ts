import {loadLocalEnv} from "./db/connection.js";
import {RoutedEditorialRepository} from "../../../packages/data/src/routed-repository.js";
import {createKnowledgeRepository} from "./repository.js";
import {buildApp} from "./app.js";

loadLocalEnv();
const repo=createKnowledgeRepository();
const app=buildApp(repo);
try{
 if(repo instanceof RoutedEditorialRepository){
   await repo.assertReady();
   const status=await repo.inspect();
   // No database URLs, passwords or secrets in diagnostic logs.
   console.log("Database route:",status.mode,"primary:",status.primary,"secondary:",status.secondary||"none");
   if(status.inSync===false)console.warn("Secondary database differs from primary; secondary is read-only");
 }
 await app.listen({port:Number(process.env.PORT||4000),host:"0.0.0.0"});
}catch(error){
 app.log.error(error);
 await app.close();
 process.exitCode=1;
}
for(const signal of ["SIGINT","SIGTERM"] as const)
 process.once(signal,()=>{void app.close().finally(()=>{process.exitCode=0;})});
