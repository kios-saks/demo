/* Local reader preferences: no telemetry, no network calls, no health profile. */
(()=>{
"use strict";
const prefix="mebe.reader.v1.";
const all=(s)=>Array.from(document.querySelectorAll(s));
const get=(key,fallback)=>{try{const value=localStorage.getItem(prefix+key);return value===null?fallback:JSON.parse(value)}catch{return fallback}};
const set=(key,value)=>{try{localStorage.setItem(prefix+key,JSON.stringify(value));return true}catch{return false}};
const remove=(key)=>{try{localStorage.removeItem(prefix+key);return true}catch{return false}};
const validSlug=(s)=>typeof s==="string"&&/^[a-z0-9-]{1,160}$/.test(s);
const slugs=(key)=>{const value=get(key,[]);return Array.isArray(value)?[...new Set(value.filter(validSlug))].slice(0,200):[]};
const announce=(text)=>all("[data-local-status]").forEach(el=>{el.textContent=text});
const current=document.querySelector("[data-current-article]")?.dataset.currentArticle;
const updateNav=()=>{
 const path=location.pathname;
 const destination=path==="/"?"/":path==="/da-luu"?"/da-luu":path==="/hanh-trinh"?"/hanh-trinh":"/thu-vien";
 all(".reader-nav-links a,.mobile-reader-nav a").forEach(a=>{if(a.getAttribute("href")===destination)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
};
function refreshSaved(){
 const list=slugs("saved");
 all("[data-save-slug]").forEach(btn=>{const saved=list.includes(btn.dataset.saveSlug);btn.hidden=false;btn.setAttribute("aria-pressed",String(saved));btn.textContent=saved?"Đã lưu ✓":"Lưu bài";btn.setAttribute("aria-label",saved?"Bỏ lưu bài viết":"Lưu bài viết")});
 all("[data-saved-item]").forEach(el=>{el.hidden=!list.includes(el.dataset.savedItem)});
 all("[data-saved-empty]").forEach(el=>{el.hidden=all("[data-saved-item]").some(item=>!item.hidden)});
}
function refreshJourney(){
 const stage=get("stage","");
 all("[data-journey-select]").forEach(el=>{el.value=Array.from(el.options).some(o=>o.value===stage)?stage:""});
 const select=document.querySelector("[data-journey-select]");
 const chosen=select&&select.selectedOptions[0];
 const plans=all("[data-journey-plan]");
 plans.forEach(el=>{el.hidden=!(chosen&&validSlug(chosen.value)&&el.dataset.journeyPlan===chosen.value)});
 all("[data-journey-plan-empty]").forEach(el=>{el.hidden=plans.some(plan=>!plan.hidden)});

 all("[data-journey-description]").forEach(el=>{el.textContent=chosen&&chosen.value?"Bạn đang quan tâm: "+chosen.textContent+".":"Chọn chặng bạn quan tâm để tìm kiến thức phù hợp hơn."});
 all("[data-journey-link]").forEach(el=>{el.href=chosen&&validSlug(chosen.value)?"/"+chosen.value:"/hanh-trinh";el.textContent=chosen&&chosen.value?"Khám phá chặng này →":"Xem hành trình →"});
}
function refreshChecks(){
 const data=get("checklist",{});
 all("[data-checklist-key]").forEach(el=>{el.disabled=false;el.checked=Boolean(data&&data[el.dataset.checklistKey]===true)});
 all("[data-journey-plan]").forEach(plan=>{
  const boxes=Array.from(plan.querySelectorAll("[data-checklist-key]"));
  const progress=plan.querySelector("[data-journey-progress]");
  if(progress)progress.textContent=boxes.filter(box=>box.checked).length+"/"+boxes.length+" việc đã đánh dấu";
 });

}
function refreshHistory(){
 const enabled=get("historyEnabled",false)===true;
 all("[data-history-opt-in]").forEach(el=>{el.checked=enabled;el.disabled=false});
 const history=enabled?slugs("history"):[];
 all("[data-history-list]").forEach(container=>{
  const ul=container.querySelector("ul");
  const items=Array.from(container.querySelectorAll("[data-history-item]"));
  items.forEach(el=>{el.hidden=!history.includes(el.dataset.historyItem)});
  history.forEach(slug=>{const el=items.find(x=>x.dataset.historyItem===slug);if(el&&ul)ul.appendChild(el)});
  const empty=container.querySelector("[data-history-empty]");if(empty)empty.hidden=items.some(el=>!el.hidden);
 });
 all("[data-recent-link]").forEach(el=>{el.hidden=!history.length;if(history.length)el.href="/bai-viet/"+history[0]});
}
all("[data-save-slug]").forEach(btn=>btn.addEventListener("click",()=>{
 const slug=btn.dataset.saveSlug;if(!validSlug(slug))return;
 const saved=slugs("saved");const next=saved.includes(slug)?saved.filter(s=>s!==slug):[slug,...saved];
 if(!set("saved",next)){announce("Trình duyệt không cho phép lưu dữ liệu.");return}refreshSaved();
}));
all("[data-journey-save]").forEach(btn=>{btn.hidden=false;btn.addEventListener("click",()=>{
 const section=btn.closest(".journey-picker");const select=section?.querySelector("select");if(!select)return;
 const stage=select.value;const ok=stage?set("stage",stage):remove("stage");
 refreshJourney();const status=section.querySelector("[data-journey-status]");if(status)status.textContent=ok?(stage?"Đã lưu lựa chọn.":"Đã xóa lựa chọn."):"Không thể lưu trên trình duyệt này.";
})});
all("[data-checklist-key]").forEach(el=>el.addEventListener("change",()=>{
 const stored=get("checklist",{});const data=stored&&typeof stored==="object"&&!Array.isArray(stored)?stored:{};
 if(el.checked)data[el.dataset.checklistKey]=true;else delete data[el.dataset.checklistKey];
 if(!set("checklist",data)){refreshChecks();announce("Không thể lưu checklist trên trình duyệt này.");}
}));
all("[data-checklist-reset]").forEach(btn=>{btn.hidden=false;btn.addEventListener("click",()=>{
 const stored=get("checklist",{});const data=stored&&typeof stored==="object"&&!Array.isArray(stored)?stored:{};
 Object.keys(data).filter(key=>key.startsWith(btn.dataset.checklistReset+"-")).forEach(key=>delete data[key]);const ok=set("checklist",data);refreshChecks();if(!ok)announce("Không thể đặt lại checklist trên trình duyệt này.");
})});
all("[data-history-opt-in]").forEach(el=>el.addEventListener("change",()=>{
 const wasEnabled=get("historyEnabled",false)===true;
 if(el.checked&&!wasEnabled&&!remove("history")){refreshHistory();announce("Không thể xóa lịch sử cũ; chưa bật lưu lịch sử đọc.");return;}
 const saved=set("historyEnabled",el.checked);
 if(!saved){refreshHistory();announce("Không thể thay đổi tùy chọn lịch sử đọc trên trình duyệt này.");return;}
 const cleared=el.checked||remove("history");refreshHistory();
 if(!cleared)announce("Đã tắt lưu lịch sử đọc nhưng chưa xóa được dữ liệu cũ. Hãy thử xóa lại hoặc xóa dữ liệu trang web trong trình duyệt.");
}));
all("[data-clear-history]").forEach(btn=>{btn.hidden=false;btn.addEventListener("click",()=>{const ok=remove("history");refreshHistory();announce(ok?"Đã xóa lịch sử đọc.":"Không thể xóa lịch sử đọc. Hãy thử lại hoặc xóa dữ liệu trang web trong trình duyệt.")})});
all("[data-clear-reader]").forEach(btn=>{btn.hidden=false;btn.addEventListener("click",()=>{
 const results=["historyEnabled","saved","stage","checklist","history"].map(remove);
 refreshSaved();refreshJourney();refreshChecks();refreshHistory();announce(results.every(Boolean)?"Đã xóa dữ liệu cá nhân hóa trên thiết bị này.":"Không thể xóa hết dữ liệu cá nhân hóa. Hãy thử lại hoặc xóa dữ liệu trang web trong trình duyệt.");
})});
all("[data-share-article]").forEach(btn=>{btn.hidden=false;btn.addEventListener("click",async()=>{
 if(!validSlug(current))return;
 const url=location.origin+"/bai-viet/"+current;
 const status=document.querySelector("[data-share-status]");
 try{if(navigator.share){await navigator.share({title:document.title,url});if(status)status.textContent="Đã mở chia sẻ."}
 else if(navigator.clipboard){await navigator.clipboard.writeText(url);if(status)status.textContent="Đã sao chép liên kết."}
 else if(status)status.textContent=url;}catch(error){if(error?.name!=="AbortError"&&status)status.textContent=url;}
})});
if(validSlug(current)&&get("historyEnabled",false)===true)set("history",[current,...slugs("history").filter(s=>s!==current)].slice(0,40));
updateNav();refreshSaved();refreshJourney();refreshChecks();refreshHistory();
window.addEventListener("storage",event=>{if(event.key===null||event.key.startsWith(prefix)){refreshSaved();refreshJourney();refreshChecks();refreshHistory()}});
})();
