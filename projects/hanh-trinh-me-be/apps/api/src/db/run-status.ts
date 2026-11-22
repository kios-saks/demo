import {loadLocalEnv} from "./connection.js";
import {createKnowledgeRepository} from "../repository.js";
import {RoutedEditorialRepository} from "../../../../packages/data/src/routed-repository.js";
loadLocalEnv();
const repo=createKnowledgeRepository();
if(!(repo instanceof RoutedEditorialRepository))throw new Error("DATABASE_MODE=mock has no live database to inspect");
try{
 const status=await repo.inspect();
 console.log(JSON.stringify(status,null,2));
 if(status.probes.some(x=>!x.ready))process.exitCode=1;
 if(status.inSync===false)console.warn("DRIFT DETECTED: do not switch primary before reconciling data");
}finally{await repo.close();}
