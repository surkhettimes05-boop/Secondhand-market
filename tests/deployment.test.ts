import test from "node:test";
import assert from "node:assert/strict";
import { deploymentProblems } from "../scripts/deployment-config.mjs";
const local = { MARKET_MODE:"live", APP_ORIGIN:"http://127.0.0.1:3000", SUPABASE_URL:"http://127.0.0.1:54321", SUPABASE_ANON_KEY:"fixture", SUPABASE_SERVICE_ROLE_KEY:"fixture", CRON_SECRET:"x".repeat(32) };
test("deployment rejects incomplete live settings and public secrets", () => {
  assert.deepEqual(deploymentProblems({}), []);
  assert.ok(deploymentProblems({MARKET_MODE:"live"}).length >= 5);
  assert.ok(deploymentProblems({NEXT_PUBLIC_SERVICE_ROLE_KEY:"private"}).length);
  assert.ok(deploymentProblems({...local,APP_ORIGIN:"http://127.0.0.1:3000/"}).length);
  assert.ok(deploymentProblems({...local,MARKET_MODE:"typo"}).length);
});
test("hosted live settings require HTTPS origins and CAPTCHA without rejecting local integration", () => {
  assert.deepEqual(deploymentProblems(local), []);
  assert.ok(deploymentProblems({...local,VERCEL:"1"}).length >= 3);
  assert.deepEqual(deploymentProblems({...local,VERCEL:"1",APP_ORIGIN:"https://market.example",SUPABASE_URL:"https://project.supabase.co",NEXT_PUBLIC_TURNSTILE_SITE_KEY:"public-site-key"}), []);
});
