import assert from "node:assert/strict";
const web="http://127.0.0.1:3000",api="http://127.0.0.1:4000";
async function ready(url){
 for(let n=0;n<100;n++){
   try{const r=await fetch(url,{signal:AbortSignal.timeout(1000)});if(r.ok)return;}catch{}
   await new Promise(r=>setTimeout(r,500));
 }
 throw new Error("Server failed to start: "+url);
}
await ready(api+"/health");
await ready(web+"/");
const health=await (await fetch(api+"/health")).json();
assert.equal(health.provider,"mock");
const stages=await (await fetch(api+"/v1/stages")).json();
assert.equal(stages.data.length,12);
const articleRequest=await fetch(api+"/v1/articles/lam-quen-nhip-sinh-hoat-so-sinh");
assert.equal(articleRequest.status,404,"Production API blocks drafts");
const disclaimer=await fetch(api+"/v1/disclaimer");
assert.equal(disclaimer.status,200);
const homepage=await (await fetch(web+"/")).text();
assert(homepage.includes("Trẻ sơ sinh"),"Web reads stages from API");
assert(!homepage.includes("Làm quen nhịp sinh hoạt của trẻ sơ sinh"),"Web must not render private draft");

assert(homepage.includes("Đang xem bản giới thiệu công khai"),"Home explains why draft articles are hidden");
assert(homepage.includes("/dev-review"),"Home provides a path to the gated development library");
assert(homepage.includes('class="hero-search"'),"Home search is discoverable above the fold");
assert((homepage.match(/class="journey-card"/g)||[]).length===12,"Journey has 12 image-rich selectable stages");
assert(homepage.includes("Đi thẳng đến nội dung chính"),"Keyboard skip link must exist on public Web");

const stage=await fetch(web+"/so-sinh");
assert.equal(stage.status,200);
const detail=await fetch(web+"/bai-viet/lam-quen-nhip-sinh-hoat-so-sinh");
assert.equal(detail.status,404,"Web blocks draft details");
const editorial=await fetch(web+"/bien-tap");
assert.equal(editorial.status,404,"Editorial overview must not be public");
const source=await fetch(web+"/nguon-tham-khao");
assert.equal(source.status,200);
console.log("PASS: Web API mode SSR; production hides all draft content; never falls back to private JSON.");

const ciToken=process.env.CI_DEV_PREVIEW_TOKEN;
assert(ciToken&&ciToken.length>=24,"Only CI can set a development preview token");
const guest=await fetch(web+"/dev-review");
assert.equal(guest.status,401,"Guests cannot view draft library");
const bad=await fetch(web+"/dev-review",{headers:{authorization:"Basic "+Buffer.from("editor:bad").toString("base64")}});
assert.equal(bad.status,401,"Wrong credentials cannot view library");
const publicDraftApi=await fetch(api+"/v1/dev-preview/articles");
assert.equal(publicDraftApi.status,404,"Direct backend preview requires a secret");
const apiDraft=await fetch(api+"/v1/dev-preview/articles?page=1&limit=50",{headers:{"x-preview-token":ciToken}});
assert.equal(apiDraft.status,200);
assert.equal((await apiDraft.json()).meta.total,72);
const headers={authorization:"Basic "+Buffer.from("editor:"+ciToken).toString("base64")};
const overview=await fetch(web+"/dev-review",{headers});
assert.equal(overview.status,200,"Authenticated Web preview should load");
assert.equal(overview.headers.get("x-robots-tag"),"noindex, nofollow, noarchive");
const overviewHtml=await overview.text();
assert(overviewHtml.includes("/media/cover-family-planning.svg"),"Dev library hero has editorial illustration");
assert(overviewHtml.includes('/dev-review-pro.css'),"Private reader loads responsive design stylesheet");
assert(overviewHtml.includes('id="dev-main"'),"Private reader has skip-link target");
assert(overviewHtml.includes('class="thumb"'),"Article cover thumbnails must have responsive CSS hook");
assert(overviewHtml.indexOf('class="search-zone"') < overviewHtml.indexOf('class="stage-tile-grid"'),"Search must appear before 12 stage options");
assert(overviewHtml.includes("72 bài biên tập"),"Dev library displays curated content count");
assert(overviewHtml.includes("72 bài chuyên sâu"),"DEV highlights the full long-form knowledge base");
assert(overviewHtml.includes("Bài chuyên sâu tiêu biểu"),"DEV contains a curated highlighted reading shelf");
assert(overviewHtml.includes("CHUYÊN SÂU • BẢN NHÁP"),"Editorial deep guides retain draft badge");
assert(overviewHtml.includes("/dev-review/ngu-an-toan-cho-tre-so-sinh"),"Indexed source-linked article must appear");
const readerStyles=await fetch(web+"/dev-review-pro.css");
assert.equal(readerStyles.status,200,"Private reader design stylesheet is served");
const readerCss=await readerStyles.text();
assert(readerCss.includes("prefers-reduced-motion"),"Private UI respects reduced-motion preferences");
assert(readerCss.includes("min-height:44px"),"Reader navigation has touch-sized targets");
const detailDev=await fetch(web+"/dev-review/ngu-an-toan-cho-tre-so-sinh",{headers});
assert.equal(detailDev.status,200,"Authenticated dev preview article loads");
const detailBody=await detailDev.text();
assert(detailBody.includes("Giấc ngủ an toàn"));
assert(detailBody.includes("cdc.gov"),"Specific cited source must be rendered");
assert(detailBody.includes('class="reading-layout"'),"Long-form articles need readable grid layout");
assert(detailBody.includes('class="reading-sidebar"'),"Long-form articles need section index");
assert(detailBody.includes('aria-label="Mục lục bài viết"'),"Section navigation needs an accessible name");
assert(detailBody.includes("/media/cover-safe-sleep.svg"),"Article must include its own cover illustration");
assert(detailBody.includes("/media/infographic-safe-sleep.svg"),"Inline cited educational infographic must be rendered");
assert(detailBody.includes("Vì sao môi trường ngủ quan trọng?"),"Source-verified detailed sleep chapter must render");
assert(detailBody.includes("Kiểm tra an toàn trong 30 giây"),"Practical sleep checklist chapter must render");
assert((detailBody.match(/<section id="part-/g)||[]).length>=10,"Expanded article must expose at least 10 reading sections");
assert.equal(detailDev.headers.get("x-robots-tag"),"noindex, nofollow, noarchive");
assert(detailBody.includes("Nội dung dev, chưa thẩm định chuyên môn."));
const newInfographic=await fetch(web+"/dev-review/hen-tu-van-tien-thai",{headers});
assert.equal(newInfographic.status,200,"Source-linked infographic article must be visible to editor");
const infographicHtml=await newInfographic.text();
assert(infographicHtml.includes("/media/auto-infographic-hen-tu-van-tien-thai.svg"),"New inline infographic is rendered");
assert(infographicHtml.includes("Đọc 3 gợi ý trong hình dưới dạng văn bản"),"Mobile-accessible transcript is rendered");
assert(infographicHtml.includes("Ghi lại thuốc và sản phẩm bổ sung"),"Transcript preserves the source-authored brief");
const infographicAsset=await fetch(web+"/media/auto-infographic-hen-tu-van-tien-thai.svg");
assert.equal(infographicAsset.status,200,"Generated SVG must be served by Next.js public assets");
const infographicSvg=await infographicAsset.text();
assert(infographicSvg.startsWith("<svg"),"Infographic must be a valid SVG resource");
assert(infographicSvg.includes("Nguồn đọc thêm:"),"Infographic should disclose source label");


const guidePage=await fetch(web+"/dev-review?stage=so-sinh",{headers});
assert.equal(guidePage.status,200,"Stage guide requires preview authentication");
const guideHtml=await guidePage.text();
assert(guideHtml.includes("Ba tháng đầu đời: an toàn và kết nối"),"Stage overview must be visible");
assert(guideHtml.includes("Checklist để bắt đầu"),"Stage needs practical steps");
assert(guideHtml.includes("Câu hỏi thường gặp"),"Stage needs grounded FAQs");
assert(guideHtml.includes("CDC – Safe Sleep"),"Stage guide links official further reading");
assert(guideHtml.includes("/dev-review/ngu-an-toan-cho-tre-so-sinh"),"Stage filter lists local articles");
assert(!guideHtml.includes("Bài khác cùng giai đoạn"),"Stage listing must remain distinct from article detail");
const guideUnauthorized=await fetch(web+"/dev-review?stage=so-sinh");
assert.equal(guideUnauthorized.status,401,"Stage guides must never be public");
assert(detailBody.includes("Xem hướng dẫn giai đoạn, FAQ và nguồn đọc thêm"),"Article detail should link back to contextual stage guide");
assert(detailBody.includes("Bài khác cùng giai đoạn"),"Article should suggest related reading");

console.log("PASS: password-gated 72-article dev reading room; guest denied, draft API protected, real sources rendered.");
