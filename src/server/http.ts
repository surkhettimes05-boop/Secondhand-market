import "server-only";
import { z } from "zod";
import { backendConfig, liveMode, userClient } from "./supabase";
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function ensureLive() {
  if (!liveMode()) throw new HttpError(503, "Real accounts and publishing are not enabled in preview mode.");
  try { backendConfig(); } catch { throw new HttpError(503, "The backend is not configured yet."); }
}
export function sameOrigin(request: Request) {
  const expected = process.env.APP_ORIGIN;
  if (!expected || request.headers.get("origin") !== expected) throw new HttpError(403, "Request origin is not allowed.");
}
export async function limitedBody(request: Request, limit: number): Promise<Uint8Array> {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Request body is required.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) { await reader.cancel(); throw new HttpError(413, "Request is too large."); }
    chunks.push(value);
  }
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result;
}
export async function jsonBody(request: Request) {
  try { return JSON.parse(new TextDecoder().decode(await limitedBody(request, 40000))); }
  catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, "Invalid JSON."); }
}
export async function actor() {
  ensureLive();
  const client = await userClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user || !user.phone_confirmed_at) throw new HttpError(401, "Sign in with a verified phone first.");
  const { data: profile, error: profileError } = await client.from("market_profiles").select("display_name,status").eq("user_id", user.id).single();
  if (profileError || profile?.status !== "active") throw new HttpError(403, "Your account is not active.");
  return { client, user, profile };
}
export async function moderator() {
  const current = await actor();
  const { data, error } = await current.client.rpc("market_is_moderator");
  if (error || !data) throw new HttpError(403, "Moderator access and authenticator verification are required.");
  return current;
}
export function databaseError(error: { code?: string; message: string } | null) {
  if (!error) return;
  if (error.code === "42501") throw new HttpError(403, "You do not have permission for this action.");
  if (error.code === "P0001") throw new HttpError(400, error.message.slice(0, 250));
  throw new HttpError(503, "The action could not be saved. Please try again.");
}
export function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}
export function handle(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    try { return await handler(request); }
    catch (error) {
      if (error instanceof z.ZodError) return json({ error: "Check the highlighted fields.", issues: error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })) }, 400);
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      return json({ error: "The service is temporarily unavailable. Please try again." }, 503);
    }
  };
}
