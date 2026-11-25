import {test} from "node:test";
import assert from "node:assert/strict";
import {initialDemoState,demoRequest,demoFamilyId,type FamilyView} from "../apps/web/lib/family-demo.js";
import {familyDemoEnabled} from "../apps/web/lib/family-demo-config.js";
test("demo is confined to exact Combined DEV",()=>{
 const env={RENDER:"true",MEBE_COMBINED_DEV:"true",RENDER_SERVICE_ID:"srv-dc19cibl550s73drji5g"};
 assert.equal(familyDemoEnabled(env),true);
 for(const e of [{},{...env,RENDER:"false"},{...env,RENDER_SERVICE_ID:"wrong"},{...env,MEBE_COMBINED_DEV:"false"}])assert.equal(familyDemoEnabled(e),false);
});
test("demo protocol: fixture account, role, consent, invite expiry, replay, shared revision, isolation and logout",()=>{
 let s=initialDemoState(),now=1000;
 const request=(method:string,path:string,body:Record<string,unknown>={},status=200)=>{
  const r=demoRequest(s,method,path,body,now);assert.equal(r.response.status,status,r.response.error);s=r.state;return r.response.data;
 };
 const path="/v1/families/"+demoFamilyId;
 const switchTo=(persona:string)=>request("POST","/demo/session",{persona});
 assert.equal((request("GET",path) as FamilyView).role,"owner");
 request("PATCH",path+"/journey",{stage:"nhu-nhi",revision:0});
 request("PATCH",path+"/checklist",{key:"read",checked:true,revision:1});
 request("PATCH",path+"/saved",{key:"ngu-an-toan-cho-tre-so-sinh",checked:true,revision:2});
 request("PATCH",path+"/journey",{stage:"so-sinh",revision:0},409);
 switchTo("demo-dad");
 const member=request("GET",path) as FamilyView;assert.equal(member.stage,"nhu-nhi");assert.equal(member.revision,3);assert.equal(member.role,"member");assert(member.checklist.includes("read"));assert.equal(member.saved.length,1);
 request("GET",path+"/members",{},404);
 switchTo("demo-grandma");request("GET",path);request("PATCH",path+"/checklist",{key:"plan",checked:true,revision:3},404);
 switchTo("demo-other");request("GET",path,{},404);request("PATCH",path+"/journey",{stage:"so-sinh",revision:3},404);
 switchTo("demo-guest");request("GET","/v1/account/me",{},409);request("POST","/v1/account/onboard",{},400);request("POST","/v1/account/onboard",{consentVersion:"family-v1"});
 switchTo("demo-mom");const old=(request("POST",path+"/invitations",{accountId:"demo-guest",role:"member"}) as {token:string}).token;
 now+=86400000;switchTo("demo-guest");request("POST","/v1/family-invitations/accept",{token:old},404);
 switchTo("demo-mom");const token=(request("POST",path+"/invitations",{accountId:"demo-guest",role:"member"}) as {token:string}).token;
 switchTo("demo-other");request("POST","/v1/family-invitations/accept",{token},404);
 switchTo("demo-guest");request("POST","/v1/family-invitations/accept",{token});request("POST","/v1/family-invitations/accept",{token},404);assert.equal((request("GET",path) as FamilyView).role,"member");
 switchTo("demo-mom");request("DELETE",path+"/members/demo-guest");request("DELETE",path+"/members/demo-mom",{},404);
 switchTo("demo-guest");request("GET",path,{},404);const fresh=request("POST","/v1/families",{name:"Gia đình nhỏ"}) as FamilyView;assert.equal(fresh.role,"owner");assert.equal(fresh.revision,0);
 request("DELETE","/demo/session");request("GET","/v1/families",{},401);
 assert.equal(initialDemoState().families[0].revision,0);
 console.log("FAMILY_DEMO_PROTOCOL_PASS");
});
