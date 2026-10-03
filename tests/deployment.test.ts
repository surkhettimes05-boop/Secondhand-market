import test from "node:test";
import assert from "node:assert/strict";
import { deploymentProblems } from "../scripts/deployment-config.mjs";
const local = { MARKET_MODE:"live", APP_ORIGIN:"http://127.0.0.1:3000", SUPABASE_URL:"http://127.0.0.1:54321", SUPABASE_ANON_KEY:"sb_publishable_fixture", SUPABASE_SERVICE_ROLE_KEY:"sb_secret_fixture", CRON_SECRET:"x".repeat(32) };
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

test("deployment rejects privileged keys in the anonymous slot", () => {
  assert.ok(deploymentProblems({...local,SUPABASE_ANON_KEY:"sb_secret_fixture"}).some((problem: string)=>problem.includes("SUPABASE_ANON_KEY")));
  const jwt = (role: string) => "header." + Buffer.from(JSON.stringify({role})).toString("base64url") + ".signature";
  assert.deepEqual(deploymentProblems({...local,SUPABASE_ANON_KEY:jwt("anon"),SUPABASE_SERVICE_ROLE_KEY:jwt("service_role")}), []);
  assert.ok(deploymentProblems({...local,SUPABASE_ANON_KEY:jwt("service_role")}).length);
});
