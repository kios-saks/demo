import atlas from "../app/hoc-cung-con/life-course-atlas.json";
import inventory from "../app/hoc-cung-con/life-course-inventory.json";
import bundle from "../app/hoc-cung-con/life-course-articles.json";
import lessons from "../app/hoc-cung-con/learning-catalog.json";
import {buildKnowledgeIndex,knowledgeGroups,filterKnowledge,findKnowledgeReference,compatibilityHref} from "./knowledge-index.mjs";
import {openDevReader} from "./open-dev-reader";
import {connectionPending,escapeHtml as e,htmlResponse,listDevArticles,requirePreviewLogin} from "./dev-preview";
import {dynamicMediaEnabled} from "./dynamic-media";
type Entry={key:string;kind:string;id:string;stage:string;pillar:string;title:string;summary:string;href:string;status:string};
// The existing A–Z gate is deliberately stricter than the legacy invitation gate.
function deny(request:Request):Response|null{
 if(!openDevReader()||!["GET","HEAD"].includes(request.method))return new Response("Không tìm thấy trang",{status:404,headers:{"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow, noarchive"}});
 return requirePreviewLogin(request);
}
export async function renderKnowledgeHub(request:Request):Promise<Response>{
 const rejected=deny(request);if(rejected)return rejected;
 try{
  const live=await listDevArticles();
  if(dynamicMediaEnabled()&&live.source!=="supabase")throw Error("Live knowledge catalog required");
  const entries:Entry[]=buildKnowledgeIndex(inventory,atlas,live.articles,bundle.articles,lessons.lessons);
  const params=new URL(request.url).searchParams;
  const stage=atlas.stages.some(s=>s.id===params.get("stage"))?params.get("stage")||"":"";
  const group=knowledgeGroups.some(g=>g.id===params.get("group"))?params.get("group")||"":"";
  const selected:Entry[]=filterKnowledge(entries,group,stage);
  const labels:Record<string,string>={legacy:"Bài viết",article:"Cẩm nang",lesson:"Bài học"};
  const groups=knowledgeGroups.map(g=>{
   const matches=selected.filter(x=>g.stages.includes(x.stage));if(!matches.length)return "";
   const stages=atlas.stages.filter(s=>g.stages.includes(s.id)&&matches.some(x=>x.stage===s.id));
   const sections=stages.map(s=>'<section data-knowledge-stage="'+e(s.id)+'"><h3>'+e(s.age)+' · '+e(s.title)+'</h3><ul class="saved-list">'+matches.filter(x=>x.stage===s.id).map(x=>'<li data-knowledge-entry="'+e(x.key)+'"><a href="'+e(x.href)+'">'+e(x.title)+'</a><small>'+e(labels[x.kind]||"Kiến thức")+' · '+e(atlas.pillars.find(p=>p.id===x.pillar)?.title||"")+'</small></li>').join("")+'</ul></section>').join("");
   return '<details class="stage-guide" data-knowledge-group="'+e(g.id)+'"'+((group||stage)?" open":"")+'><summary><strong>'+e(g.label)+'</strong> · '+matches.length+' nội dung</summary>'+sections+'</details>';
  }).join("");
  const groupLinks=knowledgeGroups.map(g=>'<a href="/kham-pha?group='+e(g.id)+'"'+(!stage&&group===g.id?' aria-current="page"':'')+'>'+e(g.label)+'</a>').join("");
  const stageLinks=atlas.stages.map(s=>'<a href="/kham-pha?stage='+e(s.id)+'"'+(stage===s.id?' aria-current="page"':'')+'>'+e(s.age)+'</a>').join("");
  return htmlResponse("Khám phá kiến thức",'<section class="compact-head"><div><span class="eyebrow">TRI THỨC CHO MỌI CHẶNG ĐỜI</span><h1>Khám phá kiến thức</h1><p>Tìm hiểu sức khỏe, học tập, gia đình và kỹ năng sống theo chặng bạn quan tâm.</p></div></section><p class="reader-notice"><strong>Lưu ý:</strong> Nội dung chưa được thẩm định chuyên môn; chỉ để tham khảo, không thay thế tư vấn y tế hoặc chuyên môn.</p><section class="search-zone"><form class="search" role="search" method="post" action="/api/dev-search" data-private-search><label class="sr-only" for="hub-search">Tìm trong 219 nội dung</label><input id="hub-search" name="q" type="search" autocomplete="off" maxlength="240" placeholder="Tìm kiến thức bạn cần"><button type="submit">Tìm kiếm</button></form></section><section class="home-section" aria-label="Nhóm tuổi"><h2>Chọn chặng quan tâm</h2><div class="topic-chips"><a href="/kham-pha"'+(!stage&&!group?' aria-current="page"':'')+'>Tất cả</a>'+groupLinks+'</div><details class="stage-guide"><summary>Xem 12 chặng chi tiết</summary><div class="topic-chips">'+stageLinks+'</div></details></section><div class="results-heading"><h2>Nội dung phù hợp</h2><p data-knowledge-count="'+selected.length+'" data-knowledge-total="'+entries.length+'">'+selected.length+' / '+entries.length+' nội dung</p></div>'+groups+'<section class="stage-guide"><h2>Cẩm nang chăm sóc gia đình</h2><p><a href="/thu-vien">Hướng dẫn theo giai đoạn mẹ và bé</a> · <a href="/hoc-cung-con">Bài học và hoạt động thực hành</a> · <a href="/nguon-tham-khao">Nguồn tham khảo</a></p></section>');
 }catch(error){console.warn("KNOWLEDGE_HUB_UNAVAILABLE",error instanceof Error?error.name:"unknown");return connectionPending(request);}
}
export function resolveKnowledgeLink(request:Request,kind:string,id:string):Response{
 const rejected=deny(request);if(rejected)return rejected;
 const ref=findKnowledgeReference(inventory,kind,id);
 const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow, noarchive"};
 if(!ref)return new Response("Không tìm thấy nội dung",{status:404,headers});
 return new Response(null,{status:307,headers:{...headers,Location:compatibilityHref(ref)}});
}
