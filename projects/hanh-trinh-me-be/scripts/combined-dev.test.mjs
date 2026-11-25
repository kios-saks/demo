import {test} from "node:test";
import assert from "node:assert/strict";
import {childEnvironments,validateRuntime} from "./combined-dev.mjs";
const env={MEBE_COMBINED_DEV:"true",PORT:"10000",SUPABASE_DATABASE_URL:"fixture-db-secret",MEDIA_SUPABASE_SERVICE_KEY:"fixture-storage-secret",MEDIA_DEV_EDITOR_TOKEN:"e".repeat(32),MEDIA_DEV_REVIEWER_TOKEN:"r".repeat(32),DEV_CONTENT_PREVIEW_TOKEN:"p".repeat(24),READER_INVITE_SHA256:"a".repeat(64),UNRELATED_SECRET:"other"};
test("combined DEV uses loopback API with isolated child environment",()=>{
 const {web,api}=childEnvironments({...env,CONTENT_API_INTERNAL_URL:"https://external.invalid",MEDIA_IMPORT_ON_START:"true"});
 assert.equal(web.CONTENT_API_INTERNAL_URL,"http://127.0.0.1:4000");assert.equal(api.PORT,"4000");assert.equal(web.PORT,"10000");
 assert.equal(api.NODE_ENV,"production");assert.equal(web.NODE_ENV,"production");assert.equal(api.MEDIA_IMPORT_ON_START,"false");
 assert.equal(web.WEB_DYNAMIC_MEDIA,"true");assert.equal(api.DATABASE_MODE,"supabase");
 for(const k of ["SUPABASE_DATABASE_URL","MEDIA_SUPABASE_SERVICE_KEY","MEDIA_DEV_EDITOR_TOKEN","MEDIA_DEV_REVIEWER_TOKEN","UNRELATED_SECRET"])assert.equal(web[k],undefined);
 assert.equal(api.READER_INVITE_SHA256,undefined);assert.equal(api.DEV_CONTENT_PREVIEW_TOKEN,web.DEV_CONTENT_PREVIEW_TOKEN);
});
test("explicit opt-in and port collision guard",()=>{assert.throws(()=>childEnvironments({}),/Explicit/);assert.throws(()=>childEnvironments({...env,PORT:"4000"}),/PORT/);});
test("fixture cannot run on Render and strips live credentials",()=>{
 assert.throws(()=>childEnvironments({...env,RENDER:"true"},true),/forbidden/);const {api,web}=childEnvironments(env,true);
 assert.equal(api.DATABASE_MODE,"mock");assert.equal(api.SUPABASE_DATABASE_URL,undefined);assert.equal(api.MEDIA_SUPABASE_SERVICE_KEY,undefined);assert.equal(api.MEDIA_DEV_ENABLED,"false");assert.equal(web.WEB_DYNAMIC_MEDIA,"false");
});
test("missing secrets fail closed by key name, distinct tokens required",()=>{
 assert.throws(()=>validateRuntime(env),/MEDIA_SUPABASE_URL/);assert.doesNotThrow(()=>validateRuntime({...env,MEDIA_SUPABASE_URL:"https://fixture.invalid"}));assert.throws(()=>validateRuntime({...env,MEDIA_SUPABASE_URL:"https://fixture.invalid",MEDIA_DEV_REVIEWER_TOKEN:env.MEDIA_DEV_EDITOR_TOKEN}),/Invalid credential/);
});
