export async function register(){
 if(process.env.NEXT_RUNTIME==="nodejs"&&process.env.WEB_DYNAMIC_MEDIA==="true"&&process.env.WEB_DYNAMIC_MEDIA_VERIFY_ON_START==="true"){
   const {auditLiveMedia}=await import("./lib/live-media-audit");
   // Keep HTTP liveness independent of a read-only audit of external media.
   void auditLiveMedia();
 }
}
