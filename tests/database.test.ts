import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";
test("real PostgreSQL permissions, review snapshots, MFA and expiry", { skip: !process.env.DATABASE_URL }, async context => {
  const connection = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await connection.connect();
  const seller = randomUUID(), buyer = randomUUID(), moderator = randomUUID();
  let id = "";
  const path = seller + "/" + randomUUID() + "/" + randomUUID() + ".webp";
  const content = {
    title: "Database-tested rental flat",
    description: "A genuine test fixture with complete rental cost and arrangement disclosures.",
    pricePaisa: 1800000, locality: "Birendranagar", role: "owner",
    phonePublic: true, whatsapp: false, termsAccepted: true, policyVersion: "2026-10-01",
    photos: [] as string[],
    privatePhone: "DO-NOT-EXPOSE",
    details: { subtype: "flat", bedrooms: 2, depositPaisa: 0, availableDate: "2026-11-01", water: "Shared water", bathroom: "Private", parking: "None", charges: "Utilities extra", brokerFee: "None", internalNote: "DO-NOT-EXPOSE" },
  };
  async function acting(user: string | null, aal = "aal1") {
    await connection.query("reset role");
    await connection.query("select set_config('request.jwt.claims',$1,true)", [JSON.stringify({ sub: user, role: user ? "authenticated" : "anon", aal })]);
    await connection.query(user ? "set local role authenticated" : "set local role anon");
  }
  async function denied(sql: string, params: unknown[] = []) {
    await connection.query("savepoint expected_denial");
    try {
      await assert.rejects(connection.query(sql, params), /permission|Not allowed|MFA|Verified|Contact unavailable|Listing is not editable|not permitted/i);
    } finally { await connection.query("rollback to savepoint expected_denial"); }
  }
  try {
    await connection.query("begin");
    for (const [user, phone] of [[seller, "9779800000091"], [buyer, "9779800000092"], [moderator, "9779800000093"]]) {
      await connection.query("insert into auth.users(id,aud,role,phone,phone_confirmed_at) values($1,'authenticated','authenticated',$2,now())", [user,phone]);
    }
    await connection.query("insert into private.market_moderators(user_id) values($1)", [moderator]);
    await acting(seller);
    id = (await connection.query("select public.market_save_draft(null,'rent',$1::jsonb) as id", [JSON.stringify(content)])).rows[0].id;
    const objectPath = path.replace(path.split("/")[1], id);
    await connection.query("reset role");
    await connection.query("insert into storage.objects(bucket_id,name,metadata) values('market-media',$1,'{\"mimetype\":\"image/webp\",\"size\":100}')", [objectPath]);
    await acting(seller);
    await connection.query("select public.market_register_media($1,$2)", [id,objectPath]);
    content.photos = [objectPath];
    await connection.query("select public.market_save_draft($1,'rent',$2::jsonb)", [id,JSON.stringify(content)]);
    await context.test("another user cannot see or overwrite private drafts or self-publish", async () => {
      await acting(buyer);
      assert.equal((await connection.query("select id from public.market_listings where id=$1",[id])).rowCount,0);
      await denied("select public.market_save_draft($1,'rent',$2::jsonb)",[id,JSON.stringify(content)]);
      await denied("update public.market_listings set status='published' where id=$1",[id]);
      await denied("insert into private.market_moderators(user_id) values($1)",[buyer]);
      await denied("insert into storage.objects(bucket_id,name) values('market-media','arbitrary.webp')");
    });
    await context.test("pending content/photos stay private and repeat submission is idempotent", async () => {
      await acting(seller);
      await connection.query("select public.market_submit($1)",[id]);
      await connection.query("select public.market_submit($1)",[id]);
      await denied("select public.market_save_draft($1,'rent',$2::jsonb)",[id,JSON.stringify(content)]);
      await acting(null);
      assert.equal((await connection.query("select public.market_catalog() as data")).rows[0].data.length,0);
      assert.equal((await connection.query("select public.market_public_media($1) as visible",[objectPath])).rows[0].visible,false);
      await denied("select public.market_contact($1)",[id]);
    });
    await context.test("moderator membership alone is insufficient; MFA then permits approval", async () => {
      await acting(moderator);
      await denied("select public.market_review($1,'approve','Complete details')",[id]);
      await acting(buyer,"aal2");
      await denied("select public.market_review($1,'approve','Complete details')",[id]);
      await acting(moderator,"aal2");
      await connection.query("select public.market_review($1,'approve','Complete details and consent')",[id]);
      await acting(null);
      const catalog=(await connection.query("select public.market_catalog() as data")).rows[0].data;
      assert.equal(catalog.length,1);
      assert.equal(catalog[0].content.title,content.title);
      assert.ok(!JSON.stringify(catalog).includes("DO-NOT-EXPOSE"));
      assert.ok(!JSON.stringify(catalog).includes("9779800000091"));
      assert.equal((await connection.query("select public.market_public_media($1) as visible",[objectPath])).rows[0].visible,true);
    });
    await context.test("edits preserve approved public content and inquiry phone disclosure is opt-in", async () => {
      await acting(seller);
      await connection.query("select public.market_save_draft($1,'rent',$2::jsonb)",[id,JSON.stringify({...content,title:"Changed pending rental title"})]);
      await acting(null);
      assert.equal((await connection.query("select public.market_catalog() as data")).rows[0].data[0].content.title,content.title);
      await acting(buyer);
      await connection.query("select public.market_inquire($1,'Can I inspect this flat tomorrow?',false)",[id]);
      await connection.query("select public.market_favorite($1)",[id]);
      await acting(seller);
      const inbox=(await connection.query("select public.market_inbox() as data")).rows[0].data;
      assert.equal(inbox[0].senderPhone,null);
    });
    await context.test("expiry blocks public reads, photos and contact even before scheduled jobs", async () => {
      await connection.query("reset role");
      await connection.query("update public.market_listings set expires_at=now()-interval '1 second' where id=$1",[id]);
      await acting(null);
      assert.equal((await connection.query("select public.market_catalog() as data")).rows[0].data.length,0);
      assert.equal((await connection.query("select public.market_public_media($1) as visible",[objectPath])).rows[0].visible,false);
      await acting(buyer);
      await denied("select public.market_contact($1)",[id]);
      await connection.query("reset role");
      assert.equal((await connection.query("select public.market_expire() as total")).rows[0].total,1);
      assert.equal((await connection.query("select public.market_expire() as total")).rows[0].total,0);
    });
  } finally {
    await connection.query("rollback");
    await connection.end();
  }
});
