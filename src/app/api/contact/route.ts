import { z } from "zod";
import { handle, json, jsonBody, sameOrigin, actor, databaseError } from "@/server/http";
export const POST = handle(async request => {
  sameOrigin(request); const { client } = await actor();
  const { id } = z.object({ id: z.string().uuid() }).parse(await jsonBody(request));
  const { data, error } = await client.rpc("market_contact", { p_id: id });
  databaseError(error); return json(data);
});
