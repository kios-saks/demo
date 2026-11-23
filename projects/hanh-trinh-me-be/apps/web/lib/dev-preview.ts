import {timingSafeEqual} from "node:crypto";
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
 "Content-Security-Policy":"default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
};
/** Dev-only, BASIC-auth reading room. No public CMS, write route or publication. */
export function requirePreviewLogin(request:Request):Response|null{
 const secret=process.env.DEV_CONTENT_PREVIEW_TOKEN;
 if(!secret||secret.length<24)return new Response("Not found",{status:404,headers:securityHeaders});
 const expected=Buffer.from("Basic "+Buffer.from("editor:"+secret).toString("base64"));
 const actual=Buffer.from(request.headers.get("authorization")||"");
 if(expected.length===actual.length&&timingSafeEqual(expected,actual))return null;
 return new Response("Development library – editor login required",{
   status:401,headers:{...securityHeaders,"WWW-Authenticate":'Basic realm="MeBe Dev Content Preview", charset="UTF-8"'}
 });
}
export const escapeHtml=(value:unknown)=>String(value??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]||c));
export function htmlResponse(title:string,body:string,status=200):Response{
 const html='<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta name="robots" content="noindex,nofollow,noarchive"><title>'+escapeHtml(title)+' · Hành Trình Mẹ & Bé DEV</title>'+
 '<style>:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#fffaf7;color:#352b35;font:15px/1.7 system-ui,-apple-system,sans-serif}a{color:#904564;text-decoration:none}a:hover{text-decoration:underline}.wrap{width:min(1000px,calc(100% - 32px));margin:0 auto}.nav{padding:22px 0;border-bottom:1px solid #f0e3e6}.nav strong{color:#904564}.warn{border:1px solid #f4d7da;border-radius:12px;background:#fff0f1;color:#7d3349;padding:14px 18px;margin:22px 0}.pill{font-size:11px;text-transform:uppercase;letter-spacing:.1em;background:#fdebee;color:#9c496e;padding:5px 9px;border-radius:30px}.hero{padding:35px 0 8px}h1{line-height:1.25;font-size:clamp(27px,4vw,42px);margin-bottom:14px}h2{font-size:22px;margin:33px 0 12px}h3{font-size:17px;margin:8px 0}p{margin:9px 0 15px}small,.muted{color:#746673}.list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:15px}.item{display:block;background:white;border:1px solid #f0e3e6;border-radius:13px;padding:19px;min-height:148px}.item p{color:#72636c;font-size:13px;margin:10px 0 0}.meta{font-size:13px;color:#796b72;margin:12px 0}.content{max-width:780px}.content section{border-top:1px solid #f0e3e6;padding-top:8px}.sources{padding:18px;background:white;border:1px solid #f0e3e6;border-radius:12px;overflow-wrap:anywhere}.sources li{margin:9px 0}.search{display:flex;gap:10px;margin:22px 0 28px}.search input{border:1px solid #e7ced8;border-radius:8px;font:inherit;flex:1;min-width:0;padding:12px}.search button{background:#904564;color:white;border:0;border-radius:8px;padding:10px 18px;font:inherit;cursor:pointer}.footer{padding:35px 0;color:#766870;font-size:12px}</style>'+
 '<style>.hero-visual{display:grid;grid-template-columns:1fr minmax(220px,350px);gap:28px;align-items:center;background:linear-gradient(115deg,#fff8f3,#fce9ed);border-radius:24px;padding:32px;margin:20px 0 24px}.hero-visual .hero{padding:0}.hero-visual img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:18px;box-shadow:0 16px 35px #5c384c19}.hero-visual h1{margin:10px 0 14px}.hero-visual p{color:#75616c;max-width:540px}.stats-mini{display:flex;gap:10px;flex-wrap:wrap}.stats-mini b{display:inline-flex;align-items:center;gap:8px;background:#fff;border-radius:12px;padding:8px 12px;font-size:13px;color:#9c496e}.list{grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}.item{padding:0;overflow:hidden;box-shadow:0 5px 22px #5e34550c;transition:transform .2s ease,box-shadow .2s ease}.item:hover{transform:translateY(-4px);box-shadow:0 17px 38px #5e345520}.item .thumb{margin:0;display:block;width:100%;height:158px;object-fit:cover;background:#f6e8ef}.item .thumb-empty{height:158px;display:grid;place-items:center;background:linear-gradient(145deg,#fff0ee,#f4e8ef);font-size:50px}.item-content{padding:16px 19px 20px}.item-content .pill{font-size:10px}.item-content h3{line-height:1.4}.item-content p{line-height:1.6}.article-cover{margin:22px 0 26px}.article-cover img{width:100%;display:block;aspect-ratio:16/9;object-fit:cover;border-radius:20px;box-shadow:0 14px 45px #6d556018}.article-cover figcaption,.infographic-figure figcaption{font-size:12px;color:#766772;margin:8px 0 0}.quick-card{border-radius:19px;background:#fdf0ee;border:1px solid #efdadc;padding:20px 22px;margin:24px 0}.quick-card h2{margin:0 0 10px;font-size:19px}.quick-card ul{padding-left:22px;margin:0}.quick-card li{padding:5px 0}.reading-note{font-size:12px;letter-spacing:.05em;color:#8e5370;text-transform:uppercase}.toc{display:flex;flex-wrap:wrap;gap:8px;margin:23px 0}.toc a{border-radius:20px;background:white;border:1px solid #efdde3;padding:6px 12px;font-size:12px}.article-content{max-width:780px}.article-content section p{font-size:15px;line-height:1.95}.infographic-figure{margin:24px 0}.infographic-figure img{width:100%;height:auto;border:1px solid #efdde3;border-radius:16px;display:block;background:white}.article-content .sources h2{margin-top:5px}.item:focus-visible,.toc a:focus-visible{outline:3px solid #924568;outline-offset:3px}@media(max-width:680px){.hero-visual{grid-template-columns:1fr;padding:23px}.hero-visual img{max-height:220px}.hero-visual h1{font-size:30px}.list{grid-template-columns:1fr 1fr;gap:10px}.item .thumb,.item .thumb-empty{height:105px}.item-content{padding:11px}.item-content h3{font-size:14px}.item-content p{font-size:11px}.item-content .meta{font-size:11px}.article-cover img{border-radius:13px}}@media(max-width:390px){.list{grid-template-columns:1fr}}.infographic-transcript{margin:14px 0;padding:12px 18px;border:1px solid #efdde3;background:#fff8f5;border-radius:13px;font-size:14px}.infographic-transcript summary{cursor:pointer;color:#904564;font-weight:700;outline-offset:3px}.infographic-transcript li{margin:8px 0;line-height:1.65}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.stage-tile-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:19px 0 35px}.stage-tile{display:block;min-width:0;border:1px solid #ead8e0;background:white;border-radius:16px;overflow:hidden;transition:box-shadow .2s,transform .2s}.stage-tile:hover{transform:translateY(-2px);box-shadow:0 13px 27px #76546d22;text-decoration:none}.stage-tile.selected{border:2px solid #9c496e;box-shadow:0 5px 20px #9c496e12}.stage-tile img,.stage-tile .thumb-empty{display:block;width:100%;height:112px;object-fit:cover;background:#fff0ee}.stage-tile>div:last-child{padding:13px}.stage-tile strong{display:block;font-size:13px;line-height:1.45}.stage-tile span{display:block;color:#806d77;font-size:11px;margin-top:7px}.library-intro h2{margin-bottom:5px}.library-intro p{color:#756574;margin-top:0}.search{flex-wrap:wrap;align-items:stretch}.search input{flex:2;min-width:170px}.search select{flex:1;min-width:175px;border:1px solid #e7ced8;border-radius:8px;background:#fff;padding:11px;font:inherit;color:inherit}.results-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid #f0e3e6;margin:26px 0 18px}.results-heading h2{margin:0 0 12px}.results-heading p{color:#766870;font-size:12px}.stage-guide{border:1px solid #efdde3;padding:24px 27px;border-radius:21px;background:#fff;margin:18px 0 38px}.stage-guide h2{font-size:29px;margin:9px 0 10px}.stage-guide h3{font-size:19px;margin:24px 0 12px}.stage-guide .eyebrow{color:#95506d;font-size:11px;font-weight:700;letter-spacing:.08em}.guide-intro{font-size:16px;color:#685565;line-height:1.85}.focus-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.focus-item{padding:16px;border:1px solid #f0e2e7;border-radius:13px;background:#fffcfa}.focus-item h4{font-size:15px;color:#914b69;margin:0 0 7px}.focus-item p{font-size:13px;color:#625660;margin:0;line-height:1.7}.checklist{padding-left:24px}.checklist li{margin:10px 0;line-height:1.75}.faq-list details{border-top:1px solid #eadbe2;padding:12px 0}.faq-list summary{font-weight:700;cursor:pointer;outline-offset:4px}.faq-list details p{font-size:14px;line-height:1.8;margin:9px 0}.guide-sources{margin:23px 0 3px;border-top:1px solid #eadbe2;padding-top:17px}.guide-sources p{line-height:1.8}.guide-sources small{font-size:11px}.media-count{display:inline-block;margin-left:9px;font-size:10px;color:#5e806e;font-weight:700}.stage-tile:focus-visible,.item:focus-visible,.search :focus-visible{outline:3px solid #924568;outline-offset:3px}@media(max-width:930px){.stage-tile-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:660px){.stage-tile-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.stage-tile img{height:97px}.stage-guide{padding:18px 16px}.focus-grid{grid-template-columns:1fr}.results-heading{display:block}.search select,.search input,.search button{width:100%}}@media(max-width:390px){.stage-tile-grid{grid-template-columns:1fr 1fr}.stage-tile strong{font-size:12px}}</style></head><body><header class="nav"><div class="wrap"><strong>♡ HÀNH TRÌNH MẸ & BÉ</strong> · KHO BIÊN TẬP DEV</div></header>'+
 '<main class="wrap">'+body+'</main><footer class="wrap footer">Bản xem trước có mật khẩu · Chưa phát hành chính thức · Dữ liệu Việt ngữ biên tập độc lập</footer></body></html>';
 return new Response(html,{status,headers:{"Content-Type":"text/html; charset=utf-8",...securityHeaders}});
}
async function fromApi<T>(route:string):Promise<T>{
 const origin=process.env.CONTENT_API_INTERNAL_URL;
 const token=process.env.DEV_CONTENT_PREVIEW_TOKEN;
 if(!origin||!token||token.length<24)throw Error("Preview backend not configured");
 const url=new URL(origin);
 if(!["https:","http:"].includes(url.protocol)||url.username||url.password||url.search||url.hash)
   throw Error("Invalid backend origin");
 const response=await fetch(url.origin+"/v1/dev-preview/"+route,{
   headers:{"x-preview-token":token,"Accept":"application/json"},
   signal:AbortSignal.timeout(12000)
 });
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
 console.warn("DEV_CONTENT_SNAPSHOT_FALLBACK",kind);
}
export async function listDevArticles():Promise<{articles:ArticleSummary[];source:PreviewSource}>{
 try{
   const first=await fromApi<{data:ArticleSummary[];meta:{total:number}}>("articles?page=1&limit=50");
   if(first.meta.total>500)throw Error("Preview catalog exceeds reader limit");
   const articles=[...first.data];
   for(let page=2;articles.length<first.meta.total;page++){
     const next=await fromApi<{data:ArticleSummary[]}>("articles?page="+page+"&limit=50");
     if(!next.data.length)break;
     articles.push(...next.data);
   }
   return {articles:articles.map(a=>({...a,media:a.media||snapshotArticles.find(x=>x.slug===a.slug)?.media})),source:"supabase"};
 }catch(error){
   reportFallback(error);
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
   const article=snapshotArticles.find(a=>a.slug===slug);
   if(!article)throw Error("Article not found in snapshot");
   return {data:article,disclaimer:snapshotDisclaimer,source:"snapshot"};
 }
}

/** Whitelist public, versioned first-party media; ignore untrusted external URLs. */
export function safeMediaPath(src:unknown):string|null{
 return typeof src==="string" && src.startsWith("/media/") && /^[a-z0-9-]+[.]svg$/.test(src.slice(7))?src:null;
}
