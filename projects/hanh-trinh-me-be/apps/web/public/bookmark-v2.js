/* Local bookmark V2. The legacy slug bucket remains authoritative for rollback.
   Canonical view = legacy:<slug> plus article/lesson IDs in a separate bucket.
   No migration writes, no network, no profile, no silent overwrites of corrupt data. */
(function(){
"use strict";
const prefix="mebe.reader.v1.",oldKey=prefix+"saved",newKey=prefix+"savedV2";
const slug=/^[a-z0-9-]{1,160}$/,canonical=/^(legacy|article|lesson):[a-z0-9-]{1,160}$/,extra=/^(article|lesson):[a-z0-9-]{1,160}$/;
function parse(storage,key,pattern){
 const raw=storage.getItem(key);if(raw===null)return [];
 const value=JSON.parse(raw);if(!Array.isArray(value)||value.some(x=>typeof x!=="string"||!pattern.test(x)))throw Error("Invalid bookmark storage");
 return [...new Set(value)];
}
function read(storage,known){
 const old=parse(storage,oldKey,slug),added=parse(storage,newKey,extra);
 const all=[...old.map(x=>"legacy:"+x),...added];
 return {keys:all.filter(x=>known.has(x)),unavailable:all.filter(x=>!known.has(x)).length};
}
function change(storage,known,key,wanted){
 if(!canonical.test(key)||!known.has(key)||typeof wanted!=="boolean")throw Error("Unknown bookmark");
 const before=read(storage,known),present=before.keys.includes(key);
 if(present===wanted)return before;
 const legacy=key.startsWith("legacy:"),bucket=legacy?oldKey:newKey,item=legacy?key.slice(7):key;
 const items=parse(storage,bucket,legacy?slug:extra);
 const next=wanted?[item,...items]:items.filter(x=>x!==item);
 storage.setItem(bucket,JSON.stringify(next));
 const after=read(storage,known);if(after.keys.includes(key)!==wanted)throw Error("Bookmark not persisted");return after;
}
const api={oldKey,newKey,read,change};
if(typeof module==="object"&&module.exports){module.exports=api;return;}
if(typeof document==="undefined"||document.body?.dataset?.bookmarkV2!=="1")return;
let known;try{const items=JSON.parse(document.body.dataset.bookmarkCatalog);if(!Array.isArray(items)||items.length!==219||new Set(items).size!==219||items.some(x=>typeof x!=="string"||!canonical.test(x)))throw Error("Catalog");known=new Set(items);}catch{return;}
const all=s=>Array.from(document.querySelectorAll(s));
const selector="[data-save-slug],[data-bookmark-key]";
const keyFor=btn=>btn.dataset.bookmarkKey||(btn.dataset.saveSlug?"legacy:"+btn.dataset.saveSlug:"");
const say=message=>all("[data-bookmark-status]").forEach(x=>{x.textContent=message;});
function feedback(btn,message){
 let el=btn.nextElementSibling;
 if(!el?.hasAttribute("data-bookmark-feedback")){el=document.createElement("span");el.setAttribute("data-bookmark-feedback","");el.setAttribute("role","status");btn.insertAdjacentElement("afterend",el);}
 el.textContent=message;
}
function refresh(){
 let state;try{state=read(window.localStorage,known);}catch{
  all(selector).forEach(btn=>{btn.hidden=false;btn.disabled=true;btn.setAttribute("aria-pressed","false");btn.textContent="Không thể đọc dữ liệu lưu";});
  all("[data-bookmark-item]").forEach(el=>{el.hidden=true;});all("[data-saved-empty]").forEach(el=>{el.hidden=true;});
  all("[data-bookmark-count]").forEach(el=>{el.textContent="Không thể đọc kho đã lưu";});
  all("[data-bookmark-filter]").forEach(el=>{el.disabled=true;});
  say("Dữ liệu lưu bị lỗi hoặc trình duyệt chặn bộ nhớ. Chưa thay đổi dữ liệu. Thử lại hoặc xóa dữ liệu trang web nếu bạn muốn.");return null;
 }
 const keys=new Set(state.keys);
 all(selector).forEach(btn=>{const key=keyFor(btn);if(!known.has(key)){btn.hidden=true;return;}const saved=keys.has(key);btn.hidden=false;btn.disabled=false;btn.setAttribute("aria-pressed",String(saved));btn.textContent=saved?"Đã lưu ✓":"Lưu nội dung";btn.setAttribute("aria-label",saved?"Bỏ lưu nội dung":"Lưu nội dung");});
 const filter=document.querySelector("[data-bookmark-filter]");if(filter)filter.disabled=false;
 let visible=0;
 all("[data-bookmark-item]").forEach(el=>{const key=el.dataset.bookmarkItem;el.hidden=!keys.has(key)||!!(filter&&filter.value!=="all"&&!key.startsWith(filter.value+":"));if(!el.hidden)visible++;});
 all("[data-saved-empty]").forEach(el=>{el.hidden=visible>0;});
 all("[data-bookmark-count]").forEach(el=>{el.textContent=visible+" / "+keys.size+" nội dung đã lưu";});
 if(state.unavailable)say(state.unavailable+" mục cũ không còn trong danh mục; dữ liệu gốc vẫn được giữ trên thiết bị.");
 return state;
}
document.addEventListener("click",event=>{
 const btn=event.target instanceof Element?event.target.closest(selector):null;if(!btn||btn.disabled||!known.has(keyFor(btn)))return;
 const key=keyFor(btn);try{
  const before=read(window.localStorage,known),wanted=!before.keys.includes(key);change(window.localStorage,known,key,wanted);refresh();
  const hidden=btn.closest("[data-bookmark-item]")?.hidden;
  if(hidden){document.getElementById("bookmark-heading")?.focus();say("Đã bỏ lưu nội dung.");}
  else feedback(btn,wanted?"Đã lưu trên thiết bị này.":"Đã bỏ lưu.");
 }catch{refresh();feedback(btn,"Không thể thay đổi dữ liệu lưu. Dữ liệu hiện có được giữ nguyên nếu ghi thất bại.");say("Không thể thay đổi dữ liệu lưu. Hãy thử lại.");}
});
document.addEventListener("change",event=>{if(event.target instanceof Element&&event.target.matches("[data-bookmark-filter]"))refresh();});
window.addEventListener("pageshow",refresh);
window.addEventListener("storage",event=>{if(event.key===null||event.key===oldKey||event.key===newKey)refresh();});
window.MebeBookmarks={refresh};refresh();
})();