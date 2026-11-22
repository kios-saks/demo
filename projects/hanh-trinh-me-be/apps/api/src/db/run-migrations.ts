import {loadLocalEnv,createMaintenancePool} from "./connection.js";
import {migrateDatabase} from "./migrate.js";
loadLocalEnv();
const pool=createMaintenancePool();
try{const n=await migrateDatabase(pool);console.log("PostgreSQL migrations applied:",n);}
finally{await pool.end();}
