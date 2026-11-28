import {randomBytes} from "node:crypto";
import {READER_COOKIE,validReaderInvite} from "../../lib/reader-invite";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const headers={"Cache-Control":"private, no-store, max-age=0","X-Robots-Tag":"noindex, nofollow, noarchive","Referrer-Policy":"no-referrer","X-Frame-Options":"DENY"};
export function GET():Response{
 if(!process.env.READER_INVITE_SHA256)return new Response("Không tìm thấy trang",{status:404,headers});
 const nonce=randomBytes(18).toString("base64");
 const html='<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Hành Trình Mẹ &amp; Bé</title></head><body><main><p id="message" role="status">Đang mở thư viện kiến thức…</p><noscript>Vui lòng bật JavaScript để mở liên kết.</noscript></main><script nonce="'+nonce+'">const token=location.hash.slice(1);history.replaceState(null,"","/tham-gia");if(!token){document.getElementById("message").textContent="Liên kết không hợp lệ hoặc đã hết hạn.";}else{fetch("/tham-gia",{method:"POST",headers:{"Content-Type":"text/plain"},body:token,credentials:"same-origin"}).then(r=>{if(!r.ok)throw Error();location.replace("/");}).catch(()=>{document.getElementById("message").textContent="Không thể mở liên kết. Vui lòng thử lại với liên kết ban đầu.";});}</script></body></html>';
 return new Response(html,{headers:{...headers,"Content-Type":"text/html; charset=utf-8","Content-Security-Policy":"default-src 'none'; script-src 'nonce-"+nonce+"'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"}});
}
export async function POST(request:Request):Promise<Response>{
 if(!request.headers.get("content-type")?.startsWith("text/plain"))return new Response(null,{status:404,headers});
 const token=await request.text();
 if(!validReaderInvite(token))return new Response(null,{status:404,headers});
 return new Response(null,{status:204,headers:{...headers,"Set-Cookie":READER_COOKIE+"="+token+"; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax"}});
}
