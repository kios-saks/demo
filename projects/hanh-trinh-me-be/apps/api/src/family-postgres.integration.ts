import {test} from "node:test";
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {readFileSync} from "node:fs";
import {Pool,type PoolClient} from "pg";
import {PostgresFamilyRepository} from "./postgres-family-repository.js";
import {buildApp} from "./app.js";
import {MockKnowledgeRepository} from "../../../packages/data/src/mock-repository.js";
import {loadSeedDataset} from "./seed-data.js";

test("family PostgreSQL: dedicated role, forced RLS, tenant isolation and concurrent writes",async()=>{
 // Hard stop: this draft DDL is ONLY applied to the disposable GitHub CI database.
 const url=process.env.DATABASE_URL;
 if(process.env.GITHUB_ACTIONS!=="true"||process.env.MEBE_FAMILY_DB_FIXTURE!=="true"||process.env.NODE_ENV==="production"||url!=="postgresql://mebe:local-test-only@127.0.0.1:5432/mebe")throw Error("Refusing non-fixture database");
 const admin=new Pool({connectionString:url,max:2});
 const rolePassword="family-ci-only-not-a-live-secret";
 let runtime:Pool|undefined;
 let app:ReturnType<typeof buildApp>|undefined;
 const ids={owner:randomUUID(),member:randomUUID(),viewer:randomUUID(),other:randomUUID()};
 try{
  // Simulate Supabase Data API roles in vanilla PostgreSQL; no live project involved.
  await admin.query("CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN");
  await admin.query(readFileSync(new URL("../../../database/family-draft/schema.sql",import.meta.url),"utf8"));
  await admin.query("CREATE ROLE mebe_family_ci_login LOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS PASSWORD '"+rolePassword+"'; GRANT mebe_family_runtime TO mebe_family_ci_login");
  runtime=new Pool({connectionString:"postgresql://mebe_family_ci_login:"+rolePassword+"@127.0.0.1:5432/mebe",max:4});
  const pool=runtime;
  const repo=new PostgresFamilyRepository(pool,new Set(["so-sinh","nhu-nhi"]));
  app=buildApp(new MockKnowledgeRepository(loadSeedDataset()),undefined,undefined,{service:repo,verifyIdentity:async token=>Object.entries(ids).find(([key])=>"fixture-"+key===token)?.[1]??null});
  const api=app;
  const call=(method:"GET"|"POST"|"PATCH"|"DELETE",url:string,who?:keyof typeof ids,payload?:Record<string,unknown>)=>api.inject({method,url,headers:who?{authorization:"Bearer fixture-"+who}:{},...(payload?{payload}:{})});
  const data=(r:Awaited<ReturnType<typeof call>>)=>r.json().data;
  const ok=(r:Awaited<ReturnType<typeof call>>)=>{assert.equal(r.statusCode,200,r.body);return data(r);};
  const scoped=async<T>(actor:string|null,fn:(c:PoolClient)=>Promise<T>)=>{
   const c=await pool.connect();try{await c.query("BEGIN");await c.query("SET LOCAL ROLE mebe_family_runtime");if(actor)await c.query("SELECT set_config('mebe.family_actor',$1,true)",[actor]);return await fn(c);}finally{try{await c.query("ROLLBACK");}finally{c.release();}}
  };
  const rls=await admin.query<{relrowsecurity:boolean;relforcerowsecurity:boolean}>("SELECT relrowsecurity,relforcerowsecurity FROM pg_class JOIN pg_namespace n ON n.oid=relnamespace WHERE n.nspname='mebe_family' AND relkind='r'");
  assert.equal(rls.rows.length,5);assert(rls.rows.every(x=>x.relrowsecurity&&x.relforcerowsecurity));
  const flags=await admin.query("SELECT rolbypassrls,rolsuper,rolcanlogin FROM pg_roles WHERE rolname='mebe_family_runtime'");
  assert.deepEqual(flags.rows[0],{rolbypassrls:false,rolsuper:false,rolcanlogin:false});
  for(const role of ["anon","authenticated","service_role"]){
   const grants=await admin.query("SELECT has_schema_privilege($1,'mebe_family','USAGE') AS allowed",[role]);assert.equal(grants.rows[0].allowed,false);
  }
  assert.equal((await call("GET","/v1/families")).statusCode,401);
  for(const who of Object.keys(ids) as (keyof typeof ids)[])ok(await call("POST","/v1/account/onboard",who,{displayName:who,consentVersion:"family-v1"}));
  const a=ok(await call("POST","/v1/families","owner",{name:"Family A"}));
  const b=ok(await call("POST","/v1/families","other",{name:"Family B"}));
  const path="/v1/families/"+a.id;
  assert.equal(a.role,"owner");
  assert.deepEqual(ok(await call("GET","/v1/families","other")).map((f:{id:string})=>f.id),[b.id]);
  assert.equal((await call("GET",path,"other")).statusCode,404);
  assert.equal((await call("PATCH",path+"/journey","other",{stage:"so-sinh",revision:0})).statusCode,404);
  // Direct SQL via restricted role: no app WHERE clause to hide a broken RLS policy.
  assert.deepEqual(await scoped(ids.other,async c=>(await c.query("SELECT id FROM mebe_family.families")).rows.map(x=>x.id)),[b.id]);
  assert.deepEqual(await scoped(ids.other,async c=>(await c.query("SELECT id FROM mebe_family.accounts")).rows.map(x=>x.id)),[ids.other]);
  assert.equal(await scoped(null,async c=>(await c.query("SELECT id FROM mebe_family.families")).rowCount),0,"actor context must not leak across pooled transactions");
  assert.equal(await scoped(ids.other,async c=>(await c.query("UPDATE mebe_family.families SET stage='so-sinh' WHERE id=$1",[a.id])).rowCount),0);
  await assert.rejects(()=>scoped(ids.other,c=>c.query("INSERT INTO mebe_family.memberships(family_id,account_id,role,status) VALUES($1,$2,'member','active')",[a.id,ids.other])),/row-level security/i);
  await assert.rejects(()=>scoped(ids.other,c=>c.query("INSERT INTO mebe_family.ownership(family_id,account_id) VALUES($1,$2)",[randomUUID(),ids.owner])),/row-level security/i);
  const invite=ok(await call("POST",path+"/invitations","owner",{accountId:ids.member,role:"member"}));
  assert.equal((await call("POST","/v1/family-invitations/accept","other",{token:invite.token})).statusCode,404);
  assert.equal(await scoped(ids.other,async c=>(await c.query("SELECT digest FROM mebe_family.invitations")).rowCount),0);
  assert.equal(await scoped(ids.member,async c=>(await c.query("SELECT id FROM mebe_family.families")).rowCount),0);
  const accepted=await Promise.all([call("POST","/v1/family-invitations/accept","member",{token:invite.token}),call("POST","/v1/family-invitations/accept","member",{token:invite.token})]);
  assert.deepEqual(accepted.map(r=>r.statusCode).sort(),[200,404]);
  assert.equal(ok(await call("GET",path,"member")).role,"member");
  const expired=ok(await call("POST",path+"/invitations","owner",{accountId:ids.viewer,role:"viewer"}));
  await admin.query("UPDATE mebe_family.invitations SET expires_at=clock_timestamp()-interval '1 second' WHERE family_id=$1 AND account_id=$2",[a.id,ids.viewer]);
  assert.equal((await call("POST","/v1/family-invitations/accept","viewer",{token:expired.token})).statusCode,404);
  const v=ok(await call("POST",path+"/invitations","owner",{accountId:ids.viewer,role:"viewer"}));
  ok(await call("POST","/v1/family-invitations/accept","viewer",{token:v.token}));
  assert.equal(ok(await call("GET",path,"viewer")).role,"viewer");
  assert.equal((await call("PATCH",path+"/journey","viewer",{stage:"so-sinh",revision:0})).statusCode,404);
  assert.equal(await scoped(ids.viewer,async c=>(await c.query("UPDATE mebe_family.families SET stage='so-sinh' WHERE id=$1",[a.id])).rowCount),0);
  assert.equal((await call("GET",path+"/members","member")).statusCode,404);
  const writes=await Promise.all([call("PATCH",path+"/journey","owner",{stage:"so-sinh",revision:0}),call("PATCH",path+"/journey","member",{stage:"nhu-nhi",revision:0})]);
  assert.deepEqual(writes.map(r=>r.statusCode).sort(),[200,409]);
  assert.equal(ok(await call("GET",path,"owner")).revision,1);
  assert.equal((await call("DELETE",path+"/members/"+ids.owner,"owner")).statusCode,404);
  ok(await call("DELETE",path+"/members/"+ids.member,"owner"));
  assert.equal((await call("GET",path,"member")).statusCode,404);
  assert.equal(await scoped(ids.member,async c=>(await c.query("SELECT id FROM mebe_family.families")).rowCount),0);
  assert.equal((await call("PATCH",path+"/journey","member",{stage:null,revision:1})).statusCode,404);
  await assert.rejects(()=>scoped(ids.member,c=>c.query("UPDATE mebe_family.memberships SET status='active',role='member' WHERE family_id=$1 AND account_id=$2",[a.id,ids.member])),/row-level security/i);
  const re=ok(await call("POST",path+"/invitations","owner",{accountId:ids.member,role:"viewer"}));
  ok(await call("POST","/v1/family-invitations/accept","member",{token:re.token}));
  assert.equal(ok(await call("GET",path,"member")).role,"viewer");
  console.log("FAMILY_POSTGRES_RLS_PASS: 5 forced-RLS tables, restricted role, tenant/account isolation, no actor leak, invitation expiry/replay, revocation, concurrent revision");
 }finally{if(app)await app.close();if(runtime)await runtime.end();await admin.end();}
});
