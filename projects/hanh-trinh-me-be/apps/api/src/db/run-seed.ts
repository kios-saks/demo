import {loadLocalEnv,createMaintenancePool} from "./connection.js";
import {seedDatabase} from "./seed.js";
import {loadSeedDataset} from "../seed-data.js";
loadLocalEnv();
const pool=createMaintenancePool();
try{await seedDatabase(pool,loadSeedDataset());console.log("PostgreSQL seed imported without overwriting existing records.");}
finally{await pool.end();}
