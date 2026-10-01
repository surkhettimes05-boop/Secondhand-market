import { z } from "zod";
export const categorySchema = z.enum(["rent", "land", "items"]);
const text = (max = 500) => z.string().trim().min(1).max(max);
const money = z.number().int().nonnegative().max(999999999999999);
export const draftContentSchema = z.object({
  title: z.string().max(100).default(""),
  description: z.string().max(3000).default(""),
  pricePaisa: money.default(0),
  locality: z.string().max(100).default("Birendranagar"),
  role: z.string().max(20).default(""),
  phonePublic: z.boolean().default(false),
  whatsapp: z.boolean().default(false),
  termsAccepted: z.boolean().default(false),
  policyVersion: z.literal("2026-10-01").default("2026-10-01"),
  photos: z.array(z.string().max(200)).max(10).default([]),
  details: z.record(z.string(), z.union([z.string().max(1000), z.number().finite(), z.boolean()])).default({}),
});
export type DraftContent = z.infer<typeof draftContentSchema>;
const base = draftContentSchema.extend({
  title: text(100).min(10),
  description: text(3000).min(30),
  pricePaisa: money.positive(),
  locality: z.literal("Birendranagar"),
  photos: z.array(z.string().regex(/^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.webp$/)).min(1).max(10),
  termsAccepted: z.literal(true),
});
const rental = base.extend({
  category: z.literal("rent"),
  role: z.enum(["owner", "broker"]),
  details: z.object({
    subtype: z.enum(["room", "flat", "house"]),
    bedrooms: z.number().int().min(1).max(100),
    depositPaisa: money,
    availableDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => !Number.isNaN(Date.parse(value)), "Use a valid date"),
    water: text(),
    bathroom: text(),
    parking: text(),
    charges: text(),
    brokerFee: text(),
  }),
});
const land = base.extend({
  category: z.literal("land"),
  role: z.enum(["owner", "broker"]),
  details: z.object({
    area: z.number().positive().max(1000000000),
    areaUnit: z.enum(["sqft", "sqm", "aana", "kattha"]),
    roadAccess: text(),
    brokerFee: text(),
    ownershipDeclared: z.literal(true),
  }),
});
const item = base.extend({
  category: z.literal("items"),
  role: z.enum(["individual", "shop"]),
  details: z.object({
    subcategory: z.enum(["furniture", "appliances", "electronics", "household"]),
    condition: z.enum(["like_new", "good", "fair", "needs_repair"]),
    defects: text(),
    pickup: text(),
  }),
});
export const listingInputSchema = z.discriminatedUnion("category", [rental, land, item]).superRefine((value, ctx) => {
  if (value.whatsapp && !value.phonePublic) ctx.addIssue({ code: "custom", path: ["whatsapp"], message: "Enable phone publication before WhatsApp." });
  const publicText = [value.title, value.description, ...Object.values(value.details).filter(part => typeof part === "string")].join(" ");
  if (/(\+?977[\s-]?)?[98][0-9]{9}/.test(publicText)) ctx.addIssue({ code: "custom", path: ["description"], message: "Keep phone numbers out of public text; use contact consent." });
});
export function normalizeNepalPhone(raw: string): string | null {
  const normalized = raw.trim().replace(/[\s()-]/g, "");
  if (/^[98]\d{9}$/.test(normalized)) return "+977" + normalized;
  if (/^(?:\+?977)[98]\d{9}$/.test(normalized)) return "+" + normalized.replace(/^\+/, "");
  return null;
}
export function safeReturnPath(value: string | null): string {
  return value && /^\/(?!\/)/.test(value) && !/[\\\r\n]/.test(value) ? value : "/account";
}
