import atlas from "../app/hoc-cung-con/life-course-atlas.json";
import inventory from "../app/hoc-cung-con/life-course-inventory.json";
import bundle from "../app/hoc-cung-con/life-course-articles.json";
import lessons from "../app/hoc-cung-con/learning-catalog.json";
import guides from "../../../packages/content/mock/stage-guides.json";
import {buildKnowledgeIndex,knowledgeGroups} from "./knowledge-index.mjs";
import {escapeHtml as e} from "./dev-preview";
import {bookmarkButton} from "./bookmark-ui";
import type {ArticleSummary} from "../../../packages/data/src/contracts";
const rows=(legacy:ArticleSummary[])=>buildKnowledgeIndex(inventory,atlas,legacy,bundle.articles,lessons.lessons);
const labels:Record<string,string>={legacy:"Bài viết",article:"Cẩm nang",lesson:"Bài học"};
export const legacyMap:Record<string,string[]>={};
for(const ref of inventory.refs){if(ref.kind==="legacy"&&ref.originalStage){const values=legacyMap[ref.originalStage]??=[];if(!values.includes(ref.stage))values.push(ref.stage);}}
export const journeyCatalog=JSON.stringify({stages:atlas.stages.map(s=>s.id),topics:atlas.pillars.map(p=>p.id),legacyMap,groupMap:Object.fromEntries(knowledgeGroups.map(g=>[g.id,g.stages])),checkKeys:guides.guides.flatMap(g=>g.steps.map((_,i)=>g.slug+"-"+i))});
export function journeyV3(legacy:ArticleSummary[]){
 const entries=rows(legacy);
 const choices=atlas.stages.map(s=>'<label class="journey-choice"><input type="checkbox" data-interest-stage="'+e(s.id)+'" disabled><span><strong>'+e(s.age)+'</strong><small>'+e(s.title)+'</small></span></label>').join("");
 const plans=atlas.stages.map(s=>{
  const matching=guides.guides.filter(g=>legacyMap[g.slug]?.includes(s.id));
  const checks=matching.map(g=>'<section class="journey-check-group" data-guide-slug="'+e(g.slug)+'"><h4>'+e(g.headline)+'</h4>'+(legacyMap[g.slug].length>1?'<p class="muted">Checklist chung cho 12–17 tuổi; tiến độ dùng chung giữa hai chặng.</p>':"")+'<p role="status" data-guide-progress>0/'+g.steps.length+' việc đã đánh dấu</p><ol class="checklist interactive-checklist">'+g.steps.map((step,i)=>'<li><label><input type="checkbox" data-checklist-key="'+e(g.slug+"-"+i)+'" disabled><span>'+e(step)+'</span></label></li>').join("")+'</ol><button class="secondary-action" type="button" data-checklist-reset="'+e(g.slug)+'" hidden>Đặt lại checklist</button></section>').join("");
  const candidates=entries.filter(x=>x.stage===s.id).map(x=>'<li data-journey-recommend="'+e(x.key)+'" data-recommend-topic="'+e(x.pillar)+'" hidden><a href="'+e(x.href+"/doc")+'">'+e(x.title)+'</a><small>'+e(labels[x.kind])+' · '+e(atlas.pillars.find(p=>p.id===x.pillar)?.title||"")+'</small>'+bookmarkButton(x.kind,x.id)+'</li>').join("");
  return '<section class="stage-guide journey-stage" data-interest-plan="'+e(s.id)+'" hidden><h3>'+e(s.age)+' · '+e(s.title)+'</h3><h4>Gợi ý kiến thức</h4><ul class="saved-list" data-journey-recommend-list>'+candidates+'</ul><p data-recommend-empty hidden>Chưa có nội dung phù hợp với chủ đề này.</p><p><a href="/kham-pha?stage='+e(s.id)+'">Xem tất cả kiến thức của chặng →</a></p><h4>Checklist hiện có</h4>'+(checks||'<p class="muted" data-no-checklist>Chặng này chưa có checklist đã biên tập. Bạn có thể đọc kiến thức và tự chọn việc phù hợp; không có lịch hay nhiệm vụ tự động.</p>')+'</section>';
 }).join("");
 return '<div data-journey-panel="1"><section class="stage-guide journey-chooser"><h2>Những chặng bạn quan tâm</h2><p>Chọn 0–12 chặng để tìm kiến thức. Đây là sở thích đọc, không phải tuổi hay hồ sơ thật của thành viên gia đình.</p><p class="muted" data-interest-count role="status">Đang đọc lựa chọn trên thiết bị…</p><div class="journey-choices">'+choices+'</div><div class="journey-controls"><button class="primary-action" data-interest-save type="button" disabled>Lưu lựa chọn</button><button class="secondary-action" data-interest-clear type="button" disabled>Xóa lựa chọn</button></div><p data-journey-status role="status"></p><noscript><p>Bật JavaScript để sử dụng hành trình trên thiết bị.</p></noscript></section><section class="journey-recommend-head"><h2>Kiến thức và checklist theo chặng</h2><label for="journey-topic">Chủ đề gợi ý</label><select id="journey-topic" data-journey-topic disabled><option value="">Mọi chủ đề</option>'+atlas.pillars.map(p=>'<option value="'+e(p.id)+'">'+e(p.title)+'</option>').join("")+'</select><p class="muted">Tối đa 3 nội dung mỗi chặng, theo thứ tự danh mục và đa dạng chủ đề. Không dựa vào lịch sử hoặc suy đoán tình trạng sức khỏe.</p><p data-interest-empty hidden>Chưa chọn chặng. Chọn và lưu ở trên hoặc <a href="/kham-pha">khám phá tất cả</a>.</p></section>'+plans+'</div>';
}
export function historyPanel(legacy:ArticleSummary[]){
 return '<section class="stage-guide" data-history-panel="1"><h2>Đọc tiếp</h2><label class="local-option"><input type="checkbox" data-history-opt-in disabled> Lưu lịch sử đọc cả 219 nội dung trên thiết bị này (tùy chọn)</label><p data-history-consent-note class="muted"></p><p data-history-status role="status"></p><div data-history-list><p data-history-empty hidden>Chưa có nội dung đọc gần đây.</p><ul class="saved-list">'+rows(legacy).map(x=>'<li data-history-key="'+e(x.key)+'"'+(x.kind==="legacy"?' data-history-item="'+e(x.id)+'"':'')+' hidden><a href="'+e(x.href+"/doc")+'">'+e(x.title)+'</a><small>'+e(labels[x.kind])+'</small></li>').join("")+'</ul></div><button class="secondary-action" type="button" data-history-disable hidden>Tắt lưu lịch sử</button><button class="secondary-action" type="button" data-clear-history hidden>Xóa lịch sử đọc</button></section>';
}
