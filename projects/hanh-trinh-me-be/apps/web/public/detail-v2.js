/* Canonical share paths only; no current search, hash, token or personal state. */
(()=>{const root=document.querySelector("[data-detail-v2]");if(!root)return;
 const link=root.querySelector("[data-detail-link]"),copy=root.querySelector("[data-detail-copy]"),share=root.querySelector("[data-detail-share]"),status=root.querySelector("[data-detail-copy-status]");if(!link||!copy||!status)return;
 const {detailKind:kind,detailId:id}=root.dataset;
 if(!["legacy","article","lesson"].includes(kind)||! /^[a-z0-9-]{1,160}$/.test(id||""))return;
 const path="/kien-thuc/"+kind+"/"+id+"/doc";if(link.getAttribute("href")!==path)return;
 const url=new URL(path,location.origin).href;
 const fallback=async()=>{try{if(!navigator.clipboard)throw Error("Clipboard unavailable");await navigator.clipboard.writeText(url);status.textContent="Đã sao chép liên kết.";}catch{status.textContent=url;}};
 copy.hidden=false;copy.addEventListener("click",fallback);
 if(share){share.hidden=false;share.addEventListener("click",async()=>{if(!navigator.share)return fallback();try{await navigator.share({title:root.querySelector("h1")?.textContent||"Hành Trình Mẹ & Bé",url});status.textContent="Đã mở chia sẻ.";}catch(error){if(error?.name!=="AbortError")await fallback();}});}
})();