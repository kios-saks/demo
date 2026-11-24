import {escapeHtml,htmlResponse,listDevArticles,requirePreviewLogin,safeMediaPath} from "../../lib/dev-preview";
import guideDataset from "../../../../packages/content/mock/stage-guides.json";
import deepArticleDataset from "../../../../packages/content/mock/deep-articles.json";
import type {ArticleSummary} from "../../../../packages/data/src/contracts";

export const dynamic="force-dynamic";
export const runtime="nodejs";
const guides=guideDataset.guides;
const deepArticleSlugs=new Set(deepArticleDataset.articles.map(x=>x.slug));
const e=escapeHtml;
function stageLabel(slug:string){return guides.find(g=>g.slug===slug)?.headline||slug.replaceAll("-"," ");}
function media(a:ArticleSummary | undefined){
 const path=safeMediaPath(a?.media?.cover?.src);
 return path?'<img class="thumb" src="'+e(path)+'" alt="'+e(a?.media?.cover?.alt)+'" loading="lazy" width="1200" height="675">':
 '<div class="thumb-empty" aria-hidden="true"></div>';
}
function sourceLink(url:string,label:string){
 if(!/^https:\/\/(www\.)?(who\.int|cdc\.gov|nhs\.uk|unicef\.org)$/.test(new URL(url).origin.replace(/^https:\/\/www\./,"https://")))
  return ""; // Explicitly allow only known external educational publishers in this preview.
 return '<a href="'+e(url)+'" rel="noopener noreferrer nofollow" target="_blank">'+e(label)+' ↗</a>';
}
function guideDetails(slug:string){
 const guide=guides.find(g=>g.slug===slug);
 if(!guide)return "";
 return '<section class="stage-guide" aria-labelledby="stage-guide-heading">'+
  '<span class="eyebrow">LỘ TRÌNH NỘI DUNG THEO GIAI ĐOẠN • BẢN NHÁP</span>'+
  '<h2 id="stage-guide-heading">'+e(guide.headline)+'</h2><p class="guide-intro">'+e(guide.overview)+'</p>'+
  '<h3>4 chủ đề nên tìm hiểu</h3><div class="focus-grid">'+guide.focus.map(([title,detail])=>
    '<div class="focus-item"><h4>'+e(title)+'</h4><p>'+e(detail)+'</p></div>').join("")+'</div>'+
  '<h3>Checklist để bắt đầu</h3><ol class="checklist">'+guide.steps.map(step=>'<li>'+e(step)+'</li>').join("")+'</ol>'+
  '<h3>Một tình huống trong gia đình</h3><p>'+e(guide.example)+'</p>'+
  '<h3>Câu hỏi thường gặp</h3><div class="faq-list">'+guide.faqs.map(([q,a])=>
    '<details><summary>'+e(q)+'</summary><p>'+e(a)+'</p></details>').join("")+'</div>'+
  '<div class="guide-sources"><strong>Tài liệu đọc thêm</strong><p>'+guide.sources.map(([title,url])=>sourceLink(url,title)).filter(Boolean).join(" · ")+'</p>'+
  '<small>Đây là bản biên tập độc lập từ nguồn tham khảo, chưa qua quy trình thẩm định y khoa. Không thay thế tư vấn hoặc điều trị chuyên môn.</small></div>'+
  '</section>';
}
function itemCard(a:ArticleSummary){
 return '<a class="item" href="/dev-review/'+encodeURIComponent(a.slug)+'">'+media(a)+
  '<div class="item-content"><span class="pill">'+(deepArticleSlugs.has(a.slug)?'CHUYÊN SÂU • BẢN NHÁP':'BẢN NHÁP')+'</span>'+
  (a.media?.inline?.length?'<span class="media-count">'+a.media.inline.length+' infographic</span>':'')+
  '<h3>'+e(a.title)+'</h3><p>'+e(a.summary)+'</p>'+
  '<p class="meta">Đọc '+Number(a.readMinutes||0)+' phút · Mở hướng dẫn và nguồn →</p></div></a>';
}
export async function GET(request:Request):Promise<Response>{
 const denied=requirePreviewLogin(request);if(denied)return denied;
 try{
  const params=new URL(request.url).searchParams;
  const q=(params.get("q")||"").trim().slice(0,120);
  const selected=(params.get("stage")||"").trim();
  const active=guides.some(g=>g.slug===selected)?selected:"";
  const {articles,source}=await listDevArticles();
  const norm=q.toLocaleLowerCase("vi-VN");
  const list=articles.filter(a=>(!active||a.stage===active) &&
   (!q||[a.title,a.summary,a.stage,...a.tags].join(" ").toLocaleLowerCase("vi-VN").includes(norm)));
  const byStage=(slug:string)=>articles.filter(a=>a.stage===slug);
  const covered=articles.filter(a=>a.media?.cover).length;
  const infographics=articles.reduce((n,a)=>n+(a.media?.inline?.length||0),0);
  const badges='<div class="stats-mini"><b>'+articles.length+' bài biên tập</b><b>'+guides.length+' giai đoạn có hướng dẫn</b><b>'+
    covered+' ảnh bìa · '+infographics+' infographic</b><b>'+articles.length+' bài chuyên sâu</b></div>';
  const hero='<section class="hero-visual"><div class="hero"><span class="pill">THƯ VIỆN KIẾN THỨC DEV • CÓ MẬT KHẨU</span>'+
    '<h1>Khám phá theo hành trình của gia đình</h1>'+
    '<p>Đọc bản nháp theo 12 giai đoạn, xem checklist, câu hỏi thường gặp và bài viết có dẫn nguồn. Kho này dành riêng cho biên tập và kiểm thử, chưa mở xuất bản.</p>'+
    badges+'</div><img src="/media/cover-family-planning.svg" width="1200" height="675" alt="Minh họa gia đình trước hành trình có em bé"></section>';
  const warning='<div class="warn"><b>ĐANG BIÊN TẬP · CHƯA DUYỆT Y KHOA</b> — nội dung chỉ dùng để thử nghiệm. Không dùng như hướng dẫn điều trị hoặc khuyến nghị cá nhân.</div>';
  const status=source==="snapshot"?'<div class="warn">Đang dùng bản dữ liệu DEV lưu trong Web; dữ liệu CMS mới nhất có thể chưa đồng bộ do Backend tạm không phản hồi.</div>':
   '<p class="meta">Dữ liệu bài viết lấy từ Backend/Supabase.</p>';
  const cards='<nav aria-label="Chọn giai đoạn phát triển" class="stage-tile-grid">'+guides.map(g=>{
   const samples=byStage(g.slug),image=samples.find(a=>a.media?.cover);
   return '<a class="stage-tile'+(active===g.slug?' selected':'')+'" href="/dev-review?stage='+encodeURIComponent(g.slug)+'"'+(active===g.slug?' aria-current="page"':'')+'>'+
    media(image)+'<div><strong>'+e(g.headline)+'</strong><span>'+samples.length+' bài viết · Checklist & FAQ</span></div></a>';
  }).join("")+'</nav>';
  const search='<form class="search" method="get" action="/dev-review">'+
   '<label class="sr-only" for="library-search">Tìm chủ đề trong thư viện DEV</label>'+
   '<input id="library-search" name="q" placeholder="Tìm theo chủ đề, ví dụ: giấc ngủ, ăn dặm..." value="'+e(q)+'" />'+
   '<label class="sr-only" for="stage-select">Lọc giai đoạn</label>'+
   '<select id="stage-select" name="stage"><option value="">Tất cả giai đoạn</option>'+guides.map(g=>
    '<option value="'+e(g.slug)+'"'+(active===g.slug?' selected':'')+'>'+e(g.headline)+'</option>').join("")+'</select>'+
   '<button type="submit">Tìm bài</button></form>';
  const showFeatured=!active&&!q;
  const deepCards=showFeatured?list.filter(a=>deepArticleSlugs.has(a.slug)):[];
  const featured=deepCards.length?'<section class="article-section"><h2>Bài chuyên sâu tiêu biểu</h2>'+
    '<p>Tám bài nổi bật của thư viện 72 bài viết chuyên sâu. Tất cả vẫn đang chờ thẩm định y khoa.</p>'+
    '<div class="list">'+deepCards.map(itemCard).join("")+'</div></section>':"";
  const stageTitle=active?stageLabel(active):"Các bài viết theo giai đoạn";
  const groups=(active?guides.filter(g=>g.slug===active):guides).map(g=>{
   const rows=list.filter(a=>a.stage===g.slug&&(!showFeatured||!deepArticleSlugs.has(a.slug)));
   if(!rows.length)return "";
   return '<section class="article-section"><h2>'+e(g.headline)+' <small>('+rows.length+' bài)</small></h2><div class="list">'+rows.map(itemCard).join("")+'</div></section>';
  }).join("");
  const activeFilter=q||active;
  const reset=activeFilter?'<a class="clear-filter" href="/dev-review">Xóa bộ lọc và xem toàn bộ thư viện</a>':"";
  const output=hero+warning+status+
   '<section class="search-zone" aria-labelledby="search-heading"><h2 id="search-heading" class="search-title">Bạn đang muốn tìm hiểu điều gì?</h2><p class="muted">Tìm theo tên, chủ đề hoặc chọn một giai đoạn phù hợp.</p>'+search+reset+'</section>'+
   featured+
   '<div class="library-intro" id="cac-giai-doan"><h2>Chọn giai đoạn để bắt đầu</h2><p>Mỗi chặng có chủ đề cần biết, các việc gia đình có thể chuẩn bị và bộ câu hỏi để thảo luận.</p></div>'+
   cards+
   '<div class="results-heading"><h2>'+e(stageTitle)+'</h2><p>Hiển thị '+list.length+'/'+articles.length+' bài viết</p></div>'+
   (active?guideDetails(active):"")+
   (list.length?(groups||'<p class="muted">Các bài phù hợp đã nằm trong mục chuyên sâu ở trên.</p>'):'<div class="warn"><b>Không có bài khớp bộ lọc.</b> Hãy thử từ khóa khác hoặc chọn <a href="/dev-review">toàn bộ giai đoạn</a>.</div>');
  return htmlResponse("Thư viện 72 bài viết và hướng dẫn DEV",output);
 }catch(error){
  console.warn("DEV_LIBRARY_RENDER_FAILED",error instanceof Error?error.name:"unknown");
  return htmlResponse("Chưa tải được thư viện",'<div class="warn">Backend đang khởi động hoặc kho dữ liệu chưa khả dụng. Hãy thử tải lại trang sau.</div>',503);
 }
}
