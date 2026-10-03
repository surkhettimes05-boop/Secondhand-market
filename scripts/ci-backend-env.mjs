// Reads only LOCAL Supabase CI status, never hosted production credentials.
import { readFileSync, appendFileSync } from "node:fs";
const local = JSON.parse(readFileSync("/tmp/surkhet-ci-backend.json", "utf8"));
const required = ["API_URL", "ANON_KEY", "SERVICE_ROLE_KEY", "DB_URL"];
for (const key of required) if (!local[key]) throw new Error("Local Supabase status is missing " + key);
const env = {
  MARKET_MODE: "live", APP_ORIGIN: "http://127.0.0.1:3000",
  SUPABASE_URL: local.API_URL, SUPABASE_ANON_KEY: local.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: local.SERVICE_ROLE_KEY, DATABASE_URL: local.DB_URL,
  CRON_SECRET: "local-ci-only-expiry-token-1234567890",
};
appendFileSync(process.env.GITHUB_ENV, Object.entries(env).map(([key,value])=>key+"="+value).join("\n")+"\n");
