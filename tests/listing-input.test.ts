import test from "node:test";
import assert from "node:assert/strict";
import { normalizeNepalPhone, safeReturnPath, listingInputSchema } from "../src/lib/listing-input.ts";
const photo = "11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333.webp";
const base = { title: "A useful local listing", description: "A clear description with enough useful details for a local buyer.", pricePaisa: 1800000, locality: "Birendranagar", phonePublic: false, whatsapp: false, termsAccepted: true, policyVersion: "2026-10-01", photos: [photo] };
test("Nepal phone normalization and return paths reject ambiguous/injected values", () => {
  assert.equal(normalizeNepalPhone("9800000001"), "+9779800000001");
  assert.equal(normalizeNepalPhone("+977 9800000001"), "+9779800000001");
  for (const bad of ["+919800000001", "123", "9800000001x", "980000000100"]) assert.equal(normalizeNepalPhone(bad), null);
  for (const bad of ["//evil.example", "https://evil.example", "/\\evil", "/\r\nevil"]) assert.equal(safeReturnPath(bad), "/account");
  assert.equal(safeReturnPath("/post?id=123"), "/post?id=123");
});
test("rental submission requires separate costs, arrangements and real-photo references", () => {
  const value = { ...base, category: "rent", role: "owner", details: { subtype: "flat", bedrooms: 2, depositPaisa: 0, availableDate: "2026-11-01", water: "Shared", bathroom: "Private", parking: "None", charges: "Utilities extra", brokerFee: "None" } };
  assert.equal(listingInputSchema.safeParse(value).success, true);
  assert.equal(listingInputSchema.safeParse({ ...value, details: { ...value.details, depositPaisa: -1 } }).success, false);
  assert.equal(listingInputSchema.safeParse({ ...value, photos: [] }).success, false);
  assert.equal(listingInputSchema.safeParse({ ...value, whatsapp: true }).success, false);
  assert.equal(listingInputSchema.safeParse({ ...value, termsAccepted: false }).success, false);
});
test("land units and authority are explicit; items disclose defects", () => {
  const land = { ...base, category: "land", role: "broker", details: { area: 8, areaUnit: "aana", roadAccess: "Gravel road", brokerFee: "1%", ownershipDeclared: true } };
  assert.equal(listingInputSchema.safeParse(land).success, true);
  assert.equal(listingInputSchema.safeParse({ ...land, details: { ...land.details, areaUnit: "unknown" } }).success, false);
  const item = { ...base, category: "items", role: "individual", details: { subcategory: "furniture", condition: "good", defects: "None known", pickup: "Birendranagar" } };
  assert.equal(listingInputSchema.safeParse(item).success, true);
  assert.equal(listingInputSchema.safeParse({ ...item, description: "Call my phone 9800000001 for more information about this chair." }).success, false);
});
