import {existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {buildApp} from "./app.js";
// Node 22 built-in env loader for the *project-level* local .env file.
// Production must use managed secret injection, never a committed .env file.
const localEnv=fileURLToPath(new URL("../../../.env",import.meta.url));
if(process.env.NODE_ENV!=="production"&&existsSync(localEnv))process.loadEnvFile(localEnv);
const port=Number(process.env.PORT||4000);
const app=buildApp();
app.listen({port,host:"0.0.0.0"}).catch(error=>{app.log.error(error);process.exit(1);});
