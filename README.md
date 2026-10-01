# Surkhet Market

Mobile-first Birendranagar marketplace, following [the PRD](docs/PRD.md) and [the phased implementation plan](docs/IMPLEMENTATION_PLAN.md).

## Current implementation

Phase 1 design preview and initial application foundation:
- Responsive home, search, listing detail, saved listings and four-stage posting screens.
- English/Nepali interface toggle and illustrative inventory.
- Working bilingual search, price/category/locality filters and URL state.
- Device-local favorites and text drafts; temporary photo previews.
- Typed domain rules, monetary validation, meaningful domain tests and CI checks.

**This is a prototype, not a production marketplace.** No real accounts, sellers, publication, contact, verified identity, payments or server persistence exist yet. Sample photographs are not evidence of local properties. All preview routes request no indexing.

## Run locally

Requires Node.js 22.18+ and npm.

1. Run `npm install`.
2. Run `npm run dev`.
3. Open http://localhost:3000.

Verification: `npm run typecheck`, `npm test`, `npm run build`.

Browser verification: after a build, run `npx playwright install chromium` and `npm run test:e2e`. The test runner starts the production server automatically. CI runs desktop/mobile browser flows and uploads screenshots/reports.

[Passing CI evidence](https://github.com/surkhettimes05-boop/Secondhand-market/actions/runs/36917000463) covers the implementation commit recorded in the status document.

Dependencies currently use compatible version ranges. CI installs them directly; generating and committing a reviewed package lock is an outstanding foundation task once the runtime is available.

## Structure

- `src/app`: Next.js App Router pages, metadata and design tokens/styles.
- `src/components`: product screens and shared UI.
- `src/lib`: domain types, filtering, currency and draft validation.
- `tests`: money/search/draft-validation tests.
- `db`: proposed schema baseline for the backend phase.
- `docs`: requirements, plan and current implementation status.

## Privacy and fixtures

Language, favorites and text drafts are browser-local. Photos use temporary object URLs and are not uploaded or persisted. Avoid entering sensitive information. Unsplash image requests and Google Fonts requests are external. Replace with licensed self-hosted brand fonts and seller-owned photos before production.

Illustrative Unsplash photos are linked for design evaluation; they are not imported marketplace listings or owner-approved local inventory. Real launch inventory must have seller permission.

## Next slice

Provider/locality decisions, phone identity and admin MFA, database migrations, authenticated drafts/media, reviewed submissions, lifecycle jobs and public/private projections. See [implementation status](docs/IMPLEMENTATION_STATUS.md).
