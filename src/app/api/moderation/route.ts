import { z } from "zod";
import { handle, json, jsonBody, sameOrigin, moderator, databaseError } from "@/server/http";
export const GET = handle(async () => {
  const { client } = await moderator();
  const results = await Promise.all([
    client.from("market_listings").select("*").eq("review_status", "pending").order("updated_at"),
    client.from("market_reports").select("*").eq("status", "open").order("created_at"),
    client.from("market_appeals").select("*").eq("status", "open").order("created_at"),
  ]);
  results.forEach(result => databaseError(result.error));
  return json({ listings: results[0].data, reports: results[1].data, appeals: results[2].data });
});
export const POST = handle(async request => {
  sameOrigin(request); const { client } = await moderator();
  const value = z.object({
    id: z.string().uuid(),
    action: z.enum(["approve","changes_requested","reject","hide","reinstate","resolved","dismissed","appeal_resolve"]),
    reason: z.string().trim().min(3).max(1000),
  }).parse(await jsonBody(request));
  let result;
  if (["approve","changes_requested","reject"].includes(value.action)) result = await client.rpc("market_review", { p_id: value.id, p_decision: value.action, p_reason: value.reason });
  else if (["resolved","dismissed"].includes(value.action)) result = await client.rpc("market_resolve_report", { p_id: value.id, p_status: value.action, p_reason: value.reason });
  else if (value.action === "appeal_resolve") result = await client.rpc("market_resolve_appeal", { p_id: value.id, p_reason: value.reason });
  else result = await client.rpc("market_moderate", { p_id: value.id, p_action: value.action, p_reason: value.reason });
  databaseError(result.error); return json({ ok: true });
});
