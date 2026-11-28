import {test} from "node:test";
import assert from "node:assert/strict";
import {parseDatabaseConfig,resolveMaintenanceTarget} from "./db/config.js";
const docker="postgresql://dev:secret@127.0.0.1:5432/app";
const supabase="postgresql://postgres.project:secret@us-east-1.pooler.supabase.com:5432/postgres";

test("defaults to mock, retains postgres docker backward compatibility",()=>{
 assert.equal(parseDatabaseConfig({}).mode,"mock");
 const legacy=parseDatabaseConfig({CONTENT_PROVIDER:"postgres",DATABASE_URL:docker});
 assert.equal(legacy.mode,"docker");
 assert.equal(legacy.primary,"docker");
 assert.equal(legacy.secondary,null);
 assert.equal(resolveMaintenanceTarget(legacy,{}),"docker");
});
test("runs docker or Supabase alone without requiring the other database",()=>{
 const local=parseDatabaseConfig({DATABASE_MODE:"docker",DOCKER_DATABASE_URL:docker});
 const remote=parseDatabaseConfig({DATABASE_MODE:"supabase",SUPABASE_DATABASE_URL:supabase});
 assert.equal(local.primary,"docker");assert.equal(local.secondary,null);
 assert.equal(remote.primary,"supabase");assert.equal(remote.secondary,null);
 assert.equal(resolveMaintenanceTarget(remote,{}),"supabase");
});
test("both requires explicit primary and explicit maintenance target",()=>{
 assert.throws(()=>parseDatabaseConfig({
   DATABASE_MODE:"both",DOCKER_DATABASE_URL:docker,SUPABASE_DATABASE_URL:supabase
 }),/DATABASE_PRIMARY/);
 const a=parseDatabaseConfig({DATABASE_MODE:"both",DATABASE_PRIMARY:"docker",
   DOCKER_DATABASE_URL:docker,SUPABASE_DATABASE_URL:supabase});
 assert.equal(a.primary,"docker");assert.equal(a.secondary,"supabase");
 assert.throws(()=>resolveMaintenanceTarget(a,{}),/DB_TARGET/);
 assert.equal(resolveMaintenanceTarget(a,{DB_TARGET:"supabase"}),"supabase");
 const b=parseDatabaseConfig({DATABASE_MODE:"both",DATABASE_PRIMARY:"supabase",
   DOCKER_DATABASE_URL:docker,SUPABASE_DATABASE_URL:supabase});
 assert.equal(b.primary,"supabase");assert.equal(b.secondary,"docker");
});
test("invalid configs fail closed, rejecting accidental duplicate targets",()=>{
 assert.throws(()=>parseDatabaseConfig({DATABASE_MODE:"supabase"}),/SUPABASE_DATABASE_URL/);
 assert.throws(()=>parseDatabaseConfig({DATABASE_MODE:"neon"}),/DATABASE_MODE/);
 assert.throws(()=>parseDatabaseConfig({DATABASE_MODE:"docker",DOCKER_DATABASE_URL:"https://example.org"}),/Invalid DOCKER_DATABASE_URL/);
 assert.throws(()=>parseDatabaseConfig({
   DATABASE_MODE:"both",DATABASE_PRIMARY:"docker",DOCKER_DATABASE_URL:docker,
   SUPABASE_DATABASE_URL:docker
 }),/same database/);
 assert.throws(()=>parseDatabaseConfig({DATABASE_MODE:"supabase",
   SUPABASE_DATABASE_URL:"postgres://postgres:secret@host.example:6543/db"
 }),/transaction-pooler/);
});
