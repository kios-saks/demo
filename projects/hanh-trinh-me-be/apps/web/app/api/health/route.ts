/**
 * Web process health, independent of Backend/Supabase cold starts.
 * The Backend exposes /health/ready for its actual database connectivity.
 */
export const dynamic="force-dynamic";
export async function GET() {
  return Response.json({ok:true,service:"web"});
}
