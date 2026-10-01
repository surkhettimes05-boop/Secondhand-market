import { z } from "zod";
import { listingInputSchema } from "@/lib/listing-input";
import { handle, json, jsonBody, sameOrigin, actor, databaseError, HttpError } from "@/server/http";
export const POST = handle(async request => {
  sameOrigin(request);
  const { client } = await actor();
  const value = z.object({ id: z.string().uuid(), action: z.enum(["submit","pause","resume","renew","sold","rented","withdrawn","revoke_contact"]) }).parse(await jsonBody(request));
  if (value.action === "submit") {
    const { data, error } = await client.from("market_listings").select("category,draft_content").eq("id", value.id).single();
    databaseError(error); if (!data) throw new HttpError(404, "Listing not found.");
    listingInputSchema.parse({ ...data.draft_content, category: data.category });
  }
  const { error } = await client.rpc(value.action === "submit" ? "market_submit" : "market_transition", value.action === "submit" ? { p_id: value.id } : { p_id: value.id, p_action: value.action });
  databaseError(error); return json({ ok: true });
});
