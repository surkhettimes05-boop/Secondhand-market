import { publicClient, liveMode } from "@/server/supabase";
export const dynamic = "force-dynamic";
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  if (!liveMode()) return Response.json({ status: "ok", mode: "preview" }, { headers });
  try {
    const { error } = await publicClient().rpc("market_catalog").abortSignal(AbortSignal.timeout(5000));
    if (error) throw error;
    return Response.json({ status: "ok", mode: "live", database: "reachable" }, { headers });
  } catch {
    return Response.json({ status: "unavailable", mode: "live" }, { status: 503, headers });
  }
}
