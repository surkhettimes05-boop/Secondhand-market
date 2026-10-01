"use client";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api, ApiError } from "@/lib/api-client";
import { useMarket } from "./market-provider";
export type Account = { user: { id: string; phone: string; displayName: string }; member: boolean; moderator: boolean };
export function useAccount() {
  const { mode } = useMarket();
  const pathname = usePathname();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    if (mode !== "live") { setLoading(false); setAccount(null); return; }
    setLoading(true);
    try { setAccount(await api<Account>("/api/auth")); setError(""); }
    catch (problem) {
      setAccount(null);
      setError(problem instanceof ApiError && problem.status === 401 ? "" : problem instanceof Error ? problem.message : "Account unavailable.");
    } finally { setLoading(false); }
  }, [mode]);
  useEffect(() => { void reload(); }, [reload, pathname]);
  return { account, loading: loading || mode === "loading", error, reload };
}
