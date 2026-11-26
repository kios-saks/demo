import {renderKnowledgeHub} from "../../lib/knowledge-hub";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(request:Request){return renderKnowledgeHub(request);}
