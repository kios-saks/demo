import {fileURLToPath} from "node:url";
import {MockKnowledgeRepository} from "../../../packages/data/src/mock-repository.js";
import {JsonMockEditorialRepository} from "../../../packages/data/src/json-editorial-repository.js";
import {PostgresEditorialRepository} from "../../../packages/data/src/postgres-repository.js";
import {loadSeedDataset} from "./seed-data.js";
import {createDbPool} from "./db/connection.js";
import type {KnowledgeRepository} from "../../../packages/data/src/contracts.js";

/** Select the implementation, never change API routes for PostgreSQL. */
export function createKnowledgeRepository():KnowledgeRepository{
 const provider=process.env.CONTENT_PROVIDER||"mock";
 if(provider==="postgres")return new PostgresEditorialRepository(createDbPool());
 if(provider!=="mock")throw new Error("Unsupported CONTENT_PROVIDER: "+provider);
 const seed=loadSeedDataset();
 if(process.env.NODE_ENV==="production")return new MockKnowledgeRepository(seed);
 const file=fileURLToPath(new URL("../../../.local/editorial-state.json",import.meta.url));
 return new JsonMockEditorialRepository(seed,file);
}
