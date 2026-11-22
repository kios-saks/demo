import {loadLocalEnv,createMaintenancePool} from "./connection.js";
import {migrateDatabase} from "./migrate.js";
import {parseDatabaseConfig,resolveMaintenanceTarget} from "./config.js";
import {preparePrivateSupabaseSchema,securePrivateSupabaseSchema} from "./supabase-schema.js";
loadLocalEnv();
const pool=createMaintenancePool();
try{
 const cfg=parseDatabaseConfig();
 const target=resolveMaintenanceTarget(cfg);
 if(target==="supabase")await preparePrivateSupabaseSchema(pool);
 const n=await migrateDatabase(pool);
 if(target==="supabase")await securePrivateSupabaseSchema(pool);
 console.log("PostgreSQL migrations applied:",n,"target:",target);
}
finally{await pool.end();}
