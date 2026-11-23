import {escapeHtml,htmlResponse,getDevArticle,requirePreviewLogin,safeMediaPath} from "../../../lib/dev-preview";
import guideDataset from "../../../../../packages/content/mock/stage-guides.json";
import contentSnapshot from "../../../../../packages/content/articles.json";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}):Promise<Response>{
 const denied=requirePreviewLogin(request);if(denied)return denied;
 try{
   const {slug}=await params;
   const {data:a,disclaimer,source}=await getDevArticle(slug);
   const inline=a.media?.inline||[];
   const stageGuide=guideDataset.guides.find(g=>g.slug===a.stage);
   const recommendations=contentSnapshot.articles.filter(x=>x.stage===a.stage&&x.slug!==a.slug).slice(0,3);
   const supplemental=stageGuide?
     '<section class="stage-context"><span class="reading-note">NỀN TẢNG CỦA GIAI ĐOẠN</span><h2>Đọc tiếp: '+escapeHtml(stageGuide.headline)+'</h2>'+
     '<p>'+escapeHtml(stageGuide.overview)+'</p><h3>Bạn có thể bắt đầu với</h3><ol class="checklist">'+stageGuide.steps.map(step=>'<li>'+escapeHtml(step)+'</li>').join("")+'</ol>'+
     '<p><a href="/dev-review?stage='+encodeURIComponent(a.stage)+'">Xem hướng dẫn giai đoạn, FAQ và nguồn đọc thêm →</a></p></section>':"";
   const related=recommendations.length?
     '<section class="related-articles"><h2>Bài khác cùng giai đoạn</h2><ul>'+recommendations.map(r=>
       '<li><a href="/dev-review/'+encodeURIComponent(r.slug)+'">'+escapeHtml(r.title)+'</a></li>').join("")+'</ul></section>':"";
   const sections=a.sections.map((s,i)=>{
     const visual=inline.filter(v=>v.afterSection===i).map(v=>{
       const path=safeMediaPath(v.src);if(!path)return '';
       return '<figure class="infographic-figure"><img src="'+escapeHtml(path)+'" width="1200" height="'+(v.src.startsWith("/media/auto-infographic-")?720:640)+'" loading="lazy" alt="'+escapeHtml(v.alt)+'">'+
         '<figcaption>'+escapeHtml(v.caption)+' · <a href="'+escapeHtml(v.sourceUrl||"#")+'" target="_blank" rel="noopener noreferrer nofollow">Xem nguồn gốc ↗</a></figcaption>'+
         (v.points?.length===3?'<details class="infographic-transcript"><summary>Đọc 3 gợi ý trong hình dưới dạng văn bản</summary><ol>'+v.points.map(point=>'<li>'+escapeHtml(point)+'</li>').join("")+'</ol></details>':"")+'</figure>';
     }).join("");
     return '<section id="part-'+i+'"><h2>'+escapeHtml(s.heading)+'</h2>'+s.paragraphs.map(p=>'<p>'+escapeHtml(p)+'</p>').join("")+'</section>'+visual;
   }).join("");
   const cover=safeMediaPath(a.media?.cover?.src);
   const heroCover=cover?'<figure class="article-cover"><img src="'+escapeHtml(cover)+'" width="1200" height="675" alt="'+escapeHtml(a.media?.cover?.alt)+'">'+
     '<figcaption>'+escapeHtml(a.media?.cover?.caption)+' · Hình minh họa gốc dự án</figcaption></figure>':'';
   const quick=a.media?.highlights?.length?'<div class="quick-card"><h2>Ghi nhớ trong 30 giây</h2><ul>'+
      a.media.highlights.map(v=>'<li>'+escapeHtml(v)+'</li>').join("")+'</ul></div>':'';
   const toc='<nav class="toc" aria-label="Mục lục bài viết"><h2>Trong bài viết này</h2>'+a.sections.map((s,i)=>
     '<a href="#part-'+i+'">'+String(i+1).padStart(2,"0")+' · '+escapeHtml(s.heading)+'</a>').join("")+'</nav>';
   const sources=a.sources.filter(s=>{try{return new URL(s.url).protocol==="https:"}catch{return false}})
       .map((s,i)=>'<li><a href="'+escapeHtml(s.url)+'" target="_blank" rel="noopener noreferrer nofollow">'+
         (i+1)+'. '+escapeHtml(s.name)+' ↗</a></li>').join("");
   const readerHeader='<div class="article-hero"><nav class="reading-breadcrumbs" aria-label="Đường dẫn bài viết">'+
     '<a href="/dev-review">← Trở về thư viện DEV</a></nav>'+
     '<span class="pill">CHƯA DUYỆT CHUYÊN MÔN · '+escapeHtml(a.stage)+'</span>'+
     '<h1>'+escapeHtml(a.title)+'</h1>'+
     '<p class="reading-lead">'+escapeHtml(a.summary)+'</p>'+
     '<div class="reader-meta"><span>Khoảng '+Number(a.readMinutes||0)+' phút đọc</span><span> · '+a.sections.length+' phần nội dung</span><span> · '+a.sources.length+' nguồn tham khảo</span></div></div>';
   const sourceNote=source==="snapshot"?'<div class="warn">Đang hiển thị bản sao DEV đã lưu trên Web; có thể chưa gồm các chỉnh sửa mới nhất từ Supabase.</div>':'';
   const warning='<div class="warn"><b>Nội dung DEV, chưa thẩm định chuyên môn.</b> '+escapeHtml(disclaimer)+'</div>';
   const body=readerHeader+sourceNote+warning+
     '<div class="reading-layout"><aside class="reading-sidebar">'+toc+
     '<p>Chọn mục để chuyển tới phần muốn đọc. Các mốc thời gian và hướng dẫn y tế cần đối chiếu với chuyên gia phù hợp.</p></aside>'+
     '<article class="content article-content" aria-label="Nội dung bài viết">'+heroCover+quick+sections+
     supplemental+related+
     '<section><h2>Nguồn tham khảo cụ thể</h2><div class="sources"><ul>'+sources+'</ul>'+
     '<p class="muted">Tài liệu bên ngoài được dẫn để người đọc đối chiếu; bài viết này là bản tổng hợp độc lập, không phải bản dịch hoặc phát hành bởi đơn vị nguồn.</p></div></section>'+
     '<p><a href="/dev-review">← Quay lại danh sách toàn bộ bài</a></p></article></div>';
   return htmlResponse(a.title,body);
 }catch{return htmlResponse("Chưa tải được bài",'<div class="warn">Bài viết hiện chưa tải được hoặc không tồn tại. <a href="/dev-review">Trở về danh sách.</a></div>',503);}
}
