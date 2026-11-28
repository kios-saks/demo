/* UX08: local interests, checklist and explicit reading-history consent.
   No telemetry, timers, profile, URL parameters or network calls. */
(function(){
"use strict";
const prefix="mebe.reader.v1.",key=k=>prefix+k;
const slug=/^[a-z0-9-]{1,160}$/,identity=/^(legacy|article|lesson):[a-z0-9-]{1,160}$/;
const get=(s,k,f)=>{const raw=s.getItem(key(k));return raw===null?f:JSON.parse(raw);};
const put=(s,k,v)=>s.setItem(key(k),JSON.stringify(v));
const remove=(s,k)=>s.removeItem(key(k));
const strings=(v,pattern)=>{if(!Array.isArray(v)||v.some(x=>typeof x!=="string"||!pattern.test(x)))throw Error("Invalid local array");return [...new Set(v)];};
const own=(obj,k)=>Object.prototype.hasOwnProperty.call(obj,k)?obj[k]:undefined;
function interests(s,c){
 const stored=get(s,"interestsV3",null);
 if(stored!==null){const ids=strings(stored,slug);if(ids.some(x=>!c.stages.includes(x)))throw Error("Unknown stage");return c.stages.filter(x=>ids.includes(x));}
 const stage=get(s,"stage",""),group=get(s,"homeGroup","");
 if(typeof stage!=="string"||typeof group!=="string")throw Error("Invalid legacy selection");
 const mapped=[...(own(c.legacyMap,stage)||[]),...(own(c.groupMap,group)||[])];
 return c.stages.filter(x=>mapped.includes(x));
}
function saveInterests(s,c,ids){
 const chosen=strings(ids,slug);if(chosen.some(x=>!c.stages.includes(x)))throw Error("Unknown stage");
 const next=c.stages.filter(x=>chosen.includes(x));put(s,"interestsV3",next);return next;
}
function recommend(rows,stage,topic=""){
 const eligible=rows.filter(x=>x.stage===stage&&(!topic||x.topic===topic)),out=[],topics=new Set();
 for(const row of eligible){if(out.length===3)break;if(!topics.has(row.topic)){topics.add(row.topic);out.push(row.key);}}
 for(const row of eligible){if(out.length===3)break;if(!out.includes(row.key))out.push(row.key);}
 return out;
}
function checklist(s){
 const value=get(s,"checklist",{});if(!value||typeof value!=="object"||Array.isArray(value)||Object.entries(value).some(([k,v])=>!slug.test(k)||typeof v!=="boolean"))throw Error("Invalid checklist");return value;
}
function changeCheck(s,c,id,checked){
 if(!c.checkKeys.includes(id)||typeof checked!=="boolean")throw Error("Unknown checklist key");
 const data=checklist(s);if(checked)data[id]=true;else delete data[id];put(s,"checklist",data);
}
function resetCheck(s,c,guide){
 const ids=c.checkKeys.filter(x=>x.startsWith(guide+"-"));if(!ids.length)throw Error("Unknown guide");
 const data=checklist(s);for(const id of ids)delete data[id];put(s,"checklist",data);
}
function consent(s){
 const enabled=get(s,"historyEnabled",false),all=get(s,"historyAll",false);
 if(typeof enabled!=="boolean"||typeof all!=="boolean")throw Error("Invalid history consent");
 return {enabled,full:enabled&&all};
}
function historyRead(s,known){
 const c=consent(s);if(!c.enabled)return {...c,keys:[]};
 const legacy=strings(get(s,"history",[]),slug).map(x=>"legacy:"+x);
 const keys=c.full?strings(get(s,"historyV3",legacy),identity):legacy;
 return {...c,keys:keys.filter(x=>known.has(x))};
}
function clearHistory(s){
 let ok=true;for(const k of ["history","historyV3"])try{remove(s,k);}catch{ok=false;}if(!ok)throw Error("History removal incomplete");
}
function setConsent(s,known,wanted){
 if(!wanted){
  put(s,"historyEnabled",false);let ok=true;try{clearHistory(s);}catch{ok=false;}try{remove(s,"historyAll");}catch{ok=false;}if(!ok)throw Error("History disabled; deletion incomplete");return;
 }
 const old=consent(s);if(old.full)return;
 // Existing opt-in covers legacy only; preserve valid legacy history on explicit expanded consent.
 const existing=old.enabled?historyRead(s,known).keys:[];
 if(!old.enabled)clearHistory(s);
 put(s,"historyV3",existing);put(s,"historyAll",true);put(s,"historyEnabled",true);
}
function record(s,known,id){
 if(!known.has(id))return;
 const c=consent(s);if(!c.enabled||(!c.full&&!id.startsWith("legacy:")))return;
 if(c.full){const previous=historyRead(s,known).keys;put(s,"historyV3",[id,...previous.filter(x=>x!==id)].slice(0,219));}
 else {const previous=strings(get(s,"history",[]),slug),short=id.slice(7);put(s,"history",[short,...previous.filter(x=>x!==short)].slice(0,40));}
}
const api={interests,saveInterests,recommend,checklist,changeCheck,resetCheck,consent,historyRead,clearHistory,setConsent,record};
if(typeof module==="object"&&module.exports){module.exports=api;return;}
if(typeof document==="undefined"||document.body?.dataset?.journeyV3!=="1")return;
const all=s=>Array.from(document.querySelectorAll(s));
let catalog,known;
try{catalog=JSON.parse(document.body.dataset.journeyCatalog);known=new Set(JSON.parse(document.body.dataset.bookmarkCatalog));if(catalog.stages.length!==12||catalog.topics.length!==16||catalog.checkKeys.length!==48||known.size!==219)throw Error("Invalid catalog");}catch{return;}
const say=(selector,message)=>all(selector).forEach(x=>x.textContent=message);
const current=()=>document.querySelector("[data-detail-v2='1']")?.dataset;
const route=id=>{const [kind,slug]=id.split(":");return kind==="legacy"?"/bai-viet/"+slug:"/kien-thuc/"+kind+"/"+slug+"/doc";};
function updateRecommendations(){
 const topic=document.querySelector("[data-journey-topic]")?.value||"";
 for(const plan of all("[data-interest-plan]")){
  const stage=plan.dataset.interestPlan,items=Array.from(plan.querySelectorAll("[data-journey-recommend]"));
  const selected=new Set(recommend(items.map(x=>({key:x.dataset.journeyRecommend,stage,topic:x.dataset.recommendTopic})),stage,topic));
  items.forEach(x=>x.hidden=!selected.has(x.dataset.journeyRecommend));const empty=plan.querySelector("[data-recommend-empty]");if(empty)empty.hidden=selected.size!==0;
 }
}
function refreshInterests(){
 let ids;try{ids=interests(window.localStorage,catalog);}catch{
  all("[data-interest-stage],[data-interest-save],[data-interest-clear],[data-journey-topic]").forEach(x=>x.disabled=true);
  all("[data-interest-plan],[data-interest-empty],[data-journey-summary]").forEach(x=>x.hidden=true);
  say("[data-interest-count]","Không thể đọc lựa chọn");say("[data-journey-status]","Dữ liệu lựa chọn bị lỗi hoặc bộ nhớ bị chặn. Chưa thay đổi dữ liệu.");return;
 }
 all("[data-interest-stage]").forEach(x=>{x.disabled=false;x.checked=ids.includes(x.dataset.interestStage);});
 all("[data-interest-save],[data-interest-clear],[data-journey-topic]").forEach(x=>x.disabled=false);
 all("[data-interest-plan]").forEach(x=>x.hidden=!ids.includes(x.dataset.interestPlan));
 all("[data-interest-empty]").forEach(x=>x.hidden=ids.length>0);
 all("[data-journey-summary]").forEach(x=>{x.hidden=ids.length===0;x.textContent=ids.length+" chặng quan tâm đã chọn hoặc kế thừa. Xem trong Hành trình.";});
 say("[data-interest-count]",ids.length+"/12 chặng đã chọn");updateRecommendations();
}
function refreshChecks(){
 let data;try{data=checklist(window.localStorage);}catch{
  all("[data-checklist-key]").forEach(x=>x.disabled=true);all("[data-checklist-reset]").forEach(x=>{x.hidden=false;x.disabled=true;});
  say("[data-guide-progress]","Không thể đọc tiến độ");say("[data-journey-status],[data-local-status]","Không thể đọc checklist. Dữ liệu cũ được giữ nguyên.");return;
 }
 all("[data-checklist-key]").forEach(x=>{x.disabled=!catalog.checkKeys.includes(x.dataset.checklistKey);x.checked=data[x.dataset.checklistKey]===true;});
 all("[data-checklist-reset]").forEach(x=>{x.hidden=false;x.disabled=false;});
 all("[data-guide-slug]").forEach(x=>{const boxes=Array.from(x.querySelectorAll("[data-checklist-key]")),p=x.querySelector("[data-guide-progress]");if(p)p.textContent=boxes.filter(b=>b.checked).length+"/"+boxes.length+" việc đã đánh dấu";});
}
function historyError(message){
 let targets=all("[data-history-status]");
 if(!targets.length){const root=document.querySelector("[data-detail-v2]");if(root){const p=document.createElement("p");p.setAttribute("data-history-status","");p.setAttribute("role","status");root.prepend(p);targets=[p];}}
 targets.forEach(x=>x.textContent=message);
}
function refreshHistory(){
 let state;try{state=historyRead(window.localStorage,known);}catch{
  all("[data-history-opt-in]").forEach(x=>{x.disabled=true;x.checked=false;});all("[data-history-key],[data-history-empty],[data-home-recent],[data-recent-link]").forEach(x=>x.hidden=true);
  all("[data-clear-history],[data-history-disable]").forEach(x=>x.hidden=false);
  historyError("Không thể đọc lịch sử. Chưa thay đổi dữ liệu. Bạn có thể xóa dữ liệu trên thiết bị.");return;
 }
 all("[data-history-opt-in]").forEach(x=>{x.disabled=false;x.checked=state.full;});
 all("[data-history-consent-note]").forEach(x=>x.textContent=state.full?"Đã bật lịch sử cho cả ba loại nội dung.":state.enabled?"Lựa chọn cũ chỉ lưu lịch sử bài viết. Bật tùy chọn trên để mở rộng; hoặc chọn Tắt lưu lịch sử.":"Mặc định không lưu lịch sử đọc.");
 all("[data-history-disable]").forEach(x=>x.hidden=!state.enabled);
 all("[data-clear-history]").forEach(x=>x.hidden=false);
 const keys=new Set(state.keys);
 for(const list of all("[data-history-list]")){
  const ul=list.querySelector("ul"),rows=Array.from(list.querySelectorAll("[data-history-key]")),map=new Map(rows.map(x=>[x.dataset.historyKey,x]));
  rows.forEach(x=>x.hidden=!keys.has(x.dataset.historyKey));for(const id of state.keys){const row=map.get(id);if(row&&ul)ul.appendChild(row);}
  const empty=list.querySelector("[data-history-empty]");if(empty)empty.hidden=rows.some(x=>!x.hidden);
 }
 const home=document.querySelector("[data-home-v2]"),recent=home?.querySelector("[data-home-recent]"),link=recent?.querySelector("a");
 if(home&&recent&&link){let titles={};try{titles=JSON.parse(home.dataset.historyTitles||"{}");}catch{}const id=state.keys.find(x=>own(titles,x));recent.hidden=!id;if(id){link.href=route(id);link.textContent=titles[id];}}
 all("[data-recent-link]").forEach(x=>{x.hidden=!state.keys.length;if(state.keys.length)x.href=route(state.keys[0]);});
}
function refresh(){refreshInterests();refreshChecks();refreshHistory();}
document.addEventListener("click",event=>{
 const target=event.target instanceof Element?event.target:null;if(!target)return;
 const btn=target.closest("[data-interest-save],[data-interest-clear],[data-checklist-reset],[data-clear-history],[data-history-disable]");if(!btn||btn.disabled)return;
 if(btn.matches("[data-interest-save],[data-interest-clear]")){
  try{const ids=btn.matches("[data-interest-clear]")?[]:all("[data-interest-stage]:checked").map(x=>x.dataset.interestStage);saveInterests(window.localStorage,catalog,ids);refreshInterests();say("[data-journey-status]",ids.length?"Đã lưu lựa chọn trên thiết bị.":"Đã xóa lựa chọn nhiều chặng; tiến độ checklist vẫn được giữ.");}
  catch{refreshInterests();say("[data-journey-status]","Không thể lưu lựa chọn. Dữ liệu cũ chưa được thay đổi.");}
 }else if(btn.matches("[data-checklist-reset]")){
  if(!window.confirm("Đặt lại tiến độ checklist này?"))return;
  try{resetCheck(window.localStorage,catalog,btn.dataset.checklistReset);refreshChecks();say("[data-journey-status]","Đã đặt lại checklist.");}catch{refreshChecks();say("[data-journey-status]","Không thể đặt lại checklist.");}
 }else if(btn.matches("[data-clear-history]")){
  if(!window.confirm("Xóa lịch sử đọc trên thiết bị này?"))return;
  try{clearHistory(window.localStorage);refreshHistory();historyError("Đã xóa lịch sử đọc.");}catch{refreshHistory();historyError("Không thể xóa hết lịch sử đọc. Hãy thử lại hoặc xóa dữ liệu trang web.");}
 }else{try{setConsent(window.localStorage,known,false);refreshHistory();historyError("Đã tắt và xóa lịch sử đọc.");}catch{refreshHistory();historyError("Không thể hoàn tất việc tắt hoặc xóa lịch sử. Kiểm tra trạng thái và thử lại.");}}
});
document.addEventListener("change",event=>{
 const el=event.target;if(!(el instanceof Element))return;
 if(el.matches("[data-journey-topic]"))updateRecommendations();
 else if(el.matches("[data-checklist-key]")){try{changeCheck(window.localStorage,catalog,el.dataset.checklistKey,el.checked);refreshChecks();}catch{refreshChecks();say("[data-journey-status],[data-local-status]","Không thể lưu checklist.");}}
 else if(el.matches("[data-history-opt-in]")){
  try{setConsent(window.localStorage,known,el.checked);refreshHistory();historyError(el.checked?"Đã bật lưu lịch sử trên thiết bị.":"Đã tắt và xóa lịch sử đọc.");}
  catch{refreshHistory();historyError("Không thể hoàn tất thay đổi lịch sử. Kiểm tra trạng thái và thử lại.");}
 }
});
window.addEventListener("storage",event=>{if(event.key===null||event.key.startsWith(prefix))refresh();});
window.addEventListener("pageshow",refresh);
window.MebeJourney={refresh};
const reading=current();if(reading)try{record(window.localStorage,known,reading.detailKind+":"+reading.detailId);}catch{historyError("Không thể lưu lịch sử đọc trên thiết bị.");}
refresh();
})();