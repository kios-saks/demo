import {detailMeta,detailRelated,detailToc,detailWrap,detailShare} from "../../../lib/knowledge-detail-ui";
import {openDevReader} from "../../../lib/open-dev-reader";
import {dynamicMediaEnabled,activeMedia,articleMediaUrl,catalogMediaUrl} from "../../../lib/dynamic-media";
import {readingVisual} from "../../../lib/reading-visual";
import {escapeHtml,htmlResponse,connectionPending,getDevArticle,requirePreviewLogin,safeMediaPath} from "../../../lib/dev-preview";
import {articleCover,coverAlt,coverCaption,inlineAsset,inlineLifestyle} from "../../../lib/editorial-media";
import {inlineContextIllustration} from "../../../lib/contextual-illustrations";
import guideDataset from "../../../../../packages/content/mock/stage-guides.json";
import contentSnapshot from "../../../../../packages/content/articles.json";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}):Promise<Response>{
 const denied=requirePreviewLogin(request);if(denied)return denied;
 try{
   const {slug}=await params;
   const {data:a,source}=await getDevArticle(slug);
   const enabled=dynamicMediaEnabled();
   if(enabled&&source!=="supabase")throw Error("Live article required for dynamic media");
   const media=enabled?await activeMedia(slug):[];
   const dynamicCover=media.find(x=>x.slot==="cover"),dynamicInline=media.find(x=>x.slot==="inline");
   if(enabled&&(!dynamicCover||!dynamicInline||dynamicInline.afterSection===null||a.sections[dynamicInline.afterSection]?.heading!==dynamicInline.anchorHeading))throw Error("Dynamic media anchor mismatch");
   const inline=a.media?.inline||[];
   // Reader copy only: preserve database revisions, exact source links and medical limitations.
   const readerCaption=(value:string)=>value==="Ba gợi ý thực hành (đang biên tập, chưa thẩm định)"?"Ba gợi ý thực hành · Chưa được thẩm định chuyên môn":value;
   const stageGuide=guideDataset.guides.find(g=>g.slug===a.stage);
   const recommendations=contentSnapshot.articles.filter(x=>x.stage===a.stage&&x.slug!==a.slug).slice(0,3);
   const supplemental=stageGuide?
     '<section class="stage-context"><span class="reading-note">NỀN TẢNG CỦA GIAI ĐOẠN</span><h2>Đọc tiếp: '+escapeHtml(stageGuide.headline)+'</h2>'+
     '<p>'+escapeHtml(stageGuide.overview)+'</p><h3>Bạn có thể bắt đầu với</h3><ol class="checklist">'+stageGuide.steps.map(step=>'<li>'+escapeHtml(step)+'</li>').join("")+'</ol>'+
     '<p><a href="/'+encodeURIComponent(a.stage)+'">Xem hướng dẫn giai đoạn, FAQ và nguồn đọc thêm →</a></p></section>':"";
   const related=openDevReader()?detailRelated("legacy",slug):recommendations.length?
     '<section class="related-articles"><h2>Bài khác cùng giai đoạn</h2><ul>'+recommendations.map(r=>
       '<li><a href="/bai-viet/'+encodeURIComponent(r.slug)+'">'+escapeHtml(r.title)+'</a></li>').join("")+'</ul></section>':"";
   const sections=a.sections.map((s,i)=>{
     const visual=inline.filter(v=>v.afterSection===i).map(v=>{
       const asset=inlineAsset(a.slug,v);const path=catalogMediaUrl(asset.src);if(!path)return '';
       return '<figure class="infographic-figure"><img src="'+escapeHtml(path)+'" width="'+asset.width+'" height="'+asset.height+'" loading="lazy" alt="'+escapeHtml(v.alt)+'">'+
         '<figcaption>'+escapeHtml(readerCaption(v.caption))+' · <a href="'+escapeHtml(v.sourceUrl||"#")+'" target="_blank" rel="noopener noreferrer nofollow">Xem nguồn gốc ↗</a></figcaption>'+
         (asset.points?.length?'<details class="infographic-transcript" open><summary>Đọc '+asset.points.length+' gợi ý trong hình dưới dạng văn bản</summary><ol>'+asset.points.map(point=>'<li>'+escapeHtml(point)+'</li>').join("")+'</ol></details>':"")+'</figure>';
     }).join("");
     const photo=enabled?undefined:inlineLifestyle(a.slug,i,s.heading);
     const photoHtml=photo?'<figure class="contextual-photo"><img src="'+escapeHtml(photo.src)+'" width="1200" height="675" loading="lazy" alt="'+escapeHtml(photo.alt)+'"><figcaption>'+escapeHtml(photo.caption||"")+' · Ảnh minh họa tạo bằng AI</figcaption></figure>':"";
     const illustration=enabled||photo?undefined:inlineContextIllustration(a.slug,i,s.heading);
     const illustrationHtml=illustration?'<figure class="contextual-photo contextual-illustration" data-contextual-illustration="'+escapeHtml(a.slug)+'"><img src="'+escapeHtml(illustration.src)+'" width="1200" height="675" loading="lazy" alt="'+escapeHtml(illustration.alt)+'"><figcaption>'+escapeHtml(illustration.caption)+' · Tranh minh họa theo chủ đề; không dùng để chẩn đoán.</figcaption></figure>':"";
     const liveHtml=dynamicInline?.afterSection===i?'<figure class="contextual-photo" data-media-source="supabase" data-media-revision="'+dynamicInline.revision+'" data-contextual-illustration="'+escapeHtml(a.slug)+'"><img src="'+escapeHtml(articleMediaUrl(a.slug,"inline",dynamicInline.revision))+'" width="'+dynamicInline.width+'" height="'+dynamicInline.height+'" loading="lazy" alt="'+escapeHtml(dynamicInline.alt)+'"><figcaption>'+escapeHtml(dynamicInline.caption)+' · Hình minh họa theo chủ đề; chưa thẩm định y khoa.</figcaption></figure>':"";
     const card=readingVisual(a,i);
     const cardHtml=card?'<figure class="reading-visual" data-reading-visual="'+escapeHtml(a.slug)+'">'+card.svg+'<figcaption>Hai đoạn trích từ nội dung bài viết, không phải hướng dẫn độc lập. <a href="#article-sources">Đối chiếu nguồn tham khảo của bài</a>.</figcaption><details class="infographic-transcript"><summary>Đọc nội dung hình dưới dạng văn bản</summary>'+card.points.map(p=>'<p><b>'+escapeHtml(p.heading)+'</b>: '+escapeHtml(p.text)+'</p>').join("")+'</details></figure>':"";
     return '<section id="part-'+i+'"><h2>'+escapeHtml(s.heading)+'</h2>'+s.paragraphs.map(p=>'<p>'+escapeHtml(p)+'</p>').join("")+'</section>'+visual+photoHtml+illustrationHtml+liveHtml+cardHtml;
   }).join("");
   const cover=dynamicCover?articleMediaUrl(a.slug,"cover",dynamicCover.revision):safeMediaPath(articleCover(a.slug,a.media?.cover?.src));
   const heroCover=cover?'<figure class="article-cover"'+(dynamicCover?' data-media-source="supabase" data-media-revision="'+dynamicCover.revision+'"':'')+'><img src="'+escapeHtml(cover)+'" width="'+(dynamicCover?.width||1200)+'" height="'+(dynamicCover?.height||675)+'" alt="'+escapeHtml(dynamicCover?.alt||coverAlt(a.title,a.slug))+'">'+
     '<figcaption>'+escapeHtml(dynamicCover?.caption||coverCaption(a.slug))+'</figcaption></figure>':'';
   const quick=a.media?.highlights?.length?'<div class="quick-card"><h2>Ghi nhớ trong 30 giây</h2><ul>'+
      a.media.highlights.map(v=>'<li>'+escapeHtml(v)+'</li>').join("")+'</ul></div>':'';
   const toc='<nav class="toc" aria-label="Mục lục bài viết"><h2>Trong bài viết này</h2>'+a.sections.map((s,i)=>
     '<a href="#part-'+i+'">'+String(i+1).padStart(2,"0")+' · '+escapeHtml(s.heading)+'</a>').join("")+'</nav>';
   const sources=a.sources.filter(s=>{try{return new URL(s.url).protocol==="https:"}catch{return false}})
       .map((s,i)=>'<li><a href="'+escapeHtml(s.url)+'" target="_blank" rel="noopener noreferrer nofollow">'+
         (i+1)+'. '+escapeHtml(s.name)+' ↗</a></li>').join("");
   const readerHeader='<div class="article-hero" data-current-article="'+escapeHtml(a.slug)+'">'+(openDevReader()?"":'<nav class="reading-breadcrumbs" aria-label="Đường dẫn bài viết"><a href="/thu-vien">← Trở về thư viện</a></nav>')+
     '<span class="pill">KIẾN THỨC CHUYÊN SÂU · '+escapeHtml(stageGuide?.headline||a.stage)+'</span>'+
     '<h1>'+escapeHtml(a.title)+'</h1>'+
     '<p class="reading-lead">'+escapeHtml(a.summary)+'</p>'+
     '<div class="reader-meta"><span>Khoảng '+Number(a.readMinutes||0)+' phút đọc</span><span> · '+a.sections.length+' phần nội dung</span><span> · '+a.sources.length+' nguồn tham khảo</span></div><div class="reader-actions"><button type="button" class="save-button" data-save-slug="'+escapeHtml(a.slug)+'" aria-pressed="false" hidden>Lưu bài</button><button type="button" class="secondary-action" data-share-article hidden>Chia sẻ</button><span data-share-status role="status"></span></div></div>';
   const warning='<div class="warn"'+(openDevReader()?' data-detail-limitation':'')+'><b>Chưa được thẩm định y khoa.</b> Nội dung chỉ để tham khảo, không thay thế chẩn đoán, điều trị hoặc tư vấn từ nhân viên y tế. Khi có dấu hiệu cấp cứu, hãy liên hệ cơ sở y tế ngay.</div>';
   const sharedToc=openDevReader()?detailToc([...a.sections.map((s,i)=>({id:"part-"+i,heading:s.heading})),{id:"article-sources",heading:"Nguồn tham khảo cụ thể"}]):'<div class="desktop-toc">'+toc+'</div><details class="mobile-toc"><summary>Trong bài viết này · '+a.sections.length+' phần</summary>'+toc+'</details>';
   const body=readerHeader+(openDevReader()?'<div class="detail-legacy-meta reader-meta">'+detailMeta("legacy",slug)+'</div>'+detailShare("legacy",slug):"")+warning+
     '<div class="reading-layout"><aside class="reading-sidebar">'+sharedToc+
     '<p>Chọn mục để chuyển tới phần muốn đọc. Các mốc thời gian và hướng dẫn y tế cần đối chiếu với chuyên gia phù hợp.</p></aside>'+
     '<article class="content article-content" aria-label="Nội dung bài viết">'+quick+heroCover+sections+
     supplemental+related+
     '<section id="article-sources"><h2>Nguồn tham khảo cụ thể</h2><div class="sources"><ul>'+sources+'</ul>'+
     '<p class="muted">Tài liệu bên ngoài được dẫn để người đọc đối chiếu; bài viết này là bản tổng hợp độc lập, không phải bản dịch hoặc phát hành bởi đơn vị nguồn.</p></div></section>'+
     '<p><a href="/thu-vien">← Quay lại danh sách toàn bộ bài</a></p></article></div>';
   return htmlResponse(a.title,openDevReader()?detailWrap("legacy",slug,body):body,200,openDevReader()?"detail-v2":undefined);
 }catch{return connectionPending(request);}
}
