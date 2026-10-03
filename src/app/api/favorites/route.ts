import { z } from "zod";
import { handle, json, jsonBody, sameOrigin, actor, databaseError } from "@/server/http";
export const GET = handle(async () => {
  const { client } = await actor();
  const { data, error } = await client.from("market_favorites").select("listing_id");
  databaseError(error); return json({ ids: (data ?? []).map(item => item.listing_id) });
});
export const POST = handle(async request => {
  sameOrigin(request); const { client } = await actor();
  const { id } = z.object({ id: z.string().uuid() }).parse(await jsonBody(request));
  const { data, error } = await client.rpc("market_favorite", { p_id: id });
  databaseError(error); return json({ ids: data });
});
