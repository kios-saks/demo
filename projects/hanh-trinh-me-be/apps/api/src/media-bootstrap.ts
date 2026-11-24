import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import assert from "node:assert/strict";
import type {FastifyInstance} from "fastify";
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
 if(process.env.MEDIA_DEV_ENABLED!=="true"||process.env.MEDIA_IMPORT_ON_START!=="true")return;
 const cfg=parseDatabaseConfig();
 assert.equal(cfg.primary,"supabase");assert.equal(resolveMaintenanceTarget(cfg),"supabase");
 const editor=process.env.MEDIA_DEV_EDITOR_TOKEN,reviewer=process.env.MEDIA_DEV_REVIEWER_TOKEN,preview=process.env.DEV_CONTENT_PREVIEW_TOKEN;
 assert(editor&&reviewer&&preview&&editor.length>=32&&reviewer.length>=32&&preview.length>=24&&new Set([editor,reviewer,preview]).size===3);
 const pool=createMaintenancePool();
 const c=await pool.connect();
 try{
  const lock=await c.query("SELECT pg_try_advisory_lock(604212023) AS acquired");
  if(!lock.rows[0].acquired){console.log("MEDIA_IMPORT_ALREADY_RUNNING");return;}
  await migrateDatabase(pool);
  await securePrivateSupabaseSchema(pool);
  const done=await c.query("SELECT value FROM app_settings WHERE key=$1",[marker]);
  if(done.rowCount){console.log("MEDIA_IMPORT_ALREADY_VERIFIED");return;}
  const registry=JSON.parse(await readFile(new URL("packages/content/mock/lifestyle-media.json",root),"utf8")).assets;
  const a=registry["inline-"+slug];assert.equal(a.reviewStatus,"approved");
  const bytes=await readFile(new URL("apps/web/public"+a.src,root));
  assert.equal(hash(bytes),a.sha256);
  const path="/v1/dev-media-admin/"+slug;
  const e={authorization:"Bearer "+editor},r={authorization:"Bearer "+reviewer},p={"x-preview-token":preview};
  assert.equal((await app.inject({url:"/v1/dev-preview/media/"+slug})).statusCode,404);
  assert.equal((await app.inject({method:"POST",url:path+"/upload",headers:{authorization:"Bearer "+preview},payload:{}})).statusCode,404);
  const getHistory=async()=>{const res=await app.inject({url:path,headers:e});assert.equal(res.statusCode,200);return res.json().data;};
  const history=await getHistory();
  let target=history.revisions.find((x:any)=>x.slot===slot&&x.asset_id===a.sha256);
  const active=history.active.find((x:any)=>x.slot===slot);
  if(!target){
   assert(!active&&!history.revisions.some((x:any)=>x.slot===slot),"Existing editor work must not be replaced");
   const res=await app.inject({method:"POST",url:path+"/upload",headers:e,payload:{slot,imageBase64:bytes.toString("base64"),alt:a.alt,caption:a.caption,provenance:a.provenance,afterSection:a.afterSection,anchorHeading:a.anchorHeading}});
   assert.equal(res.statusCode,200);const uploaded=res.json().data;assert.equal(uploaded.assetId,a.sha256);assert.equal(uploaded.reviewStatus,"pending");
   target={revision:uploaded.revision,review_status:"pending"};
  }
  const signed=await app.inject({method:"POST",url:path+"/preview",headers:r,payload:{slot,revision:target.revision}});
  assert.equal(signed.statusCode,200);
  const downloaded=await fetch(signed.json().data.url,{redirect:"error",signal:AbortSignal.timeout(15000)});
  assert(downloaded.ok);assert.equal(hash(Buffer.from(await downloaded.arrayBuffer())),a.sha256);
  if(!active){
    assert.equal(target.review_status,"pending");
    const approved=await app.inject({method:"POST",url:path+"/review",headers:r,payload:{slot,revision:target.revision,expectedActiveRevision:null,action:"approve",note:"Preserve existing DEV-approved repository image during migration; no medical approval."}});
    assert.equal(approved.statusCode,200);
  }else assert.equal(active.revision,target.revision);
  const live=await app.inject({url:"/v1/dev-preview/media/"+slug,headers:p});
  assert.equal(live.statusCode,200);assert(live.json().data.some((x:any)=>x.assetId===a.sha256&&x.slot===slot));
  console.log("MEDIA_UPLOAD_API_VERIFIED");
  await importMedia(true);
  await c.query("INSERT INTO app_settings(key,value) VALUES($1,$2::jsonb) ON CONFLICT(key) DO NOTHING",[marker,JSON.stringify({version:1,verifiedAt:new Date().toISOString()})]);
  console.log("MEDIA_IMPORT_BOOTSTRAP_COMPLETE");
 }finally{
  await c.query("SELECT pg_advisory_unlock(604212023)").catch(()=>{});
  c.release();await pool.end();
 }
}
