import { handle, json } from "@/server/http";
import { publicListings } from "@/server/catalog";
import { liveMode } from "@/server/supabase";
export const dynamic = "force-dynamic";
export const GET = handle(async () => json({ mode: liveMode() ? "live" : "preview", listings: await publicListings() }));
