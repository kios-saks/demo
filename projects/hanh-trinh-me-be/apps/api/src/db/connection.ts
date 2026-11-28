import {existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {Pool} from "pg";
import {parseDatabaseConfig,resolveMaintenanceTarget} from "./config.js";
import {defaultConnectionProvider} from "./providers.js";

export function loadLocalEnv():void{
 if(process.env.NODE_ENV==="production")return;
 const path=fileURLToPath(new URL("../../../../.env",import.meta.url));
 if(existsSync(path))process.loadEnvFile(path);
}
/** Legacy helper retained for isolated PostgreSQL integration tests. */
export function createDbPool():Pool{
 const uri=process.env.DATABASE_URL||process.env.DOCKER_DATABASE_URL;
 if(!uri)throw new Error("DATABASE_URL required for PostgreSQL integration test");
 return defaultConnectionProvider("docker",uri).open();
}
/** Explicit destination for schema migrations and seed import. */
export function createMaintenancePool():Pool{
 const config=parseDatabaseConfig();
 const target=resolveMaintenanceTarget(config);
 return defaultConnectionProvider(target,config.urls[target]!).open();
}
