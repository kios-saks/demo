import {escapeHtml,htmlResponse,getDevArticle,requirePreviewLogin} from "../../../lib/dev-preview";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}):Promise<Response>{
 const denied=requirePreviewLogin(request);if(denied)return denied;
 try{
   const {slug}=await params;
   const {data:a,disclaimer}=await getDevArticle(slug);
   const sections=a.sections.map(s=>'<section><h2>'+escapeHtml(s.heading)+'</h2>'+
      s.paragraphs.map(p=>'<p>'+escapeHtml(p)+'</p>').join("")+'</section>').join("");
   const sources=a.sources.filter(s=>{try{return new URL(s.url).protocol==="https:"}catch{return false}})
       .map((s,i)=>'<li><a href="'+escapeHtml(s.url)+'" target="_blank" rel="noopener noreferrer nofollow">'+
         (i+1)+'. '+escapeHtml(s.name)+' ↗</a></li>').join("");
   const body='<div class="hero content"><p><a href="/dev-review">← Về thư viện dev</a></p>'+
    '<span class="pill">'+escapeHtml(a.status)+' · '+escapeHtml(a.stage)+'</span><h1>'+escapeHtml(a.title)+'</h1>'+
    '<p style="font-size:18px">'+escapeHtml(a.summary)+'</p><p class="meta">Khoảng '+a.readMinutes+' phút đọc</p></div>'+
    '<div class="warn"><b>Nội dung dev, chưa thẩm định chuyên môn.</b> '+escapeHtml(disclaimer)+'</div>'+
    '<article class="content">'+sections+
    '<section><h2>Nguồn tham khảo cụ thể</h2><div class="sources"><ul>'+sources+'</ul>'+
    '<p class="muted">Tài liệu bên ngoài được dẫn để người đọc đối chiếu; bài viết này là bản tổng hợp độc lập, không phải bản dịch hoặc phát hành bởi đơn vị nguồn.</p></div></section>'+
    '<p><a href="/dev-review">← Quay lại danh sách toàn bộ bài</a></p></article>';
   return htmlResponse(a.title,body);
 }catch{return htmlResponse("Chưa tải được bài",'<div class="warn">Bài viết hiện chưa tải được hoặc không tồn tại. <a href="/dev-review">Trở về danh sách.</a></div>',503);}
}
