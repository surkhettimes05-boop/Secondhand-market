import { test, expect, request as playwrightRequest, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import pg from "pg";
import sharp from "sharp";
const origin = "http://127.0.0.1:3000";
const headers = { origin };
async function signIn(page: Page, phone: string) {
  await page.goto("/login");
  await page.getByLabel("Mobile number", { exact: true }).fill(phone);
  const sending = page.waitForResponse(response => response.url().endsWith("/api/auth") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Send code", exact: true }).click();
  const sent = await sending;
  if (sent.status() !== 200) {
    const probe = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
    const result = await probe.auth.signInWithOtp({ phone: "+977" + phone });
    throw new Error("Local OTP diagnostic: " + JSON.stringify({ api: await sent.json(), code: result.error?.code, status: result.error?.status, message: result.error?.message }));
  }
  await expect(page.getByLabel("6-digit code", { exact: true })).toBeVisible();
  await page.getByLabel("6-digit code", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Verify and sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole("heading", { name: "Your listings", exact: true })).toBeVisible();
}
function totp(secret: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0, accumulator = 0;
  const bytes: number[] = [];
  for (const character of secret.toUpperCase().replace(/=+$/, "")) {
    const value = alphabet.indexOf(character);
    if (value < 0) throw new Error("Invalid test authenticator key");
    accumulator = (accumulator << 5) | value; bits += 5;
    if (bits >= 8) { bytes.push((accumulator >>> (bits - 8)) & 255); bits -= 8; }
  }
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac("sha1", Buffer.from(bytes)).update(counter).digest();
  const offset = digest[digest.length - 1] & 15;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(6, "0");
}
test("real identity, private upload, MFA review, contact, inquiry and expiry", async ({ page, browser }, testInfo) => {
  const service = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const created = await service.auth.admin.createUser({ phone: "+9779800000003", phone_confirm: true });
  expect(created.error).toBeNull();
  const moderatorId = created.data.user!.id;
  const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  await db.query("insert into private.market_moderators(user_id) values($1)", [moderatorId]);
  const anonymous = await playwrightRequest.newContext({ baseURL: origin });
  const adminContext = await browser.newContext({ baseURL: origin });
  const buyerContext = await browser.newContext({ baseURL: origin, viewport: { width: 390, height: 844 } });
  const adminPage = await adminContext.newPage();
  const buyerPage = await buyerContext.newPage();
  try {
    await signIn(page, "9800000001");
    await page.goto("/post");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByLabel("Listing title", { exact: true }).fill("CI rental listing in Birendranagar");
    await page.getByLabel("Description", { exact: true }).fill("A local integration test flat with separate costs, a private bathroom and clear arrangements.");
    await page.getByLabel("Monthly rent (NPR)", { exact: true }).fill("18000");
    await page.getByLabel("Your role", { exact: true }).selectOption("owner");
    await page.getByLabel("Rental type", { exact: true }).selectOption("flat");
    await page.getByLabel("Bedrooms", { exact: true }).fill("2");
    await page.getByLabel("Available from", { exact: true }).fill("2026-11-01");
    await page.getByLabel("Deposit (NPR; 0 if none)", { exact: true }).fill("0");
    await page.getByLabel("Water arrangement", { exact: true }).fill("Shared supply");
    await page.getByLabel("Bathroom arrangement", { exact: true }).fill("Private bathroom");
    await page.getByLabel("Parking", { exact: true }).fill("No parking");
    await page.getByLabel("Additional charges (state none if none)", { exact: true }).fill("Utilities extra");
    await page.getByLabel("Broker fee (state none if none)", { exact: true }).fill("None");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Show it as it is.", exact: true })).toBeVisible();
    const photo = await sharp({ create: { width: 160, height: 100, channels: 3, background: "#b8c6dc" } }).png().toBuffer();
    await page.getByLabel("Upload listing photos", { exact: true }).setInputFiles({ name: "test-room.png", mimeType: "image/png", buffer: photo });
    await expect(page.getByText("Photos uploaded privately and draft saved.")).toBeVisible();
    const privateListings = await (await page.request.get("/api/listings")).json();
    const listing = privateListings.listings[0];
    const id = listing.id;
    const media = "/api/media?key=" + encodeURIComponent(listing.draft_content.photos[0]);
    expect((await anonymous.get(media)).status()).toBe(404);
    expect((await page.request.get(media)).status()).toBe(200);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByLabel("Allow signed-in buyers to reveal my verified phone for this listing.", { exact: true }).check();
    await page.getByLabel(/I confirm accurate details and agree/).check();
    await page.getByRole("button", { name: "Submit for review", exact: true }).click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.locator(".account-listing").first()).toContainText("Pending review");
    expect((await (await anonymous.get("/api/catalog")).json()).listings).toHaveLength(0);

    await signIn(adminPage, "9800000003");
    expect((await adminPage.request.get("/api/moderation")).status()).toBe(403);
    const enrolling = adminPage.waitForResponse(response => response.url().endsWith("/api/auth/mfa") && response.request().method() === "POST");
    await adminPage.getByRole("button", { name: "Set up authenticator", exact: true }).click();
    const enrollment = await (await enrolling).json();
    expect(enrollment.factorId).toBeTruthy();
    await adminPage.getByLabel("Authenticator code", { exact: true }).fill(totp(enrollment.setupKey));
    await adminPage.getByRole("button", { name: "Verify authenticator", exact: true }).click();
    await adminPage.getByRole("link", { name: "Open moderation", exact: true }).click();
    await expect(adminPage.getByRole("heading", { name: "CI rental listing in Birendranagar", exact: true })).toBeVisible();
    await adminPage.getByLabel("Decision reason", { exact: true }).fill("Complete disclosures, consent and actual test photo.");
    await adminPage.getByRole("button", { name: "Approve", exact: true }).click();
    await expect(adminPage.getByText("Decision saved.", { exact: true })).toBeVisible();
    const catalog = await (await anonymous.get("/api/catalog")).json();
    expect(catalog.listings).toHaveLength(1);
    expect(JSON.stringify(catalog)).not.toContain("9779800000001");
    expect((await anonymous.get(media)).status()).toBe(200);

    await signIn(buyerPage, "9800000002");
    const overwritten = await buyerPage.request.post("/api/listings", { headers, data: { id, category: "rent", content: listing.draft_content } });
    expect(overwritten.status()).toBe(403);
    await buyerPage.goto("/listings/" + id);
    await buyerPage.getByRole("button", { name: "Show seller contact", exact: true }).click();
    await expect(buyerPage.getByRole("link", { name: "+9779800000001", exact: true })).toBeVisible();
    await buyerPage.getByLabel("Ask about this listing", { exact: true }).fill("Could I inspect this flat tomorrow afternoon?");
    await buyerPage.getByRole("button", { name: "Send inquiry", exact: true }).click();
    await expect(buyerPage.getByText("Inquiry sent to the seller.", { exact: true })).toBeVisible();
    const inbox = await (await page.request.get("/api/inquiries")).json();
    expect(inbox.inquiries[0].body).toContain("tomorrow");
    expect(inbox.inquiries[0].senderPhone).toBeNull();
    await buyerPage.getByRole("button", { name: "Save", exact: true }).click();
    await buyerPage.goto("/saved");
    await expect(buyerPage.locator("article")).toHaveCount(1);
    await buyerPage.goto("/listings/" + id);
    await buyerPage.screenshot({ path: testInfo.outputPath("live-mobile-listing.png"), fullPage: true });

    await db.query("update public.market_listings set expires_at=now()-interval '1 second' where id=$1", [id]);
    expect((await (await anonymous.get("/api/catalog")).json()).listings).toHaveLength(0);
    expect((await anonymous.get(media)).status()).toBe(404);
    expect((await buyerPage.request.post("/api/contact", { headers, data: { id } })).status()).toBe(400);
    expect((await anonymous.get("/api/jobs/expiry")).status()).toBe(401);
    const job = await anonymous.get("/api/jobs/expiry", { headers: { authorization: "Bearer " + process.env.CRON_SECRET } });
    expect(job.status()).toBe(200);
    expect((await job.json()).expired).toBe(1);
    await page.reload();
    await expect(page.locator(".account-listing").first()).toContainText("Expired");
  } finally {
    await db.end();
    await anonymous.dispose();
    await adminContext.close();
    await buyerContext.close();
  }
});
