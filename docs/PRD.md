# Product Requirements Document: Birendranagar Marketplace

Version: 1.0  
Date: 2026-10-01  
Status: Planning baseline for implementation  
Working name: Surkhet Market — final brand TBD  
Market: Birendranagar, Surkhet, Nepal  
Repository: surkhettimes05-boop/Secondhand-market

## 1. Product vision

A mobile-first local marketplace where residents list land for sale, rooms/houses for rent, and secondhand items. Buyers discover relevant, available listings and contact sellers directly. The platform provides structured information, freshness controls, transparent seller roles, and moderation.

**Promise:** Find available properties and used items in Birendranagar, with clear details and easy local contact.

This document defines the intended complete product and a bounded first release. It does not imply that market research, legal review, vendor setup, or application development is complete.

## 2. Confirmed scope and assumptions

Confirmed: the founder wants property and secondhand listings, Birendranagar as the initial market, and this repository as the project destination.

| Topic | Planning default | Needs validation |
|---|---|---|
| Land | Sale listings | Whether land rental is also wanted |
| Housing | Rooms, flats, houses for rent | House sales deferred |
| Transactions | Direct buyer/seller arrangements | No platform checkout, escrow, delivery, rent or deposit collection |
| Identity | Nepal phone OTP; admin MFA | Local SMS delivery, cost and provider availability |
| Language | Nepali and English interface | Local translation review |
| Revenue | Free basic listings at launch | Paid promotion willingness after pilot |
| Moderation | Review before first publication | Named operator and actual working schedule |
| Geography | Birendranagar only | Locally validated wards/neighbourhoods |

Defaults permit planning; changes to transaction scope or category scope require a PRD revision.

## 3. Problem and competition

Users currently rely on scattered social posts, websites, shops and brokers. Problems to validate include stale listings, unclear location, incomplete costs, missing condition details, and uncertainty about seller identity.

| Alternative | Strength | Proposed differentiation |
|---|---|---|
| [Hamrobazar](https://hamrobazaar.com/) | Established broad Nepal classifieds | Local discovery and fresh inventory |
| Facebook Marketplace/local groups | Familiar posting and direct messaging | Structured filtering and availability |
| [GharJagga](https://www.gharjagga.com/) | Property focus | Local supply and complete rental/land disclosures |
| [99aana](https://99aana.com/) | Property focus | Surkhet service and transparent seller roles |
| Local brokers | Relationships and viewing assistance | Clear fees and partner accounts |
| Secondhand shops/word of mouth | Physical inspection and local trust | Searchable nearby stock |

This is preliminary hypothesis-based analysis. Current local inventory, traffic, pricing, feature coverage and market shares have not been verified. Do not claim competitors lack a feature from this table.

Validation: interview 10 landlords/brokers, 10 renters/buyers, and 10 secondhand sellers. Audit a sample of current local listings for completeness, duplication, freshness and seller responsiveness. Never republish inventory without seller permission.

## 4. Users and jobs

| User | Job | Outcome |
|---|---|---|
| Renter | Find housing within budget near a landmark | Compare rent/deposit/charges and arrange viewing |
| Land buyer | Compare plots by location, price, area and access | Contact owner/broker and independently investigate documents |
| Used-item buyer | Find a nearby item in acceptable condition | Inspect before buying |
| Individual seller/landlord | Publish clearly and quickly | Receive relevant contacts and mark completion |
| Broker/shop | Manage legitimate inventory | Disclose role and fees and reach local buyers |
| Moderator | Review listings and reports | Maintain quality with reasons and audit history |

## 5. Goals and pilot metrics

Targets are hypotheses, not forecasts. Review after the first 30 days.

| Metric | Definition | Proposed pilot target |
|---|---|---|
| Supply | Approved, available listings with permission | 50–100 |
| Freshness | Active listings confirmed in previous 30 days / all active listings | At least 90% |
| Contact reach | Listings with unique contact intent within 14 days / listings with full 14-day observation window | At least 30% |
| First contact | Median publication-to-contact time among contacted listings | At most 7 days |
| Posting completion | Submissions / verified users starting a draft, within 7 days | At least 60% |
| Review service | Submissions reviewed within one business day | At least 90% |
| Report service | Actionable reports reviewed within two business days | At least 90% |
| Outcomes | Listings voluntarily marked sold/rented | Track first; set target from baseline |

Contact intent means reveal phone, tap call, open WhatsApp or send inquiry. It does not establish a completed call or transaction. Deduplicate by user or short-lived session, listing and day; exclude self-actions and known bots.

## 6. Release scope

### R1: first public release

- Mobile-first responsive website.
- Land sale; room/flat/house rentals; secondhand furniture, appliances, electronics and household goods.
- Public search, filters, listing detail and sharing.
- Phone OTP, profile, roles and account controls.
- Adaptive posting forms, drafts, photos, previews and seller dashboard.
- Moderation, revisions, reports, appeals and suspension.
- Phone contact, optional seller-enabled WhatsApp, authenticated inquiry form.
- Favorites and in-app notifications.
- 30-day availability confirmation/expiry.
- Nepali/English interface, NPR and curated local geography.
- Privacy/policy pages, monitoring, backups and analytics.

All three main categories are supported in R1. Recruit rentals and household goods first; onboard land when its moderation/disclosure process is ready.

### R1.1

Business profiles/quotas, saved-search alerts, consent-based SMS alerts, approximate map browsing and assisted listing services.

### R2

Labelled featured listings, broker/shop packages, payments for platform services, expanded categories and native apps if retention supports them.

### Outside R1

Escrow, checkout, delivery, deposits/rent collection, legal title certification, automatic valuation, real-time chat, ratings, auctions, national expansion, house sales, public exact home coordinates, public identity documents, and unauthorized scraping/importing.

## 7. Information architecture

| Page | Core content |
|---|---|
| Home | Search, location, categories, recent inventory, post action |
| Search/category | Filters, count, sort, pagination and clear-all |
| Listing | Photos, price, details, locality, seller role, availability, contact/save/share/report |
| Sign-in | Phone/OTP and recoverable failure states |
| Post | Adaptive form, photos, draft, preview and submission |
| My listings | Status tabs and edit/pause/renew/complete actions |
| Favorites | Saved listings with unavailable labels |
| Inquiries | Listing context, messages and chosen contact disclosure |
| Settings | Profile, language, contact preferences, account deletion |
| Help/policy | Rules, safe-trading guidance, terms, privacy and real support route |
| Admin | Review queue, reports, users, appeals, taxonomy and audit history |

Mobile navigation: Home, Search, Post, Favorites, Account. Browsing does not require sign-in.

## 8. Primary flows

1. **Discover:** search/category → filters → detail → review costs/condition/availability → contact opted-in seller. Unavailable listings have disabled contact actions.
2. **Post:** OTP → role → category form/photos → preview → submission → review → publish or actionable correction.
3. **Maintain:** reminder 3 days before expiry → explicit availability confirmation → renew; no confirmation → expiry; sold/rented removes active discovery immediately.
4. **Report:** reason/details → acknowledgement → moderator triage → decision → seller notification → appeal when applicable.
5. **Delete account:** verified request → revoke sessions and unpublish → erase within policy period; documented restricted exceptions only.

## 9. Functional requirements and acceptance criteria

P0 gates pilot exposure. P1 gates broad public promotion. P2 is future work.

| ID | Priority | Requirement and acceptance |
|---|---|---|
| AUTH-01 | P0 | Normalize Nepal +977 numbers; OTP single-use, 5-minute expiry, max 5 attempts, 60-second resend cooldown; recover from provider failure |
| AUTH-02 | P0 | Server enforces user ownership and admin roles on every private read/mutation; cross-account tests pass |
| AUTH-03 | P0 | Profile controls, freshly verified phone change, session revocation and deletion request work |
| LIST-01 | P0 | Category-dependent required fields validated in browser and server; field-specific errors preserve input |
| LIST-02 | P0 | Drafts persist; retries/double submissions do not create duplicate listings |
| LIST-03 | P0 | 1–10 JPEG/PNG/WebP photos, max 10 MB each; actual signature checked; reorder/cover/remove; metadata stripped; processed thumbnails |
| LIST-04 | P0 | Draft/pending/rejected content absent from public APIs; approval/rejection records actor, reason and version |
| LIST-05 | P0 | Public-field edits create reviewed revisions; approved version remains until replacement approval; pause immediate |
| LIST-06 | P0 | Publication/explicit renewal sets 30-day expiry; edits/views do not renew; queries exclude expired inventory even if job delayed |
| DISC-01 | P0 | Search title/description and location aliases; category/location/price filters combine; stable 20-result pagination |
| DISC-02 | P1 | Newest/price sort, category-specific filters, persistent filter URLs, clear-all, empty/loading/error states |
| CONTACT-01 | P0 | Explicit phone-publication consent; rate-limited reveal; optional opted-in WhatsApp with encoded listing URL; revocation takes effect |
| CONTACT-02 | P1 | Verified inquiry, 20–1,000 characters, listing context, private delivery, optional sender phone disclosure and abuse report |
| SAVE-01 | P1 | Favorites persist across sessions; unavailable labels; canonical sharing with clipboard fallback |
| TRUST-01 | P0 | Phone badge describes phone control only; owner/broker is self-declared; no ownership/authenticity guarantee |
| TRUST-02 | P0 | Reports: unavailable, misleading, duplicate, scam, prohibited, privacy; private reporter identity; triage/appeal history |
| ADMIN-01 | P0 | Review snapshots, approve/request changes/reject, hide/reinstate, suspend and resolve reports with audited reasons |
| ADMIN-02 | P0 | Admin MFA and least privilege; no self-granted roles; sensitive actions server-checked |
| LOCAL-01 | P0 | NPR with monthly rental labels; curated ward/neighbourhood; exact address/coordinates private |
| I18N-01 | P1 | All interface strings Nepali/English; preference persists; seller content stays original; Devanagari renders correctly |
| NOTIFY-01 | P1 | Approval/rejection, inquiry, reminder and expiry notices generated once; read/unread and destinations work |
| PRIV-01 | P0 | Public field allowlists, consent records, deletion and retention controls verified |
| OPS-01 | P0 | Monitoring, expiry jobs, daily backup, restore rehearsal and staffed moderation exist |
| SEO-01 | P1 | Canonical/meta/sitemap only for appropriate approved content; private routes authenticated and excluded from indexing |

Initial quotas: 5 active individual listings, 3 submissions/day; reviewed business quotas later. OTP max 5 sends/hour/phone plus IP/device protections mindful of shared networks. Inquiries max 10/hour/account; phone reveals initially 20/hour/session plus IP abuse controls. All enforced server-side, monitored and tunable.

## 10. Listing fields and validation

### Shared

ID, seller, category/subtype, declared role, title 10–100 characters, description 30–3,000 characters, explicit NPR price, negotiable flag, locality IDs, optional public landmark, photos, contact consent, policy version, lifecycle/version and timestamps. Do not publish phone numbers or sensitive data in description/title.

### Land sale

Required: total asking price, positive numeric area with explicit unit, road-access description, owner/broker role, self-declaration of ownership or authority. Broker fee disclosure required if applicable.

Optional: frontage, road width, utilities, terrain and stated land use. Units: square feet, square metres, aana, kattha. Preserve entered unit. Cross-unit filtering requires locally validated conversion data; otherwise filter within a selected unit. Never silently equate aana with kattha. Ownership documents are not public uploads.

### Rentals

Required: room/flat/house subtype, monthly rent, deposit (explicit zero allowed), relevant room/bedroom counts, available date, water, bathroom arrangement, parking, owner/broker and broker fee if applicable.

Additional charges: explicitly none, included, fixed amount or usage-based with explanation. Optional furnished/kitchen/floor/internet/lease/accessibility. Show rent, deposit, commission and additional charges separately; never advertise an incomplete move-in total.

### Secondhand items

Required: subcategory, price, condition (like new/good/fair/needs repair), known defects (explicit none known allowed), pickup neighbourhood and actual photos. Optional brand/model, age, accessories and described warranty claim. Reject stock-image-only listings.

### Validation

Store money as integer paisa; accept at most two decimals, positive asking prices and nonnegative deposits/fees. Areas positive decimals; counts valid integers. Reject invalid/infinite/out-of-range values. Use parameterized queries, escaped output and sanitized user text. Display category-specific units. Upload validation must inspect content, not only extension.

## 11. Lifecycle and revisions

| State | Discovery | Transitions |
|---|---|---|
| Draft | Private | Pending review or delete |
| Pending review | Private | Published, changes requested, rejected or withdrawn |
| Changes requested/rejected | Private | Correct/resubmit, appeal or delete |
| Published | Public while unexpired | Pending revision, paused, sold/rented, withdrawn, expired, removed |
| Paused | Hidden | Resume unchanged if still valid; otherwise review; complete/delete |
| Expired | Not active | Confirm and resubmit for review or delete |
| Sold/rented | Not active | Terminal transaction; archive/delete |
| Withdrawn | Hidden | Archive; create new draft |
| Removed | Hidden | Appeal/reinstatement without resetting expiry |

Soft deletion is separate from policy-driven erasure. Completed listings cannot be renewed as the same transaction. Suspension immediately hides active inventory and blocks abusive posting/contact. Revisions preserve immutable submitted snapshots and moderation history.

## 12. Trust and operations

Reject illegal/stolen/counterfeit goods, weapons/drugs, harassment, discrimination, impersonation, spam, exposed personal information and misleading listings. R1 excludes animals, medical/financial products and regulated goods until policy review.

Moderators verify completeness and obvious inconsistencies, not legal title. Buyers should inspect goods/property and independently check relevant documents. No badge is a payment guarantee.

Review oldest submissions with priority queues for fraud/privacy issues. Record actor, target version, reason and time. Target review within one business day, reports within two business days. Proposed coverage 10:00–18:00 Nepal time on locally agreed working days; publish actual coverage. Founder must assign an operator and real support contact. Appeals go to a different reviewer where staffing permits.

## 13. UX and localization

Support 360-pixel mobile layouts, slow connections, readable Nepali fonts, strong contrast, visible keyboard focus, semantic labels, accessible errors and approximately 44-pixel touch targets. Target WCAG 2.2 AA for essential flows with manual verification.

Compress/lazy-load photos. Visible draft-save confirmation only after server success. Interrupted uploads/submissions can retry without losing input. No geolocation permission required.

NPR/Rs. displayed consistently. Store UTC; display Asia/Kathmandu. R1 uses consistently labelled Gregorian dates; Bikram Sambat deferred. Critical states include OTP failure, offline/save failure, invalid uploads, pending/rejected review, no results, expired listing, suspension and deletion processing.

## 14. Suggested architecture

Recommendation, subject to engineering/provider evaluation:

- TypeScript/Next.js responsive frontend and server APIs.
- PostgreSQL with category/location/status/price indexes; trigram/full-text search initially.
- Object storage with private originals/incoming uploads and approved processed derivatives.
- Managed Nepal-compatible phone identity; MFA-capable admin authentication.
- Durable jobs for media, expiry, reminders and deletion; retry and idempotency.
- Separate staging/production, HTTPS, secrets management and centralized monitoring.
- Curated geography first; approximate maps later.

Evaluate SMS delivery on local networks, cost and sender requirements before selection. R1 needs no payment gateway. Maintain operating-cost estimates for hosting, database, storage, SMS and moderation based on actual quotes.

### Service contracts

Account: OTP, session/profile, preferences, deletion. Discovery: active search/detail/categories/localities. Listings: draft/media/submit/revise/pause/complete/renew/delete. Engagement: favorites/contact reveal/inquiries/reports. Admin: reviews/reports/appeals/suspension/audit. Notifications: own list/read.

Use stable translated errors, server validation, opaque IDs, pagination, idempotency keys and explicit public/private projections. Enforce status/expiry at query time.

## 15. Data model

| Entity | Data |
|---|---|
| User/SellerProfile | Protected phone, display name, language, role, verification, consent, status and quota |
| Locality | Stable IDs, ward/neighbourhood, bilingual names/aliases |
| Listing | Owner, category, state, approved/pending revision, availability/expiry, deletion |
| ListingRevision | Immutable field snapshot, version, decision/reviewer/timestamps |
| PropertyDetails/ItemDetails | Category attributes tied to revision |
| Media | Owner/listing/version, object keys, processing state and cover order |
| Favorite | Unique user/listing pair |
| Inquiry | Sender/recipient/listing/body/chosen contact disclosure/read status |
| Report/Appeal | Target/reason/private reporter/evidence/status/outcome |
| Notification | Recipient/event/type/read/delivery |
| AuditEvent | Actor/target/action/reason/time/restricted metadata |
| PolicyConsent | User/version/purpose/time |
| AnalyticsEvent | Minimal pseudonymous event properties |

Enforce foreign keys and unique constraints. Generic serialization must never expose phone, precise address, drafts, inquiries, reports or moderation notes.

## 16. Security, privacy and retention

HTTPS, secure HttpOnly sessions, CSRF protection where applicable, output escaping, parameterized queries, least privilege and server authorization. Never log OTPs, full phones, private messages or secrets. Hash OTPs if internally implemented. Validate/re-encode media and remove EXIF. Admin MFA and auditable decisions required.

Obtain explicit consent for contact publication; users can revoke it. Deletion revokes sessions and unpublishes immediately.

Proposed retention, subject to local legal review:

| Data | Default |
|---|---|
| Orphan uploads | 24 hours |
| Inactive drafts | Notify then remove at 90 days |
| Deleted primary profile/content | Erase within 30 days |
| Inquiries | 180 days |
| Raw analytics | 90 days; non-identifying aggregates longer |
| Moderation/audits | 180 days, restricted |
| Backups | 30-day rotating retention |

Document narrowly scoped legal holds and retain only necessary evidence. Backup restoration must reapply deletion through a suppression ledger. Provide access/correction/deletion support. Local counsel must review relevant Nepal privacy, consumer, brokerage, advertising and electronic-commerce obligations before launch.

## 17. Non-functional requirements

| Area | Target | Verification |
|---|---|---|
| Mobile performance | p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 | Prelaunch lab checks; field metrics after launch |
| API | Search/detail p95 server response ≤1s | Initial workload: 10,000 listings, 50 concurrent browsers |
| Availability | 99.5% monthly target | Synthetic checks and incident records |
| Recovery | RPO ≤24h; RTO ≤8h | Daily backup and prelaunch restore rehearsal |
| Reliability | No unauthorized publication or duplicate submissions | Retry/concurrency/expiry-delay tests |
| Accessibility | Essential flows target WCAG 2.2 AA | Automated plus keyboard/screen-reader review |
| Monitoring | Errors, SMS failures, stuck jobs, backup failure and costs | Simulated staging failures |

Targets are not guarantees. Measure SMS sending, delivery and verification separately.

## 18. Analytics

Events: search_performed, filter_applied, listing_viewed, contact_revealed, call_clicked, whatsapp_clicked, inquiry_sent, favorite_added, draft_started, listing_submitted, listing_approved/rejected, availability_confirmed, listing_expired/completed, report_submitted/resolved, account_deleted.

Use event IDs, timestamp, category/listing/locality IDs, source, language, device class and pseudonymous/session reference. Avoid raw personal data, inquiry bodies and sensitive search text. Deduplicate intents; separate clicks from confirmed outcomes. Review weekly by category, since land decisions take longer.

## 19. Delivery plan and backlog

Estimates are indicative, dependent on staffing, providers and validation.

| Milestone | Effort | Exit |
|---|---|---|
| M0 Discovery/policy | 1 week | Interviews, category defaults, locality validation, operator, draft policies |
| M1 Foundation/design | 1–2 weeks | Mobile prototypes, translations, schema, environments, tested SMS and admin identity |
| M2 Supply/moderation | 2 weeks | Forms, photos, lifecycle, revisions, admin and permissions |
| M3 Discovery/contact | 1–2 weeks | Search/detail/filters, contact/inquiries/favorites and analytics |
| M4 Hardening/pilot | 1–2 weeks | Security/privacy/accessibility, restore, permitted seed supply, feedback |
| M5 Launch | Gate-based | Operational readiness and measured pilot acceptance |
| M6 Growth | Evidence-based | Business accounts, alerts, then promotions |

Epics: Foundation (AUTH, LOCAL, ADMIN security); Supply (LIST); Trust operations (TRUST/ADMIN); Discovery (DISC/SEO); Engagement (CONTACT/SAVE/NOTIFY); Readiness (I18N/PRIV/OPS). Supply depends on identity/schema; discovery depends on approved inventory; engagement depends on contact consent. Public posting never launches without moderation.

## 20. Verification and launch gates

Required end-to-end checks:

1. Browse/filter/contact in both interface languages and on a small mobile screen.
2. Post and approve each category; pending content remains private.
3. Invalid price/area/fees/media produce recoverable errors.
4. Reviewed edits preserve approved version; rejected changes never leak.
5. Expiry works despite scheduler delay; explicit renewal required.
6. Paused/completed/removed listings block contact through direct APIs too.
7. Cross-user draft/media/inquiry/notification access fails.
8. Retries and concurrent submissions remain idempotent.
9. Reports, suspension, appeals and reinstatement preserve audit history.
10. Account deletion removes exposure/revokes sessions; restore reapplies deletion.
11. OTP outage, upload failure and offline submission recover safely.
12. Admin MFA, least privilege, backup restore and monitoring work.

Public launch requires all P0/P1 criteria checked, no critical authorization/privacy defects, reviewed local translations/taxonomy, tested SMS, named support/moderator, policies/legal review, permitted seed inventory, cost/abuse alerts and rollback procedures. Pause submissions if moderation cannot operate.

## 21. Go-to-market and revenue

Recruit a closed cohort of landlords, responsible brokers, shops and household sellers. Assist posting with permission. Concentrate outreach on rentals and furniture/appliances while moderating land through the same system. Use founder-authorized local partnerships; no unauthorized mass messaging.

Start free. Validate seller value through real inquiries before charging. Future paid placements must be labelled and relevant to filters. Payment for platform services requires separate invoicing, refund, cancellation, reconciliation and fulfillment requirements. Do not assume a transaction commission can be measured.

## 22. Risks and decisions

| Risk | Mitigation |
|---|---|
| Low supply/Facebook habits | Local recruitment, complete fresh inventory, useful filters |
| Stale listings | Explicit 30-day renewal and reports |
| Fraud/false ownership | Accurate badge limits, review/removal, independent inspection |
| Contact scraping | Consent, reveal limits, no phones in metadata |
| SMS failures/spend | Local tests, rate limits, alerts |
| Moderation overload | Quotas, coverage, pause growth before backlog escalates |
| Wrong units/locality | Validated directory/conversions; preserve entered units |
| Misleading success claims | Separate contact intent and seller-reported completion |
| Scope expansion | R1 taxonomy and explicit future releases |

Before M1, founder settles brand, category defaults, geography, business roles and staffing; engineering/founder selects SMS, hosting and budget. Before launch, founder/legal reviewer finalizes policies and retention. After pilot, decide monetization and expansion. Dates depend on actual team capacity.

## 23. Definition of done

Residents can find fresh local listings; sellers can publish and maintain all three categories; buyers can contact opted-in sellers; operators can moderate and support the service. Acceptance criteria, bilingual usability, security/privacy checks and launch gates pass.

A sample-listing website alone is not the complete product. Completion requires working persistence, identity, uploads, moderation, expiration, contact controls, monitoring and an accountable operator.
