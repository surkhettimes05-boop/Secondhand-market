import { z } from "zod";
import { handle, json, jsonBody, sameOrigin, actor, HttpError } from "@/server/http";
async function member() {
  const current = await actor();
  const { data, error } = await current.client.rpc("market_moderator_member");
  if (error || !data) throw new HttpError(403, "Moderator membership is required.");
  return current;
}
export const GET = handle(async () => {
  const { client } = await member();
  const { data, error } = await client.auth.mfa.listFactors();
  if (error) throw new HttpError(503, "Authenticator settings unavailable.");
  return json({ factors: data.totp.filter(factor => factor.status === "verified").map(factor => ({ id: factor.id, name: factor.friendly_name })) });
});
export const POST = handle(async request => {
  sameOrigin(request);
  const { client } = await member();
  const value = z.discriminatedUnion("action", [
    z.object({ action: z.literal("enroll") }),
    z.object({ action: z.literal("verify"), factorId: z.string().uuid(), code: z.string().regex(/^\d{6}$/) }),
  ]).parse(await jsonBody(request));
  if (value.action === "enroll") {
    const existing = await client.auth.mfa.listFactors();
    if (existing.data?.totp.some(factor => factor.status === "verified")) throw new HttpError(400, "An authenticator is already enrolled; verify it instead.");
    for (const factor of existing.data?.all ?? []) if (factor.status === "unverified") await client.auth.mfa.unenroll({ factorId: factor.id });
    const { data, error } = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: "Surkhet Market", issuer: "Surkhet Market" });
    if (error) throw new HttpError(400, "Authenticator enrollment failed. Try again.");
    return json({ factorId: data.id, qrCode: data.totp.qr_code, setupKey: data.totp.secret });
  }
  const { error } = await client.auth.mfa.challengeAndVerify({ factorId: value.factorId, code: value.code });
  if (error) throw new HttpError(400, "Authenticator code is invalid or expired.");
  return json({ ok: true });
});
