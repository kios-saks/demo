import {test} from "node:test";
import assert from "node:assert/strict";
import {familyRuntimeConfig} from "./family-runtime.js";
const env={RENDER:"true",RENDER_SERVICE_ID:"srv-dc19cibl550s73drji5g",MEBE_COMBINED_DEV:"true",DATABASE_MODE:"supabase",FAMILY_DB_AUDIT_ENABLED:"true",FAMILY_SUPABASE_URL:"https://yfmwznvlblbhicxexffe.supabase.co",FAMILY_SUPABASE_PUBLISHABLE_KEY:"sb_publishable_fixture_not_real_key",SUPABASE_CA_CERT_PATH:"fixture-ca",FAMILY_DATABASE_URL:"postgresql://mebe_family_login.yfmwznvlblbhicxexffe:fixture-only@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"};
test("family runtime is opt-in, exact DEV only, no shared owner login or TLS override",()=>{
 assert.equal(familyRuntimeConfig({}),null);
 assert.equal(familyRuntimeConfig({...env,FAMILY_DB_AUDIT_ENABLED:"false"}),null);
 assert.equal(familyRuntimeConfig({...env,RENDER_SERVICE_ID:"other"}),null);
 assert.equal(familyRuntimeConfig({...env,DATABASE_MODE:"mock"}),null);
 assert.equal(familyRuntimeConfig(env)?.enabled,false);
 assert.equal(familyRuntimeConfig({...env,FAMILY_API_ENABLED:"true"})?.enabled,true);
 for(const uri of [env.FAMILY_DATABASE_URL+"?sslmode=disable",env.FAMILY_DATABASE_URL.replace("mebe_family_login.","postgres."),env.FAMILY_DATABASE_URL.replace(":5432",":6543"),env.FAMILY_DATABASE_URL.replace("pooler.supabase.com","evil.invalid")])assert.throws(()=>familyRuntimeConfig({...env,FAMILY_DATABASE_URL:uri}),/FAMILY_CONFIG_INVALID/);
 assert.throws(()=>familyRuntimeConfig({...env,SUPABASE_DATABASE_URL:env.FAMILY_DATABASE_URL}),/FAMILY_CONFIG_INVALID/);
});
