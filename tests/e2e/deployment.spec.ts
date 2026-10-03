import { test, expect } from "@playwright/test";
test("preview health is explicit and deployment headers are present", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toEqual({ status: "ok", mode: "preview" });
  expect(health.headers()["cache-control"]).toContain("no-store");
  const home = await request.get("/");
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  expect(home.headers()["x-frame-options"]).toBe("DENY");
});
