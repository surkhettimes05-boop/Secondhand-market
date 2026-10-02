# Backend implementation status

Updated: 2026-10-02
Branch: `feat/marketplace-foundation`
[Pull request #1](https://github.com/surkhettimes05-boop/Secondhand-market/pull/1)

## Implemented

Supabase integration for verified phone sessions, persistent drafts, structured rental/land/item disclosures, processed private photo uploads, reviewed publication, MFA-gated moderation, contact consent, inquiries, reports, appeals, account favorites, notifications and expiry.

Moderators attach and verify an email before native TOTP enrollment. Ordinary buyers and sellers use phone login. Pending photos are private; approved photos become readable; expiry/removal closes public access. Pending edits preserve approved public content. Phone revocation also withdraws consent from pending drafts, so a later approval cannot restore it.

Preview remains the default until real service configuration is provided. Live mode never substitutes sample inventory on failure. Server-only credentials are not embedded.

## Verification evidence

Verified code commit: `f1118eb3ab8608791ce6549fa10298a62b23399e`.
[Successful GitHub Actions run](https://github.com/surkhettimes05-boop/Secondhand-market/actions/runs/36944356949): both preview and backend jobs passed.

- TypeScript checks and production builds in both modes.
- Backend Node test run: 14 passing results, zero failures. This includes seven domain checks, six nested PostgreSQL scenarios and their parent test.
- Database checks cover cross-account permissions, private pending content/photos, actual storage RLS, moderator membership/MFA, approved edit snapshots, opt-in inquiry phone disclosure, consent withdrawal during pending approval, and expiry.
- Eight preview browser tests across desktop/mobile Chrome.
- One complete backend browser flow using isolated local Supabase, PostgreSQL, storage, mail capture and real sessions: phone OTP, persistent rental draft, private processed upload, submission, moderator email verification, TOTP enrollment/verification, approval, public photo/catalog access, buyer contact reveal, inquiry privacy, persisted favorites, synchronous expiry protection and authenticated expiry job.
- Reports/screenshots uploaded as `preview-browser-review` and `backend-browser-review` artifacts.

Local fixed SMS codes and dummy provider values are test fixtures, not a production authentication path. Hosted SMS/SMTP delivery and production CAPTCHA have not been tested. Land/item validation has domain coverage; their full browser workflows are not covered by the rental integration scenario.

The connected execution environment was unavailable, so verification ran in GitHub Actions. Screenshots have not received a manual visual review; automated checks do not establish accessibility compliance or local usability.

## Remaining before launch

Live service provisioning/SMS/SMTP, final operator policy/support details, validated local geography, licensed self-hosted typography, reviewed dependency lockfile, retention/account erasure, orphan-media cleanup, server-paginated discovery, live photo removal/reorder, manual visual/accessibility review, production migration/restore/monitoring and pilot rollout.

See [BACKEND_SETUP.md](BACKEND_SETUP.md) for exact configuration and boundaries. No hosted project or production deployment was created. This code phase is complete; the full PRD and public launch are not complete.
