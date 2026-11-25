export async function register(){
 if(process.env.NEXT_RUNTIME==="nodejs"&&process.env.RENDER==="true"&&process.env.WEB_DYNAMIC_MEDIA==="true"&&process.env.WEB_MEDIA_ADMIN_ENABLED==="true"){
   const {auditAuthenticatedReader}=await import("./lib/authenticated-reader-audit");
   // Do not block the HTTP listener or run the expensive full media audit.
   void auditAuthenticatedReader();
 }
 if(process.env.NEXT_RUNTIME==="nodejs"&&process.env.WEB_DYNAMIC_MEDIA==="true"&&process.env.WEB_DYNAMIC_MEDIA_VERIFY_ON_START==="true"){
   const {auditLiveMedia}=await import("./lib/live-media-audit");
   // Keep HTTP liveness independent of a read-only audit of external media.
   void auditLiveMedia();
 }
}
