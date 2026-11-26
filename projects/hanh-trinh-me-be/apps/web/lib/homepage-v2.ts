import atlas from "../app/hoc-cung-con/life-course-atlas.json";
import inventory from "../app/hoc-cung-con/life-course-inventory.json";
import bundle from "../app/hoc-cung-con/life-course-articles.json";
import lessons from "../app/hoc-cung-con/learning-catalog.json";
import {buildKnowledgeIndex,knowledgeGroups} from "./knowledge-index.mjs";
import {escapeHtml as e,htmlResponse} from "./dev-preview";
import type {ArticleSummary} from "../../../packages/data/src/contracts";

type Entry={key:string;kind:string;id:string;stage:string;pillar:string;title:string;summary:string;href:string;status:string};
const descriptions:Record<string,string>={prenatal:"Tiền thai · Thai kỳ · Hậu sản",child:"Sơ sinh đến mầm non",school:"Tiểu học đến tuổi teen",young:"Học tập · Tự lập",adult:"Công việc · Gia đình",senior:"Sức khỏe · Sống chủ động"};
const labels:Record<string,string>={legacy:"Bài viết",article:"Cẩm nang",lesson:"Bài học"};
const tasks=[["feeding","Ăn dặm"],["puberty","Dậy thì"],["ai","AI"],["finance","Tài chính"],["aging","Tuổi già"]];
const curated=["legacy:cuoc-tro-chuyen-truoc-khi-co-con","legacy:an-dam-khi-nao-bat-dau","lesson:ai-co-the-sai","lesson:tai-chinh-tu-lap","article:an-uong-khi-di-lam","article:phong-te-nga-tuoi-60-74"];
function card(row:Entry){
 return '<article class="home-v2-card" data-home-entry="'+e(row.key)+'" data-home-entry-stage="'+e(row.stage)+'"><span class="home-v2-kicker">'+e(labels[row.kind]||"Kiến thức")+' · '+e(atlas.stages.find(s=>s.id===row.stage)?.age||"")+'</span><h3><a href="'+e(row.href)+'">'+e(row.title)+'</a></h3><p>'+e(row.summary)+'</p></article>';
}
export function renderHomepageV2(legacy:ArticleSummary[]):Response{
 // Caller enforces exact Combined DEV and canonical live catalog when dynamic media is enabled.
 const rows:Entry[]=buildKnowledgeIndex(inventory,atlas,legacy,bundle.articles,lessons.lessons);
 const groups=knowledgeGroups.map(g=>({...g,rows:rows.filter(x=>g.stages.includes(x.stage))}));
 const groupLinks=groups.map(g=>'<a class="home-v2-group" data-home-group="'+e(g.id)+'" href="/kham-pha?group='+e(g.id)+'"><span class="home-v2-group-name">'+e(g.label)+'</span><span>'+e(descriptions[g.id]||"")+'</span><small>'+g.rows.length+' nội dung <span aria-hidden="true">→</span></small></a>').join("");
 const general=groups.map((g,i)=>{const chosen=g.rows.find(x=>x.key===curated[i])||g.rows[0];if(!chosen)throw Error("Homepage group empty");return card(chosen)}).join("");
 const personalized=groups.map(g=>{
  const picked:Entry[]=[];
  for(const kind of ["legacy","lesson","article"]){const row=g.rows.find(x=>x.kind===kind);if(row)picked.push(row)}
  for(const row of g.rows){if(picked.length>=3)break;if(!picked.some(x=>x.key===row.key))picked.push(row)}
  return '<section data-home-personal-group="'+e(g.id)+'" hidden><h2>Gợi ý cho '+e(g.label)+'</h2><p class="home-v2-muted">Dựa trên nhóm tuổi bạn đã chọn, không dựa trên theo dõi hành vi.</p><div class="home-v2-cards">'+picked.map(card).join("")+'</div><p><a href="/kham-pha?group='+e(g.id)+'">Xem mọi nội dung nhóm này →</a></p></section>';
 }).join("");
 const choices=groups.map(g=>'<option value="'+e(g.id)+'">'+e(g.label)+'</option>').join("");
 const legacyTitles=Object.fromEntries(rows.filter(x=>x.kind==="legacy").map(x=>[x.id,x.title]));
 return htmlResponse("Trang chủ",'<div class="home-v2" data-home-v2="1" data-home-legacy="'+e(JSON.stringify(legacyTitles))+'"><section class="home-v2-intro" aria-labelledby="home-v2-heading"><span class="home-v2-kicker">KIẾN THỨC CHO MỌI CHẶNG ĐỜI</span><h1 id="home-v2-heading">Mỗi chặng đời, mình cùng hiểu hơn.</h1><p>Tìm kiến thức chăm sóc, học tập và sống khỏe theo nhu cầu của bạn.</p><form class="home-v2-search" role="search" method="post" action="/api/dev-search" data-private-search><label class="sr-only" for="home-v2-q">Tìm kiếm kiến thức</label><input id="home-v2-q" type="search" name="q" maxlength="240" autocomplete="off" placeholder="Bạn muốn tìm hiểu điều gì?"><button type="submit">Tìm kiếm</button></form><p class="home-v2-muted home-v2-hint">Tìm trong '+rows.length+' nội dung. Không nhập thông tin cá nhân.</p></section>'+
 '<section class="home-v2-age" aria-labelledby="home-v2-age-heading"><div class="home-v2-section-head"><h2 id="home-v2-age-heading">Bạn quan tâm chặng nào?</h2><a href="/kham-pha">Khám phá A–Z →</a></div><div class="home-v2-groups">'+groupLinks+'</div></section>'+
 '<section class="home-v2-topics" aria-labelledby="home-v2-topic-heading"><h2 id="home-v2-topic-heading">Tìm nhanh theo nhu cầu</h2><div class="home-v2-chips">'+tasks.map(([id,title])=>'<a data-home-topic="'+id+'" href="/tim-kiem#q='+encodeURIComponent(title)+'">'+e(title)+'</a>').join("")+'</div></section>'+
 '<section class="home-v2-personal" aria-labelledby="home-v2-personal-heading"><h2 id="home-v2-personal-heading">Cá nhân hóa theo lựa chọn của bạn</h2><p>Chỉ lưu nhóm quan tâm trên trình duyệt này khi bạn chủ động bấm lưu. Không cần đăng nhập, không đồng bộ dữ liệu.</p><div class="home-v2-controls"><label for="home-v2-group">Nhóm quan tâm</label><select id="home-v2-group" data-home-group-select><option value="">Chưa chọn</option>'+choices+'</select><button type="button" data-home-save hidden>Lưu lựa chọn</button><button type="button" data-home-reset hidden>Xóa lựa chọn</button></div><p role="status" data-home-status data-local-status></p><label class="home-v2-history"><input type="checkbox" data-history-opt-in disabled> Lưu lịch sử đọc bài viết trên thiết bị này (tùy chọn)</label><p class="home-v2-muted">Tiếp tục đọc hiện hỗ trợ bài viết mẹ và bé. <a href="/da-luu">Quản lý và xóa dữ liệu đọc</a>.</p><noscript><p>Bật JavaScript nếu muốn lưu lựa chọn hoặc mở tìm kiếm từ lối tìm nhanh.</p></noscript></section>'+
 '<section class="home-v2-recent" data-home-recent hidden><h2>Tiếp tục đọc</h2><a href="/thu-vien"></a></section>'+
 '<section data-home-general><div class="home-v2-section-head"><h2>Gợi ý đọc theo chặng đời</h2><a href="/kham-pha">Xem tất cả →</a></div><p class="home-v2-muted">Chọn từ thư viện hiện có, mỗi nhóm một nội dung. Không phải bảng xếp hạng theo lượt xem.</p><div class="home-v2-cards">'+general+'</div></section>'+personalized+
 '<section class="home-v2-links"><a href="/hanh-trinh">Hành trình và checklist →</a><a href="/da-luu">Kho bài đã lưu →</a><a href="/thu-vien">Thư viện mẹ và bé →</a><a href="/nguon-tham-khao">Nguồn tham khảo →</a></section><p class="reader-notice">Nội dung đang biên tập, chưa được thẩm định chuyên môn; chỉ để tham khảo, không thay thế tư vấn y tế hoặc chuyên môn.</p></div>',200,"home-v2");
}
