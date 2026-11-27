import atlas from "../app/hoc-cung-con/life-course-atlas.json";
import inventory from "../app/hoc-cung-con/life-course-inventory.json";
import {knowledgeHref,findKnowledgeReference} from "./knowledge-index.mjs";
import {escapeHtml as e} from "./dev-preview";
export const detailHref=(kind:string,id:string)=>knowledgeHref(kind,id)+"/doc";
const labels:Record<string,string>={legacy:"Bài viết",article:"Cẩm nang",lesson:"Bài học"};
export type DetailAnchor={id:string;heading:string};
export function detailMeta(kind:string,id:string,extra:string[]=[]){
 const ref=findKnowledgeReference(inventory,kind,id);if(!ref)return "";
 return [labels[kind],atlas.stages.find(s=>s.id===ref.stage)?.age||"",atlas.pillars.find(p=>p.id===ref.pillar)?.title||"",...extra].filter(Boolean).map(x=>'<span>'+e(x)+'</span>').join("");
}
export function detailToc(anchors:DetailAnchor[]){
 const toc='<nav class="toc" aria-label="Mục lục bài đọc"><h2>Trong bài đọc này</h2>'+anchors.map((a,i)=>'<a href="#'+e(a.id)+'">'+String(i+1).padStart(2,"0")+' · '+e(a.heading)+'</a>').join("")+'</nav>';
 return '<div class="desktop-toc">'+toc+'</div><details class="mobile-toc"><summary>Trong bài đọc này · '+anchors.length+' mục</summary>'+toc+'</details>';
}
export function detailRelated(kind:string,id:string){
 const ref=findKnowledgeReference(inventory,kind,id);if(!ref)return "";
 const items=inventory.refs.filter(x=>!(x.kind===kind&&x.id===id)&&(x.stage===ref.stage||x.pillar===ref.pillar)).sort((a,b)=>Number(b.stage===ref.stage&&b.pillar===ref.pillar)-Number(a.stage===ref.stage&&a.pillar===ref.pillar)||Number(b.stage===ref.stage)-Number(a.stage===ref.stage)).slice(0,3);
 return '<section class="related-articles detail-related" data-detail-related><h2>Đọc tiếp</h2><ul>'+items.map(x=>'<li><a href="'+e(detailHref(x.kind,x.id))+'">'+e(x.title)+'</a><small>'+e(labels[x.kind])+' · '+e(atlas.stages.find(s=>s.id===x.stage)?.age||"")+'</small></li>').join("")+'</ul><a href="/kham-pha?stage='+e(ref.stage)+'">Khám phá thêm theo độ tuổi</a></section>';
}
export function detailShare(kind:string,id:string){return '<div class="detail-share"><a data-detail-link href="'+e(detailHref(kind,id))+'">Liên kết bài đọc</a><button type="button" data-detail-copy hidden>Sao chép liên kết</button><span role="status" data-detail-copy-status></span></div>';}
export function detailWrap(kind:string,id:string,body:string){return '<div data-detail-v2="1" data-detail-kind="'+e(kind)+'" data-detail-id="'+e(id)+'">'+body+'</div>';}
