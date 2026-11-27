/* Progressive enhancement: one native GET form, no storage or telemetry. */
(()=>{
 const root=document.querySelector("[data-discovery-v2]");if(!root)return;
 const form=document.getElementById("discovery-filter"),home=document.getElementById("discovery-form-home"),inline=document.getElementById("discovery-inline"),sheet=document.getElementById("discovery-sheet"),slot=document.getElementById("discovery-sheet-body"),open=root.querySelector("[data-discovery-open]"),close=root.querySelector("[data-discovery-close]"),loading=root.querySelector("[data-discovery-loading]");
 if(!form||!home||!sheet||!slot||!open||!close||!inline)return;
 const media=matchMedia("(max-width:768px)");let submitting=false;
 function setup(){
  if(!media.matches&&sheet.open)sheet.close();
  root.dataset.discoveryEnhanced=media.matches&&typeof sheet.showModal==="function"?"mobile":"desktop";
  open.hidden=root.dataset.discoveryEnhanced!=="mobile";
  if(!media.matches)inline.open=true;
 }
 open.addEventListener("click",()=>{if(sheet.open)return;slot.append(form);sheet.showModal();close.focus();});
 close.addEventListener("click",()=>sheet.close());
 sheet.addEventListener("close",()=>{if(!submitting)form.reset();home.append(form);if(!open.hidden)open.focus();});
 form.addEventListener("submit",()=>{submitting=true;if(loading)loading.hidden=false;form.querySelector("[data-discovery-form-loading]").hidden=false;root.querySelector(".discovery-content")?.setAttribute("aria-busy","true");});
 window.addEventListener("pageshow",()=>{submitting=false;if(loading)loading.hidden=true;form.querySelector("[data-discovery-form-loading]").hidden=true;root.querySelector(".discovery-content")?.removeAttribute("aria-busy");if(sheet.open)sheet.close();setup();});
 media.addEventListener("change",setup);setup();
})();
