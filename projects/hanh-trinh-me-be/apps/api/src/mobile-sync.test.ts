import {test} from "node:test";
import assert from "node:assert/strict";
import {MobileContentSync} from "../../mobile/src/content-sync.js";
import type {ContentStorage} from "../../mobile/src/content-sync.js";
import {JsonMockEditorialRepository} from "../../../packages/data/src/json-editorial-repository.js";
import {loadSeedDataset} from "./seed-data.js";
import {buildApp} from "./app.js";

function memory():ContentStorage{
 const data=new Map<string,string>();
 return {
  getItem:async(key)=>data.get(key)||null,
  setItem:async(key,value)=>{data.set(key,value)},
  removeItem:async(key)=>{data.delete(key)}
 };
}
test("mobile preview sync, persistent offline cache, TTL and server edits",async()=>{
 const backend=new JsonMockEditorialRepository(loadSeedDataset());
 const app=buildApp(backend);
 let online=true;
 let now=Date.now();
 const fetcher:typeof fetch=async input=>{
   if(!online)throw Error("network unavailable");
   const target=new URL(String(input));
   const r=await app.inject(target.pathname+target.search);
   return new Response(r.body,{status:r.statusCode,headers:{"content-type":"application/json"}});
 };
 const store=memory();
 const sync=new MobileContentSync("https://api.example.com",store,false,fetcher,()=>now);
 try{
   const list=await sync.refreshIndex();
   assert.equal(list.stages.length,12);
   assert.equal(list.articles.length,24);
   const slug="lam-quen-nhip-sinh-hoat-so-sinh";
   const before=await sync.loadArticle(slug);
   assert(before);
   await backend.editArticle(slug,1,{
     title:"Đã đồng bộ CMS sang Mobile preview",summary:"Nội dung được cập nhật và đã truy vấn lại từ Backend qua giao diện repository chung.",
     readMinutes:3,tags:before.tags,sections:before.sections,sources:before.sources
   },{id:"demo-writer",role:"writer"});
   assert.equal((await sync.loadArticle(slug))?.title,"Đã đồng bộ CMS sang Mobile preview");
   online=false;
   assert.equal((await sync.cachedIndex())?.articles.length,24);
   assert.equal((await sync.loadArticle(slug))?.title,"Đã đồng bộ CMS sang Mobile preview");
   now+=73*60*60*1000;
   assert.equal(await sync.cachedIndex(),null);
   await assert.rejects(()=>sync.loadArticle(slug),/network unavailable/);
 }finally{await app.close()}
});
test("release never reads draft preview cache and requires HTTPS API",async()=>{
 const backend=new JsonMockEditorialRepository(loadSeedDataset());
 const app=buildApp(backend);
 const fetcher:typeof fetch=async input=>{
   const url=new URL(String(input));const r=await app.inject(url.pathname+url.search);
   return new Response(r.body,{status:r.statusCode,headers:{"content-type":"application/json"}});
 };
 const store=memory();
 try{
   const preview=new MobileContentSync("https://api.example.com",store,false,fetcher);
   await preview.refreshIndex();
   await preview.loadArticle("lam-quen-nhip-sinh-hoat-so-sinh");
   const release=new MobileContentSync("https://api.example.com",store,true,fetcher);
   assert.equal(await release.cachedIndex(),null,"Release cache must be namespaced from preview");
   assert.equal((await release.refreshIndex()).articles.length,0);
   assert.equal(await release.loadArticle("lam-quen-nhip-sinh-hoat-so-sinh"),null);
   assert.throws(()=>new MobileContentSync("http://example.com",store,true),/HTTPS/);
 }finally{await app.close()}
});
