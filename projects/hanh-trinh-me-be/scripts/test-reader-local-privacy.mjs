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


// Sprint 03: selected-stage plan, local checklist progress, cross-tab/reset and invalid state.
{
 const prefix="mebe.reader.v1.",store=new Map([[prefix+"stage",JSON.stringify("so-sinh")],[prefix+"checklist",JSON.stringify({"so-sinh-0":true,"tap-di-0":true})]]);
 const el=(dataset={})=>({dataset,hidden:true,disabled:true,checked:false,textContent:"",events:{},addEventListener(k,fn){this.events[k]=fn;}});
 const options=[{value:"",textContent:"Chọn giai đoạn"},{value:"so-sinh",textContent:"Sơ sinh"},{value:"tap-di",textContent:"Tập đi"}];
 const select={...el(),options,value:"",get selectedOptions(){return [options.find(o=>o.value===this.value)||options[0]];}};
 const checks=[el({checklistKey:"so-sinh-0"}),el({checklistKey:"so-sinh-1"}),el({checklistKey:"tap-di-0"})];
 const progress=[el(),el()],empty=el(),status=el(),reset=el({checklistReset:"so-sinh"}),clear=el();
 const plans=["so-sinh","tap-di"].map((slug,i)=>({...el({journeyPlan:slug}),querySelectorAll(s){return s==="[data-checklist-key]"?checks.filter(x=>x.dataset.checklistKey.startsWith(slug+"-")):[]},querySelector(s){return s==="[data-journey-progress]"?progress[i]:null}}));
 const nodes={"[data-journey-select]":[select],"[data-journey-plan]":plans,"[data-journey-plan-empty]":[empty],"[data-checklist-key]":checks,"[data-checklist-reset]":[reset],"[data-clear-reader]":[clear],"[data-local-status]":[status]};
 const events={};
 runInNewContext(source,{document:{querySelectorAll:s=>nodes[s]||[],querySelector:s=>nodes[s]?.[0]||null},localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},location:{pathname:"/hanh-trinh"},window:{addEventListener:(k,fn)=>events[k]=fn},navigator:{}},{timeout:1000});
 assert.equal(plans[0].hidden,false);assert.equal(plans[1].hidden,true);assert.equal(empty.hidden,true);assert.equal(progress[0].textContent,"1/2 việc đã đánh dấu");
 checks[1].checked=true;checks[1].events.change();assert.equal(progress[0].textContent,"2/2 việc đã đánh dấu");
 reset.events.click();assert.equal(progress[0].textContent,"0/2 việc đã đánh dấu");assert.equal(progress[1].textContent,"1/1 việc đã đánh dấu");
 store.set(prefix+"stage",JSON.stringify("tap-di"));events.storage({key:prefix+"stage"});assert.equal(plans[0].hidden,true);assert.equal(plans[1].hidden,false);
 store.set(prefix+"stage",JSON.stringify("unknown"));events.storage({key:prefix+"stage"});assert.ok(plans.every(p=>p.hidden));assert.equal(empty.hidden,false);
 clear.events.click();assert.ok(!store.has(prefix+"stage")&&!store.has(prefix+"checklist"));assert.equal(progress[1].textContent,"0/1 việc đã đánh dấu");
 console.log("PASS personal journey: selection, progress, reset, cross-tab, invalid stage, clear");
}
