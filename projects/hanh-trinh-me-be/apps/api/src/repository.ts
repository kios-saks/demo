import {fileURLToPath} from "node:url";
import {MockKnowledgeRepository} from "../../../packages/data/src/mock-repository.js";
import {JsonMockEditorialRepository} from "../../../packages/data/src/json-editorial-repository.js";
import {PostgresEditorialRepository} from "../../../packages/data/src/postgres-repository.js";
import {RoutedEditorialRepository} from "../../../packages/data/src/routed-repository.js";
import {loadSeedDataset} from "./seed-data.js";
import {parseDatabaseConfig} from "./db/config.js";
import {defaultConnectionProvider} from "./db/providers.js";
import type {ConnectionProviderFactory} from "./db/providers.js";
import type {DatabaseRouteConfig} from "./db/config.js";
import type {KnowledgeRepository} from "../../../packages/data/src/contracts.js";

/**
 * Storage composition root. Web, API and CMS operate against interfaces;
 * no business handler is coupled to Docker, Supabase or a specific vendor.
 */
export function createDatabaseRepository(config:DatabaseRouteConfig,factory:ConnectionProviderFactory=defaultConnectionProvider):RoutedEditorialRepository{
 if(!config.primary||config.mode==="mock")throw new Error("Selected config has no database");
 const open=(target:"docker"|"supabase")=>
   new PostgresEditorialRepository(factory(target,config.urls[target]!).open());
 const primaryRepo=open(config.primary);
 try{
   const secondaryRepo=config.secondary?open(config.secondary):null;
   return new RoutedEditorialRepository(config.mode,config.primary,primaryRepo,config.secondary,secondaryRepo);
 }catch(err){
   void primaryRepo.close();
   throw err;
 }
}
export function createKnowledgeRepository():KnowledgeRepository {
 const config=parseDatabaseConfig();
 if(config.mode!=="mock")return createDatabaseRepository(config);
 const seed=loadSeedDataset();
 if(process.env.NODE_ENV==="production")return new MockKnowledgeRepository(seed);
 const file=fileURLToPath(new URL("../../../.local/editorial-state.json",import.meta.url));
 return new JsonMockEditorialRepository(seed,file);
}
