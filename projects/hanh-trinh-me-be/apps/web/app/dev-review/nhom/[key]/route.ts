import {renderReaderLibrary} from "../../../../lib/reader-library";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(request:Request,{params}:{params:Promise<{key:string}>}):Promise<Response>{
 const {key}=await params;
 switch(key){
  case "home":return renderReaderLibrary(request,{mode:"home"});
  case "search":return renderReaderLibrary(request,{mode:"search"});
  case "saved":return renderReaderLibrary(request,{mode:"saved"});
  case "journey":return renderReaderLibrary(request,{mode:"journey"});
  default:return renderReaderLibrary(request,{mode:"stage",stage:key});
 }
}
