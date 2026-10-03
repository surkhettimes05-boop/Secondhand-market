# Deployment preparation status

Updated: 2026-10-03 (Nepal)
Code commit: `909f162007bc1ed574de226e67da31113f5c077f`
[Successful CI run](https://github.com/surkhettimes05-boop/Secondhand-market/actions/runs/37140033121)
[Pull request #1](https://github.com/surkhettimes05-boop/Secondhand-market/pull/1)

## Prepared and verified

- Committed npm lockfile; CI and Vercel use npm ci.
- Node.js 22 runtime declaration and consistent CI version.
- Automatic prebuild checks for live credentials, exact origin, hosted HTTPS, CAPTCHA site key and correct Supabase key roles. No secret values are printed.
- Explicit Next.js Vercel install/build configuration and daily expiry cron.
- Noncached /api/health: preview is labelled; live checks database availability with a five-second timeout and returns 503 on failure.
- Security headers for framing, MIME sniffing, referrers and browser permissions.
- Live upload limit of 3 MB per photo, with server-side multipart bounds below Vercel's request limit.
- [Deployment guide](DEPLOYMENT.md) with staging, migrations, private configuration, smoke tests, cron, monitoring and rollback.

Both CI jobs passed with locked installs, type checks and production builds. Preview: 10 passing Node domain/configuration checks, one database suite skipped intentionally, and 10 desktop/mobile browser tests. Backend: 17 passing Node results including nested PostgreSQL cases, and the complete real local backend browser flow, now including health verification.

## External setup still required

No hosted Supabase/Vercel project or deployment has been created by this code preparation. Create/configure those projects, real Nepal SMS, SMTP, native CAPTCHA and TOTP, apply all migrations, set private environment values, then deploy and run the guide's smoke tests.

Provider delivery, hosted storage/functions, production restores and manual mobile/design/accessibility checks remain unverified. Retention/erasure, orphan cleanup, pagination and live photo removal/reordering remain further product work. This is a tested deployment package for a pilot; it does not establish public-launch readiness or completion of the whole PRD.
