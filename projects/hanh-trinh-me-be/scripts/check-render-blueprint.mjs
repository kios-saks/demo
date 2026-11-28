import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const config=readFileSync(new URL("../../../render.yaml",import.meta.url),"utf8");
assert(config.includes("name: hanh-trinh-me-be-api"));
assert(config.includes("name: hanh-trinh-me-be-web"));
assert.equal((config.match(/plan: free/g)||[]).length,2);
assert(!/\n\s*databases\s*:/.test(config),"Do not provision a duplicate Postgres database");
assert(config.includes("SUPABASE_DATABASE_URL\n        sync: false"),
   "Postgres URL must be entered as secret, never committed");
assert(!/postgresql:\/\//.test(config),"No database URL can be hardcoded");
assert(config.includes("branch: feat/hanh-trinh-me-be-ecosystem"));
assert(config.includes("envVarKey: RENDER_EXTERNAL_URL"));
assert(config.includes("healthCheckPath: /health/ready"));
assert(config.includes("healthCheckPath: /api/health"));
console.log("PASS Render Blueprint: 2 Free services, only Supabase secret prompt, no password in git");
