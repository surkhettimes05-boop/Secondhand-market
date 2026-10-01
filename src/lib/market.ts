export type Language = "en" | "ne";
export type Category = "rent" | "land" | "items";
export type Listing = {
  id: string;
  isSample?: boolean;
  confirmedAt?: string;
  images?: string[];
  details?: Record<string, string | number | boolean>;
  category: Category;
  title: Record<Language, string>;
  description: Record<Language, string>;
  locality: Record<Language, string>;
  pricePaisa: number;
  image: string;
  imageAlt: Record<Language, string>;
  facts: Record<Language, string[]>;
  condition?: Record<Language, string>;
  sellerRole: Record<Language, string>;
  status: "available" | "sold" | "rented";
  depositPaisa?: number;
  fees: Record<Language, string>;
};
export type Filters = { query: string; category: string; locality: string; min: string; max: string; sort: string };
export const defaultFilters: Filters = { query: "", category: "all", locality: "", min: "", max: "", sort: "recommended" };
export function toPaisa(value: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return null;
  const [whole, fraction = ""] = value.trim().split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(amount) ? amount : null;
}
export function formatPrice(paisa: number, language: Language = "en") {
  return new Intl.NumberFormat(language === "ne" ? "ne-NP" : "en-IN", { style: "currency", currency: "NPR", maximumFractionDigits: paisa % 100 === 0 ? 0 : 2 }).format(paisa / 100);
}
export function filterListings(listings: Listing[], filters: Filters) {
  const terms = filters.query.trim().normalize("NFKC").toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const min = filters.min ? toPaisa(filters.min) : null;
  const max = filters.max ? toPaisa(filters.max) : null;
  const result = listings.filter(item => {
    const searchable = [item.title.en, item.title.ne, item.description.en, item.description.ne, item.locality.en, item.locality.ne].join(" ").normalize("NFKC").toLocaleLowerCase();
    return item.status === "available" &&
      (filters.category === "all" || item.category === filters.category) &&
      (!filters.locality || item.locality.en === filters.locality) &&
      (min === null || item.pricePaisa >= min) &&
      (max === null || item.pricePaisa <= max) &&
      terms.every(term => searchable.includes(term));
  });
  if (filters.sort === "price-asc") result.sort((a,b) => a.pricePaisa - b.pricePaisa || a.id.localeCompare(b.id));
  if (filters.sort === "price-desc") result.sort((a,b) => b.pricePaisa - a.pricePaisa || a.id.localeCompare(b.id));
  return result;
}
export function filtersFromParams(params: URLSearchParams): Filters {
  const category = params.get("category") || "all";
  const sort = params.get("sort") || "recommended";
  return {
    query: (params.get("q") || "").slice(0,200),
    category: ["all","rent","land","items"].includes(category) ? category : "all",
    locality: (params.get("locality") || "").slice(0,100),
    min: params.get("min") && toPaisa(params.get("min")!) !== null ? params.get("min")! : "",
    max: params.get("max") && toPaisa(params.get("max")!) !== null ? params.get("max")! : "",
    sort: ["recommended","price-asc","price-desc"].includes(sort) ? sort : "recommended",
  };
}
export function filtersToParams(filters: Filters): string {
  const params = new URLSearchParams();
  if(filters.query) params.set("q", filters.query);
  if(filters.category !== "all") params.set("category", filters.category);
  if(filters.locality) params.set("locality", filters.locality);
  if(filters.min) params.set("min", filters.min);
  if(filters.max) params.set("max", filters.max);
  if(filters.sort !== "recommended") params.set("sort", filters.sort);
  return params.toString();
}
export type Draft = { category: Category; title: string; description: string; price: string; locality: string; detail: string; deposit: string; fee: string; role: string; photos: string[] };
export const emptyDraft: Draft = { category:"rent",title:"",description:"",price:"",locality:"",detail:"",deposit:"",fee:"",role:"",photos:[] };
export function validateDraft(draft: Draft): string[] {
  const errors: string[] = [];
  if(draft.title.trim().length < 10 || draft.title.trim().length > 100) errors.push("title");
  if(draft.description.trim().length < 30 || draft.description.trim().length > 3000) errors.push("description");
  const amount = toPaisa(draft.price);
  if(amount === null || amount <= 0) errors.push("price");
  if(!draft.locality.trim()) errors.push("locality");
  if(!draft.detail.trim()) errors.push("detail");
  if(!draft.role) errors.push("role");
  if(!draft.fee.trim()) errors.push("fee");
  if(draft.category === "rent" && toPaisa(draft.deposit) === null) errors.push("deposit");
  return errors;
}
