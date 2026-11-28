/* Accessible pending feedback for same-origin reader navigation; no data collection. */
(()=>{
 let status;
 function reset(){if(status){status.hidden=true;status.textContent="";}}
 window.addEventListener("pageshow",reset);
 document.addEventListener("click",event=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target instanceof Element?event.target.closest("a[href]"):null;
  if(!link||link.hasAttribute("download")||link.target&&link.target!=="_self")return;
  const target=new URL(link.href,location.href);
  if(target.origin!==location.origin||target.pathname===location.pathname&&target.search===location.search&&target.hash)return;
  if(!status){status=document.createElement("p");status.setAttribute("role","status");status.setAttribute("aria-live","polite");status.className="warn";document.getElementById("dev-main")?.prepend(status);}
  status.hidden=false;status.textContent="Đang tải nội dung…";
 });
})();
