import type { Listing } from "./market";
export type CatalogRow = {
  id: string; category: "rent" | "land" | "items";
  confirmedAt: string; expiresAt: string;
  content: { title: string; description: string; pricePaisa: number; locality: string; role: string; photos: string[]; details: Record<string, string | number | boolean> };
};
const both = (value: string) => ({ en: value, ne: value });
export function catalogListing(row: CatalogRow): Listing {
  const details = row.content.details;
  let facts: { en: string[]; ne: string[] };
  let fees: { en: string; ne: string };
  if (row.category === "rent") {
    facts = { en: [String(details.bedrooms) + " bedrooms", String(details.subtype)], ne: [String(details.bedrooms) + " शयनकक्ष", String(details.subtype)] };
    fees = both("Broker fee: " + String(details.brokerFee) + ". Other charges: " + String(details.charges));
  } else if (row.category === "land") {
    facts = { en: [String(details.area) + " " + String(details.areaUnit), String(details.roadAccess)], ne: [String(details.area) + " " + String(details.areaUnit), String(details.roadAccess)] };
    fees = both("Broker fee: " + String(details.brokerFee));
  } else {
    facts = { en: [String(details.condition).replaceAll("_", " "), String(details.pickup)], ne: [String(details.condition).replaceAll("_", " "), String(details.pickup)] };
    fees = both("Pickup: " + String(details.pickup));
  }
  const roles: Record<string, { en: string; ne: string }> = { owner: { en: "Owner · self-declared", ne: "धनी · स्वघोषित" }, broker: { en: "Broker · self-declared", ne: "दलाल · स्वघोषित" }, individual: { en: "Individual", ne: "व्यक्ति" }, shop: { en: "Shop", ne: "पसल" } };
  return {
    id: row.id, category: row.category, title: both(row.content.title), description: both(row.content.description),
    locality: { en: row.content.locality, ne: row.content.locality === "Birendranagar" ? "वीरेन्द्रनगर" : row.content.locality },
    pricePaisa: row.content.pricePaisa,
    image: "/api/media?key=" + encodeURIComponent(row.content.photos[0]),
    images: row.content.photos.map(path => "/api/media?key=" + encodeURIComponent(path)),
    imageAlt: both(row.content.title), facts, sellerRole: roles[row.content.role] || both("Seller"),
    status: "available", isSample: false, confirmedAt: row.confirmedAt, details,
    depositPaisa: row.category === "rent" ? Number(details.depositPaisa) : undefined,
    condition: row.category === "items" ? both(String(details.defects)) : undefined, fees,
  };
}
