import { z } from "zod";
import { handle, json, jsonBody, sameOrigin, actor, databaseError } from "@/server/http";
export const GET = handle(async () => {
  const { client } = await actor();
  const { data, error } = await client.from("market_notifications").select("*").order("created_at", { ascending: false }).limit(50);
  databaseError(error); return json({ notifications: data });
});
export const POST = handle(async request => {
  sameOrigin(request); const { client } = await actor();
  const { id } = z.object({ id: z.string().uuid() }).parse(await jsonBody(request));
  const { error } = await client.rpc("market_read_notification", { p_id: id });
  databaseError(error); return json({ ok: true });
});
