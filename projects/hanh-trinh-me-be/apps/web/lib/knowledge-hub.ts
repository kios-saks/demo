import {bookmarkButton} from "./bookmark-ui";
import {detailHref} from "./knowledge-detail-ui";
import {parseDiscoveryParams,discoveryHref,discoveryFacets,paginateDiscovery,discoveryPageSize} from "./knowledge-discovery.mjs";
import atlas from "../app/hoc-cung-con/life-course-atlas.json";
import inventory from "../app/hoc-cung-con/life-course-inventory.json";
import bundle from "../app/hoc-cung-con/life-course-articles.json";
import lessons from "../app/hoc-cung-con/learning-catalog.json";
import {buildKnowledgeIndex,knowledgeGroups,findKnowledgeReference,compatibilityHref} from "./knowledge-index.mjs";
import {openDevReader} from "./open-dev-reader";
import {escapeHtml as e,htmlResponse,listDevArticles,requirePreviewLogin} from "./dev-preview";
import {dynamicMediaEnabled} from "./dynamic-media";
type Entry={key:string;kind:string;id:string;stage:string;pillar:string;title:string;summary:string;href:string;status:string};
// The existing A–Z gate is deliberately stricter than the legacy invitation gate.
function deny(request:Request):Response|null{
 if(!openDevReader()||!["GET","HEAD"].includes(request.method))return new Response("Không tìm thấy trang",{status:404,headers:{"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow, noarchive"}});
 return requirePreviewLogin(request);
}
export async function renderKnowledgeHub(request:Request,load=listDevArticles):Promise<Response>{
 const rejected=deny(request);if(rejected)return rejected;
 const state=parseDiscoveryParams(new URL(request.url).searchParams,atlas);
 try{
  const live=await load();
  if(dynamicMediaEnabled()&&live.source!=="supabase")throw Error("Live knowledge catalog required");
  const entries:Entry[]=buildKnowledgeIndex(inventory,atlas,live.articles,bundle.articles,lessons.lessons);
  const result=paginateDiscovery(entries,state,atlas),facets=discoveryFacets(entries,state,atlas);
  const labels:Record<string,string>={legacy:"Bài viết",article:"Cẩm nang",lesson:"Bài học"};
  const count=state.stages.length+state.topics.length+state.kinds.length;
  const option=(name:string,id:string,label:string,checked:boolean,n:number)=>'<label class="discovery-option"><input type="checkbox" name="'+name+'" value="'+e(id)+'"'+(checked?" checked":"")+'><span>'+e(label)+'</span><small aria-label="'+n+' nội dung">'+n+'</small></label>';
  const options=(name:string,title:string,selected:string[],values:{id:string;label:string}[],counts:Record<string,number>)=>'<details class="discovery-facet"'+(selected.length?" open":"")+'><summary>'+e(title)+' <small>'+selected.length+' đã chọn</small></summary><fieldset><legend class="sr-only">'+e(title)+'</legend>'+values.map(x=>option(name,x.id,x.label,selected.includes(x.id),counts[x.id]||0)).join("")+'</fieldset></details>';
  const form='<form id="discovery-filter" method="get" action="/kham-pha" aria-label="Bộ lọc khám phá"><p class="discovery-help">Chọn nhiều mục trong một nhóm; kết hợp các nhóm để thu hẹp. Số cạnh từng mục là số bài phù hợp với các nhóm còn lại.</p>'+options("stage","Độ tuổi",state.stages,atlas.stages.map(s=>({id:s.id,label:s.age})),facets.stage)+options("topic","Chủ đề",state.topics,atlas.pillars.map(p=>({id:p.id,label:p.title})),facets.topic)+options("kind","Loại nội dung",state.kinds,Object.entries(labels).map(([id,label])=>({id,label})),facets.kind)+'<div class="discovery-actions"><button type="submit" class="primary-action">Áp dụng bộ lọc</button><a class="secondary-action" data-discovery-clear href="/kham-pha">Xóa tất cả</a><p role="status" data-discovery-form-loading hidden>Đang tải nội dung…</p></div></form>';
  const groupHref=(group:string)=>discoveryHref({...state,group,stages:[]});
  const groupLinks='<div class="discovery-age-links" aria-label="Nhóm tuổi nhanh"><a href="'+e(groupHref(""))+'"'+(!state.stages.length?' aria-current="page"':'')+'>Mọi độ tuổi</a>'+knowledgeGroups.map(g=>'<a href="'+e(groupHref(g.id))+'"'+(state.stages.length===g.stages.length&&g.stages.every(s=>state.stages.includes(s))?' aria-current="page"':'')+'>'+e(g.label)+'</a>').join("")+'</div>';
  const selectedChips=[...state.stages.map(id=>({dimension:"stages" as const,id,label:atlas.stages.find(s=>s.id===id)!.age})),...state.topics.map(id=>({dimension:"topics" as const,id,label:atlas.pillars.find(s=>s.id===id)!.title})),...state.kinds.map(id=>({dimension:"kinds" as const,id,label:labels[id]}))];
  const chips=selectedChips.map(c=>'<a class="discovery-chip" href="'+e(discoveryHref({...state,group:c.dimension==="stages"?"":state.group,[c.dimension]:state[c.dimension].filter(x=>x!==c.id)}))+'" aria-label="Bỏ lọc '+e(c.label)+'">'+e(c.label)+' ×</a>').join("");
  const rows=knowledgeGroups.map(g=>{
   const matches=result.items.filter(x=>g.stages.includes(x.stage));if(!matches.length)return "";
   const stages=atlas.stages.filter(s=>g.stages.includes(s.id)&&matches.some(x=>x.stage===s.id));
   return '<section class="discovery-group" data-knowledge-group="'+e(g.id)+'"><h3>'+e(g.label)+'</h3>'+stages.map(s=>'<section data-knowledge-stage="'+e(s.id)+'"><h4>'+e(s.age)+' · '+e(s.title)+'</h4><ul class="saved-list discovery-results">'+matches.filter(x=>x.stage===s.id).map(x=>'<li data-knowledge-entry="'+e(x.key)+'" data-discovery-stage="'+e(x.stage)+'" data-discovery-topic="'+e(x.pillar)+'" data-discovery-kind="'+e(x.kind)+'"><a href="'+e(detailHref(x.kind,x.id))+'">'+e(x.title)+'</a><small>'+e(labels[x.kind])+' · '+e(atlas.pillars.find(p=>p.id===x.pillar)?.title||"")+'</small><p>'+e(x.summary)+'</p>'+bookmarkButton(x.kind,x.id)+'</li>').join("")+'</ul></section>').join("")+'</section>';
  }).join("");
  const pageLink=(n:number,label:string)=>'<a data-discovery-page="'+n+'" href="'+e(discoveryHref(state,n))+'"'+(n===result.page?' aria-current="page"':'')+'>'+e(label)+'</a>';
  const pager=result.pages>1?'<nav class="discovery-pagination" aria-label="Phân trang kết quả">'+(result.page>1?pageLink(result.page-1,"Trước"):"")+Array.from({length:result.pages},(_,i)=>pageLink(i+1,String(i+1))).join("")+(result.page<result.pages?pageLink(result.page+1,"Tiếp"):"")+'</nav>':"";
  const range=result.total?((result.page-1)*discoveryPageSize+1)+"–"+Math.min(result.page*discoveryPageSize,result.total):"0";
  return htmlResponse("Khám phá kiến thức",'<div data-discovery-v2="1"><section class="discovery-head"><h1>Khám phá kiến thức</h1><p>Tìm điều hữu ích cho từng chặng đời.</p><form class="search" role="search" method="post" action="/api/dev-search" data-private-search><label class="sr-only" for="hub-search">Tìm trong 219 nội dung</label><input id="hub-search" name="q" type="search" autocomplete="off" maxlength="240" placeholder="Tìm kiến thức bạn cần"><button type="submit">Tìm kiếm</button></form>'+groupLinks+'</section><div class="discovery-toolbar"><button type="button" data-discovery-open hidden aria-haspopup="dialog" aria-controls="discovery-sheet">Bộ lọc'+(count?' ('+count+')':'')+'</button><h2 id="discovery-result-heading" tabindex="-1">Nội dung phù hợp</h2><p role="status" data-knowledge-count="'+result.total+'" data-knowledge-total="'+entries.length+'" data-discovery-current-page="'+result.page+'" data-discovery-pages="'+result.pages+'">'+result.total+' / '+entries.length+' nội dung · Hiển thị '+range+'</p><p role="status" data-discovery-loading hidden>Đang tải nội dung…</p></div>'+(chips?'<div class="discovery-chips" aria-label="Bộ lọc đang áp dụng">'+chips+'<a data-discovery-clear href="/kham-pha">Xóa tất cả</a></div>':'')+'<div class="discovery-layout"><aside class="discovery-sidebar" aria-label="Bộ lọc"><details id="discovery-inline"><summary>Bộ lọc'+(count?' ('+count+')':'')+'</summary><div id="discovery-form-home">'+form+'</div></details></aside><section class="discovery-content" aria-labelledby="discovery-result-heading">'+(result.total?rows+pager:'<section class="warn" data-discovery-empty><h3>Chưa có nội dung phù hợp</h3><p>Thử bỏ bớt bộ lọc hoặc chọn chặng khác. Không có kết quả không có nghĩa chủ đề không quan trọng.</p><a class="primary-action" data-discovery-clear href="/kham-pha">Xem tất cả nội dung</a></section>')+'</section></div><dialog id="discovery-sheet" aria-labelledby="discovery-sheet-title"><div class="discovery-sheet-head"><h2 id="discovery-sheet-title">Bộ lọc</h2><button type="button" data-discovery-close aria-label="Đóng bộ lọc">Đóng</button></div><div id="discovery-sheet-body"></div></dialog><p class="reader-notice"><strong>Lưu ý:</strong> Nội dung chưa được thẩm định chuyên môn; chỉ để tham khảo, không thay thế tư vấn y tế hoặc chuyên môn.</p><p><a href="/thu-vien">Hướng dẫn theo giai đoạn mẹ và bé</a> · <a href="/hoc-cung-con">Bài học và hoạt động thực hành</a></p></div>',200,"discovery-v2");
 }catch(error){console.warn("KNOWLEDGE_HUB_UNAVAILABLE",error instanceof Error?error.name:"unknown");return htmlResponse("Đang kết nối dữ liệu",'<section class="warn" role="status" data-discovery-error><h1>Đang kết nối hệ thống</h1><p>Chưa thể tải kho kiến thức. Vui lòng thử lại; không dùng dữ liệu cũ thay thế.</p><a class="primary-action" href="'+e(discoveryHref(state,state.page))+'">Thử lại</a> · <a href="/">Về trang chủ</a></section>',503,"discovery-v2");}
}
export function resolveKnowledgeLink(request:Request,kind:string,id:string):Response{
 const rejected=deny(request);if(rejected)return rejected;
 const ref=findKnowledgeReference(inventory,kind,id);
 const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow, noarchive"};
 if(!ref)return new Response("Không tìm thấy nội dung",{status:404,headers});
 return new Response(null,{status:307,headers:{...headers,Location:compatibilityHref(ref)}});
}
