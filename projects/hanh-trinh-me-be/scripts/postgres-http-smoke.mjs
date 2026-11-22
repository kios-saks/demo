import assert from "node:assert/strict";
const base="http://localhost:4000";
for(let attempt=0;attempt<60;attempt++){
 try{const r=await fetch(base+"/health");if(r.ok)break;}catch{}
 await new Promise(resolve=>setTimeout(resolve,500));
 if(attempt===59)throw new Error("Postgres API unavailable after startup");
}
async function get(url){
 const r=await fetch(base+url);
 assert.equal(r.status,200,base+url+" -> "+r.status);
 return r.json();
}
const health=await get("/health");
assert.equal(health.provider,"postgres");
const stages=await get("/v1/stages");assert.equal(stages.data.length,12);
const articles=await get("/v1/articles?limit=50");assert.equal(articles.meta.total,72);
const sources=await get("/v1/sources");assert.equal(sources.data.length,45);
const topics=await get("/v1/topics");assert.equal(topics.data.length,13);
const cards=await get("/v1/research-cards");assert.equal(cards.data.length,12);
const single=await get("/v1/articles/lam-quen-nhip-sinh-hoat-so-sinh");
assert(["draft","in_review"].includes(single.data.status));
const noAuth=await fetch(base+"/v1/admin/articles");
assert([401,503,404].includes(noAuth.status));
console.log("PASS real PostgreSQL API HTTP: stages=12 articles=72 sources=45 topics=13 cards=12; anonymous CMS denied");
