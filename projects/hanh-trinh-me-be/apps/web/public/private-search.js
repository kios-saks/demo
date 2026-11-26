/* Combined DEV only: query in POST body, URL fragment stays browser-side. No storage or telemetry. */
(()=>{
 let generation=0,controller;
 const target="/tim-kiem";
 async function restore(){
  if(location.pathname!==target||!["#q=","#stage=","#topic=","#kind="].some(prefix=>location.hash.startsWith(prefix)))return;
  const params=new URLSearchParams(location.hash.slice(1)),id=++generation;
  controller?.abort();controller=new AbortController();
  const main=document.getElementById("dev-main");if(!main)return;
  main.querySelector("[data-private-pending]")?.remove();
  main.removeAttribute("data-private-search-ready");
  main.setAttribute("aria-busy","true");
  const pending=document.createElement("p");pending.setAttribute("role","status");pending.setAttribute("data-private-pending","");pending.textContent="Đang tìm kiếm…";main.prepend(pending);
  try{
   const res=await fetch("/api/dev-search",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:params.toString(),cache:"no-store",credentials:"same-origin",signal:controller.signal});
   if(res.status!==200&&res.status!==503)throw Error("Search unavailable");
   const doc=new DOMParser().parseFromString(await res.text(),"text/html"),next=doc.getElementById("dev-main");
   if(!next||!next.querySelector("[data-unified-search],[data-search-error]"))throw Error("Invalid response");
   if(id===generation){main.replaceWith(next);next.setAttribute("data-private-search-ready","true");}
  }catch(e){if(id===generation&&e.name!=="AbortError"){pending.textContent="Không thể kết nối tìm kiếm. Hãy thử tải lại trang.";pending.setAttribute("data-search-error","");}}
  finally{if(id===generation)main.removeAttribute("aria-busy");}
 }
 document.addEventListener("submit",event=>{
  const form=event.target;if(!(form instanceof HTMLFormElement)||!form.hasAttribute("data-private-search"))return;
  event.preventDefault();const params=new URLSearchParams(new FormData(form)),hash=params.toString();
  if(location.pathname===target&&!location.search){if(location.hash.slice(1)===hash)void restore();else location.hash=hash;}
  else location.assign(target+"#"+hash);
 });
 window.addEventListener("hashchange",()=>{if(!location.hash&&location.pathname===target){location.reload();return;}void restore();});
 void restore();
})();
