import {proxyMedia} from "../../../../../lib/dynamic-media";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(request:Request,{params}:{params:Promise<{key:string;slot:string}>}){
 const {key,slot}=await params;return proxyMedia(request,key,slot);
}
