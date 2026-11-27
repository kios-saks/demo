import inventory from "../app/hoc-cung-con/life-course-inventory.json";
import atlas from "../app/hoc-cung-con/life-course-atlas.json";
import bundle from "../app/hoc-cung-con/life-course-articles.json";
import lessons from "../app/hoc-cung-con/learning-catalog.json";
import {buildKnowledgeIndex,type KnowledgeEntry} from "./knowledge-index.mjs";
import {escapeHtml as e} from "./dev-preview";
import type {ArticleSummary} from "../../../packages/data/src/contracts";
const labels:Record<string,string>={legacy:"Bài viết",article:"Cẩm nang",lesson:"Bài học"};
export function bookmarkButton(kind:string,id:string){
 return '<button type="button" class="save-button bookmark-v2-button" data-bookmark-key="'+e(kind+":"+id)+'" aria-pressed="false" hidden>Lưu nội dung</button>';
}
export function bookmarkLibrary(legacy:ArticleSummary[]){
 const rows:KnowledgeEntry[]=buildKnowledgeIndex(inventory,atlas,legacy,bundle.articles,lessons.lessons);
 return '<section class="bookmark-library" data-bookmark-library="1" data-saved-list aria-labelledby="bookmark-heading"><div class="bookmark-heading"><h2 id="bookmark-heading" tabindex="-1">Nội dung đã lưu</h2><p role="status" data-bookmark-count>Đang đọc dữ liệu trên thiết bị…</p></div><p class="muted">Bài lưu chỉ nằm trên trình duyệt này, không đồng bộ tài khoản. Chia sẻ liên kết không chia sẻ kho cá nhân.</p><label for="bookmark-kind">Loại nội dung</label><select id="bookmark-kind" data-bookmark-filter disabled><option value="all">Tất cả</option><option value="legacy">Bài viết</option><option value="article">Cẩm nang</option><option value="lesson">Bài học</option></select><p data-bookmark-status role="status"></p><p data-saved-empty hidden>Chưa có nội dung đã lưu phù hợp.</p><ul class="saved-list bookmark-list">'+rows.map(x=>'<li data-bookmark-item="'+e(x.key)+'"'+(x.kind==="legacy"?' data-saved-item="'+e(x.id)+'"':'')+' hidden><a href="'+e(x.href+"/doc")+'">'+e(x.title)+'</a><small>'+e(labels[x.kind])+' · '+e(atlas.stages.find(s=>s.id===x.stage)?.age||"")+'</small>'+bookmarkButton(x.kind,x.id)+'</li>').join("")+'</ul><a class="primary-action" href="/kham-pha">Khám phá kiến thức →</a><noscript><p>Bật JavaScript để xem và quản lý bài lưu trên thiết bị.</p></noscript></section>';
}
