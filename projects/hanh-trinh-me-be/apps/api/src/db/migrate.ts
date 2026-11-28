import {readdir,readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import type {Pool} from "pg";
const directory=new URL("../../../../database/migrations/",import.meta.url);
/** Tracked, checked, transaction-safe SQL migration runner; no destructive reset. */
export async function migrateDatabase(pool:Pool):Promise<number>{
 const files=(await readdir(directory)).filter(x=>/^\d{3}_[a-z0-9-]+\.sql$/.test(x)).sort();
 const client=await pool.connect();
 let applied=0;
 try{
   await client.query("SELECT pg_advisory_lock(604212022)");
   await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
     name text PRIMARY KEY, sha256 text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now()
   )`);
   for(const name of files){
     const sql=await readFile(new URL(name,directory),"utf8");
     const hash=createHash("sha256").update(sql).digest("hex");
     const existing=await client.query<{sha256:string}>("SELECT sha256 FROM schema_migrations WHERE name=$1",[name]);
     if(existing.rowCount){
       if(existing.rows[0].sha256!==hash)throw new Error("Applied migration was edited: "+name);
       continue;
     }
     await client.query("BEGIN");
     try{
       await client.query(sql);
       await client.query("INSERT INTO schema_migrations(name,sha256) VALUES($1,$2)",[name,hash]);
       await client.query("COMMIT");
       applied++;
     }catch(e){await client.query("ROLLBACK");throw e;}
   }
   return applied;
 }finally{
   await client.query("SELECT pg_advisory_unlock(604212022)").catch(()=>{});
   client.release();
 }
}
