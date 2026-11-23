import {escapeHtml,htmlResponse,listDevArticles,requirePreviewLogin,safeMediaPath} from "../../lib/dev-preview";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(request:Request):Promise<Response>{
 const denied=requirePreviewLogin(request);if(denied)return denied;
 try{
   const q=(new URL(request.url).searchParams.get("q")||"").trim().slice(0,120);
   const {articles,source}=await listDevArticles();
   const normalized=q.toLocaleLowerCase("vi-VN");
   const list=articles.filter(a=>!q||[a.title,a.summary,a.stage,...a.tags].join(" ").toLocaleLowerCase("vi-VN").includes(normalized));
   const groups=[...new Set(list.map(a=>a.stage))];
   const body='<div class="hero-visual"><div class="hero"><span class="pill">THƯ VIỆN HÀNH TRÌNH MẸ & BÉ</span><h1>Những điều nhỏ,<br>yêu thương lớn.</h1>'+
     '<p>72 bài viết tiếng Việt, chia theo 12 giai đoạn. Bộ hình minh họa đầu tiên đã có mặt trong 6 bài mẫu để bạn thử trải nghiệm đọc mới.</p>'+
     '<div class="stats-mini"><b>72 bài biên tập</b><b>12 chặng phát triển</b><b>6 bài có hình</b></div></div>'+
     '<img src="/media/cover-family-planning.svg" width="1200" height="675" alt="Minh họa gia đình chuẩn bị hành trình làm cha mẹ"></div>'+
     '<div class="warn"><b>CHƯA CÓ CHỨNG NHẬN DUYỆT Y KHOA</b> · Chỉ dùng để biên tập và thử nghiệm. Không sử dụng như hướng dẫn điều trị hoặc tài liệu chính thức của tổ chức được dẫn nguồn.</div>'+
     '<form class="search" method="get"><input name="q" placeholder="Tìm bài viết, chủ đề..." value="'+escapeHtml(q)+'"><button type="submit">Tìm</button></form>'+
     (source==="snapshot"?'<div class="warn"><b>Đang hiển thị bản sao DEV đã lưu trong Web.</b> Backend Supabase có thể đang ngủ hoặc không phản hồi; những chỉnh sửa mới chỉ có trên database sẽ hiện khi kết nối phục hồi.</div>':'<p class="meta">Nội dung đang lấy trực tiếp từ Supabase API.</p>')+
     '<p class="meta">Hiển thị '+list.length+'/'+articles.length+' bài · '+groups.length+' giai đoạn</p>'+
     groups.map(stage=>'<section><h2>'+escapeHtml(stage.replaceAll("-"," "))+'</h2><div class="list">'+
       list.filter(a=>a.stage===stage).map(a=>{const cover=safeMediaPath(a.media?.cover?.src);
       const visual=cover?'<img class="thumb" src="'+escapeHtml(cover)+'" width="1200" height="675" loading="lazy" alt="'+escapeHtml(a.media?.cover?.alt)+'">':
         '<div class="thumb-empty" aria-hidden="true">✿</div>';
       return '<a class="item" href="/dev-review/'+encodeURIComponent(a.slug)+'">'+visual+'<div class="item-content">'+
         '<span class="pill">'+escapeHtml(a.status)+'</span><h3>'+escapeHtml(a.title)+'</h3><p>'+escapeHtml(a.summary)+'</p>'+
         '<p class="meta">Đọc '+a.readMinutes+' phút · Mở bài và nguồn →</p></div></a>';
     }).join("")+'</div></section>').join("");
   return htmlResponse("Thư viện 72 bài dev",body);
 }catch{return htmlResponse("Chưa tải được thư viện",'<div class="warn">Backend đang khởi động hoặc kho dữ liệu chưa khả dụng. Hãy thử tải lại trang sau.</div>',503);}
}
