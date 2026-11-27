import inventory from "../app/hoc-cung-con/life-course-inventory.json";
import bundle from "../app/hoc-cung-con/life-course-articles.json";
import lessons from "../app/hoc-cung-con/learning-catalog.json";
import {findKnowledgeReference,compatibilityHref} from "./knowledge-index.mjs";
import {openDevReader} from "./open-dev-reader";
import {escapeHtml as e,htmlResponse,requirePreviewLogin} from "./dev-preview";
import {detailHref,detailMeta,detailToc,detailRelated,detailShare,detailWrap,type DetailAnchor} from "./knowledge-detail-ui";
type Source={name:string;url:string};
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow, noarchive","Referrer-Policy":"no-referrer"};
const notFound=()=>new Response("Không tìm thấy nội dung",{status:404,headers});
function sourceLink(map:Record<string,Source>,id:string){
 const source=map[id];if(!source||new URL(source.url).protocol!=="https:")throw Error("Invalid detail source");
 return '<a href="'+e(source.url)+'" target="_blank" rel="noopener noreferrer nofollow">'+e(source.name)+' ↗</a>';
}
export function renderKnowledgeDetail(request:Request,kind:string,id:string):Response{
 if(!openDevReader()||!["GET","HEAD"].includes(request.method))return notFound();
 const denied=requirePreviewLogin(request);if(denied)return denied;
 const ref=findKnowledgeReference(inventory,kind,id);if(!ref||ref.status!=="draft")return notFound();
 if(kind==="legacy")return new Response(null,{status:307,headers:{...headers,Location:compatibilityHref(ref)}});
 try{
  const anchors:DetailAnchor[]=[];let title="",summary="",body="",sourceIds:string[]=[],map:Record<string,Source>={},checked="";
  const section=(key:string,heading:string,content:string)=>{anchors.push({id:key,heading});return '<section id="'+e(key)+'" data-detail-section><h2>'+e(heading)+'</h2>'+content+'</section>';};
  if(kind==="article"){
   const a=bundle.articles.find(x=>x.id===id&&x.stage===ref.stage&&x.pillar===ref.pillar&&x.status==="draft");if(!a)throw Error("Detail inventory mismatch");
   title=a.title;summary=a.summary;map=bundle.sources;checked=bundle.sourceCheckedOn;sourceIds=a.sourceIds;
   body=a.sections.map((s,i)=>section("part-"+i,s.heading,'<p>'+e(s.body)+'</p>'+(s.sourceIds.length?'<p class="detail-section-sources">Tham khảo: '+s.sourceIds.map(x=>sourceLink(map,x)).join(" · ")+'</p>':""))).join("");
   body+=section("detail-practice","Checklist thực hành",'<ol>'+a.practice.map(x=>'<li>'+e(x)+'</li>').join("")+'</ol>')+section("detail-limits","Giới hạn áp dụng",'<p>'+e(a.limits)+'</p>');
  }else if(kind==="lesson"){
   const l=lessons.lessons.find(x=>x.id===id&&x.age===ref.stage&&x.status==="draft");if(!l)throw Error("Detail inventory mismatch");
   title=l.title;summary=l.goal;map=lessons.sources;checked=lessons.sourceCheckedOn;sourceIds=l.sourceIds;
   body=section("part-0","Kiến thức nền tảng",'<p>'+e(l.knowledge)+'</p>')+section("detail-practice","Hoạt động cùng con",'<p>'+e(l.practice)+'</p>')+section("detail-reflection","Câu hỏi suy ngẫm",'<p>'+e(l.reflection)+'</p>')+'<p class="reader-notice">Hoạt động là gợi ý để gia đình điều chỉnh theo hoàn cảnh.</p>';
  }else return notFound();
  body+=section("article-sources","Nguồn tham khảo cụ thể",'<div class="sources"><ul>'+sourceIds.map(x=>'<li>'+sourceLink(map,x)+'</li>').join("")+'</ul><p class="muted">Tra cứu nguồn: '+e(checked)+'. Chưa thẩm định chuyên môn.</p></div>');
  const head='<div class="article-hero"><h1>'+e(title)+'</h1><p class="reading-lead">'+e(summary)+'</p><div class="reader-meta">'+detailMeta(kind,id,[sourceIds.length+" nguồn tham khảo"])+'</div>'+detailShare(kind,id)+'</div>';
  const warning='<div class="warn" data-detail-limitation><b>Chưa được thẩm định chuyên môn.</b> Nội dung chỉ để tham khảo, không thay thế chẩn đoán, điều trị, tư vấn y tế hoặc tư vấn chuyên môn cá nhân. Khi có dấu hiệu cấp cứu, hãy liên hệ cơ sở y tế ngay. <a href="#article-sources">Đối chiếu nguồn tham khảo</a>.</div>';
  return htmlResponse(title,detailWrap(kind,id,head+warning+'<div class="reading-layout"><aside class="reading-sidebar">'+detailToc(anchors)+'</aside><article class="content article-content" aria-label="Nội dung bài đọc">'+body+detailRelated(kind,id)+'<p><a href="'+e(compatibilityHref(ref))+'">Xem trong bản đồ tri thức theo độ tuổi</a> · <a href="/kham-pha">Quay lại khám phá</a></p></article></div>'),200,"detail-v2");
 }catch(error){console.warn("KNOWLEDGE_DETAIL_UNAVAILABLE",error instanceof Error?error.name:"unknown");return htmlResponse("Đang kết nối dữ liệu",'<section class="warn" data-detail-error role="status"><h1>Chưa thể tải nội dung</h1><p>Vui lòng thử lại.</p><a href="'+e(detailHref(kind,id))+'">Thử lại</a> · <a href="/kham-pha">Về khám phá</a></section>',503,"detail-v2");}
}
