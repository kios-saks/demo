import {NextResponse,type NextRequest} from "next/server";
const stages=new Set(["chuan-bi-mang-thai","thai-ky-3-thang-dau","thai-ky-3-thang-giua","thai-ky-3-thang-cuoi","hau-san","so-sinh","nhu-nhi","tap-di","mam-non","tieu-hoc","thieu-nien","truong-thanh"]);
export function middleware(request:NextRequest){
 const path=request.nextUrl.pathname;
 if(!request.cookies.has("mebe_reader"))return NextResponse.next();
 const target=request.nextUrl.clone();
 if(path==="/"||path==="/thu-vien"||path==="/tim-kiem")target.pathname="/dev-review";
 else if(stages.has(path.slice(1))){target.pathname="/dev-review";target.searchParams.set("stage",path.slice(1));}
 else if(path.startsWith("/bai-viet/"))target.pathname="/dev-review/"+path.slice("/bai-viet/".length);
 else return NextResponse.next();
 // Presence only routes requests; the Node handler validates the cookie against
 // the server-only digest before returning any article, even on a rewrite.
 return NextResponse.rewrite(target);
}
export const config={matcher:["/","/thu-vien","/tim-kiem","/:stage","/bai-viet/:slug"]};
