import {loadLocalEnv} from "./db/connection.js";
import {PostgresEditorialRepository} from "../../../packages/data/src/postgres-repository.js";
import {createKnowledgeRepository} from "./repository.js";
import {buildApp} from "./app.js";

loadLocalEnv();
const repo=createKnowledgeRepository();
const app=buildApp(repo);
try{
 if(repo instanceof PostgresEditorialRepository)await repo.assertReady();
 await app.listen({port:Number(process.env.PORT||4000),host:"0.0.0.0"});
}catch(error){
 app.log.error(error);
 await app.close();
 process.exitCode=1;
}
for(const signal of ["SIGINT","SIGTERM"] as const)
 process.once(signal,()=>{void app.close().finally(()=>{process.exitCode=0;})});
