import {openDevReader} from "../../../lib/open-dev-reader";
import {requirePreviewLogin} from "../../../lib/dev-preview";
import {renderUnifiedSearch} from "../../../lib/knowledge-search-render";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const headers={"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow, noarchive","Referrer-Policy":"no-referrer"};
export async function POST(request:Request):Promise<Response>{
 const denied=()=>new Response("Không tìm thấy trang",{status:404,headers});
 if(!openDevReader())return denied();
 const url=new URL(request.url),origin=request.headers.get("origin");
 if(!origin||!(origin===url.origin||origin==="https://hanh-trinh-me-be-web-jn5v.onrender.com")||request.headers.get("sec-fetch-site")==="cross-site")return denied();
 const guarded=new Request(url.origin+"/tim-kiem",{method:"GET",headers:request.headers});
 if(requirePreviewLogin(guarded))return denied();
 if(!/^application\/x-www-form-urlencoded(?:;|$)/i.test(request.headers.get("content-type")||""))return new Response("Invalid request",{status:415,headers});
 const reader=request.body?.getReader();if(!reader)return new Response("Invalid request",{status:400,headers});
 let bytes=0;const decoder=new TextDecoder();let body="";
 try{for(;;){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>4096){await reader.cancel();return new Response("Invalid request",{status:413,headers});}body+=decoder.decode(value,{stream:true});}body+=decoder.decode();}
 catch{return new Response("Invalid request",{status:400,headers});}finally{reader.releaseLock();}
 return renderUnifiedSearch(guarded,undefined,new URLSearchParams(body));
}
