import {test} from "node:test";
import assert from "node:assert/strict";
import {renderUnifiedSearch} from "../../../apps/web/lib/knowledge-search-render.js";
import {listDevSearchArticles} from "../../../apps/web/lib/dev-preview.js";
test("UX02 unavailable upstream fails closed, generic 503",async()=>{
 const settings={MEBE_COMBINED_DEV:"true",RENDER:"true",RENDER_SERVICE_ID:"srv-dc19cibl550s73drji5g",DEV_CONTENT_PREVIEW_TOKEN:"test-placeholder-".repeat(3),CONTENT_API_INTERNAL_URL:"invalid:///unreachable"};
 const old=Object.fromEntries(Object.keys(settings).map(key=>[key,process.env[key]]));
 Object.assign(process.env,settings);
 try{
  const req=new Request("http://localhost/tim-kiem?q=synthetic-search-sentinel");
  const response=await renderUnifiedSearch(req);
  assert.equal(response.status,503);assert.equal(response.headers.get("Retry-After"),"5");assert.match(response.headers.get("Cache-Control")||"",/no-store/);
  const html=await response.text();assert(html.includes("data-search-error"));assert(!html.includes("data-search-empty"));assert(!html.includes("synthetic-search-sentinel"));assert(!html.includes(settings.DEV_CONTENT_PREVIEW_TOKEN));
  await assert.rejects(listDevSearchArticles);
  const incomplete=await renderUnifiedSearch(req,async()=>[]);assert.equal(incomplete.status,503);
  process.env.MEBE_COMBINED_DEV="false";
  assert.equal((await renderUnifiedSearch(req,async()=>{throw Error("must not load");})).status,404);
  console.log("UX02_UPSTREAM_FAIL_CLOSED_PASS");
 }finally{for(const [key,value] of Object.entries(old)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
