"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Language, Listing } from "@/lib/market";
import { api, ApiError } from "@/lib/api-client";
type Mode = "loading" | "preview" | "live" | "error";
type ContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (en: string, ne: string) => string;
  saved: string[];
  toggleSaved: (id: string) => void;
  ready: boolean;
  storageWarning: boolean;
  inventory: Listing[];
  mode: Mode;
  catalogError: string;
  reloadCatalog: () => void;
};
const Context = createContext<ContextValue | null>(null);
export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [inventory, setInventory] = useState<Listing[]>([]);
  const [mode, setMode] = useState<Mode>("loading");
  const [catalogError, setCatalogError] = useState("");
  const [revision, setRevision] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    try {
      if (localStorage.getItem("surkhet-language") === "ne") setLanguage("ne");
    } catch { setStorageWarning(true); }
    setReady(true);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    if (ready) try { localStorage.setItem("surkhet-language", language); } catch { setStorageWarning(true); }
  }, [language, ready]);
  useEffect(() => {
    let alive = true;
    api<{ mode: "preview" | "live"; listings: Listing[] }>("/api/catalog")
      .then(result => {
        if (!alive) return;
        setMode(result.mode); setInventory(result.listings); setCatalogError("");
      })
      .catch(() => { if (alive) { setMode("error"); setInventory([]); setCatalogError("Listings are temporarily unavailable."); } });
    return () => { alive = false; };
  }, [revision, pathname]);
  useEffect(() => {
    let alive = true;
    if (mode === "live") {
      api<{ ids: string[] }>("/api/favorites").then(result => { if (alive) setSaved(result.ids); }).catch(() => { if (alive) setSaved([]); });
    } else if (mode === "preview") {
      try {
        const parsed: unknown = JSON.parse(localStorage.getItem("surkhet-saved") || "[]");
        setSaved(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string").slice(0, 100) : []);
      } catch { setStorageWarning(true); }
    }
    return () => { alive = false; };
  }, [mode, pathname]);
  async function toggleSaved(id: string) {
    if (mode === "live") {
      try {
        const result = await api<{ ids: string[] }>("/api/favorites", { id });
        setSaved(result.ids);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) router.push("/login?next=" + encodeURIComponent(pathname));
        else setCatalogError("Could not update saved listings. Try again.");
      }
      return;
    }
    if (mode !== "preview") return;
    setSaved(current => {
      const next = current.includes(id) ? current.filter(value => value !== id) : [...current, id];
      try { localStorage.setItem("surkhet-saved", JSON.stringify(next)); } catch { setStorageWarning(true); }
      return next;
    });
  }
  return <Context.Provider value={{
    language, setLanguage, t: (en, ne) => language === "en" ? en : ne,
    saved, toggleSaved, ready: ready && mode !== "loading", storageWarning,
    inventory, mode, catalogError, reloadCatalog: () => setRevision(current => current + 1),
  }}>{children}</Context.Provider>;
}
export function useMarket() {
  const value = useContext(Context);
  if (!value) throw new Error("MarketProvider is required");
  return value;
}
