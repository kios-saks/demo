import {test} from "node:test";
import assert from "node:assert/strict";
import {MockKnowledgeRepository} from "../../../packages/data/src/mock-repository.js";
import {loadSeedDataset} from "./seed-data.js";
import {buildApp} from "./app.js";

test("readiness succeeds when repository responds, without revealing internals",async()=>{
 const app=buildApp(new MockKnowledgeRepository(loadSeedDataset()));
 try{
   const res=await app.inject("/health/ready");
   assert.equal(res.statusCode,200);
   assert.deepEqual(res.json(),{ok:true});
 }finally{await app.close()}
});
test("readiness reports sanitized 503 when data dependency is unavailable",async()=>{
 const offline=new MockKnowledgeRepository(loadSeedDataset());
 offline.listStages=async()=>{throw Error("sensitive-postgres-password-or-URL");};
 const app=buildApp(offline);
 try{
   const res=await app.inject("/health/ready");
   assert.equal(res.statusCode,503);
   assert.deepEqual(res.json(),{ok:false,error:"DEPENDENCY_UNAVAILABLE"});
   assert(!res.body.includes("password"));
 }finally{await app.close()}
});
