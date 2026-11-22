import type {Pool} from "pg";
/** Supabase app tables live outside the Data API default public schema. */
export async function preparePrivateSupabaseSchema(pool:Pool):Promise<void>{
 await pool.query("CREATE SCHEMA IF NOT EXISTS mebe");
 await pool.query("REVOKE ALL ON SCHEMA mebe FROM PUBLIC, anon, authenticated");
}
/** Defense in depth for all application tables, including migration tracker. */
export async function securePrivateSupabaseSchema(pool:Pool):Promise<void>{
 await pool.query(`DO $$
 DECLARE item record;
 BEGIN
   FOR item IN SELECT tablename FROM pg_tables WHERE schemaname='mebe' LOOP
     EXECUTE format('ALTER TABLE mebe.%I ENABLE ROW LEVEL SECURITY',item.tablename);
     EXECUTE format('REVOKE ALL ON TABLE mebe.%I FROM PUBLIC, anon, authenticated',item.tablename);
   END LOOP;
 END $$;`);
}
