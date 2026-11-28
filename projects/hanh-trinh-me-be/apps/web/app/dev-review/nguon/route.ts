import {openDevReader} from "../../../lib/open-dev-reader";
import {getWebRepository} from "../../../lib/repository";
import {escapeHtml as e,htmlResponse,requirePreviewLogin} from "../../../lib/dev-preview";
export const dynamic="force-dynamic";
export const runtime="nodejs";
/** DEV-only non-interactive source directory. Public React page is unchanged. */
export async function GET(request:Request):Promise<Response>{
 if(!openDevReader())return new Response("Không tìm thấy trang",{status:404,headers:{"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow, noarchive","Referrer-Policy":"no-referrer"}});
 const denied=requirePreviewLogin(request);if(denied)return denied;
 try{
  const repo=getWebRepository(),stages=await repo.listStages(),requested=new URL(request.url).searchParams.get("stage")||"";
  const stage=stages.some(s=>s.slug===requested)?requested:"";
  const sources=await repo.listSources(stage);
  const cards=sources.map(s=>{
   const url=new URL(s.url);if(!["https:","http:"].includes(url.protocol))throw Error("Invalid source URL");
   return '<article class="item item-content" data-source-id="'+e(s.id)+'"><span class="pill">'+e(s.publisher)+'</span><h3>'+e(s.title)+'</h3><p>Kiểm tra liên kết: '+e(s.accessedAt)+' · Ngôn ngữ: '+e(s.language.toUpperCase())+' · Chưa thẩm định từng luận điểm.</p><a href="'+e(s.url)+'" target="_blank" rel="noopener noreferrer">Xem nguồn chính thức ↗</a></article>';
  }).join("");
  const options=stages.map(s=>'<option value="'+e(s.slug)+'"'+(s.slug===stage?" selected":"")+'>'+e(s.title)+'</option>').join("");
  return htmlResponse("Nguồn tham khảo",'<section data-source-catalog-v2="1"><div class="compact-head"><span class="eyebrow">THƯ VIỆN NGUỒN · TÀI LIỆU THAM KHẢO</span><h1>Nguồn nghiên cứu và tham khảo</h1><p>Khám phá các tài liệu gốc từ tổ chức y tế, giáo dục và cơ quan chuyên môn. Việc dẫn nguồn không có nghĩa các tổ chức này tài trợ hoặc chứng thực Hành Trình Mẹ &amp; Bé. Nội dung sức khỏe trên website chưa được thẩm định y khoa.</p></div><form action="/nguon-tham-khao" method="get" class="search" aria-label="Lọc nguồn"><label for="source-stage">Lọc giai đoạn</label><select id="source-stage" name="stage"><option value="">Mọi giai đoạn</option>'+options+'</select><button type="submit">Lọc nguồn</button></form><p role="status" data-source-count="'+sources.length+'">'+sources.length+' nguồn tham khảo · Liên kết đến tài liệu gốc</p><div class="list">'+cards+'</div><p class="reader-notice">Tài liệu được cung cấp để bạn tìm hiểu và đối chiếu thông tin; không thay thế tư vấn chuyên môn.</p></section>');
 }catch(error){console.warn("DEV_SOURCE_DIRECTORY_UNAVAILABLE",error instanceof Error?error.name:"unknown");return htmlResponse("Nguồn tham khảo",'<section class="warn" role="status"><h1>Chưa thể tải nguồn tham khảo</h1><a href="/nguon-tham-khao">Thử lại</a></section>',503);}
}
