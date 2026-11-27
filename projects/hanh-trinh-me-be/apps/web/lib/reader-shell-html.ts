import {shellDestinations,shellBreadcrumb,type ShellSection} from "./reader-shell-model";
const e=(value:string)=>value.replace(/[&<>"']/g,c=>(({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"} as Record<string,string>)[c]||c));
const icon=(path:string)=>'<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="'+path+'"/></svg>';
function nav(section:ShellSection,mobile:boolean){
 return '<nav class="'+(mobile?"mobile-reader-nav shell-v2-mobile":"reader-nav-links shell-v2-desktop")+'" data-shell-nav="'+(mobile?"mobile":"desktop")+'" aria-label="'+(mobile?"Điều hướng trên điện thoại":"Điều hướng chính")+'">'+shellDestinations.map(d=>'<a href="'+d.href+'"'+(d.id===section?' aria-current="page"':'')+'>'+icon(d.icon)+'<span>'+d.label+'</span></a>').join("")+'</nav>';
}
export function shellHeader(section:ShellSection){
 return '<a class="shell-v2-skip" href="#dev-main">Đi thẳng đến nội dung chính</a><header class="nav shell-v2-header"><div class="wrap reader-nav-inner shell-v2-inner"><a class="reader-brand shell-v2-brand" href="/" aria-label="Hành Trình Mẹ &amp; Bé — về trang chủ"><span class="brand-symbol" aria-hidden="true">'+icon("M12 21 3 12a5 5 0 0 1 9-5 5 5 0 0 1 9 5z")+'</span><span>Hành Trình Mẹ &amp; Bé</span></a>'+nav(section,false)+'</div></header>';
}
export function shellCrumbs(section:ShellSection,title:string){
 const crumbs=shellBreadcrumb(section,title);if(!crumbs.length)return "";
 return '<nav class="shell-v2-crumbs" data-shell-breadcrumb aria-label="Đường dẫn"><ol>'+crumbs.map(c=>'<li>'+("href" in c&&c.href?'<a href="'+c.href+'">'+e(c.label)+'</a>':'<span aria-current="page">'+e(c.label)+'</span>')+'</li>').join("")+'</ol></nav>';
}
export function shellFooter(section:ShellSection){
 return '<footer class="wrap footer shell-v2-footer">Hành Trình Mẹ &amp; Bé · Đồng hành bằng kiến thức và sự thấu hiểu · <a href="/nguon-tham-khao">Nguồn tham khảo</a></footer>'+nav(section,true);
}
