export function deploymentProblems(env) {
  const problems = [];
  const mode = env.MARKET_MODE || "preview";
  if (!["preview", "live"].includes(mode)) problems.push("MARKET_MODE must be preview or live.");
  for (const key of Object.keys(env)) if (/^NEXT_PUBLIC_.*(SERVICE_ROLE|SECRET|PRIVATE_KEY)/.test(key) && env[key]) problems.push(key + " must never be public.");
  if (mode !== "live") return problems;
  for (const key of ["APP_ORIGIN","SUPABASE_URL","SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY","CRON_SECRET"]) if (!env[key]?.trim()) problems.push(key + " is required in live mode.");
  if ((env.CRON_SECRET || "").length < 32) problems.push("CRON_SECRET must contain at least 32 characters.");
  for (const key of ["APP_ORIGIN","SUPABASE_URL"]) {
    try {
      const url = new URL(env[key]);
      if (!["http:","https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || (url.pathname !== "/" && url.pathname !== "")) throw new Error();
      if (key === "APP_ORIGIN" && env[key] !== url.origin) throw new Error();
      if (env.VERCEL === "1" && (url.protocol !== "https:" || ["localhost","127.0.0.1","::1","[::1]"].includes(url.hostname))) problems.push(key + " must use a public HTTPS origin on Vercel.");
    } catch { problems.push(key + " must be a valid origin without credentials, query or path."); }
  }
  for (const [key, prefix, role] of [["SUPABASE_ANON_KEY","sb_publishable_","anon"],["SUPABASE_SERVICE_ROLE_KEY","sb_secret_","service_role"]]) {
    const value = env[key] || "";
    if (value.startsWith(prefix)) continue;
    try {
      const payload = JSON.parse(Buffer.from(value.split(".")[1] || "", "base64url").toString());
      if (payload.role !== role) throw new Error();
    } catch { problems.push(key + " has the wrong key type. Use the correct project API key."); }
  }
  if (env.VERCEL === "1" && !env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()) problems.push("NEXT_PUBLIC_TURNSTILE_SITE_KEY is required for hosted live login; configure matching native Supabase CAPTCHA.");
  return problems;
}
