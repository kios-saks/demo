import {loadLocalEnv,createDbPool} from "./connection.js";
import {migrateDatabase} from "./migrate.js";
loadLocalEnv();
const pool=createDbPool();
try{const n=await migrateDatabase(pool);console.log("PostgreSQL migrations applied:",n);}
finally{await pool.end();}
