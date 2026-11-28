import {openDevReader} from "../../../lib/open-dev-reader";
import {requirePreviewLogin,htmlResponse} from "../../../lib/dev-preview";
import {renderCourseCompat} from "../../../lib/course-compat-v3";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(request:Request):Promise<Response>{
 if(!openDevReader())return new Response("Không tìm thấy trang",{status:404,headers:{"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow, noarchive","Referrer-Policy":"no-referrer"}});
 const denied=requirePreviewLogin(request);if(denied)return denied;
 return htmlResponse("Học cùng con",renderCourseCompat(new URL(request.url).searchParams.get("stage")||""),200,"course-v3","explore");
}
