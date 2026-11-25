import {familyDemoEnabled} from "./family-demo-config";
import {familyWebConfig} from "./family-web-config";
import {readBackend} from "./backend-reader";
import {timingSafeEqual} from "node:crypto";
import {openDevReader} from "./open-dev-reader";
import {hasReaderSession} from "./reader-invite";
import type {Article,ArticleSummary} from "../../../packages/data/src/contracts";
import contentSnapshot from "../../../packages/content/articles.json";

export type PreviewSource = "supabase"|"snapshot";
const snapshotArticles=contentSnapshot.articles as unknown as Article[];
const snapshotDisclaimer=contentSnapshot.disclaimer;

const securityHeaders={
 "Cache-Control":"private, no-store, max-age=0",
 "X-Robots-Tag":"noindex, nofollow, noarchive",
 "Referrer-Policy":"no-referrer",
 "X-Frame-Options":"DENY",
 "Content-Security-Policy":"default-src 'none'; script-src 'self'; img-src 'self'; style-src 'self' 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
};
/** Read-only link access on the designated Combined DEV; all other environments retain the existing credential gate. */
export function requirePreviewLogin(request:Request):Response|null{
 const secret=process.env.DEV_CONTENT_PREVIEW_TOKEN;
 if(!secret||secret.length<24)return new Response("Not found",{status:404,headers:securityHeaders});
 if(openDevReader()&&["GET","HEAD"].includes(request.method))return null;
 if(hasReaderSession(request))return null;
 const expected=Buffer.from("Basic "+Buffer.from("editor:"+secret).toString("base64"));
 const actual=Buffer.from(request.headers.get("authorization")||"");
 if(expected.length===actual.length&&timingSafeEqual(expected,actual))return null;
 return new Response("Không tìm thấy trang",{status:404,headers:securityHeaders});
}
export const escapeHtml=(value:unknown)=>String(value??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]||c));
export function connectionPending(request:Request):Response{
 const url=new URL(request.url);
 const retry=escapeHtml(url.pathname.startsWith("//")?"/":url.pathname+url.search);
 return htmlResponse("Đang kết nối dữ liệu",'<section class="warn" role="status"><h1>Đang kết nối hệ thống</h1><p>Backend có thể đang khởi động. Dữ liệu của bạn vẫn được giữ nguyên. Vui lòng thử lại sau ít giây.</p><p><a href="'+retry+'">Thử kết nối lại</a> · <a href="/">Về trang chủ</a></p></section>',503);
}
export function htmlResponse(title:string,body:string,status=200):Response{
 const html='<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta name="robots" content="noindex,nofollow,noarchive"><title>'+escapeHtml(title)+' · Hành Trình Mẹ & Bé</title>'+
 '<style>:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#fffaf7;color:#352b35;font:15px/1.7 system-ui,-apple-system,sans-serif}a{color:#904564;text-decoration:none}a:hover{text-decoration:underline}.wrap{width:min(1000px,calc(100% - 32px));margin:0 auto}.nav{padding:22px 0;border-bottom:1px solid #f0e3e6}.nav strong{color:#904564}.warn{border:1px solid #f4d7da;border-radius:12px;background:#fff0f1;color:#7d3349;padding:14px 18px;margin:22px 0}.pill{font-size:11px;text-transform:uppercase;letter-spacing:.1em;background:#fdebee;color:#9c496e;padding:5px 9px;border-radius:30px}.hero{padding:35px 0 8px}h1{line-height:1.25;font-size:clamp(27px,4vw,42px);margin-bottom:14px}h2{font-size:22px;margin:33px 0 12px}h3{font-size:17px;margin:8px 0}p{margin:9px 0 15px}small,.muted{color:#746673}.list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:15px}.item{display:block;background:white;border:1px solid #f0e3e6;border-radius:13px;padding:19px;min-height:148px}.item p{color:#72636c;font-size:13px;margin:10px 0 0}.meta{font-size:13px;color:#796b72;margin:12px 0}.content{max-width:780px}.content section{border-top:1px solid #f0e3e6;padding-top:8px}.sources{padding:18px;background:white;border:1px solid #f0e3e6;border-radius:12px;overflow-wrap:anywhere}.sources li{margin:9px 0}.search{display:flex;gap:10px;margin:22px 0 28px}.search input{border:1px solid #e7ced8;border-radius:8px;font:inherit;flex:1;min-width:0;padding:12px}.search button{background:#904564;color:white;border:0;border-radius:8px;padding:10px 18px;font:inherit;cursor:pointer}.footer{padding:35px 0;color:#766870;font-size:12px}</style>'+
 '<style>.hero-visual{display:grid;grid-template-columns:1fr minmax(220px,350px);gap:28px;align-items:center;background:linear-gradient(115deg,#fff8f3,#fce9ed);border-radius:24px;padding:32px;margin:20px 0 24px}.hero-visual .hero{padding:0}.hero-visual img{display:block;width:100%;height:auto;aspect-ratio:auto;object-fit:contain;border-radius:18px;box-shadow:0 16px 35px #5c384c19}.hero-visual h1{margin:10px 0 14px}.hero-visual p{color:#75616c;max-width:540px}.stats-mini{display:flex;gap:10px;flex-wrap:wrap}.stats-mini b{display:inline-flex;align-items:center;gap:8px;background:#fff;border-radius:12px;padding:8px 12px;font-size:13px;color:#9c496e}.list{grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}.item{padding:0;overflow:hidden;box-shadow:0 5px 22px #5e34550c;transition:transform .2s ease,box-shadow .2s ease}.item:hover{transform:translateY(-4px);box-shadow:0 17px 38px #5e345520}.item .thumb{margin:0;display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:contain;background:#f6e8ef}.item .thumb-empty{height:auto;aspect-ratio:16/9;display:grid;place-items:center;background:linear-gradient(145deg,#fff0ee,#f4e8ef);font-size:50px}.item-content{padding:16px 19px 20px}.item-content .pill{font-size:10px}.item-content h3{line-height:1.4}.item-content p{line-height:1.6}.article-cover{margin:22px 0 26px}.article-cover img{width:100%;height:auto;display:block;aspect-ratio:auto;object-fit:contain;border-radius:20px;box-shadow:0 14px 45px #6d556018}.article-cover figcaption,.infographic-figure figcaption{font-size:12px;color:#766772;margin:8px 0 0}.quick-card{border-radius:19px;background:#fdf0ee;border:1px solid #efdadc;padding:20px 22px;margin:24px 0}.quick-card h2{margin:0 0 10px;font-size:19px}.quick-card ul{padding-left:22px;margin:0}.quick-card li{padding:5px 0}.reading-note{font-size:12px;letter-spacing:.05em;color:#8e5370;text-transform:uppercase}.toc{display:flex;flex-wrap:wrap;gap:8px;margin:23px 0}.toc a{border-radius:20px;background:white;border:1px solid #efdde3;padding:6px 12px;font-size:12px}.article-content{max-width:780px}.article-content section p{font-size:15px;line-height:1.95}.infographic-figure{margin:24px 0}.infographic-figure img{width:100%;height:auto;border:1px solid #efdde3;border-radius:16px;display:block;background:white}.article-content .sources h2{margin-top:5px}.item:focus-visible,.toc a:focus-visible{outline:3px solid #924568;outline-offset:3px}@media(max-width:680px){.hero-visual{grid-template-columns:1fr;padding:23px}.hero-visual img{max-height:220px}.hero-visual h1{font-size:30px}.list{grid-template-columns:1fr 1fr;gap:10px}.item .thumb,.item .thumb-empty{height:auto;aspect-ratio:16/9}.item-content{padding:11px}.item-content h3{font-size:14px}.item-content p{font-size:11px}.item-content .meta{font-size:11px}.article-cover img{border-radius:13px}}@media(max-width:390px){.list{grid-template-columns:1fr}}.infographic-transcript{margin:14px 0;padding:12px 18px;border:1px solid #efdde3;background:#fff8f5;border-radius:13px;font-size:14px}.infographic-transcript summary{cursor:pointer;color:#904564;font-weight:700;outline-offset:3px}.infographic-transcript li{margin:8px 0;line-height:1.65}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.stage-tile-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:19px 0 35px}.stage-tile{display:block;min-width:0;border:1px solid #ead8e0;background:white;border-radius:16px;overflow:hidden;transition:box-shadow .2s,transform .2s}.stage-tile:hover{transform:translateY(-2px);box-shadow:0 13px 27px #76546d22;text-decoration:none}.stage-tile.selected{border:2px solid #9c496e;box-shadow:0 5px 20px #9c496e12}.stage-tile img,.stage-tile .thumb-empty{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:contain;background:#fff0ee}.stage-tile>div:last-child{padding:13px}.stage-tile strong{display:block;font-size:13px;line-height:1.45}.stage-tile span{display:block;color:#806d77;font-size:11px;margin-top:7px}.library-intro h2{margin-bottom:5px}.library-intro p{color:#756574;margin-top:0}.search{flex-wrap:wrap;align-items:stretch}.search input{flex:2;min-width:170px}.search select{flex:1;min-width:175px;border:1px solid #e7ced8;border-radius:8px;background:#fff;padding:11px;font:inherit;color:inherit}.results-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid #f0e3e6;margin:26px 0 18px}.results-heading h2{margin:0 0 12px}.results-heading p{color:#766870;font-size:12px}.stage-guide{border:1px solid #efdde3;padding:24px 27px;border-radius:21px;background:#fff;margin:18px 0 38px}.stage-guide h2{font-size:29px;margin:9px 0 10px}.stage-guide h3{font-size:19px;margin:24px 0 12px}.stage-guide .eyebrow{color:#95506d;font-size:11px;font-weight:700;letter-spacing:.08em}.guide-intro{font-size:16px;color:#685565;line-height:1.85}.focus-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.focus-item{padding:16px;border:1px solid #f0e2e7;border-radius:13px;background:#fffcfa}.focus-item h4{font-size:15px;color:#914b69;margin:0 0 7px}.focus-item p{font-size:13px;color:#625660;margin:0;line-height:1.7}.checklist{padding-left:24px}.checklist li{margin:10px 0;line-height:1.75}.faq-list details{border-top:1px solid #eadbe2;padding:12px 0}.faq-list summary{font-weight:700;cursor:pointer;outline-offset:4px}.faq-list details p{font-size:14px;line-height:1.8;margin:9px 0}.guide-sources{margin:23px 0 3px;border-top:1px solid #eadbe2;padding-top:17px}.guide-sources p{line-height:1.8}.guide-sources small{font-size:11px}.media-count{display:inline-block;margin-left:9px;font-size:10px;color:#5e806e;font-weight:700}.stage-tile:focus-visible,.item:focus-visible,.search :focus-visible{outline:3px solid #924568;outline-offset:3px}@media(max-width:930px){.stage-tile-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:660px){.stage-tile-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.stage-tile img{height:97px}.stage-guide{padding:18px 16px}.focus-grid{grid-template-columns:1fr}.results-heading{display:block}.search select,.search input,.search button{width:100%}}@media(max-width:390px){.stage-tile-grid{grid-template-columns:1fr 1fr}.stage-tile strong{font-size:12px}}</style><link rel="stylesheet" href="/dev-review-pro.css"><link rel="stylesheet" href="/reader-ecosystem.css"><script src="/reader-local.js" defer></script></head><body><a class="reader-skip" href="#dev-main">Đi thẳng đến nội dung chính</a><header class="nav"><div class="wrap reader-nav-inner"><a class="reader-brand" href="/"><span class="brand-symbol" aria-hidden="true"><svg viewBox="0 0 32 32" width="24" height="24" fill="none"><path d="M16 27.5 5.7 17.3a7 7 0 0 1 10.3-9.4 7 7 0 0 1 10.3 9.4L16 27.5Z" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 21.5c0-5.5 2.4-9.3 6.5-11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>Hành Trình Mẹ & Bé</a><nav class="reader-nav-links" aria-label="Điều hướng thư viện"><a href="/">Trang chủ</a><a href="/thu-vien">Khám phá</a><a href="/da-luu">Đã lưu</a><a href="/hanh-trinh">Hành trình</a>'+(familyDemoEnabled()?'<a href="/gia-dinh-demo">Gia đình mẫu</a>':'')+(familyWebConfig()?'<a href="/gia-dinh">Gia đình</a>':'')+'</nav></div></header>'+
 '<main class="wrap" id="dev-main">'+body+'</main><footer class="wrap footer">Hành Trình Mẹ & Bé · Đồng hành bằng kiến thức và sự thấu hiểu · <a href="/nguon-tham-khao">Nguồn tham khảo</a></footer><nav class="mobile-reader-nav" aria-label="Điều hướng trên điện thoại"><a href="/"><svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/></svg><span>Trang chủ</span></a><a href="/thu-vien"><svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5z"/></svg><span>Khám phá</span></a><a href="/da-luu"><svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg><span>Đã lưu</span></a><a href="/hanh-trinh"><svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg><span>Hành trình</span></a></nav><script src="/reader-connection.js" defer></script></body></html>';
 return new Response(html,{status,headers:{"Content-Type":"text/html; charset=utf-8",...securityHeaders,...(status===503?{"Retry-After":"5"}:{})}});
}
async function fromApi<T>(route:string):Promise<T>{
 const origin=process.env.CONTENT_API_INTERNAL_URL;
 const token=process.env.DEV_CONTENT_PREVIEW_TOKEN;
 if(!origin||!token||token.length<24)throw Error("Preview backend not configured");
 const url=new URL(origin);
 if(!["https:","http:"].includes(url.protocol)||url.username||url.password||url.search||url.hash)
   throw Error("Invalid backend origin");
 const response=await readBackend(url.origin+"/v1/dev-preview/"+route,{"x-preview-token":token,"Accept":"application/json"});
 if(response.status===404)throw Error("Preview API unavailable");
 if(!response.ok)throw Error("Preview API returned non-success");
 return response.json() as Promise<T>;
}
// The Render Free backend may sleep for an extended period. Prefer the actual
// Supabase-backed API, but never make the owner lose access to the 72 local
// versioned development articles merely because the remote service is cold.
// These are development-only drafts; all public release paths remain gated.
function reportFallback(error:unknown):void{
 const kind=error instanceof DOMException?"TIMEOUT_OR_ABORT":
   error instanceof TypeError?"NETWORK_OR_URL":
   error instanceof Error&&error.message==="Preview backend not configured"?"MISSING_CONFIG":
   error instanceof Error&&error.message==="Invalid backend origin"?"INVALID_ORIGIN":
   error instanceof Error&&error.message==="Preview API unavailable"?"UPSTREAM_404":
   error instanceof Error&&error.message==="Preview API returned non-success"?"UPSTREAM_NON_200":"UNKNOWN";
 console.warn(process.env.WEB_DYNAMIC_MEDIA==="true"?"DEV_CONTENT_LIVE_UNAVAILABLE":"DEV_CONTENT_SNAPSHOT_FALLBACK",kind);
}
export async function listDevArticles():Promise<{articles:ArticleSummary[];source:PreviewSource}>{
 try{
   const first=await fromApi<{data:ArticleSummary[];meta:{total:number}}>("articles?page=1&limit=50");
   if(first.meta.total>500)throw Error("Preview catalog exceeds reader limit");
   const articles=[...first.data];
   for(let page=2;articles.length<first.meta.total;page++){
     const next=await fromApi<{data:ArticleSummary[]}>("articles?page="+page+"&limit=50");
     if(!next.data.length)throw Error("Incomplete preview catalog");
     articles.push(...next.data);
   }
   if(articles.length!==first.meta.total||new Set(articles.map(a=>a.slug)).size!==articles.length)throw Error("Inconsistent preview catalog");
   return {articles:articles.map(a=>({...a,media:a.media||snapshotArticles.find(x=>x.slug===a.slug)?.media})),source:"supabase"};
 }catch(error){
   reportFallback(error);
   if(process.env.WEB_DYNAMIC_MEDIA==="true")throw error;
   return {source:"snapshot",articles:snapshotArticles.map(({sections,sources,...summary})=>summary)};
 }
}
export async function getDevArticle(slug:string):Promise<{data:Article;disclaimer:string;source:PreviewSource}>{
 if(!/^[a-z0-9-]{1,160}$/.test(slug))throw Error("Invalid article slug");
 try{
   const live=await fromApi<{data:Article;disclaimer:string}>("articles/"+encodeURIComponent(slug));
   return {data:{...live.data,media:live.data.media||snapshotArticles.find(x=>x.slug===slug)?.media},disclaimer:live.disclaimer,source:"supabase"};
 }catch(error){
   reportFallback(error);
   if(process.env.WEB_DYNAMIC_MEDIA==="true")throw error;
   const article=snapshotArticles.find(a=>a.slug===slug);
   if(!article)throw Error("Article not found in snapshot");
   return {data:article,disclaimer:snapshotDisclaimer,source:"snapshot"};
 }
}

/** Whitelist public, versioned first-party media; ignore untrusted external URLs. */
export function safeMediaPath(src:unknown):string|null{
 return typeof src==="string" && src.startsWith("/media/") && /^(?:[a-z0-9-]+[.]svg|lifestyle-[a-z0-9-]+[.]webp)$/.test(src.slice(7))?src:null;
}
