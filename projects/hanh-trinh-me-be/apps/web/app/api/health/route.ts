/**
 * Web process health, independent of Backend/Supabase cold starts.
 * The Backend exposes /health/ready for its actual database connectivity.
 */
export const dynamic="force-dynamic";
export async function GET() {
  if(process.env.MEBE_COMBINED_DEV==="true"){
    try{
      const r=await fetch("http://127.0.0.1:4000/health/ready",{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(3000)});
      if(r.status===200&&(await r.json()).ok===true)return Response.json({ok:true,service:"web",mode:"combined-dev",backend:"ready"},{headers:{"Cache-Control":"no-store"}});
    }catch{}
    return Response.json({ok:false,service:"web",mode:"combined-dev",backend:"unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});
  }
  return Response.json({ok:true,service:"web"});
}
