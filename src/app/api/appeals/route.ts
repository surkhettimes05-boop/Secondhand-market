import { z } from "zod";
import { handle, json, jsonBody, sameOrigin, actor, databaseError } from "@/server/http";
export const POST = handle(async request => {
  sameOrigin(request); const { client } = await actor();
  const { id, body } = z.object({ id: z.string().uuid(), body: z.string().trim().min(20).max(1000) }).parse(await jsonBody(request));
  const { data, error } = await client.rpc("market_appeal", { p_id: id, p_body: body });
  databaseError(error); return json({ id: data });
});
