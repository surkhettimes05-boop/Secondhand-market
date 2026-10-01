import { timingSafeEqual } from "node:crypto";
import { handle, json, ensureLive, HttpError } from "@/server/http";
import { storageService } from "@/server/supabase";
export const dynamic = "force-dynamic";
export const GET = handle(async request => {
  ensureLive();
  const configured = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization") || "";
  if (!configured || configured.length < 32) throw new HttpError(503, "The scheduled job is not configured.");
  const expected = "Bearer " + configured;
  if (Buffer.byteLength(supplied) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) throw new HttpError(401, "Not authorized.");
  const { data, error } = await storageService().rpc("market_expire");
  if (error) throw new HttpError(503, "The expiry job failed.");
  return json({ expired: data });
});
