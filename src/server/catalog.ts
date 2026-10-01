import "server-only";
import { listings } from "@/lib/listings";
import { catalogListing } from "@/lib/live-listings";
import type { CatalogRow } from "@/lib/live-listings";
import { liveMode, publicClient } from "./supabase";
export async function publicListings() {
  if (!liveMode()) return listings;
  const { data, error } = await publicClient().rpc("market_catalog");
  if (error) throw new Error("Catalog unavailable");
  return (data as CatalogRow[]).map(catalogListing);
}
