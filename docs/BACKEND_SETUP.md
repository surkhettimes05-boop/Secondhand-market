# Backend setup and live-service handoff

## Implemented integration

Supabase provides phone identity, PostgreSQL and private processed-photo storage. User routes use cookie-backed caller sessions and database permissions. A server-only service key is limited in application code to processed image writes/deletion compensation and the expiry job.

The executable schema is under `supabase/migrations`. The old `db/001_marketplace_foundation.sql` is an earlier planning baseline; **do not apply it alongside these migrations**.

## Live project prerequisites

1. Create/select a Supabase project. Review its region, billing and backup plan.
2. Enable phone authentication, configure a Nepal-compatible SMS provider, and test real delivery. Set OTP expiry to 300 seconds, resend cooldown of at least 60 seconds, appropriate send/verification limits and production bot protection.
3. Enable TOTP MFA. Moderators need a verified phone and enrolled authenticator.
4. Apply migrations with the Supabase CLI against the selected project. Review migration output and RLS tests first.
5. Configure server environment values privately:
   - `MARKET_MODE=live`
   - `APP_ORIGIN`: exact website origin, without trailing slash.
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`: server-only; never prefix with NEXT_PUBLIC.
   - `CRON_SECRET`: at least 32 random characters.
6. Assign a moderator manually in the trusted SQL console, using their actual verified user UUID:
   `insert into private.market_moderators(user_id) values ('ACTUAL_USER_UUID');`
   This membership table has no public self-registration path.
7. Sign in as that moderator, enroll an authenticator in Account, verify it, and open Moderation.
8. Submit an authorized real listing, upload actual photos, and approve it using a different moderator account.
9. Test contact consent, inquiries, expiry, reporting and appeals before inviting real users.

Never share private keys in chat or commit them to GitHub. `.env.example` contains placeholders only.

## Local development / CI

The checked-in `supabase/config.toml` is **local-only**. Its fixed SMS test codes use synthetic phone numbers solely for isolated integration tests. They must never be configured on hosted production.

With Docker and Node.js 22 available:
1. `npm install`
2. `npx supabase start --exclude studio,realtime,imgproxy,inbucket,logflare,vector,edge-runtime`
3. Obtain local status and configure a private `.env.local`; do not dump hosted secrets.
4. `npm run typecheck`, `npm test`, `npm run build`.
5. `npx playwright install chromium` and `npm run test:e2e:live`.
6. Stop local containers with `npx supabase stop --no-backup`.

Node test database assertions run when DATABASE_URL is present. Browser integration uses real local Supabase sessions, storage, database and MFA; it does not mock application authorization.

## Behaviour and deliberate boundaries

- Preview runs without services and stays clearly labelled.
- Live mode never falls back to sample listings on an outage or missing configuration.
- Only approved, unexpired listings owned by active profiles are public.
- Editing preserves approved content until a moderator approves the new draft.
- Public data uses an explicit allowlist and excludes phone numbers.
- Private bucket policies prevent anonymous access before approval and after expiry/removal.
- Uploads decode/re-encode static JPEG/PNG/WebP, remove metadata, enforce size/pixel limits and store WebP derivatives.
- Publication requires at least one registered photo and category-specific disclosures.
- Native SMS rate/bot controls must be configured in Supabase; an application endpoint alone cannot protect a public auth provider.
- Contact reveal currently requires sign-in and seller consent, with per-account database limits. This is stricter than the PRD's initial anonymous-call concept; public reveal needs a trusted edge rate-limiting design before enabling it.
- Favorites and inquiries persist on the account in live mode.
- Expiry/reminder notifications run via a secret-authenticated job. Availability is also enforced synchronously, so delayed cron never keeps an expired listing public.
- Report submission currently requires sign-in.
- The initial public catalog returns up to 500 listings. Server-side paginated discovery is a further scaling task.
- Photos cannot yet be reordered/removed in the live composer. Up to 20 registered media records accommodate approved/pending versions; submissions contain at most 10.
- Prelaunch policy wording is not a legal-review completion claim.

## Before a public launch

Complete real SMS delivery and spam-control tests, production migration/restore checks, operator identity/support details, validated ward/neighbourhood data, local legal review, retention/deletion automation, orphan-media cleanup, audit/monitoring runbooks, manual visual/accessibility review and authorized seed supply.

No hosted project, paid SMS account or production deployment is created by uploading this integration.
