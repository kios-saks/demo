/* Keep keyboard focus out of the fixed navigation and sticky header. No telemetry. */
(()=>{
 if(window.__mebeShellFocus)return;window.__mebeShellFocus=true;
 document.addEventListener("focusin",event=>{
  const el=event.target;if(!(el instanceof HTMLElement))return;
  const shell=el.closest('[data-reader-shell="v2"]');if(!shell||el.closest("[data-shell-nav],.shell-v2-header,.shell-v2-skip"))return;
  requestAnimationFrame(()=>{
   if(document.activeElement!==el)return;
   const rect=el.getBoundingClientRect(),nav=shell.querySelector(".shell-v2-mobile"),header=shell.querySelector(".shell-v2-header");
   const bottom=nav&&getComputedStyle(nav).display!=="none"?nav.getBoundingClientRect().top:innerHeight;
   const top=header&&getComputedStyle(header).position==="sticky"?Math.max(0,header.getBoundingClientRect().bottom):0;
   const available=bottom-top-16;
   if(rect.height>available){if(rect.top<top+8||rect.top>bottom-8)window.scrollBy({top:rect.top-top-8,behavior:"instant"});return}
   if(rect.bottom>bottom-8)window.scrollBy({top:rect.bottom-bottom+8,behavior:"instant"});
   else if(rect.top<top+8)window.scrollBy({top:rect.top-top-8,behavior:"instant"});
  });
 });
})();
