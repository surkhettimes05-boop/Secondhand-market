"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Language } from "@/lib/market";
type MarketContext = { language: Language; setLanguage: (language: Language) => void; t: (en: string, ne: string) => string; saved: string[]; toggleSaved: (id: string) => void; ready: boolean; storageWarning: boolean };
const Context = createContext<MarketContext | null>(null);
export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [language,setLanguage] = useState<Language>("en");
  const [saved,setSaved] = useState<string[]>([]);
  const [ready,setReady] = useState(false);
  const [storageWarning,setStorageWarning] = useState(false);
  useEffect(()=>{
    try {
      const locale=localStorage.getItem("surkhet-language");
      if(locale==="ne") setLanguage("ne");
      const parsed:unknown=JSON.parse(localStorage.getItem("surkhet-saved") || "[]");
      if(Array.isArray(parsed)) setSaved(parsed.filter((id):id is string=>typeof id==="string").slice(0,100));
    } catch { setStorageWarning(true); }
    setReady(true);
  },[]);
  useEffect(()=>{ document.documentElement.lang=language; if(ready) try { localStorage.setItem("surkhet-language",language); localStorage.setItem("surkhet-saved",JSON.stringify(saved)); } catch {setStorageWarning(true);} },[language,saved,ready]);
  return <Context.Provider value={{language,setLanguage,t:(en,ne)=>language==="en"?en:ne,saved,toggleSaved:id=>setSaved(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]),ready,storageWarning}}>{children}</Context.Provider>;
}
export function useMarket() { const value=useContext(Context); if(!value) throw new Error("MarketProvider is required"); return value; }
