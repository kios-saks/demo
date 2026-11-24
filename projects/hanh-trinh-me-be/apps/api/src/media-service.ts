import type {Pool,PoolClient} from "pg";
import {MediaError,PrivateMediaStorage,readWebp} from "./media-storage.js";
import {parseDatabaseConfig} from "./db/config.js";
import {defaultConnectionProvider} from "./db/providers.js";

type Slot="cover"|"inline";
type MediaRow={article_slug:string;slot:Slot;revision:number;asset_id:string;alt:string;caption:string;provenance:string;after_section:number|null;anchor_heading:string|null;review_status:string;object_path:string;mime_type:string;width:number;height:number};
const select="SELECT r.*,a.object_path,a.mime_type,a.width,a.height FROM media_revisions r JOIN media_assets a ON a.id=r.asset_id";
const validSlug=(s:string)=>/^[a-z0-9-]{1,160}$/.test(s);
function requireSlot(v:unknown):Slot{if(v!=="cover"&&v!=="inline")throw new MediaError(400,"INVALID_SLOT");return v;}
function string(v:unknown,max:number){if(typeof v!=="string"||!v.trim()||v.length>max)throw new MediaError(400,"INVALID_METADATA");return v.trim();}
function positive(v:unknown){if(typeof v!=="number"||!Number.isSafeInteger(v)||v<1)throw new MediaError(400,"INVALID_REVISION");return v;}
function validateAnchor(slot:Slot,index:unknown,heading:unknown,payload:{sections?:{heading:string}[]}){
 if(slot==="cover"){if(index!=null||heading!=null)throw new MediaError(400,"INVALID_ANCHOR");return;}
 if(typeof index!=="number"||!Number.isSafeInteger(index)||index<0||typeof heading!=="string"||!heading.trim()||payload.sections?.[index]?.heading!==heading)throw new MediaError(409,"ANCHOR_MISMATCH");
}
export class MediaService{
 constructor(private readonly pool:Pool,private readonly storage:PrivateMediaStorage){}
 async close(){await this.pool.end();}
 private async transaction<T>(task:(c:PoolClient)=>Promise<T>){
  const c=await this.pool.connect();try{await c.query("BEGIN");const result=await task(c);await c.query("COMMIT");return result;}catch(e){await c.query("ROLLBACK").catch(()=>{});throw e;}finally{c.release();}
 }
 private async article(c:Pool|PoolClient,slug:string,lock=false){
   if(!validSlug(slug))throw new MediaError(404,"NOT_FOUND");
   const r=await c.query("SELECT status,payload FROM knowledge_articles WHERE slug=$1"+(lock?" FOR UPDATE":""),[slug]);
   if(!r.rowCount||r.rows[0].status!=="draft")throw new MediaError(404,"NOT_FOUND");
   return r.rows[0].payload as {sections?:{heading:string}[]};
 }
 async active(slug:string){
  const payload=await this.article(this.pool,slug);
  const rows=await this.pool.query<MediaRow>(select+" JOIN article_media m ON (m.article_slug,m.slot,m.revision)=(r.article_slug,r.slot,r.revision) WHERE r.article_slug=$1 AND r.review_status IN ('dev_context_only','dev_approved') ORDER BY r.slot",[slug]);
  return Promise.all(rows.rows.map(async r=>{validateAnchor(r.slot,r.after_section,r.anchor_heading,payload);return {slot:r.slot,revision:r.revision,assetId:r.asset_id,url:await this.storage.signedUrl(r.object_path),expiresIn:120,width:r.width,height:r.height,alt:r.alt,caption:r.caption,afterSection:r.after_section,anchorHeading:r.anchor_heading,reviewStatus:r.review_status};}));
 }
 async activeImage(slug:string,slotValue:unknown,expected?:unknown){
  const payload=await this.article(this.pool,slug),slot=requireSlot(slotValue);
  const r=await this.pool.query<MediaRow>(select+" JOIN article_media m ON (m.article_slug,m.slot,m.revision)=(r.article_slug,r.slot,r.revision) WHERE r.article_slug=$1 AND r.slot=$2 AND r.review_status IN ('dev_context_only','dev_approved')",[slug,slot]);
  if(!r.rowCount)throw new MediaError(404,"NOT_FOUND");
  const row=r.rows[0];validateAnchor(slot,row.after_section,row.anchor_heading,payload);
  if(expected!==undefined&&String(row.revision)!==expected)throw new MediaError(409,"ACTIVE_REVISION_CHANGED");
  return this.storage.verifiedBytes(row.object_path,row.asset_id,row.mime_type);
 }
 async catalogImage(file:string){
  // Only existing reader-facing source paths; never expose review archives.
  if(!/^[a-z0-9-]{1,180}\.(webp|svg)$/.test(file))throw new MediaError(404,"NOT_FOUND");
  const r=await this.pool.query<{object_path:string;id:string;mime_type:string}>("SELECT a.object_path,a.id,a.mime_type FROM media_import_catalog c JOIN media_assets a ON a.id=c.asset_id WHERE c.logical_path=$1 AND c.usage='legacy_source'",["apps/web/public/media/"+file]);
  if(!r.rowCount)throw new MediaError(404,"NOT_FOUND");
  const row=r.rows[0];return this.storage.verifiedBytes(row.object_path,row.id,row.mime_type);
 }
 async adminCatalog(){
  const rows=await this.pool.query(`SELECT k.slug,k.payload->>'title' AS title,k.payload->>'stage' AS stage,
    m.revision AS active_revision,r.asset_id AS active_asset_id,a.mime_type AS active_mime,
    base.mime_type AS original_mime,
    (SELECT count(*)::int FROM media_revisions p WHERE p.article_slug=k.slug AND p.slot='cover' AND p.review_status='pending') AS pending,
    (SELECT max(p.revision) FROM media_revisions p WHERE p.article_slug=k.slug AND p.slot='cover' AND p.review_status='pending') AS latest_pending
   FROM knowledge_articles k
   LEFT JOIN article_media m ON m.article_slug=k.slug AND m.slot='cover'
   LEFT JOIN media_revisions r ON (r.article_slug,r.slot,r.revision)=(m.article_slug,m.slot,m.revision)
   LEFT JOIN media_assets a ON a.id=r.asset_id
   LEFT JOIN media_revisions original ON original.article_slug=k.slug AND original.slot='cover' AND original.revision=1
   LEFT JOIN media_assets base ON base.id=original.asset_id
   WHERE k.status='draft' ORDER BY k.slug`);
  const items=rows.rows;
  const target=items.filter(x=>x.original_mime==='image/svg+xml');
  return {items,progress:{total:items.length,webp:items.filter(x=>x.active_mime==='image/webp').length,target:target.length,upgraded:target.filter(x=>x.active_mime==='image/webp'&&x.active_revision>1).length,pending:items.reduce((n,x)=>n+Number(x.pending),0),missing:items.filter(x=>x.active_revision==null).length}};
 }
 async revisionImage(slug:string,slotValue:unknown,revisionValue:unknown){
  await this.article(this.pool,slug);
  const slot=requireSlot(slotValue),revision=positive(revisionValue);
  const r=await this.pool.query<MediaRow>(select+" WHERE r.article_slug=$1 AND r.slot=$2 AND r.revision=$3",[slug,slot,revision]);
  if(!r.rowCount)throw new MediaError(404,"NOT_FOUND");
  const row=r.rows[0];return this.storage.verifiedBytes(row.object_path,row.asset_id,row.mime_type);
 }
 async history(slug:string){
  await this.article(this.pool,slug);
  const rows=await this.pool.query<MediaRow>(select+" WHERE r.article_slug=$1 ORDER BY r.slot,r.revision DESC",[slug]);
  const events=await this.pool.query("SELECT slot,revision,action,actor_role,note,created_at FROM media_review_events WHERE article_slug=$1 ORDER BY id DESC",[slug]);
  const active=await this.pool.query("SELECT slot,revision FROM article_media WHERE article_slug=$1",[slug]);
  return {revisions:rows.rows.map(({object_path,...r})=>r),active:active.rows,events:events.rows};
 }
 async preview(slug:string,slotValue:unknown,rev:unknown){
  await this.article(this.pool,slug);
  const slot=requireSlot(slotValue),revision=positive(rev);
  const r=await this.pool.query<MediaRow>(select+" WHERE r.article_slug=$1 AND r.slot=$2 AND r.revision=$3",[slug,slot,revision]);
  if(!r.rowCount)throw new MediaError(404,"NOT_FOUND");
  return {url:await this.storage.signedUrl(r.rows[0].object_path),expiresIn:120};
 }
 async upload(slug:string,input:Record<string,unknown>){
  const slot=requireSlot(input.slot),image=readWebp(input.imageBase64);
  const alt=string(input.alt,500),caption=string(input.caption,1000),provenance=string(input.provenance,2000);
  const after=input.afterSection??null,heading=input.anchorHeading??null;
  validateAnchor(slot,after,heading,await this.article(this.pool,slug));
  const path=image.id+".webp";
  await this.storage.upload(path,image.bytes);
  return this.transaction(async c=>{
    validateAnchor(slot,after,heading,await this.article(c,slug,true));
    await c.query("INSERT INTO media_assets(id,object_path,mime_type,byte_size,width,height) VALUES($1,$2,'image/webp',$3,$4,$5) ON CONFLICT(id) DO NOTHING",[image.id,path,image.bytes.length,image.width,image.height]);
    const v=await c.query("SELECT COALESCE(MAX(revision),0)+1 AS revision FROM media_revisions WHERE article_slug=$1 AND slot=$2",[slug,slot]);
    const revision=Number(v.rows[0].revision);
    await c.query("INSERT INTO media_revisions(article_slug,slot,revision,asset_id,alt,caption,provenance,after_section,anchor_heading) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",[slug,slot,revision,image.id,alt,caption,provenance,after,heading]);
    await c.query("INSERT INTO media_review_events(article_slug,slot,revision,action,actor_role) VALUES($1,$2,$3,'upload','editor')",[slug,slot,revision]);
    return {slug,slot,revision,assetId:image.id,reviewStatus:"pending"};
  });
 }
 async review(slug:string,input:Record<string,unknown>){
  const slot=requireSlot(input.slot),revision=positive(input.revision),action=input.action;
  const expected=input.expectedActiveRevision;
  if(expected!==null&&(typeof expected!=="number"||!Number.isSafeInteger(expected)||expected<1))throw new MediaError(400,"INVALID_EXPECTED_REVISION");
  if(action!=="approve"&&action!=="rollback"&&action!=="request_changes")throw new MediaError(400,"INVALID_ACTION");
  const note=string(input.note,1000);
  return this.transaction(async c=>{
    const payload=await this.article(c,slug,true);
    const rows=await c.query<MediaRow>(select+" WHERE r.article_slug=$1 AND r.slot=$2 AND r.revision=$3",[slug,slot,revision]);
    if(!rows.rowCount)throw new MediaError(404,"NOT_FOUND");
    const target=rows.rows[0];
    const current=await c.query("SELECT revision FROM article_media WHERE article_slug=$1 AND slot=$2",[slug,slot]);
    if((current.rows[0]?.revision??null)!==expected)throw new MediaError(409,"ACTIVE_REVISION_CHANGED");
    if(action==="request_changes"){
      if(current.rows[0]?.revision===revision)throw new MediaError(409,"ACTIVE_REVISION");
      await c.query("UPDATE media_revisions SET review_status='pending' WHERE article_slug=$1 AND slot=$2 AND revision=$3",[slug,slot,revision]);
    }else{
      validateAnchor(slot,target.after_section,target.anchor_heading,payload);
      if(action==="rollback"&&!["dev_approved","dev_context_only"].includes(target.review_status))throw new MediaError(409,"NOT_APPROVED");
      // DEV editorial approval only, never clinical/public approval.
      if(action==="approve")await c.query("UPDATE media_revisions SET review_status='dev_approved' WHERE article_slug=$1 AND slot=$2 AND revision=$3",[slug,slot,revision]);
      await c.query("INSERT INTO article_media(article_slug,slot,revision) VALUES($1,$2,$3) ON CONFLICT(article_slug,slot) DO UPDATE SET revision=excluded.revision",[slug,slot,revision]);
    }
    await c.query("INSERT INTO media_review_events(article_slug,slot,revision,action,actor_role,note) VALUES($1,$2,$3,$4,'reviewer',$5)",[slug,slot,revision,action,note]);
    return {slug,slot,revision,action};
  });
 }
}
export function createMediaService():MediaService|undefined{
 if(process.env.MEDIA_DEV_ENABLED!=="true")return undefined;
 const config=parseDatabaseConfig();
 // Never silently route cloud media writes into a local/secondary database.
 if(config.primary!=="supabase"||!config.urls.supabase)throw new Error("Media requires primary Supabase");
 const url=process.env.MEDIA_SUPABASE_URL,key=process.env.MEDIA_SUPABASE_SERVICE_KEY;
 if(!url||!key)throw new Error("Media storage configuration missing");
 const storage=new PrivateMediaStorage(url,key);
 return new MediaService(defaultConnectionProvider("supabase",config.urls.supabase).open(),storage);
}
