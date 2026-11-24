import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {adminPath,mediaAdminProxy} from "../apps/web/lib/media-admin-proxy";
test("CMS proxy allowlist, role forwarding, image integrity and feature gate",async()=>{
 const prior=process.env.WEB_MEDIA_ADMIN_ENABLED,origin=process.env.CONTENT_API_INTERNAL_URL,fetchOld=globalThis.fetch;
 const token="e".repeat(40), bytes=Buffer.from("controlled test bytes"),id=createHash("sha256").update(bytes).digest("hex");
 let calls=0,bad=false;
 const req=(parts:string,auth=true,method="GET",body?:unknown)=>new Request("https://web.invalid/api/media-admin/"+parts,{method,headers:{...(auth?{Authorization:"Bearer "+token}:{}),...(body?{"Content-Type":"application/json"}:{})},body:body?JSON.stringify(body):undefined});
 try{
  assert.equal(adminPath("GET",["..","catalog"]),null);
  assert.equal(adminPath("POST",["article","preview"]),null);
  assert.equal(adminPath("GET",["article","image","cover","0"]),null);
  process.env.WEB_MEDIA_ADMIN_ENABLED="false";
  assert.equal((await mediaAdminProxy(req("catalog"),["catalog"])).status,404);
  process.env.WEB_MEDIA_ADMIN_ENABLED="true";process.env.CONTENT_API_INTERNAL_URL="https://api.invalid";
  globalThis.fetch=(async(input:any,init:any)=>{
   calls++;assert.equal(init.headers.authorization,"Bearer "+token);assert.equal(init.redirect,"error");assert.equal(init.cache,"no-store");
   assert.ok(String(input).startsWith("https://api.invalid/v1/dev-media-admin/"));
   if(String(input).includes("/image/"))return new Response(new Uint8Array(bytes),{headers:{"content-type":"image/webp","x-media-asset":bad?"a".repeat(64):id}});
   if(String(input).endsWith("/review"))return Response.json({error:"NOT_FOUND"},{status:404});
   return Response.json({data:{role:"editor"}});
  }) as typeof fetch;
  assert.equal((await mediaAdminProxy(req("catalog",false),["catalog"])).status,404);assert.equal(calls,0);
  const cross=new Request("https://web.invalid/api/media-admin/catalog",{headers:{Authorization:"Bearer "+token,"sec-fetch-site":"cross-site"}});
  assert.equal((await mediaAdminProxy(cross,["catalog"])).status,404);assert.equal(calls,0);
  const session=await mediaAdminProxy(req("session"),["session"]);assert.equal(session.status,200);assert.equal((await session.json()).data.role,"editor");
  const image=await mediaAdminProxy(req("article/image/cover/1"),["article","image","cover","1"]);assert.equal(image.status,200);assert.equal(image.headers.get("x-media-asset"),id);assert.match(image.headers.get("cache-control")||"",/no-store/);
  bad=true;assert.equal((await mediaAdminProxy(req("article/image/cover/1"),["article","image","cover","1"])).status,503);
  assert.equal((await mediaAdminProxy(req("article/review",true,"POST",{slot:"cover"}),["article","review"])).status,404);
  console.log("MEDIA_CMS_PROXY_VERIFIED");
 }finally{globalThis.fetch=fetchOld;if(prior===undefined)delete process.env.WEB_MEDIA_ADMIN_ENABLED;else process.env.WEB_MEDIA_ADMIN_ENABLED=prior;if(origin===undefined)delete process.env.CONTENT_API_INTERNAL_URL;else process.env.CONTENT_API_INTERNAL_URL=origin;}
});
