import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {setTimeout as sleep} from "node:timers/promises";
const fixture="combined-ci-preview-token-not-production";
const p=spawn(process.execPath,["scripts/combined-dev.mjs","start","--fixture"],{stdio:"inherit",env:{...process.env,PORT:"10000",DEV_CONTENT_PREVIEW_TOKEN:fixture}});
const web="http://127.0.0.1:10000",api="http://127.0.0.1:4000";
try{
 let health;
 for(let n=0;n<120;n++){if(p.exitCode!==null)throw Error("Supervisor exited");try{const r=await fetch(web+"/api/health",{signal:AbortSignal.timeout(3000)});if(r.ok){health=await r.json();break;}}catch{}await sleep(500);}
 assert.equal(health?.backend,"ready");assert.equal(health?.mode,"combined-dev");
 assert.equal((await (await fetch(api+"/v1/stages")).json()).data.length,12);
 assert.equal((await fetch(api+"/v1/articles?status=draft")).status,403);
 assert.equal((await fetch(api+"/v1/dev-preview/articles")).status,404);
 assert.equal((await fetch(api+"/v1/dev-preview/articles",{headers:{"x-preview-token":fixture}})).status,200);
 assert.equal((await fetch(web+"/api/media-admin/session")).status,404);
 assert.equal((await fetch(web+"/dev-review")).status,404);
 assert.equal((await fetch(web+"/")).status,200);
 assert.equal((await fetch(web+"/v1/dev-preview/articles")).status,404);
 console.log("COMBINED_DEV_HTTP_PASS");
}finally{
 p.kill("SIGTERM");
 await new Promise(resolve=>{if(p.exitCode!==null||p.signalCode!==null)return resolve();p.once("exit",resolve);});
}
// Both children must stop with their supervisor.
for(const url of [web+"/api/health",api+"/health"]){await assert.rejects(()=>fetch(url,{signal:AbortSignal.timeout(2000)}));}
console.log("COMBINED_DEV_SHUTDOWN_PASS");
