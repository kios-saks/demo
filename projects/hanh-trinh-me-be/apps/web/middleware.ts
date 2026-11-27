import {NextResponse,type NextRequest} from "next/server";
import {openDevReader} from "./lib/open-dev-reader";
import {stageOptions} from "./lib/reader-navigation";
const stages=new Set(stageOptions.map(([slug])=>slug));
export function middleware(request:NextRequest){
 const path=request.nextUrl.pathname;
 if(!openDevReader()&&!request.cookies.has("mebe_reader"))return NextResponse.next();
 const target=request.nextUrl.clone();
 if(path==="/")target.pathname="/dev-review/nhom/home";
 else if(path==="/thu-vien")target.pathname="/dev-review";
 else if(path==="/tim-kiem")target.pathname="/dev-review/nhom/search";
 else if(path==="/da-luu")target.pathname="/dev-review/nhom/saved";
 else if(path==="/hanh-trinh")target.pathname="/dev-review/nhom/journey";
 else if(stages.has(path.slice(1)))target.pathname="/dev-review/nhom/"+path.slice(1);
 else if(path.startsWith("/bai-viet/"))target.pathname="/dev-review/"+path.slice("/bai-viet/".length);
 else {
  const response=NextResponse.next();
  if(openDevReader()&&["/hoc-cung-con","/nguon-tham-khao"].includes(path)){response.headers.set("Cache-Control","private, no-store, max-age=0");response.headers.set("X-Robots-Tag","noindex, nofollow, noarchive");response.headers.set("Referrer-Policy","no-referrer");}
  return response;
 }
 // Route identity is a path parameter rather than a rewrite-injected query.
 // Every destination independently enforces the DEV-only read policy.
 return NextResponse.rewrite(target);
}
export const config={matcher:["/","/thu-vien","/tim-kiem","/da-luu","/hanh-trinh","/:stage","/bai-viet/:slug"]};
