import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { handle, json, actor, sameOrigin, databaseError, limitedBody, HttpError, ensureLive } from "@/server/http";
import { userClient, storageService } from "@/server/supabase";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = handle(async request => {
  ensureLive();
  const key = z.string().regex(/^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.webp$/).parse(new URL(request.url).searchParams.get("key"));
  const client = await userClient();
  const { data, error } = await client.storage.from("market-media").download(key);
  if (error || !data) throw new HttpError(404, "Photo unavailable.");
  return new Response(data, { headers: { "Content-Type": "image/webp", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
});
export const POST = handle(async request => {
  sameOrigin(request);
  const { client, user } = await actor();
  const buffer = await limitedBody(request, 11 * 1024 * 1024);
  const body = new Request("http://upload.invalid", { method: "POST", headers: { "content-type": request.headers.get("content-type") || "" }, body: Buffer.from(buffer) });
  const form = await body.formData();
  const id = z.string().uuid().parse(form.get("listingId"));
  const file = form.get("file");
  if (!(file instanceof File) || file.size > 10 * 1024 * 1024 || !["image/jpeg","image/png","image/webp"].includes(file.type)) throw new HttpError(400, "Choose a JPEG, PNG or WebP photo up to 10 MB.");
  const { data: listing, error } = await client.from("market_listings").select("id,owner_id,review_status,status").eq("id", id).single();
  databaseError(error);
  if (!listing || listing.owner_id !== user.id || listing.review_status === "pending" || ["sold","rented","removed","withdrawn"].includes(listing.status)) throw new HttpError(403, "This listing cannot receive photos.");
  let encoded: Buffer;
  try {
    const input = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40000000 });
    const metadata = await input.metadata();
    if (!["jpeg","png","webp"].includes(metadata.format || "") || (metadata.pages ?? 1) !== 1) throw new Error("Unsupported image");
    encoded = await input.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  } catch { throw new HttpError(400, "This photo could not be decoded. Use a valid static image."); }
  const service = storageService();
  const path = user.id + "/" + id + "/" + randomUUID() + ".webp";
  const result = await service.storage.from("market-media").upload(path, encoded, { contentType: "image/webp", cacheControl: "0", upsert: false });
  if (result.error) throw new HttpError(503, "Photo upload failed. Please retry.");
  const registered = await client.rpc("market_register_media", { p_id: id, p_path: path });
  if (registered.error) { await service.storage.from("market-media").remove([path]); databaseError(registered.error); }
  return json({ path, url: "/api/media?key=" + encodeURIComponent(path) });
});
