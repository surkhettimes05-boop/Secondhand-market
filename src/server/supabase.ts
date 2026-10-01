import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
export function liveMode() { return process.env.MARKET_MODE === "live"; }
export function backendConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Backend not configured");
  return { url, key };
}
export async function userClient() {
  const { url, key } = backendConfig();
  const store = await cookies();
  return createServerClient(url, key, {
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.APP_ORIGIN?.startsWith("https:") ?? false, path: "/" },
    cookies: {
      getAll() { return store.getAll(); },
      setAll(values) { try { values.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* RSC refresh is performed in proxy. */ } },
    },
  });
}
export function publicClient() {
  const { url, key } = backendConfig();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
// Used ONLY for processed media writes/deletion compensation and the expiry job.
// Business reads/mutations always use the caller client and database authorization.
export function storageService() {
  const { url } = backendConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Photo storage not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
