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
 "Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
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
 '</head><body><header class="nav"><div class="wrap"><strong>♡ HÀNH TRÌNH MẸ & BÉ</strong> · KHO BIÊN TẬP DEV</div></header>'+
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
   cache:"no-store",signal:AbortSignal.timeout(12000)
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
   return {articles,source:"supabase"};
 }catch(error){
   reportFallback(error);
   return {source:"snapshot",articles:snapshotArticles.map(({sections,sources,...summary})=>summary)};
 }
}
export async function getDevArticle(slug:string):Promise<{data:Article;disclaimer:string;source:PreviewSource}>{
 if(!/^[a-z0-9-]{1,160}$/.test(slug))throw Error("Invalid article slug");
 try{
   const live=await fromApi<{data:Article;disclaimer:string}>("articles/"+encodeURIComponent(slug));
   return {...live,source:"supabase"};
 }catch(error){
   reportFallback(error);
   const article=snapshotArticles.find(a=>a.slug===slug);
   if(!article)throw Error("Article not found in snapshot");
   return {data:article,disclaimer:snapshotDisclaimer,source:"snapshot"};
 }
}
