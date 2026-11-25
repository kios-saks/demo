import {spawn} from "node:child_process";
import {createRequire} from "node:module";
import {fileURLToPath,pathToFileURL} from "node:url";
import {setTimeout as sleep} from "node:timers/promises";
const root=fileURLToPath(new URL("../",import.meta.url));
const webDir=fileURLToPath(new URL("../apps/web/",import.meta.url));
const webRequire=createRequire(new URL("../apps/web/package.json",import.meta.url));
const apiOrigin="http://127.0.0.1:4000";
const systemKeys=["PATH","HOME","TMPDIR","TMP","TEMP","LANG","LC_ALL","TZ","CI","NODE_EXTRA_CA_CERTS","SSL_CERT_FILE","SSL_CERT_DIR","SystemRoot","ComSpec","PATHEXT"];
const webKeys=["NEXT_PUBLIC_SITE_URL","NEXT_PUBLIC_CONTENT_API_URL","NEXT_TELEMETRY_DISABLED","DEV_CONTENT_PREVIEW_TOKEN","READER_INVITE_SHA256","WEB_MEDIA_ADMIN_ENABLED","WEB_DYNAMIC_MEDIA","RENDER","RENDER_SERVICE_ID","RENDER_EXTERNAL_URL","FAMILY_WEB_ENABLED","FAMILY_SIGNUP_ENABLED","FAMILY_SUPABASE_URL","FAMILY_SUPABASE_PUBLISHABLE_KEY"];
const apiKeys=["SUPABASE_DATABASE_URL","SUPABASE_CA_CERT_PATH","MEDIA_SUPABASE_URL","MEDIA_SUPABASE_SERVICE_KEY","MEDIA_DEV_EDITOR_TOKEN","MEDIA_DEV_REVIEWER_TOKEN","DEV_CONTENT_PREVIEW_TOKEN","CORS_ORIGIN","RENDER","RENDER_SERVICE_ID","EDITORIAL_DEMO_WRITER_TOKEN","EDITORIAL_DEMO_EDITOR_TOKEN","EDITORIAL_DEMO_REVIEWER_TOKEN","FAMILY_API_ENABLED","FAMILY_DB_AUDIT_ENABLED","FAMILY_DATABASE_URL","FAMILY_SUPABASE_URL","FAMILY_SUPABASE_PUBLISHABLE_KEY"];
const pick=(env,keys)=>Object.fromEntries(keys.filter(k=>typeof env[k]==="string").map(k=>[k,env[k]]));
export function childEnvironments(env,fixture=false){
 const port=Number(env.PORT||10000);
 if(!Number.isInteger(port)||port<1024||port>65535||port===4000)throw Error("Invalid public PORT");
 if(fixture&&env.RENDER==="true")throw Error("Fixture mode forbidden on Render");
 if(!fixture&&env.MEBE_COMBINED_DEV!=="true")throw Error("Explicit MEBE_COMBINED_DEV=true required");
 const sys=pick(env,systemKeys);
 const shared={...sys,NODE_ENV:"production",MEBE_COMBINED_DEV:"true",MEBE_COMBINED_WEB_PORT:String(port)};
 const web={...shared,...pick(env,webKeys),PORT:String(port),WEB_CONTENT_PROVIDER:"api",CONTENT_API_INTERNAL_URL:apiOrigin,WEB_DYNAMIC_MEDIA_VERIFY_ON_START:"false",NEXT_TELEMETRY_DISABLED:"1"};
 const api={...shared,...pick(env,apiKeys),PORT:"4000",DATABASE_MODE:fixture?"mock":"supabase",MEDIA_IMPORT_ON_START:"false",MEDIA_DEV_ENABLED:fixture?"false":"true",SUPABASE_CA_CERT_PATH:env.SUPABASE_CA_CERT_PATH||fileURLToPath(new URL("../database/certs/prod-ca-2021.crt",import.meta.url))};
 if(fixture){
  for(const child of [api,web])for(const key of Object.keys(child))if(key.startsWith("FAMILY_"))delete child[key];
  // Never touch real storage or DB even if the operator's shell has credentials.
  for(const k of ["SUPABASE_DATABASE_URL","MEDIA_SUPABASE_URL","MEDIA_SUPABASE_SERVICE_KEY","MEDIA_DEV_EDITOR_TOKEN","MEDIA_DEV_REVIEWER_TOKEN","EDITORIAL_DEMO_WRITER_TOKEN","EDITORIAL_DEMO_EDITOR_TOKEN","EDITORIAL_DEMO_REVIEWER_TOKEN"])delete api[k];
  web.WEB_DYNAMIC_MEDIA="false";web.WEB_MEDIA_ADMIN_ENABLED="false";delete web.NEXT_PUBLIC_CONTENT_API_URL;
 }else{
  web.WEB_DYNAMIC_MEDIA="true";web.WEB_MEDIA_ADMIN_ENABLED="true";
 }
 return {web,api,port};
}
export function validateRuntime(env){
 const missing=["SUPABASE_DATABASE_URL","MEDIA_SUPABASE_URL","MEDIA_SUPABASE_SERVICE_KEY","MEDIA_DEV_EDITOR_TOKEN","MEDIA_DEV_REVIEWER_TOKEN","DEV_CONTENT_PREVIEW_TOKEN","READER_INVITE_SHA256"].filter(k=>!env[k]);
 if(missing.length)throw Error("Missing required environment keys: "+missing.join(", "));
 const tokens=[env.MEDIA_DEV_EDITOR_TOKEN,env.MEDIA_DEV_REVIEWER_TOKEN,env.DEV_CONTENT_PREVIEW_TOKEN];
 if(tokens[0].length<32||tokens[1].length<32||tokens[2].length<24||new Set(tokens).size!==3||!/^[a-f0-9]{64}$/i.test(env.READER_INVITE_SHA256))throw Error("Invalid credential configuration");
}
async function ready(origin,path,deadline,child){
 while(Date.now()<deadline){
  if(child.exitCode!==null||child.signalCode!==null)throw Error("Child exited before readiness");
  try{const r=await fetch(origin+path,{redirect:"error",signal:AbortSignal.timeout(3000)});if(r.status===200&&(await r.json()).ok===true)return;}catch{}
  await sleep(500);
 }
 throw Error("Local readiness deadline exceeded");
}
async function run(){
 const cmd=process.argv[2],fixture=process.argv[3]==="--fixture";
 if(!["build","start"].includes(cmd))throw Error("Use build or start");
 const {web,api,port}=childEnvironments(process.env,fixture);
 if(cmd==="build"){
  // Next's build receives only Web keys. No DB or CMS reviewer/editor secrets.
  const p=spawn("npm",["run","build:web"],{cwd:root,env:web,stdio:"inherit"});
  p.on("error",()=>{process.exitCode=1;});
  p.on("exit",(code)=>{process.exitCode=code??1;});return;
 }
 if(!fixture)validateRuntime(process.env);
 const children=[];let stopping=false;
 function stop(code){
  if(stopping)return;stopping=true;process.exitCode=code;
  for(const p of children)if(p.exitCode===null&&p.signalCode===null)p.kill("SIGTERM");
  const timer=setTimeout(()=>{for(const p of children)if(p.exitCode===null&&p.signalCode===null)p.kill("SIGKILL");},10000);timer.unref();
 }
 function child(label,args,cwd,env){
  const p=spawn(process.execPath,args,{cwd,env,stdio:"inherit"});children.push(p);
  p.once("error",()=>{console.error("COMBINED_CHILD_ERROR",label);stop(1);});
  p.once("exit",(code,signal)=>{if(!stopping){console.error("COMBINED_CHILD_EXIT",label,code??signal);stop(1);}});
  return p;
 }
 process.once("SIGINT",()=>stop(0));process.once("SIGTERM",()=>stop(0));
 try{
  const backend=child("api",["--import","tsx","apps/api/src/server.ts"],root,api);
  await ready(apiOrigin,"/health/ready",Date.now()+90000,backend);
  if(stopping)return;
  console.log("COMBINED_API_READY",{provider:fixture?"mock":"supabase",host:"loopback"});
  const frontend=child("web",[webRequire.resolve("next/dist/bin/next"),"start","--hostname","0.0.0.0","--port",String(port)],webDir,web);
  await ready("http://127.0.0.1:"+port,"/api/health",Date.now()+90000,frontend);
  if(!stopping)console.log("COMBINED_DEV_READY",{port,api:"loopback"});
 }catch{console.error("COMBINED_STARTUP_FAILED");stop(1);}
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url)run().catch(e=>{console.error("COMBINED_CONFIG_ERROR",e.message);process.exitCode=1;});
