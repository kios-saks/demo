import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {mkdtemp,readFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {JsonMockEditorialRepository} from "../../../packages/data/src/json-editorial-repository.js";
import type {MockContentDataset} from "../../../packages/data/src/contracts.js";
import {buildApp} from "./app.js";

const creds={
 writer:"dev-writer-test-key-at-least-24",
 editor:"dev-editor-test-key-at-least-24",
 reviewer:"dev-reviewer-test-key-at-least-24"
};
const read=(file:string)=>JSON.parse(readFileSync(new URL("../../../packages/content/"+file,import.meta.url),"utf8"));
function fixture():MockContentDataset{
 const original=read("articles.json");
 return {...original,topics:read("mock/topics.json"),sources:read("mock/sources.json"),
   researchCards:read("mock/research-cards.json"),seededAt:"2026-11-21"};
}
const slug="lam-quen-nhip-sinh-hoat-so-sinh";
const token=(role:keyof typeof creds)=>({authorization:"Bearer "+creds[role]});
const action=(role:keyof typeof creds,method:"GET"|"PUT"|"POST",url:string,payload?:object)=>({
 method,url,headers:token(role),...(payload?{payload}:{})
});

test("CMS must fail closed with missing configuration, bad role tokens and production",async()=>{
 const repo=new JsonMockEditorialRepository(fixture());
 const app=buildApp(repo);
 try{
   assert.equal((await app.inject("/v1/admin/articles")).statusCode,503);
 }finally{await app.close()}
 const enabled=buildApp(repo,creds);
 try{
   assert.equal((await enabled.inject("/v1/admin/articles")).statusCode,401);
   assert.equal((await enabled.inject({url:"/v1/admin/articles",headers:{authorization:"Bearer wrong-token"}})).statusCode,401);
   const info=(await enabled.inject(action("reviewer","GET","/v1/admin/session"))).json().data;
   assert.equal(info.role,"reviewer");
   assert.equal((await enabled.inject(action("writer","GET","/v1/admin/articles"))).json().data.length,24);
   assert.equal((await enabled.inject(action("writer","GET","/v1/admin/articles/unknown"))).statusCode,404);
 }finally{await enabled.close()}
 const prev=process.env.NODE_ENV;
 process.env.NODE_ENV="production";
 const production=buildApp(repo,creds);
 try{
   assert.equal((await production.inject(action("writer","GET","/v1/admin/articles"))).statusCode,404);
   assert.equal((await production.inject(action("reviewer","GET","/v1/admin/session"))).statusCode,404);
 }finally{
   await production.close();
   if(prev===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=prev;
 }
});

test("writer edit -> submit -> editor/medical approvals, then return for revision",async()=>{
 const app=buildApp(new JsonMockEditorialRepository(fixture()),creds);
 try{
   const original=(await app.inject(action("writer","GET","/v1/admin/articles/"+slug))).json().data;
   assert.equal(original.revision,1);
   const content={title:"Bản nháp chỉnh sửa theo quy trình",summary:"Nội dung được thay đổi bằng chức năng CMS mock có kiểm soát phiên bản.",readMinutes:4,
     tags:original.article.tags,sections:original.article.sections,sources:original.article.sources};
   const edited=await app.inject(action("writer","PUT","/v1/admin/articles/"+slug,{expectedRevision:1,content}));
   assert.equal(edited.statusCode,200,edited.body);
   assert.equal(edited.json().data.revision,2);
   assert.equal(edited.json().data.article.title,content.title);
   assert.equal((await app.inject(action("writer","PUT","/v1/admin/articles/"+slug,{expectedRevision:1,content}))).statusCode,409);
   const submitted=await app.inject(action("writer","POST","/v1/admin/articles/"+slug+"/submit",{expectedRevision:2}));
   assert.equal(submitted.statusCode,200);
   assert.equal(submitted.json().data.article.status,"in_review");
   assert.equal((await app.inject(action("writer","POST","/v1/admin/articles/"+slug+"/review",{expectedRevision:2,decision:"editorial_approve"}))).statusCode,403);
   const editorial=await app.inject(action("editor","POST","/v1/admin/articles/"+slug+"/review",{expectedRevision:2,decision:"editorial_approve"}));
   assert.equal(editorial.statusCode,200,editorial.body);
   assert.equal(editorial.json().data.editorialApproval.revision,2);
   const medical=await app.inject(action("reviewer","POST","/v1/admin/articles/"+slug+"/review",{expectedRevision:2,decision:"medical_approve"}));
   assert.equal(medical.statusCode,200,medical.body);
   assert.equal(medical.json().data.medicalApproval.revision,2);
   assert.equal(medical.json().data.article.status,"in_review","Demo approvals must never auto-publish");
   assert.equal((await app.inject(action("reviewer","PUT","/v1/admin/articles/"+slug,{expectedRevision:2,content}))).statusCode,403);
   const change=await app.inject(action("editor","POST","/v1/admin/articles/"+slug+"/review",{expectedRevision:2,decision:"request_changes",note:"Cần cập nhật thêm nguồn khoa học."}));
   assert.equal(change.statusCode,200,change.body);
   assert.equal(change.json().data.article.status,"draft");
   assert.equal(change.json().data.editorialApproval,null);
   assert.equal(change.json().data.medicalApproval,null);
   assert.equal((await app.inject(action("writer","GET","/v1/admin/articles/"+slug+"/history"))).json().data.length,5);
 }finally{await app.close()}
});

test("rejects invalid data, self-review and attempted approval bypass",async()=>{
 const app=buildApp(new JsonMockEditorialRepository(fixture()),creds);
 try{
   const rec=(await app.inject(action("editor","GET","/v1/admin/articles/"+slug))).json().data;
   const base={title:rec.article.title,summary:rec.article.summary,readMinutes:rec.article.readMinutes,
    tags:rec.article.tags,sections:rec.article.sections,sources:rec.article.sources};
   assert.equal((await app.inject(action("writer","PUT","/v1/admin/articles/"+slug,{expectedRevision:1,
     content:{...base,sources:[{name:"Malicious URL",url:"javascript:alert(1)"}]}}))).statusCode,422);
   assert.equal((await app.inject(action("writer","PUT","/v1/admin/articles/"+slug,{expectedRevision:1,
     content:{...base,status:"published",stage:"truong-thanh",slug:"hijack",title:"An updated educational draft title"}}))).statusCode,200);
   const current=(await app.inject(action("writer","GET","/v1/admin/articles/"+slug))).json().data;
   assert.equal(current.article.status,"draft");
   assert.equal(current.article.stage,"so-sinh");
   assert.equal(current.article.slug,slug);
   assert.equal((await app.inject(action("editor","POST","/v1/admin/articles/"+slug+"/review",{expectedRevision:2,decision:"request_changes",note:""}))).statusCode,422);
   assert.equal((await app.inject(action("editor","POST","/v1/admin/articles/"+slug+"/review",{expectedRevision:2,decision:"request_changes",note:"Bản này chưa được gửi duyệt."}))).statusCode,409);
   assert.equal((await app.inject(action("editor","POST","/v1/admin/articles/"+slug+"/submit",{expectedRevision:2}))).statusCode,200);
   const editedByEditor=await app.inject(action("editor","PUT","/v1/admin/articles/"+slug,{expectedRevision:2,content:base}));
   assert.equal(editedByEditor.statusCode,200);
   assert.equal((await app.inject(action("editor","POST","/v1/admin/articles/"+slug+"/submit",{expectedRevision:3}))).statusCode,200);
   assert.equal((await app.inject(action("editor","POST","/v1/admin/articles/"+slug+"/review",{expectedRevision:3,decision:"editorial_approve"}))).statusCode,403);
   assert.equal((await app.inject(action("writer","POST","/v1/admin/articles/"+slug+"/review",{expectedRevision:3,decision:"medical_approve"}))).statusCode,403);
   assert.equal((await app.inject(action("editor","POST","/v1/admin/articles/"+slug+"/publish",{expectedRevision:3}))).statusCode,404);
 }finally{await app.close()}
});

test("local JSON persistence reloads editor history; atomic revisions prevent lost writes",async()=>{
 const dir=await mkdtemp(join(tmpdir(),"mebe-editorial-"));
 const location=join(dir,"state.json");
 try{
   const store=new JsonMockEditorialRepository(fixture(),location);
   const original=await store.getEditorialArticle(slug);
   assert(original);
   const content={title:"Test storing revisions in JSON",summary:"Temporary local JSON state is persisted and reloaded using the repository boundary.",
      readMinutes:3,tags:original.article.tags,sections:original.article.sections,sources:original.article.sources};
   const writer={id:"demo-writer",role:"writer" as const};
   const results=await Promise.allSettled([store.editArticle(slug,1,content,writer),store.editArticle(slug,1,content,writer)]);
   assert.equal(results.filter(x=>x.status==="fulfilled").length,1);
   assert.equal(results.filter(x=>x.status==="rejected").length,1);
   const raw=JSON.parse(await readFile(location,"utf8"));
   assert.equal(raw.records[slug].revision,2);
   const loaded=new JsonMockEditorialRepository(fixture(),location);
   const after=await loaded.getEditorialArticle(slug);
   assert.equal(after?.revision,2);
   assert.equal(after?.article.title,content.title);
   assert.equal(after?.events.length,1);
   assert.equal((await loaded.getArticle(slug))?.title,content.title);
 }finally{await rm(dir,{recursive:true,force:true})}
});
