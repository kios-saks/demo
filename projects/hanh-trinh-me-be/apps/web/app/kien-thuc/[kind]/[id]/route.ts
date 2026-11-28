import {resolveKnowledgeLink} from "../../../../lib/knowledge-hub";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(request:Request,{params}:{params:Promise<{kind:string;id:string}>}){
 const {kind,id}=await params;return resolveKnowledgeLink(request,kind,id);
}
