# Implementation status

Updated: 2026-10-02
Branch: `feat/marketplace-foundation`
[Pull request #1](https://github.com/surkhettimes05-boop/Secondhand-market/pull/1)

## Delivered

The responsive Next.js/TypeScript marketplace now includes both a labelled preview and a configurable Supabase backend.

- Photo-led home page, search/filter/sort, listing details, saved listings and four-stage posting.
- English/Nepali UI with separate rental costs, seller-role disclosures and clear verification boundaries.
- Phone login, persistent drafts and structured rental/land/item fields.
- Actual photo decoding/resizing/metadata removal and private storage.
- Moderator email verification, native TOTP MFA, review and publication.
- Owner availability controls, phone-consent withdrawal, inquiries, reports, appeals, notifications and expiry.
- Database authorization, domain validation, desktop/mobile browser checks and isolated backend integration CI.

The executable database schema is under `supabase/migrations`; it has been applied and tested locally in CI. The older `db/001_marketplace_foundation.sql` planning baseline must not be applied alongside it.

## Verified

Code commit: `f1118eb3ab8608791ce6549fa10298a62b23399e`.
[GitHub Actions evidence](https://github.com/surkhettimes05-boop/Secondhand-market/actions/runs/36944356949): preview and backend jobs succeeded, including type checks, production builds, domain/database tests and browser tests.

[Backend status](BACKEND_STATUS.md) records the exact test scope and limits. [Backend setup](BACKEND_SETUP.md) explains live provisioning and moderator onboarding.

## Outstanding

Real Supabase/SMS/SMTP configuration and deployment remain. Public launch also requires verified local geography, operator/support details and legal review, approved real supply, manual design/accessibility review, licensed fonts, dependency locking, retention/erasure/media cleanup, production restore/monitoring and pilot checks.

Server pagination and live photo removal/reordering remain further implementation work. Contact reveal and reports currently require sign-in; public anonymous contact would need an additional trusted rate-control design.

The PR remains draft for design review and live configuration. No production deployment has been performed. This delivers the preview and backend implementation phases, not the entire PRD or a launch-ready marketplace.
