# Surkhet Market

A mobile-first local marketplace for Birendranagar: land sales, housing rentals and secondhand goods.

- [PRD](docs/PRD.md)
- [Phased implementation/design plan](docs/IMPLEMENTATION_PLAN.md)
- [Backend setup](docs/BACKEND_SETUP.md)
- [Backend status](docs/BACKEND_STATUS.md)
- [Deployment guide](docs/DEPLOYMENT.md)
- [Deployment verification](docs/DEPLOYMENT_STATUS.md)

## Modes

**Preview** (default): clearly labelled sample inventory; local favorites/text drafts and temporary photo previews. No real transactions.

**Live**: Supabase phone login, persistent drafts, processed private photo uploads, MFA-gated moderation, reviewed publication, owner lifecycle controls, account favorites, seller-contact consent, inquiries/reports/appeals, notifications and expiry jobs. Real services must be configured; live outages never show sample listings.

## Run

Node.js 22.18+ required.

1. `npm ci`
2. Copy `.env.example` to private `.env.local` (leave MARKET_MODE=preview to explore without services).
3. `npm run dev`, then open http://localhost:3000.

Deployment configuration: `npm run deploy:check` (also runs before builds).

Checks: `npm run typecheck`, `npm test`, `npm run build`.

Preview browser checks: `npx playwright install chromium` then `npm run test:e2e`.
Live integration: follow BACKEND_SETUP.md, then `npm run test:e2e:live`.

## Architecture

Next.js App Router; Supabase SSR sessions; Zod domain validation; PostgreSQL RPCs/RLS; Sharp photo processing; private Supabase storage; Playwright and PostgreSQL security tests.

Apply only `supabase/migrations`. `db/001_marketplace_foundation.sql` is an older proposed schema, not the executable integration.

The server-only service key is used for processed storage operations and expiry jobs, not caller business authorization. Never commit secrets. Fixed SMS fixtures in the local Supabase config are test-only and must not be enabled in hosted production.

## Readiness

Uploading code does not provision real SMS/database services or deploy a production marketplace. See setup/status documents for verified checks, deliberate boundaries and remaining launch gates. Photo removal/reorder, retention/erasure, orphan cleanup and scaling remain further work.

Homepage illustrative photography comes from Unsplash; Google Fonts is temporary. Real listings require seller-owned/authorized photos. Self-host licensed brand fonts before public launch.

## Vercel deployment source

The connected Vercel project must deploy `feat/marketplace-foundation`. Deploy this branch once before selecting an existing deployment for the production domain. Keep `MARKET_MODE=preview` until hosted Supabase and authentication services are configured.
