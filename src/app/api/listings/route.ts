import { z } from "zod";
import { draftContentSchema, categorySchema } from "@/lib/listing-input";
import { handle, json, jsonBody, actor, sameOrigin, databaseError } from "@/server/http";
export const GET = handle(async () => {
  const { client, user } = await actor();
  const { data, error } = await client.from("market_listings").select("*").eq("owner_id", user.id).order("updated_at", { ascending: false }).limit(100);
  databaseError(error); return json({ listings: data });
});
export const POST = handle(async request => {
  sameOrigin(request);
  const { client } = await actor();
  const value = z.object({ id: z.string().uuid().nullable().optional(), category: categorySchema, content: draftContentSchema }).parse(await jsonBody(request));
  const { data, error } = await client.rpc("market_save_draft", { p_id: value.id ?? null, p_category: value.category, p_content: value.content });
  databaseError(error); return json({ id: data });
});
