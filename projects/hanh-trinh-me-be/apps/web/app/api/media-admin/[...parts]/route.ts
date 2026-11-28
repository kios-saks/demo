import {mediaAdminProxy} from "../../../../lib/media-admin-proxy";
export const dynamic="force-dynamic";
export const runtime="nodejs";
type Context={params:Promise<{parts:string[]}>};
export async function GET(request:Request,{params}:Context){return mediaAdminProxy(request,(await params).parts);}
export async function POST(request:Request,{params}:Context){return mediaAdminProxy(request,(await params).parts);}
