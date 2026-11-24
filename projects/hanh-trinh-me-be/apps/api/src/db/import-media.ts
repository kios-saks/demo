import {readFile,readdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import assert from "node:assert/strict";
import {loadLocalEnv,createMaintenancePool} from "../db/connection.js";
import {parseDatabaseConfig,resolveMaintenanceTarget} from "../db/config.js";
import {PrivateMediaStorage,readWebp,MAX_MEDIA_BYTES} from "../media-storage.js";

const root=new URL("../../../../",import.meta.url);
const json=async(path:string)=>JSON.parse(await readFile(new URL(path,root),"utf8"));
type Entry={src:string;alt:string;caption?:string;provenance?:string;reviewStatus:string;afterSection?:number;anchorHeading?:string;sha256?:string};
type Article={slug:string;title:string;sections:{heading:string}[]};
type Asset={id:string;path:string;mime:"image/webp"|"image/svg+xml";bytes:Buffer;width:number;height:number};
const hash=(bytes:Buffer)=>createHash("sha256").update(bytes).digest("hex");
function inspect(name:string,bytes:Buffer):Asset{
 assert(bytes.length>0&&bytes.length<=MAX_MEDIA_BYTES,"Invalid asset size");
 const id=hash(bytes);
 if(name.endsWith(".webp")){
  const {width,height}=readWebp(bytes.toString("base64"));
  return {id,path:id+".webp",mime:"image/webp",bytes,width,height};
 }
 assert(name.endsWith(".svg"),"Unsupported source type");
 const svg=bytes.toString("utf8");
 // Only audited repository-generated SVG; never accept arbitrary client SVG.
 assert(/^\s*<svg\b/.test(svg)&&!/<(?:script|foreignObject|iframe|object|embed|image|use|animate|set)\b|<!DOCTYPE|<!ENTITY|\bon[a-z]+\s*=|\b(?:href|src)\s*=|@import|url\(\s*(?!#)|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(svg),"Unsafe SVG: "+name);
 const m=svg.match(/<svg\b[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"/);
 assert(m,"Missing SVG dimensions: "+name);
 const width=Number(m[1]),height=Number(m[2]);
 assert(width>=1&&height>=1&&width<=8192&&height<=8192);
 return {id,path:id+".svg",mime:"image/svg+xml",bytes,width,height};
}
export async function importMedia(apply=false){
 const {articles}=await json("packages/content/articles.json") as {articles:Article[]};
 const photos=(await json("packages/content/mock/lifestyle-media.json")).assets as Record<string,Entry>;
 const vectors=(await json("packages/content/mock/contextual-inline-illustrations.json")).assets as Record<string,Entry>;
 const sourceDir="apps/web/public/media/";
 const reviewDir="docs/media-review/";
 const inventory=new Map<string,Asset>();
 for(const dir of [sourceDir,reviewDir]){
  for(const name of (await readdir(new URL(dir,root))).sort()){
   if(!/^[a-z0-9-]+\.(webp|svg)$/.test(name))continue;
   const path=dir+name;
   inventory.set(path,inspect(name,await readFile(new URL(path,root))));
  }
 }
 const pairs:{slug:string;slot:"cover"|"inline";entry:Entry;asset:Asset;status:string}[]=[];
 for(const a of articles){
  for(const slot of ["cover","inline"] as const){
   const photo=photos[slot+"-"+a.slug];
   const vector=vectors[a.slug];
   const entry:Entry=photo?.reviewStatus==="approved"?photo:slot==="inline"?vector:{
    src:"/media/editorial-cover-"+a.slug+".svg",alt:"Tranh minh họa biên tập: "+a.title,caption:"Tranh minh họa biên tập theo chủ đề",reviewStatus:"dev-context-only"
   };
   assert(entry?.src.startsWith("/media/"),"Missing media: "+a.slug);
   const asset=inventory.get(sourceDir+entry.src.slice(7));
   assert(asset,"Missing file: "+entry.src);
   if(entry.sha256)assert.equal(asset.id,entry.sha256,"Checksum mismatch");
   if(slot==="inline")assert.equal(a.sections[entry.afterSection!]?.heading,entry.anchorHeading,"Anchor mismatch");
   pairs.push({slug:a.slug,slot,entry,asset,status:entry.reviewStatus==="approved"?"dev_approved":"dev_context_only"});
  }
 }
 assert.equal(articles.length,72);assert.equal(pairs.length,144);
 console.log("MEDIA_IMPORT_PLAN",JSON.stringify({files:inventory.size,uniqueObjects:new Set([...inventory.values()].map(a=>a.id)).size,articleSlots:pairs.length}));
 if(!apply)return;
 loadLocalEnv();
 const config=parseDatabaseConfig();
 assert.equal(resolveMaintenanceTarget(config),"supabase","Import target must be Supabase");
 assert.equal(config.primary,"supabase","Import requires primary Supabase");
 const url=process.env.MEDIA_SUPABASE_URL,key=process.env.MEDIA_SUPABASE_SERVICE_KEY;
 assert(url&&key,"Server-only storage credentials required");
 const storage=new PrivateMediaStorage(url,key),pool=createMaintenancePool();
 try{
  const db=await pool.query("SELECT slug,status,payload FROM knowledge_articles");
  const rows=new Map(db.rows.map(x=>[x.slug,x]));
  for(const p of pairs){
   const a=rows.get(p.slug);assert(a?.status==="draft","Import only to existing draft");
   if(p.slot==="inline")assert.equal(a.payload.sections[p.entry.afterSection!]?.heading,p.entry.anchorHeading,"Live anchor mismatch");
  }
  const seen=new Set<string>();
  for(const [logical,asset] of inventory){
   if(!seen.has(asset.id)){
    await storage.upload(asset.path,asset.bytes,asset.mime);
    const signed=await storage.signedUrl(asset.path);
    const downloaded=await fetch(signed,{signal:AbortSignal.timeout(15000),redirect:"error"});
    assert(downloaded.ok,"Signed fetch failed");
    assert.equal(hash(Buffer.from(await downloaded.arrayBuffer())),asset.id,"Remote checksum mismatch");
    seen.add(asset.id);
   }
   await pool.query("INSERT INTO media_assets(id,object_path,mime_type,byte_size,width,height) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO NOTHING",[asset.id,asset.path,asset.mime,asset.bytes.length,asset.width,asset.height]);
   await pool.query("INSERT INTO media_import_catalog(logical_path,asset_id,usage) VALUES($1,$2,$3) ON CONFLICT(logical_path) DO NOTHING",[logical,asset.id,logical.startsWith(reviewDir)?"review_archive":"legacy_source"]);
   const check=await pool.query("SELECT asset_id FROM media_import_catalog WHERE logical_path=$1",[logical]);assert.equal(check.rows[0]?.asset_id,asset.id,"Catalog conflict");
  }
  for(const p of pairs){
   const c=await pool.connect();
   try{
    await c.query("BEGIN");
    const locked=await c.query("SELECT status,payload FROM knowledge_articles WHERE slug=$1 FOR UPDATE",[p.slug]);
    assert.equal(locked.rows[0]?.status,"draft");
    if(p.slot==="inline")assert.equal(locked.rows[0].payload.sections[p.entry.afterSection!]?.heading,p.entry.anchorHeading);
    // Never replace existing reviewed or pending versions. Migration is replay-safe.
    const any=await c.query("SELECT revision FROM media_revisions WHERE article_slug=$1 AND slot=$2",[p.slug,p.slot]);
    if(!any.rowCount){
     await c.query("INSERT INTO media_revisions(article_slug,slot,revision,asset_id,alt,caption,provenance,after_section,anchor_heading,review_status) VALUES($1,$2,1,$3,$4,$5,$6,$7,$8,$9)",[p.slug,p.slot,p.asset.id,p.entry.alt,p.entry.caption||p.entry.alt,p.entry.provenance||"Original repository DEV illustration; not clinically approved",p.slot==="inline"?p.entry.afterSection:null,p.slot==="inline"?p.entry.anchorHeading:null,p.status]);
     await c.query("INSERT INTO article_media(article_slug,slot,revision) VALUES($1,$2,1)",[p.slug,p.slot]);
    }
    await c.query("COMMIT");
   }catch(e){await c.query("ROLLBACK");throw e;}finally{c.release();}
  }
  const counts=await pool.query("SELECT slot,count(*)::int AS count FROM article_media GROUP BY slot ORDER BY slot");
  assert(counts.rows.some(r=>r.slot==="inline"&&r.count===72)&&counts.rows.some(r=>r.slot==="cover"&&r.count===72),"Active media coverage incomplete");
  console.log("MEDIA_IMPORT_VERIFIED",JSON.stringify({verifiedObjects:seen.size,files:inventory.size,active:counts.rows}));
 }finally{await pool.end();}
}
if(process.argv[1]&&new URL(import.meta.url).pathname===process.argv[1])importMedia(process.argv.includes("--apply")).catch(()=>{console.error("MEDIA_IMPORT_FAILED; no source deletion; inspect configuration and run dry-run first");process.exitCode=1;});
