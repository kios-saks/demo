import {renderReaderLibrary} from "../../lib/reader-library";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(request:Request):Promise<Response>{
 return renderReaderLibrary(request);
}
