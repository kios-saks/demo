import atlas from "../app/hoc-cung-con/life-course-atlas.json";
import inventory from "../app/hoc-cung-con/life-course-inventory.json";
import bundle from "../app/hoc-cung-con/life-course-articles.json";
import lessons from "../app/hoc-cung-con/learning-catalog.json";
import {openDevReader} from "./open-dev-reader";
import {dynamicMediaEnabled} from "./dynamic-media";
import {connectionPending,escapeHtml as e,htmlResponse,listDevArticles,requirePreviewLogin} from "./dev-preview";
import {stageOptions} from "./reader-navigation";
import {createSearchIndex,parseSearchParams,searchKnowledge} from "./knowledge-search.mjs";
const labels:Record<string,string>={legacy:"Bài viết",article:"Cẩm nang",lesson:"Bài học"};
type SearchRow={key:string;kind:string;id:string;title:string;summary:string;href:string;stage:string;pillar:string;stageLabel:string;topicLabel:string};
export async function renderUnifiedSearch(request:Request):Promise<Response>{
 if(!openDevReader()||!["GET","HEAD"].includes(request.method))return new Response("Không tìm thấy trang",{status:404,headers:{"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow, noarchive"}});
 const denied=requirePreviewLogin(request);if(denied)return denied;
 try{
  const live=await listDevArticles();
  if(dynamicMediaEnabled()&&live.source!=="supabase")throw Error("Live knowledge catalog required");
  const index=createSearchIndex(inventory,atlas,live.articles,bundle.articles,lessons.lessons);
  const filters=parseSearchParams(new URL(request.url).searchParams,atlas,stageOptions.map(([id])=>id));
  const matches:SearchRow[]=searchKnowledge(index,filters);
  const opt=(id:string,label:string,value:string)=>'<option value="'+e(id)+'"'+(id===value?' selected':'')+'>'+e(label)+'</option>';
  const stageList=atlas.stages.map(s=>opt(s.id,s.age+" · "+s.title,filters.stage)).join("");
  const oldStages=stageOptions.map(([id,label])=>opt(id,label,filters.stage)).join("");
  const form='<form class="search" role="search" method="get" action="/tim-kiem" aria-label="Tìm kiếm toàn bộ tri thức"><label class="sr-only" for="unified-q">Từ khóa</label><input id="unified-q" name="q" type="search" value="'+e(filters.q)+'" maxlength="240" autocomplete="off" placeholder="Ăn dặm, dậy thì, AI, tài chính…"><label class="sr-only" for="unified-stage">Độ tuổi</label><select id="unified-stage" name="stage">'+opt("","Tất cả độ tuổi",filters.stage)+stageList+'<optgroup label="Giai đoạn mẹ và bé (URL cũ)">'+oldStages+'</optgroup></select><label class="sr-only" for="unified-topic">Chủ đề</label><select id="unified-topic" name="topic">'+opt("","Tất cả chủ đề",filters.topic)+atlas.pillars.map(p=>opt(p.id,p.title,filters.topic)).join("")+'</select><label class="sr-only" for="unified-kind">Loại nội dung</label><select id="unified-kind" name="kind">'+opt("","Tất cả loại",filters.kind)+Object.entries(labels).map(([id,label])=>opt(id,label,filters.kind)).join("")+'</select><button type="submit">Tìm kiếm</button></form>';
  const rows=matches.map(x=>'<li data-search-entry="'+e(x.key)+'" data-search-stage="'+e(x.stage)+'" data-search-topic="'+e(x.pillar)+'" data-search-kind="'+e(x.kind)+'"><a href="'+e(x.href)+'">'+e(x.title)+'</a><small>'+e(labels[x.kind])+' · '+e(x.stageLabel)+' · '+e(x.topicLabel)+'</small><p>'+e(x.summary)+'</p></li>').join("");
  return htmlResponse("Tìm kiếm kiến thức",'<section class="compact-head" data-unified-search="v2"><div><span class="eyebrow">TÌM KIẾN THỨC THEO NHU CẦU</span><h1>Tìm kiếm kiến thức</h1><p>Tìm trong toàn bộ 219 nội dung theo từ khóa có dấu hoặc không dấu. Chỉ tìm tài liệu, không tạo lời khuyên y tế.</p></div></section><section class="search-zone">'+form+'<a class="clear-filter" href="/tim-kiem">Xóa bộ lọc</a> · <a href="/kham-pha">Khám phá theo chặng</a><p class="muted">Không nhập tên, hồ sơ sức khỏe hay thông tin cá nhân vào tìm kiếm. Từ khóa có thể lưu trong lịch sử trình duyệt.</p></section><div class="results-heading"><h2>Kết quả tìm kiếm</h2><p role="status" data-search-count="'+matches.length+'" data-search-total="'+index.length+'">'+matches.length+' / '+index.length+' nội dung</p></div>'+(matches.length?'<ul class="saved-list unified-results">'+rows+'</ul>':'<section class="warn" data-search-empty><h2>Không tìm thấy nội dung phù hợp</h2><p>Thử từ khóa ngắn hơn hoặc xóa bộ lọc.</p><a href="/tim-kiem">Xem tất cả nội dung</a></section>')+'<p class="reader-notice">Nội dung chưa được thẩm định chuyên môn; không thay thế tư vấn y tế hoặc chuyên môn.</p>');
 }catch(error){console.warn("UNIFIED_SEARCH_UNAVAILABLE",error instanceof Error?error.name:"unknown");return connectionPending(request);}
}
