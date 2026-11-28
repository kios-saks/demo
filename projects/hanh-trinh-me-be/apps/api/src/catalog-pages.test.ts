import test from "node:test";
import assert from "node:assert/strict";
import {readCatalogPages} from "../../../apps/web/lib/catalog-pages.js";
import type {ArticleSummary} from "../../../packages/data/src/contracts.js";
const items=Array.from({length:72},(_,i)=>({slug:"article-"+i,title:"Title "+i,status:"draft"} as ArticleSummary));
const page=(n:number,rows=items)=>({data:rows.slice((n-1)*50,n*50),meta:{total:rows.length,page:n,limit:50}});

test("catalog fast path overlaps first two requests and preserves all ordered article identities",async()=>{
 const calls:number[]=[];let release!:()=>void;
 const barrier=new Promise<void>(r=>{release=r;});
 const task=readCatalogPages(async n=>{calls.push(n);await barrier;return page(n);});
 assert.deepEqual(calls,[1,2]);release();
 assert.deepEqual(await task,items);
});
test("catalog fast path handles bounded totals, empty pages and remaining pagination",async()=>{
 for(const total of [0,1,50,51,100,101,500]){
  const rows=Array.from({length:total},(_,i)=>({slug:"item-"+i} as ArticleSummary));
  const calls:number[]=[];
  assert.deepEqual(await readCatalogPages(async n=>{calls.push(n);return page(n,rows);}),rows);
  assert.deepEqual(calls,Array.from({length:Math.max(2,Math.ceil(total/50))},(_,i)=>i+1));
 }
});
test("catalog fast path fails closed on incomplete, duplicate, inconsistent and oversized responses",async()=>{
 await assert.rejects(readCatalogPages(async n=>n===2?{...page(n),data:page(n).data.slice(1)}:page(n)),/Inconsistent/);
 await assert.rejects(readCatalogPages(async n=>n===2?{...page(n),data:[items[0],...page(n).data.slice(1)]}:page(n)),/Inconsistent/);
 await assert.rejects(readCatalogPages(async n=>n===2?{...page(n),meta:{...page(n).meta,total:73}}:page(n)),/Inconsistent/);
 await assert.rejects(readCatalogPages(async n=>({...page(n),meta:{...page(n).meta,total:501}})),/Invalid/);
 await assert.rejects(readCatalogPages(async n=>{if(n===2)throw Error("upstream failed");return page(n);}),/upstream failed/);
});
