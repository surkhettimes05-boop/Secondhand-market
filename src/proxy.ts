import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (process.env.MARKET_MODE !== "live" || !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) return response;
  if (!request.cookies.getAll().some(cookie => cookie.name.startsWith("sb-"))) return response;
  const client = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.APP_ORIGIN?.startsWith("https:") ?? false, path: "/" },
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await client.auth.getUser();
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|icon.svg|favicon.ico).*)"] };
