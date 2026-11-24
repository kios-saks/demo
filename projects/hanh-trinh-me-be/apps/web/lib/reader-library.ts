import {escapeHtml as e,htmlResponse,listDevArticles,requirePreviewLogin,safeMediaPath} from "./dev-preview";
import {stageGroups,stageOptions,readerTopics,normalizeSearch} from "./reader-navigation";
import {editorialHero,groupVisual,stageVisual,articleCover,coverAlt} from "./editorial-media";
import guidesData from "../../../packages/content/mock/stage-guides.json";
import deepData from "../../../packages/content/mock/deep-articles.json";
import type {ArticleSummary} from "../../../packages/data/src/contracts";
const guides=guidesData.guides;
const featuredSlugs=new Set(deepData.articles.map(x=>x.slug));
const stageName=(slug:string)=>stageOptions.find(([key])=>key===slug)?.[1]||slug;
const href=(slug:string)=>"/bai-viet/"+encodeURIComponent(slug);
const stageHref=(slug:string)=>"/"+encodeURIComponent(slug);
const image=(src:string|undefined,alt:string,cls="thumb",priority=false)=>{
 const path=safeMediaPath(src);
 return path?'<img class="'+cls+'" src="'+e(path)+'" alt="'+e(alt)+'" width="1200" height="675" '+(priority?'fetchpriority="high"':'loading="lazy"')+'>':'<div class="thumb-empty" aria-hidden="true"></div>';
};
function sourceLink(url:string,title:string){
 try{if(!/^https:\/\/(www\.)?(who\.int|cdc\.gov|nhs\.uk|unicef\.org)$/.test(new URL(url).origin))return "";}catch{return "";}
 return '<a href="'+e(url)+'" rel="noopener noreferrer nofollow" target="_blank">'+e(title)+' ↗</a>';
}
function itemCard(a:ArticleSummary){
 return '<div class="item" data-article-card="'+e(a.slug)+'"><a class="card-link" href="'+href(a.slug)+'">'+image(articleCover(a.slug,a.media?.cover?.src),coverAlt(a.title))+
 '<div class="item-content"><span class="pill">'+e(stageName(a.stage))+' · CHUYÊN SÂU</span><h3>'+e(a.title)+'</h3><p>'+e(a.summary)+'</p><p class="meta">'+Number(a.readMinutes||0)+' phút đọc · Đọc bài →</p></div></a>'+
 '<div class="card-actions"><button type="button" class="save-button" data-save-slug="'+e(a.slug)+'" aria-pressed="false" hidden>Lưu bài</button></div></div>';
}
function stageGroupsHtml(){
 return '<div class="home-stage-groups stage-tile-grid">'+stageGroups.map(g=>'<details class="stage-group" data-stage-group="'+e(g.image)+'"><summary>'+
 image(groupVisual(g.image),g.title,"group-image")+'<span class="group-copy"><strong>'+e(g.title)+'</strong><small>'+e(g.description)+'</small><span class="group-arrow" aria-hidden="true">⌄</span></span></summary>'+
 '<div class="stage-links">'+g.stages.map(([slug,title])=>'<a data-stage-link="'+e(slug)+'" href="'+stageHref(slug)+'">'+e(title)+' <span aria-hidden="true">→</span></a>').join("")+'</div></details>').join("")+'</div>';
}
function searchForm(q="",stage="",withStage=false){
 return '<form class="search" role="search" method="get" action="/tim-kiem"><label class="sr-only" for="library-search">Tìm kiếm kiến thức</label><input id="library-search" name="q" type="search" placeholder="Bạn muốn tìm hiểu điều gì?" value="'+e(q)+'" maxlength="120" autocomplete="off">'+
 (withStage?'<label class="sr-only" for="stage-select">Lọc giai đoạn</label><select id="stage-select" name="stage"><option value="">Tất cả giai đoạn</option>'+stageOptions.map(([slug,title])=>'<option value="'+e(slug)+'"'+(stage===slug?' selected':'')+'>'+e(title)+'</option>').join("")+'</select>':'')+
 '<button type="submit">Tìm kiếm</button></form>';
}
function topicChips(){
 return '<div class="topic-chips">'+readerTopics.map(t=>'<a href="/tim-kiem?q='+encodeURIComponent(t)+'">'+e(t)+'</a>').join("")+'</div>';
}
const notice='<p class="reader-notice"><strong>Lưu ý:</strong> Nội dung chưa được thẩm định y khoa, chỉ để tham khảo, không thay thế tư vấn chuyên môn.</p>';
function journeyPicker(){
 return '<section class="journey-banner" aria-labelledby="journey-heading"><div><h2 id="journey-heading">Hành trình của gia đình bạn</h2><p data-journey-description>Chọn chặng bạn quan tâm để tìm kiến thức phù hợp hơn.</p><a class="text-link" data-journey-link href="/hanh-trinh">Xem hành trình →</a><a data-recent-link class="text-link" href="/hanh-trinh" hidden>Tiếp tục đọc →</a></div><div class="journey-picker"><label for="journey-choice">Giai đoạn quan tâm</label><select id="journey-choice" data-journey-select><option value="">Chọn giai đoạn</option>'+stageOptions.map(([slug,title])=>'<option value="'+e(slug)+'">'+e(title)+'</option>').join("")+'</select><button class="primary-action" type="button" data-journey-save hidden>Lưu lựa chọn</button><span role="status" data-journey-status></span></div></section>';
}
function home(articles:ArticleSummary[]){
 const featured=stageGroups.map(g=>articles.find(a=>a.stage===g.image&&featuredSlugs.has(a.slug))||articles.find(a=>a.stage===g.image)).filter((a):a is ArticleSummary=>Boolean(a)).slice(0,6);
 return '<section class="hero-visual home-hero"><div class="hero"><span class="eyebrow">ĐỒNG HÀNH CÙNG GIA ĐÌNH</span><h1>Mỗi chặng lớn lên, <em>mình cùng hiểu hơn.</em></h1><p>Kiến thức từ khi chuẩn bị mang thai đến lúc con trưởng thành. Tìm đúng chủ đề, đúng giai đoạn, theo nhịp riêng của gia đình.</p><div class="search-zone">'+searchForm()+'</div><a class="primary-action" href="#cac-giai-doan">Khám phá hành trình →</a></div>'+image(editorialHero,"Tranh minh họa gia đình cùng nhau đọc và trò chuyện","home-hero-image",true)+'</section>'+
 journeyPicker()+'<section class="home-section" id="cac-giai-doan"><div class="section-head"><div><span class="eyebrow">CHỌN ĐIỂM BẮT ĐẦU</span><h2>Khám phá theo hành trình</h2><p>6 nhóm lớn, 12 chặng chi tiết để bạn tìm đúng nội dung.</p></div><a class="text-link" href="/thu-vien">Xem toàn bộ thư viện →</a></div>'+stageGroupsHtml()+'</section>'+
 '<section class="home-section topic-panel"><h2>Bạn đang quan tâm điều gì?</h2>'+topicChips()+'</section>'+
 '<section class="home-section"><div class="section-head"><div><span class="eyebrow">ĐỌC VÀ HIỂU HƠN</span><h2>Kiến thức hữu ích</h2><p>Những bài viết được chọn từ các chặng của gia đình.</p></div><a class="text-link" href="/thu-vien">Tất cả bài viết →</a></div><div class="list">'+featured.map(itemCard).join("")+'</div></section>'+
 '<section class="home-section ecosystem-links"><a href="/hanh-trinh"><strong>Hành trình và checklist</strong><span>Chọn chặng và xem việc cần chuẩn bị →</span></a><a href="/da-luu"><strong>Kho kiến thức của tôi</strong><span>Mở những bài đã lưu →</span></a><a href="/nguon-tham-khao"><strong>Nguồn tham khảo</strong><span>Đối chiếu tài liệu gốc →</span></a></section>'+notice;
}
function guideDetails(slug:string){
 const guide=guides.find(g=>g.slug===slug);if(!guide)return "";
 return '<section class="stage-guide" aria-labelledby="stage-guide-heading"><span class="eyebrow">LỘ TRÌNH NỘI DUNG THEO GIAI ĐOẠN</span><h2 id="stage-guide-heading">'+e(guide.headline)+'</h2><p class="guide-intro">'+e(guide.overview)+'</p><h3>4 chủ đề nên tìm hiểu</h3><div class="focus-grid">'+guide.focus.map(([title,detail])=>'<div class="focus-item"><h4>'+e(title)+'</h4><p>'+e(detail)+'</p></div>').join("")+'</div>'+
 '<h3>Checklist để bắt đầu</h3><p class="muted">Đánh dấu những việc đã chuẩn bị. Trạng thái chỉ lưu trên trình duyệt này.</p><ol class="checklist interactive-checklist">'+guide.steps.map((step,i)=>'<li><label><input type="checkbox" data-checklist-key="'+e(slug)+"-"+i+'" disabled><span>'+e(step)+'</span></label></li>').join("")+'</ol><button type="button" class="secondary-action" data-checklist-reset="'+e(slug)+'" hidden>Đặt lại checklist</button>'+
 '<h3>Một tình huống trong gia đình</h3><p>'+e(guide.example)+'</p><h3>Câu hỏi thường gặp</h3><div class="faq-list">'+guide.faqs.map(([q,a])=>'<details><summary>'+e(q)+'</summary><p>'+e(a)+'</p></details>').join("")+'</div>'+
 '<div class="guide-sources"><strong>Tài liệu đọc thêm</strong><p>'+guide.sources.map(([title,url])=>sourceLink(url,title)).filter(Boolean).join(" · ")+'</p><small>Nội dung biên tập độc lập, chưa qua thẩm định y khoa.</small></div></section>';
}
function savedList(articles:ArticleSummary[],kind:"saved"|"history"){
 return '<div data-'+kind+'-list><p data-'+kind+'-empty class="muted">Chưa có bài '+(kind==="saved"?"đã lưu":"đọc gần đây")+'.</p><ul class="saved-list">'+articles.map(a=>'<li data-'+kind+'-item="'+e(a.slug)+'" hidden><a href="'+href(a.slug)+'">'+e(a.title)+'</a><small>'+e(stageName(a.stage))+' · '+Number(a.readMinutes||0)+' phút</small>'+(kind==="saved"?'<button type="button" class="save-button" data-save-slug="'+e(a.slug)+'" aria-pressed="false" hidden>Lưu bài</button>':'')+'</li>').join("")+'</ul></div>';
}
function personal(articles:ArticleSummary[],mode:string){
 const isSaved=mode==="saved";
 return '<section class="personal-head"><span class="eyebrow">KHÔNG GIAN CỦA GIA ĐÌNH</span><h1>'+(isSaved?"Kho kiến thức của tôi":"Hành trình của tôi")+'</h1><p class="muted">Các lựa chọn chỉ lưu trên trình duyệt này. Không cần hồ sơ trẻ hoặc tài khoản. Bạn có thể xóa khi dùng thiết bị chung.</p></section>'+
 (isSaved?'<section class="stage-guide"><h2>Bài đã lưu</h2>'+savedList(articles,"saved")+'<a class="primary-action" href="/thu-vien">Khám phá bài viết →</a></section>':journeyPicker()+'<section class="stage-guide"><h2>Checklist theo giai đoạn</h2><p>Chọn một chặng để xem hướng dẫn và đánh dấu các việc đã chuẩn bị.</p>'+stageGroupsHtml()+'</section><section class="stage-guide"><h2>Đọc tiếp</h2><label class="local-option"><input type="checkbox" data-history-opt-in disabled> Lưu lịch sử đọc trên thiết bị này</label>'+savedList(articles,"history")+'<button class="secondary-action" type="button" data-clear-history hidden>Xóa lịch sử đọc</button></section>')+
 '<section class="privacy-controls"><button type="button" class="secondary-action" data-clear-reader hidden>Xóa toàn bộ dữ liệu cá nhân hóa trên thiết bị</button><p role="status" data-local-status></p></section>';
}
type ReaderOptions={mode?:"home"|"library"|"search"|"saved"|"journey"|"stage";stage?:string};
export async function renderReaderLibrary(request:Request,options:ReaderOptions={}):Promise<Response>{
 const denied=requirePreviewLogin(request);if(denied)return denied;
 try{
  const params=new URL(request.url).searchParams;
  const mode=options.mode||"library";
  const q=(params.get("q")||"").trim().slice(0,120);
  const selected=options.stage||(params.get("stage")||"").trim();
  const active=guides.some(g=>g.slug===selected)?selected:"";
  if(mode==="stage"&&!active)return htmlResponse("Không tìm thấy giai đoạn",'<p>Giai đoạn không tồn tại. <a href="/thu-vien">Về thư viện</a></p>',404);
  const {articles}=await listDevArticles();
  if(mode==="home")return htmlResponse("Trang chủ",home(articles));
  if(mode==="saved"||mode==="journey")return htmlResponse(mode==="saved"?"Đã lưu":"Hành trình của tôi",personal(articles,mode));
  const norm=normalizeSearch(q);
  const list=articles.filter(a=>(!active||a.stage===active)&&(!norm||norm.split(" ").every(word=>normalizeSearch([a.title,a.summary,stageName(a.stage),...a.tags].join(" ")).includes(word))));
  const guide=guides.find(g=>g.slug===active);
  const isCatalog=!active&&!q&&mode==="library";
  const hero=isCatalog?'<section class="hero-visual catalog-hero"><div class="hero"><span class="eyebrow">THƯ VIỆN KIẾN THỨC</span><h1>Khám phá theo hành trình của gia đình</h1><p>'+articles.length+' bài biên tập · '+articles.length+' bài chuyên sâu · '+guides.length+' giai đoạn</p></div>'+image(editorialHero,"Minh họa gia đình","catalog-image",true)+'</section>':
   '<section class="compact-head'+(guide?' editorial-stage-head':'')+'"><div><nav class="reading-breadcrumbs" aria-label="Đường dẫn"><a href="/">Trang chủ</a> / <a href="/thu-vien">Thư viện</a></nav><h1>'+e(guide?stageName(active):"Tìm kiếm kiến thức")+'</h1>'+(guide?'<p>'+e(guide.overview)+'</p>':'<p>Tìm theo chủ đề hoặc giai đoạn, có dấu hoặc không dấu.</p>')+'</div>'+(guide?image(stageVisual(active),"Tranh minh họa giai đoạn "+stageName(active),"editorial-stage-image",true):"")+'</section>';
  const deepCards=isCatalog?list.filter(a=>featuredSlugs.has(a.slug)):[];
  const featured=deepCards.length?'<section class="article-section"><h2>Bài chuyên sâu tiêu biểu</h2><div class="list">'+deepCards.map(itemCard).join("")+'</div></section>':"";
  const results=isCatalog?guides.map(g=>{const rows=list.filter(a=>a.stage===g.slug&&!featuredSlugs.has(a.slug));return rows.length?'<section class="article-section"><h2>'+e(g.headline)+' <small>('+rows.length+' bài)</small></h2><div class="list">'+rows.map(itemCard).join("")+'</div></section>':"";}).join(""):'<div class="list">'+list.map(itemCard).join("")+'</div>';
  const body=hero+'<section class="search-zone" aria-labelledby="search-heading"><h2 id="search-heading" class="search-title">Bạn đang muốn tìm hiểu điều gì?</h2>'+searchForm(q,active,true)+(q||active?'<a class="clear-filter" href="/thu-vien">Xóa bộ lọc</a>':"")+'</section>'+
   (isCatalog?'<section class="home-section" id="cac-giai-doan"><h2>Chọn giai đoạn để bắt đầu</h2>'+stageGroupsHtml()+'</section>':"")+
   '<div class="results-heading"><h2>'+e(active?"Bài viết của giai đoạn":q?"Kết quả tìm kiếm":"Các bài viết theo giai đoạn")+'</h2><p role="status">Hiển thị '+list.length+'/'+articles.length+' bài viết</p></div>'+
   featured+(list.length?results:'<div class="warn"><b>Không có bài khớp bộ lọc.</b> Thử từ khóa khác hoặc xem <a href="/thu-vien">toàn bộ thư viện</a>.</div>')+
   (active?guideDetails(active):"")+notice;
  return htmlResponse(guide?stageName(active):"Thư viện kiến thức gia đình",body);
 }catch(error){console.warn("DEV_LIBRARY_RENDER_FAILED",error instanceof Error?error.name:"unknown");return htmlResponse("Chưa tải được thư viện",'<p>Chưa tải được thư viện. Vui lòng thử lại.</p>',503);}
}
