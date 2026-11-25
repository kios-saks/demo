import {test} from "node:test";
import assert from "node:assert/strict";
import {buildApp} from "./app.js";
import {FixtureFamilyService} from "./family-service.js";
import {MockKnowledgeRepository} from "../../../packages/data/src/mock-repository.js";
import {loadSeedDataset} from "./seed-data.js";
const repo=()=>new MockKnowledgeRepository(loadSeedDataset());
test("family endpoints are absent from ordinary server composition",async()=>{
 const app=buildApp(repo());try{
  assert.equal((await app.inject("/v1/families")).statusCode,404);
  assert.equal((await app.inject("/v1/account/me")).statusCode,404);
 }finally{await app.close();}
});
test("fixture family API: verified principal, consent, tenant isolation, invite, revoke and optimistic concurrency",async()=>{
 let now=1000;
 const identities=new Map([["fixture-owner","owner"],["fixture-member","member"],["fixture-viewer","viewer"],["fixture-other","other"]]);
 const service=new FixtureFamilyService(new Set(["so-sinh","mang-thai"]),()=>now);
 const app=buildApp(repo(),undefined,undefined,{service,verifyIdentity:async token=>{
  if(token==="fixture-unavailable")throw Error("provider offline");
  return identities.get(token)??null;
 }});
 const call=(method:"GET"|"POST"|"PATCH"|"DELETE",url:string,who?:string,payload?:Record<string,unknown>)=>app.inject({method,url,headers:who?{authorization:"Bearer fixture-"+who}:{},...(payload?{payload}:{})});
 const data=(r:Awaited<ReturnType<typeof call>>)=>r.json().data;
 try{
  assert.equal((await call("GET","/v1/families")).statusCode,401);
  assert.equal((await call("GET","/v1/families","forged")).statusCode,401);
  assert.equal((await call("GET","/v1/families","unavailable")).statusCode,503);
  assert.equal((await app.inject({url:"/v1/families",headers:{"x-account-id":"owner","x-role":"owner"}})).statusCode,401);
  assert.equal((await call("GET","/v1/account/me","owner")).statusCode,409);
  assert.equal((await call("POST","/v1/account/onboard","owner",{displayName:"Owner",consentVersion:"old"})).statusCode,400);
  for(const who of ["owner","member","viewer","other"]){
   const r=await call("POST","/v1/account/onboard",who,{displayName:who,consentVersion:"family-v1"});
   assert.equal(r.statusCode,200);assert.equal(data(r).id,who);assert.match(r.headers["cache-control"] as string,/no-store/);
  }
  assert.equal((await call("POST","/v1/account/onboard","owner",{displayName:"Other",consentVersion:"family-v1"})).statusCode,409);
  assert.equal((await call("POST","/v1/families","owner",{name:"Family",role:"owner",accountId:"other"})).statusCode,400);
  const created=await call("POST","/v1/families","owner",{name:"My family"});assert.equal(created.statusCode,200);
  const family=data(created).id as string, path="/v1/families/"+family;
  const second=data(await call("POST","/v1/families","other",{name:"Other family"})).id;
  assert.equal(data(await call("GET","/v1/families","owner")).length,1);
  assert.equal(data(await call("GET","/v1/families","other"))[0].id,second);
  assert.equal((await call("GET",path,"other")).statusCode,404);
  assert.equal((await call("PATCH",path+"/journey","other",{stage:"so-sinh",revision:0})).statusCode,404);
  assert.equal((await call("POST",path+"/invitations","other",{accountId:"member",role:"member"})).statusCode,404);
  assert.equal((await call("POST",path+"/invitations","owner",{accountId:"member",role:"owner"})).statusCode,400);
  const invite=(who:string,role:string)=>call("POST",path+"/invitations","owner",{accountId:who,role});
  const accept=(who:string,token:string)=>call("POST","/v1/family-invitations/accept",who,{token});
  const m=await invite("member","member");assert.equal(m.statusCode,200);const mt=data(m).token;
  assert.equal((await accept("other",mt)).statusCode,404);
  assert.equal((await call("GET",path,"member")).statusCode,404);
  assert.equal((await accept("member",mt)).statusCode,200);
  assert.equal((await accept("member",mt)).statusCode,404);
  const v=data(await invite("viewer","viewer")).token;now+=86400000;
  assert.equal((await accept("viewer",v)).statusCode,404);
  const fresh=data(await invite("viewer","viewer")).token;assert.equal((await accept("viewer",fresh)).statusCode,200);
  assert.equal((await call("GET",path,"viewer")).statusCode,200);
  assert.equal((await call("PATCH",path+"/journey","viewer",{stage:"so-sinh",revision:0})).statusCode,404);
  assert.equal((await call("GET",path+"/members","member")).statusCode,404);
  assert.equal((await call("PATCH",path+"/journey","member",{stage:"invalid",revision:0})).statusCode,400);
  const result=await call("PATCH",path+"/journey","member",{stage:"so-sinh",revision:0});
  assert.equal(result.statusCode,200);assert.equal(data(result).revision,1);
  assert.equal(data(await call("GET",path,"owner")).stage,"so-sinh");
  assert.equal((await call("PATCH",path+"/journey","owner",{stage:null,revision:0})).statusCode,409);
  assert.equal((await call("DELETE",path+"/members/owner","owner")).statusCode,404);
  assert.equal((await call("DELETE",path+"/members/member","viewer")).statusCode,404);
  assert.equal((await call("DELETE",path+"/members/member","owner")).statusCode,200);
  assert.equal((await call("GET",path,"member")).statusCode,404);
  assert.equal(data(await call("GET","/v1/families","member")).length,0);
  assert.equal((await call("PATCH",path+"/journey","member",{stage:null,revision:1})).statusCode,404);
  identities.delete("fixture-viewer");
  assert.equal((await call("GET",path,"viewer")).statusCode,401);
  console.log("FAMILY_FIXTURE_API_PASS: consent, verified principal, tenant isolation, invite binding/expiry/replay, RBAC, revision conflict, revocation");
 }finally{await app.close();}
});
