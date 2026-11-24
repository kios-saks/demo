import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import assert from "node:assert/strict";
import type {FastifyInstance} from "fastify";
import type {PoolClient} from "pg";
import {BootstrapError,validateMediaTokens,safeMediaFailure,apiFailureCode} from "./media-diagnostics.js";
import {createMaintenancePool} from "./db/connection.js";
import {parseDatabaseConfig,resolveMaintenanceTarget} from "./db/config.js";
import {migrateDatabase} from "./db/migrate.js";
import {securePrivateSupabaseSchema} from "./db/supabase-schema.js";
import {importMedia} from "./db/import-media.js";

const hash=(b:Buffer)=>createHash("sha256").update(b).digest("hex");
const root=new URL("../../../",import.meta.url);
const slug="hen-tu-van-tien-thai",slot="inline";
const marker="media_import_v1_complete";
// Explicit server-only startup switch. Session advisory lock prevents concurrent imports.
// A successful marker avoids subsequent import work and never overwrites newer versions.
export async function bootstrapMedia(app:FastifyInstance){
 if(process.env.MEDIA_DEV_ENABLED!=="true"||process.env.MEDIA_IMPORT_ON_START!=="true"){console.log("MEDIA_IMPORT_SKIPPED_FLAGS");return;}
 let stage="CONFIG";
 const step=(next:string)=>{stage=next;console.log("MEDIA_BOOTSTRAP_STEP",next);};
 let pool:ReturnType<typeof createMaintenancePool>|undefined;
 let c:PoolClient|undefined;
 let acquired=false;
 try{
  step("CONFIG_DATABASE");
  const cfg=parseDatabaseConfig();
  if(cfg.primary!=="supabase")throw new BootstrapError("MEDIA_PRIMARY_NOT_SUPABASE");
  try{if(resolveMaintenanceTarget(cfg)!=="supabase")throw new Error();}catch{throw new BootstrapError("MEDIA_DB_TARGET_MISMATCH");}
  step("CONFIG_STORAGE");
  if(!process.env.MEDIA_SUPABASE_URL?.trim()||!process.env.MEDIA_SUPABASE_SERVICE_KEY?.trim())throw new BootstrapError("MEDIA_STORAGE_CONFIG_MISSING");
  step("CONFIG_ROLES");
  const {editor,reviewer,preview}=validateMediaTokens(process.env);
  step("DB_CONNECT");
  pool=createMaintenancePool();
  c=await pool.connect();
  step("DB_LOCK");
  const lock=await c.query("SELECT pg_try_advisory_lock(604212023) AS acquired");
  acquired=Boolean(lock.rows[0].acquired);
  if(!acquired){console.log("MEDIA_IMPORT_ALREADY_RUNNING");return;}
  step("DB_MIGRATE");
  const migrations=await migrateDatabase(pool);console.log("MEDIA_DB_MIGRATIONS_APPLIED",migrations);
  step("DB_SECURITY");
  await securePrivateSupabaseSchema(pool);
  step("IMPORT_MARKER");
  const done=await c.query("SELECT value FROM app_settings WHERE key=$1",[marker]);
  if(done.rowCount){console.log("MEDIA_IMPORT_ALREADY_VERIFIED");return;}
  step("SOURCE_CHECKSUM");
  const registry=JSON.parse(await readFile(new URL("packages/content/mock/lifestyle-media.json",root),"utf8")).assets;
  const a=registry["inline-"+slug];assert.equal(a.reviewStatus,"approved");
  const bytes=await readFile(new URL("apps/web/public"+a.src,root));
  assert.equal(hash(bytes),a.sha256);
  const path="/v1/dev-media-admin/"+slug;
  const e={authorization:"Bearer "+editor},r={authorization:"Bearer "+reviewer},p={"x-preview-token":preview};
  step("API_ACCESS_GUARD");
  assert.equal((await app.inject({url:"/v1/dev-preview/media/"+slug})).statusCode,404);
  assert.equal((await app.inject({method:"POST",url:path+"/upload",headers:{authorization:"Bearer "+preview},payload:{}})).statusCode,404);
  const getHistory=async()=>{const res=await app.inject({url:path,headers:e});apiFailureCode(res);return res.json().data;};
  step("API_HISTORY");
  const history=await getHistory();
  let target=history.revisions.find((x:any)=>x.slot===slot&&x.asset_id===a.sha256);
  const active=history.active.find((x:any)=>x.slot===slot);
  if(!target){
   assert(!active&&!history.revisions.some((x:any)=>x.slot===slot),"Existing editor work must not be replaced");
   step("API_UPLOAD");
   const res=await app.inject({method:"POST",url:path+"/upload",headers:e,payload:{slot,imageBase64:bytes.toString("base64"),alt:a.alt,caption:a.caption,provenance:a.provenance,afterSection:a.afterSection,anchorHeading:a.anchorHeading}});
   apiFailureCode(res);const uploaded=res.json().data;assert.equal(uploaded.assetId,a.sha256);assert.equal(uploaded.reviewStatus,"pending");
   target={revision:uploaded.revision,review_status:"pending"};
  }
  step("API_SIGNED_URL");
  const signed=await app.inject({method:"POST",url:path+"/preview",headers:r,payload:{slot,revision:target.revision}});
  apiFailureCode(signed);
  step("STORAGE_DOWNLOAD_CHECKSUM");
  const downloaded=await fetch(signed.json().data.url,{redirect:"error",signal:AbortSignal.timeout(15000)});
  assert(downloaded.ok);assert.equal(hash(Buffer.from(await downloaded.arrayBuffer())),a.sha256);
  if(!active){
    assert.equal(target.review_status,"pending");
    step("API_REVIEW");
    const approved=await app.inject({method:"POST",url:path+"/review",headers:r,payload:{slot,revision:target.revision,expectedActiveRevision:null,action:"approve",note:"Preserve existing DEV-approved repository image during migration; no medical approval."}});
    apiFailureCode(approved);
  }else assert.equal(active.revision,target.revision);
  step("API_ACTIVE");
  const live=await app.inject({url:"/v1/dev-preview/media/"+slug,headers:p});
  apiFailureCode(live);assert(live.json().data.some((x:any)=>x.assetId===a.sha256&&x.slot===slot));
  console.log("MEDIA_UPLOAD_API_VERIFIED");
  step("BULK_IMPORT");
  await importMedia(true);
  step("SAVE_COMPLETION_MARKER");
  await c.query("INSERT INTO app_settings(key,value) VALUES($1,$2::jsonb) ON CONFLICT(key) DO NOTHING",[marker,JSON.stringify({version:1,verifiedAt:new Date().toISOString()})]);
  console.log("MEDIA_IMPORT_BOOTSTRAP_COMPLETE");
 }catch(error){
  console.error("MEDIA_IMPORT_BOOTSTRAP_FAILED",JSON.stringify({stage,code:safeMediaFailure(error)}));
  return;
 }finally{
  if(c){if(acquired)await c.query("SELECT pg_advisory_unlock(604212023)").catch(()=>{});c.release();}
  if(pool)await pool.end();
 }
}
