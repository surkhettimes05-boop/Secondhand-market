import { z } from "zod";
import { handle, json, jsonBody, sameOrigin, actor, databaseError } from "@/server/http";
export const POST = handle(async request => {
  sameOrigin(request); const { client } = await actor();
  const value = z.object({ id: z.string().uuid(), reason: z.enum(["unavailable","misleading","duplicate","scam","prohibited","privacy"]), detail: z.string().max(1000).default("") }).parse(await jsonBody(request));
  const { data, error } = await client.rpc("market_report", { p_id: value.id, p_reason: value.reason, p_detail: value.detail });
  databaseError(error); return json({ id: data });
});
