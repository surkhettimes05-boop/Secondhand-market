# Deployment handoff: Vercel + Supabase

Prepared 2026-10-03 (Nepal). Code lives in PR #1 on feat/marketplace-foundation; main currently contains planning documents, not the app.

## Preview deployment

Import this GitHub repository in Vercel, use the Next.js preset, root directory '.', Node.js 22.x and npm. Select feat/marketplace-foundation as the preview source, or merge the reviewed PR before using main. Keep MARKET_MODE=preview and use the committed package-lock.json with npm ci. A preview contains labelled sample inventory and cannot accept real listings.

The build runs configuration validation automatically. Do not configure preview deployments with production database keys. Use a separate Supabase staging project for live integration previews.

## Live deployment

1. Create Supabase staging and production projects. Use docs/BACKEND_SETUP.md to apply all five migrations in order, configure phone/SMS, SMTP moderator email verification, native Turnstile CAPTCHA and TOTP. Never copy local fixed OTPs or dummy Twilio values into hosted projects.
2. Import/link the repository in Vercel. Set these privately for the appropriate environment:
   MARKET_MODE=live, APP_ORIGIN=the exact HTTPS website origin without trailing slash, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY and a random CRON_SECRET of at least 32 characters.
3. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY to the public site key and configure its matching secret in Supabase. Allow the actual website domain in Turnstile. Set Supabase Site URL/allowed redirect URLs to the intended site.
4. Run npm run deploy:check before npm run build. Hosted live builds reject incomplete settings, non-HTTPS origins, public private-key variables and a missing CAPTCHA site key. The checks do not establish that provider delivery or CAPTCHA settings work.
5. Deploy staging first. Verify /api/health returns status=ok, mode=live and database=reachable. Preview health explicitly returns mode=preview. Health checks database catalog availability only; SMS, SMTP, storage, permissions and cron require the smoke tests below.
6. Confirm a real Nepal phone OTP, moderator email code and authenticator. Submit an authorized listing with a photo smaller than 3 MB, confirm anonymous photo/catalog denial before approval, then approve with a different moderator.
7. Verify public discovery/photo visibility, phone consent, inquiry phone privacy, saved-listing persistence, reports/appeals, owner pause/withdraw and expiry. Check the 3 MB file limit in the composer; larger source images need compression first.
8. Vercel runs /api/jobs/expiry daily at 02:00 UTC (07:45 Nepal time). Its CRON_SECRET environment value authorizes the job automatically. Verify unauthorized requests return 401. Expired listings are blocked synchronously even if cron is delayed.
9. Review staging on actual mobile devices. Complete operator identity/support details, policies, backup/restore, monitoring, retention/account deletion and manual accessibility review before a public launch.
10. Merge the reviewed PR, deploy the same tested commit to the production environment and repeat production smoke tests before inviting users.

## Operational checks and rollback

Use external uptime monitoring on /api/health. Inspect Vercel function/build logs for failures without logging OTPs, phone numbers or private keys. Review Supabase auth and database/storage errors. Keep a release record of the deployed commit and applied migrations.

If smoke tests fail, leave the production alias on the previous working deployment. Roll back through Vercel's deployment dashboard. Code rollback does not undo database migrations; use forward-compatible schema changes and verify backups/restores separately.

## Current boundaries

This repository preparation does not create paid accounts, hosted projects, secrets or a public deployment. Live SMS/SMTP/CAPTCHA and production restores remain unverified. Server pagination, photo removal/reordering, retention/erasure and orphan-media cleanup remain additional product work. Pilot deployment readiness is separate from completion of the entire PRD.
