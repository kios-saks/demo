import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
const source=readFileSync(new URL("../apps/web/public/reader-local.js",import.meta.url),"utf8");
function makeHarness(source, initial={}, failRemove=[], failSet=[], execute){
 const prefix="mebe.reader.v1.",store=new Map(Object.entries(initial).map(([k,v])=>[prefix+k,JSON.stringify(v)]));
 const removeFails=new Set(failRemove.map(k=>prefix+k)),setFails=new Set(failSet.map(k=>prefix+k));
 const element=()=>({hidden:false,checked:false,disabled:false,textContent:"",events:{},addEventListener(name,fn){this.events[name]=fn;}});
 const status=element(),history=element(),clearHistory=element(),clearAll=element();
 const nodes={"[data-local-status]":[status],"[data-history-opt-in]":[history],"[data-clear-history]":[clearHistory],"[data-clear-reader]":[clearAll]};
 const context={document:{querySelectorAll(s){return nodes[s]||[];},querySelector(){return null;}},localStorage:{getItem:k=>store.get(k)??null,setItem(k,v){if(setFails.has(k))throw Error("storage denied");store.set(k,v);},removeItem(k){if(removeFails.has(k))throw Error("storage denied");store.delete(k);}},location:{pathname:"/hanh-trinh"},window:{addEventListener(){}},navigator:{}};
 execute(source,context);
 return {status,history,clearHistory,clearAll,read:k=>store.has(prefix+k)?JSON.parse(store.get(prefix+k)):undefined,clearFailure:k=>removeFails.delete(prefix+k)};
}
function cases(source,execute,check){
 let h=makeHarness(source,{saved:["abc"],history:["abc"],historyEnabled:true},["saved"],[],execute);
 h.clearAll.events.click();check(h.read("saved")?.[0]==="abc"&&h.read("history")===undefined&&h.read("historyEnabled")===undefined&&h.status.textContent.includes("Không thể xóa hết"),"partial clear reports failure and still attempts every key");
 h=makeHarness(source,{history:["abc"],historyEnabled:true},["history"],[],execute);
 h.clearHistory.events.click();check(h.read("history")?.[0]==="abc"&&h.status.textContent.includes("Không thể xóa lịch sử"),"history deletion failure is visible");
 h=makeHarness(source,{history:["abc"],historyEnabled:true},[],["historyEnabled"],execute);
 h.history.checked=false;h.history.events.change();check(h.history.checked===true&&h.read("historyEnabled")===true&&h.status.textContent.includes("Không thể thay đổi"),"failed opt-out is not represented as disabled");
 h=makeHarness(source,{history:["abc"],historyEnabled:true},["history"],[],execute);
 h.history.checked=false;h.history.events.change();check(h.read("historyEnabled")===false&&h.status.textContent.includes("chưa xóa được"),"opt-out reports retained history");
 h.history.checked=true;h.history.events.change();check(h.history.checked===false&&h.status.textContent.includes("chưa bật"),"cannot re-enable while retained history cannot be erased");
 h.clearFailure("history");h.history.checked=true;h.history.events.change();check(h.history.checked===true&&h.read("history")===undefined,"re-enable only after retained history erased");
 h=makeHarness(source,{history:["abc"],saved:["abc"],historyEnabled:true},[],[],execute);
 h.clearAll.events.click();check(h.read("saved")===undefined&&h.read("history")===undefined&&h.read("historyEnabled")===undefined&&h.status.textContent.startsWith("Đã xóa"),"normal clear remains successful");
}
cases(source,(src,context)=>runInNewContext(src,context,{timeout:1000}),(ok,name)=>{assert.ok(ok,name);console.log("PASS reader privacy:",name);});
