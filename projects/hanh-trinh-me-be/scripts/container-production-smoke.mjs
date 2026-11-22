import assert from "node:assert/strict";
const base="http://127.0.0.1:4000";
for(let i=0;i<80;i++){
 try{
   const result=await fetch(base+"/health/ready",{signal:AbortSignal.timeout(1000)});
   if(result.ok)break;
 }catch{}
 if(i===79)throw new Error("Container did not become ready");
 await new Promise(res=>setTimeout(res,500));
}
const health=await (await fetch(base+"/health")).json();
assert.equal(health.ok,true);
assert.equal(health.provider,"mock");
const stages=await (await fetch(base+"/v1/stages")).json();
assert.equal(stages.data.length,12);
const articleList=await (await fetch(base+"/v1/articles")).json();
assert.equal(articleList.meta.total,0);
for(const [path,status] of [
 ["/v1/articles/lam-quen-nhip-sinh-hoat-so-sinh",404],
 ["/v1/research-cards",404],
 ["/v1/editorial/overview",404],
 ["/v1/admin/articles",404]
]){
 const result=await fetch(base+path);
 assert.equal(result.status,status,path);
}
console.log("PASS isolated release Docker image /health/ready, stages and public draft gate");
