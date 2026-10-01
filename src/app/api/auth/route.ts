import { z } from "zod";
import { handle, json, jsonBody, sameOrigin, ensureLive, actor, HttpError } from "@/server/http";
import { userClient } from "@/server/supabase";
import { normalizeNepalPhone } from "@/lib/listing-input";
const input = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send"), phone: z.string().max(30), captchaToken: z.string().max(3000).optional() }),
  z.object({ action: z.literal("verify"), phone: z.string().max(30), code: z.string().regex(/^\d{6}$/), captchaToken: z.string().max(3000).optional() }),
  z.object({ action: z.literal("signout") }),
]);
export const GET = handle(async () => {
  const { client, user, profile } = await actor();
  const { data: member } = await client.rpc("market_moderator_member");
  const { data: moderator } = await client.rpc("market_is_moderator");
  return json({ user: { id: user.id, phone: user.phone, displayName: profile.display_name }, member: !!member, moderator: !!moderator });
});
export const POST = handle(async request => {
  sameOrigin(request); ensureLive();
  const value = input.parse(await jsonBody(request));
  const client = await userClient();
  if (value.action === "signout") {
    const { error } = await client.auth.signOut();
    if (error) throw new HttpError(503, "Could not sign out. Please try again.");
    return json({ ok: true });
  }
  const phone = normalizeNepalPhone(value.phone);
  if (!phone) throw new HttpError(400, "Enter a valid Nepal mobile number.");
  if (value.action === "send") {
    const { error } = await client.auth.signInWithOtp({ phone, options: { captchaToken: value.captchaToken } });
    if (error) throw new HttpError(error.status === 429 ? 429 : 400, "The code could not be sent. Check the number, wait a minute and try again.");
    return json({ ok: true });
  }
  const { error } = await client.auth.verifyOtp({ phone, token: value.code, type: "sms", options: { captchaToken: value.captchaToken } });
  if (error) throw new HttpError(400, "The code is invalid or expired.");
  return json({ ok: true });
});
