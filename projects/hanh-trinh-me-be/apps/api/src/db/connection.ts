import {existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {Pool} from "pg";

export function loadLocalEnv():void{
  if(process.env.NODE_ENV==="production")return;
  const path=fileURLToPath(new URL("../../../../.env",import.meta.url));
  if(existsSync(path))process.loadEnvFile(path);
}
export function createDbPool():Pool{
  const url=process.env.DATABASE_URL;
  if(!url)throw new Error("CONTENT_PROVIDER=postgres requires DATABASE_URL");
  return new Pool({connectionString:url,max:10,idleTimeoutMillis:10000,
    connectionTimeoutMillis:5000,application_name:"mebe-api"});
}
