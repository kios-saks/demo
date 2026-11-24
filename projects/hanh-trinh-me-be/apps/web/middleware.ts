import {NextResponse,type NextRequest} from "next/server";
import {stageOptions} from "./lib/reader-navigation";
const stages=new Set(stageOptions.map(([slug])=>slug));
export function middleware(request:NextRequest){
 const path=request.nextUrl.pathname;
 if(!request.cookies.has("mebe_reader"))return NextResponse.next();
 const target=request.nextUrl.clone();
 if(path==="/")target.pathname="/dev-review/nhom/home";
 else if(path==="/thu-vien")target.pathname="/dev-review";
 else if(path==="/tim-kiem")target.pathname="/dev-review/nhom/search";
 else if(path==="/da-luu")target.pathname="/dev-review/nhom/saved";
 else if(path==="/hanh-trinh")target.pathname="/dev-review/nhom/journey";
 else if(stages.has(path.slice(1)))target.pathname="/dev-review/nhom/"+path.slice(1);
 else if(path.startsWith("/bai-viet/"))target.pathname="/dev-review/"+path.slice("/bai-viet/".length);
 else return NextResponse.next();
 // Route identity is a path parameter rather than a rewrite-injected query.
 // Every destination validates the reader session server-side before rendering.
 return NextResponse.rewrite(target);
}
export const config={matcher:["/","/thu-vien","/tim-kiem","/da-luu","/hanh-trinh","/:stage","/bai-viet/:slug"]};
