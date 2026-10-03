import { z } from "zod";
import { handle, json, jsonBody, sameOrigin, actor, databaseError } from "@/server/http";
export const GET = handle(async () => {
  const { client } = await actor(); const { data, error } = await client.rpc("market_inbox");
  databaseError(error); return json({ inquiries: data });
});
export const POST = handle(async request => {
  sameOrigin(request); const { client } = await actor();
  const value = z.object({ id: z.string().uuid(), body: z.string().trim().min(20).max(1000), sharePhone: z.boolean().default(false) }).parse(await jsonBody(request));
  const { data, error } = await client.rpc("market_inquire", { p_id: value.id, p_body: value.body, p_share_phone: value.sharePhone });
  databaseError(error); return json({ id: data });
});
