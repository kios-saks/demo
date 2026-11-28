import {test} from "node:test";
import assert from "node:assert/strict";
import {renderKnowledgeHub} from "../../../apps/web/lib/knowledge-hub.js";
test("UX05 upstream failure is distinct from empty and stays gated",async()=>{
 const settings={MEBE_COMBINED_DEV:"true",RENDER:"true",RENDER_SERVICE_ID:"srv-dc19cibl550s73drji5g",DEV_CONTENT_PREVIEW_TOKEN:"test-placeholder-".repeat(3),WEB_DYNAMIC_MEDIA:"true"};
 const old=Object.fromEntries(Object.keys(settings).map(key=>[key,process.env[key]]));Object.assign(process.env,settings);
 try{
  const req=new Request("http://localhost/kham-pha?stage=baby&topic=health&q=synthetic-sentinel");
  const res=await renderKnowledgeHub(req,async()=>{throw Error("synthetic-sentinel");});assert.equal(res.status,503);assert.equal(res.headers.get("Retry-After"),"5");assert.match(res.headers.get("Cache-Control")||"",/no-store/);const html=await res.text();assert(html.includes("data-discovery-error"));assert(!html.includes("data-discovery-empty"));assert(!html.includes("synthetic-sentinel"));assert(html.includes("/kham-pha?stage=baby&amp;topic=health"));
  const incomplete=await renderKnowledgeHub(req,async()=>({source:"supabase",articles:[]}));assert.equal(incomplete.status,503);
  process.env.MEBE_COMBINED_DEV="false";const denied=await renderKnowledgeHub(req,async()=>{throw Error("must not load");});assert.equal(denied.status,404);
  console.log("UX05_UPSTREAM_FAIL_CLOSED_PASS");
 }finally{for(const [k,v] of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
