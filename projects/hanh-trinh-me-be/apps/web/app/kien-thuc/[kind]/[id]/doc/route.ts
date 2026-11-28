import {renderKnowledgeDetail} from "../../../../../lib/knowledge-detail";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(request:Request,{params}:{params:Promise<{kind:string;id:string}>}){const {kind,id}=await params;return renderKnowledgeDetail(request,kind,id);}
