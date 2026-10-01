# Backend implementation status

This phase adds a Supabase integration for verified phone sessions, MFA-gated moderation, database drafts and reviewed publication, processed private photos, contact consent, inquiries, reports, appeals, account favorites, notifications and expiry.

The integration remains disabled until real service configuration is provided. No credentials are embedded. The local CI backend uses synthetic users and fixed local-only OTP fixtures, not a production bypass.

Verification results will be recorded here after migration, type, domain and browser checks complete. Public-launch prerequisites and current limits are documented in BACKEND_SETUP.md.

Not complete: live service provisioning/SMS, final operator policy/support details, retention/account erasure, orphan-media cleanup, server-paginated discovery, live photo removal/reorder, manual visual/accessibility review, production restore/monitoring and pilot rollout.
