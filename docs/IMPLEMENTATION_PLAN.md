# Phased Implementation Plan and Design Direction

Version: 1.0  
Date: 2026-10-01  
Product: Birendranagar Marketplace / Surkhet Market (working name)  
Source of scope: [Product Requirements Document](./PRD.md)  
Status: Execution plan; application implementation has not started

## 1. Intended result

Build an exceptionally well-designed local marketplace for land sale, housing rentals and secondhand items in Birendranagar. The experience should feel thoughtfully designed and carefully engineered: confident typography, useful local content, coherent navigation, accurate disclosures and dependable interactions.

Use Stripe as a reference for visual hierarchy, typography, restrained depth and meticulous interaction design. Adapt those principles to an inventory marketplace with real seller photography, Nepali language and local buying behaviour. This is an original brand and interface; Stripe logos, wording, illustrations and proprietary assets are not reused.

“Human-coded” is a quality requirement, not a claim about authorship. It means deliberate page composition, consistent engineering, complete states and local detail that survive real use.

## 2. Release boundaries and execution rules

R1 includes all three categories, moderated posting, OTP identity, public discovery, contact, inquiries, favorites, freshness, bilingual UI and operational controls specified in the PRD.

Public posting requires real moderation, persistence, contact consent and authorization. Prototype fixtures are visibly marked in staging and never presented as real public inventory. R1 does not include checkout, escrow, rent collection, house sales, real-time chat or native apps.

Deliver complete vertical slices. Each phase ends with a working demonstration, relevant verification evidence, open-issue record and exit gate. Dates are estimates; passing gates governs release.

The founder's design direction in this document supplements the PRD. Functional and trust constraints in the PRD remain binding.

## 3. Team, effort and dependencies

Indicative plan: **10–14 calendar weeks** for two experienced engineers with part-time product/design and a local moderator, assuming timely provider setup and decisions. A solo implementation should estimate from actual capacity rather than reuse this calendar. Estimates are planning guidance, not commitments.

| Role | Responsibility |
|---|---|
| Founder/product owner | Brand, scope, interviews, local partnerships, budget and launch decisions |
| Product designer | Layouts, tokens, bilingual prototypes, usability and visual review |
| Engineering owner | Architecture, implementation, security, data and releases |
| Local content/moderation owner | Localities, translations, seed listings, reports and seller support |
| Legal/provider contacts | Policies, identity/SMS feasibility and service terms |

Roles can be held by the same person, but every responsibility needs a named owner before public launch.

Critical path: category/locality decisions → identity/schema/design → posting and moderation → real approved supply → discovery and contact → hardening → controlled pilot → public release.

## 4. Art direction: Stripe-level craft for local commerce

### Brand character

Precise, welcoming, practical and trustworthy. The product should feel premium while staying familiar to someone looking for a room or selling a used fridge. Product photography and useful information lead; brand decoration provides subtle structure.

### Proposed tokens

Treat these as a starting specification, then validate contrast and bilingual rendering in Phase 1.

| Token | Starting value / rule |
|---|---|
| Canvas | Warm off-white #F7F8FA |
| Surface | White #FFFFFF |
| Primary text | Deep ink #14213D |
| Secondary text | Slate #52627A |
| Action | Indigo #4338CA; white text, verified contrast |
| Border | Soft grey #DCE2EA |
| Success | Deep green #166534; text plus icon |
| Warning | Dark amber #92400E; readable pale surface |
| Spacing | 4, 8, 12, 16, 24, 32, 48, 64, 96 px |
| Radius | 8 px controls, 12 px content panels, 16 px image containers |
| Shadow | Very light resting elevation; stronger only for menus/dialogs |
| Container | Approx. 1,200 px maximum; 16/24/32 px responsive side gutters |
| Typography | One coherent Latin sans family (e.g. Inter), paired with Noto Sans Devanagari; self-host licensed fonts |
| Body | 16–18 px; comfortable line-height; Nepali tuned separately |
| Display | Approx. 40 px mobile to 64 px desktop; avoid excessive tracking in Nepali |
| Numeric prices | Tabular figures where supported; consistent NPR formatting |
| Motion | 120–200 ms for small transitions; respect reduced-motion preference |

Use semantic CSS variables, including focus/error/disabled states. Avoid scattering arbitrary colour and spacing values through components. Status never relies on colour alone. Test all actual colour combinations for WCAG contrast; a token table alone does not establish compliance.

### Composition rules

- Use a deliberate grid, consistent text baselines and generous space between sections.
- Keep inventory dense enough to browse; reserve large whitespace for introduction and decisions.
- Use a subtle brand gradient only in an optional small home illustration/accent. Search and listing pages remain clear and photo-led.
- Limit shadows; separate most content through spacing, alignment and fine borders.
- Create page-specific layouts from shared primitives. Search, posting and administration serve different tasks.
- Buttons have a clear hierarchy and plain action labels. Primary action colour communicates action rather than decoration.
- Realistic local content must shape layouts: long Nepali titles, mixed image quality, land units, monthly rent and incomplete optional fields.

## 5. Page-by-page design specification

### Home

Desktop: compact navigation, visible Birendranagar locality, language switch and “Post a listing.” A concise introduction sits alongside a purposeful local image composition. Search occupies a prominent position within the first screen.

Suggested headline: **“Find your next place. Give useful things a new home.”** Supporting copy names Birendranagar and the three supported categories. Validate wording with local users and write natural Nepali separately.

Below search: three category choices, then fresh inventory organized by category. Use real available counts only when backed by data. A short seller section explains posting, review and direct contact. Footer contains real help/policies/support.

Mobile: headline, search and category shortcuts precede decorative imagery. Make listing discovery visible quickly; oversized artwork must not consume the entire first screen.

### Search/category

Desktop: left filter rail and an adaptable results grid. Mobile: visible active filters, accessible filter sheet, result count and sort. Keep search/location context in view.

Default card hierarchy: image → price → title → locality → two category-specific facts → availability date. Examples: rental bedrooms and monthly rent; land area/unit and access; item condition and pickup locality. Avoid a wall of identical pills.

Use consistent image frames and distinct internal card structures for property/item needs. Photos are not retouched to misrepresent condition. Favorites are separate, accessible buttons; the card link must not contain nested interactive controls.

### Listing detail

Desktop: photo gallery and main details with a compact contact panel alongside. Panel may be sticky within its container. Mobile: readable photo gallery, price and essentials, followed by details; sticky contact bar clears bottom navigation and safe areas.

Order information by decisions: price → availability/location → key facts → condition/costs → seller → description → contact/report guidance. Show rental deposits/fees and item defects prominently. Land shows area units explicitly.

Contact panel includes seller role, accurately explained phone badge, contact choices and concise relevant guidance. Choose the first action by listing context: “Contact about this rental,” “Contact about this land,” or “Contact seller.” Once a contact method is selected, show honest method-specific feedback; never imply a transaction succeeded.

Sold/expired state must be visually obvious, disable contact, and offer relevant active alternatives.

### Posting

Four stages: **Category → Details → Photos → Review.** Sign-in happens before private draft persistence; preserve anonymous category choice through authentication.

Show progress by completed stages. Ask only relevant fields. Put help next to the fields that need it. Draft status displays its saved timestamp. The review page exposes the exact public information and phone consent.

Final action is **“Submit for review.”** Explain actual review expectations. Do not use “Publish instantly” when moderation exists.

### Seller account

Task-oriented rows with image, title, status, expiry and a clear next action. Show approved content and pending changes separately. Explain rejection in plain language with a correction action. Completion distinguishes “Sold,” “Rented” and “Withdrawn.”

### Admin

Dense, legible operational layout with queue, version snapshot, evidence and decision area. Use tables for volume, explicit reasons and safe action confirmations. Preserve keyboard efficiency. Consumer marketing decoration does not belong in the review queue.

### Edge states

Design loading, empty, error, offline, no-photo failure, pending, rejected, suspended, expired and deleted states before coding each flow. Skeletons reflect real layout. Messages explain a next step. “Saved,” “sent” and “approved” appear only after confirmed server results.

## 6. Sales psychology translated into product decisions

The conversion goal is a relevant seller contact or completed legitimate listing. No purchase occurs on this platform in R1.

| Principle | Implementation | Measure / guardrail |
|---|---|---|
| Reduce cognitive load | Three clear categories, progressive filters, adaptive forms | Search-to-detail and form completion; preserve full access to details |
| Establish relevance quickly | Visible locality, landmarks, NPR and category-specific facts | Relevant result engagement |
| Reduce uncertainty | Availability confirmation, defects, fees and declared seller role | Contact reach; fewer misleading-listing reports |
| Make action concrete | Contextual contact button and plain posting labels | Contact intent and submission completion |
| Lower commitment | Browse freely, save drafts, optional favorites | Posting recovery and repeat discovery |
| Build earned credibility | Real inventory, accurate phone badge, actual seller outcomes when available | Report rate and pilot interviews |
| Support comparison | Consistent price/location/fact order | Buyer task success |
| Give honest progress | Four posting stages and saved status | Step abandonment |
| Offer useful alternatives | Relevant active listings after unavailable detail | Recovery without hiding unavailable status |

No fabricated reviews, invented user counts, fake countdowns, false scarcity, preselected contact consent or misleading original-price discounts. “Recently confirmed” requires a real timestamp. “Popular” requires a defined measured basis. Completion data is seller-reported and labelled accordingly.

Revenue experiments come after proven contact value. Optimize contact quality, freshness and trust alongside click rate; more clicks alone do not establish a better experience.

## 7. What will make the interface feel deliberately built

Design review rejects generic template habits: repeated feature-card sections, unnecessary bento grids, decorative gradient headings, arbitrary icon collections, meaningless counters, excessive rounded panels and identical layouts for every task.

Engineering review checks:
- Shared layout and form primitives with category-specific domain components.
- Explicit types for money, units, statuses and public/private data.
- Semantic links/buttons, predictable focus and accessible dialogs.
- Clear feature boundaries and reusable domain rules rather than oversized page components.
- Complete server integration; no dead buttons or success toasts without persistence.
- Consistent spacing, number formatting, image ratios and feedback throughout.
- Mobile details: filter sheet scroll, keyboard behaviour, OTP paste, safe areas and sticky controls.
- Synthetic fixtures covering long bilingual text, awkward images and every lifecycle state.

## 8. Phase 0 — Discovery and implementation decisions

**Estimate:** 1 week. **Owner:** founder/product and engineering.

Tasks:
1. Confirm land sale/housing rental defaults, brand placeholder, geography and category taxonomy.
2. Interview target users and inspect current local workflows.
3. Validate ward/neighbourhood names and aliases.
4. Identify moderator, support channel and publication policy.
5. Evaluate Nepal OTP delivery, admin MFA, hosting/storage/database costs.
6. Create decision register, risk register and initial issue backlog.

Artifacts: locality/taxonomy seed specification, provider decision record, interview findings, policy draft and operating-cost worksheet.

**Exit gate:** launch categories and responsibilities are recorded; no unresolved provider limitation prevents identity; assumptions remain explicitly tracked. Full legal/provider contracting may continue, but pilot launch depends on completion.

## 9. Phase 1 — Design system and high-fidelity prototype

**Estimate:** 1–2 weeks. **Owner:** design/product.

Tasks:
1. Create tokens, grid, typography, controls, status labels and icon conventions.
2. Compose home, search, listing detail and posting at 360/390, 768 and 1440 px.
3. Prototype browse → filter → contact and category → post → review.
4. Design seller/admin and all critical states.
5. Populate realistic synthetic English/Nepali category fixtures.
6. Run 5–8 local usability sessions and revise major obstacles.

Artifacts: design source/exported specs, component inventory, prototype, copy sheet and state matrix.

**Exit gate:** participants can find a relevant listing, explain its price/fees, choose contact and submit a draft with minimal guidance. Both languages fit; core contrast/focus checks pass. Record observed task success and problems rather than claiming statistical certainty from a small sample.

## 10. Phase 2 — Application and data foundation

**Estimate:** 1 week. **Owner:** engineering.

Tasks:
- Bootstrap TypeScript/Next.js, repository conventions, lint/type/build checks.
- Establish PostgreSQL migrations, seed fixtures and versioned locality data.
- Define listing revisions, lifecycle rules, money/unit validation and public projections.
- Implement OTP sessions, user ownership, admin MFA and permission boundaries.
- Set up storage, job interfaces, translation keys and staging environment.
- Create monitoring, secret handling and deployment/rollback documentation.

Suggested structure:
- src/app: routes and entry points.
- src/components/ui: accessible primitives and design tokens.
- src/features: listings, discovery, auth, contact, moderation, accounts.
- src/server: domain services, authorization, persistence and provider adapters.
- src/i18n: interface translations.
- tests: domain, integration and critical browser scenarios.

**Exit gate:** verified user/admin sessions work; unauthorized access fails; migrations and builds pass; demo-only fixtures remain isolated; provider smoke tests work in staging.

## 11. Phase 3 — Listing supply and moderation vertical slice

**Estimate:** 2 weeks. **Owner:** engineering and operator.

Tasks:
- Implement category-specific forms, preview and persistent drafts.
- Add signed upload, file validation, metadata removal, derivatives and media permissions.
- Build reviewed submissions, immutable revisions and approval/rejection.
- Add seller dashboard, pause/complete/renew and state transitions.
- Implement expiry enforcement at query time plus jobs/reminders.
- Implement audits, reports, appeals and user suspension.

PRD coverage: LIST-01–06, LOCAL-01, TRUST-01/02, ADMIN-01/02.

**Exit gate:** a seller submits every category, moderator reviews it, and approved inventory appears through a protected public projection. Draft/rejected/private media never leaks. Retry, revision, expiry and cross-user tests pass.

## 12. Phase 4 — Discovery and contact vertical slice

**Estimate:** 1–2 weeks. **Owner:** engineering/design.

Tasks:
- Implement designed home/category/search and indexed query logic.
- Add combined filters, stable pagination and URL state.
- Build photo galleries/details/category facts and unavailable alternatives.
- Add explicit consent, protected phone reveal, call and opted-in WhatsApp.
- Add private inquiries, favorites, sharing and in-app notifications.
- Complete bilingual navigation, empty/error/loading states and SEO projections.

PRD coverage: DISC-01/02/03 as described in PRD scope, CONTACT-01/02, SAVE-01, I18N-01, NOTIFY-01, SEO-01. Note: the current PRD combines error/empty requirements under DISC-02; this plan does not create an additional mandatory ID.

**Exit gate:** real approved listings can be found and contacted on mobile; consent revocation and unavailable-state protection work through both interface and API. Analytics distinguish contact intent from outcome.

## 13. Phase 5 — Craft, security and operational hardening

**Estimate:** 1–2 weeks. **Owner:** engineering/design/operations.

Tasks:
- Review every core route against visual specifications at target widths/languages.
- Fix image treatment, spacing, typographic rhythm, sticky overlaps and interaction details.
- Manually check keyboard/screen-reader flows and reduced motion.
- Test authorization, scraping controls, quotas, concurrency and upload attacks.
- Implement deletion/retention, backup restoration and deletion suppression.
- Test SMS outage, scheduler delay, offline submission and job retry.
- Check performance against PRD targets with realistic media.
- Complete support/policy pages, monitoring alerts and incident runbooks.

**Exit gate:** no critical security/privacy defects; P0/P1 requirements verified; restore rehearsal succeeds; moderator/support ready; material remaining issues documented with release impact.

## 14. Phase 6 — Controlled pilot and launch

**Estimate:** 1–2 weeks of initial pilot plus monitoring. **Owner:** founder/operator.

Tasks:
1. Recruit 50–100 legitimate listings with permission.
2. Invite a small buyer cohort; observe real search/contact/posting problems.
3. Review freshness, contact reach, seller responses and moderation backlog.
4. Fix blocking usability/content issues and retest affected flows.
5. Confirm operating cost and workload.
6. Expand promotion gradually with rollback and submission-pause controls.

**Exit gate:** founder reviews actual pilot evidence; all launch gates in PRD pass; public claims match observed data. A weak metric triggers targeted improvement, not fabricated social proof.

## 15. Phase 7 — Evidence-led growth

Implement in order supported by demand:
1. Business profiles/quotas and saved searches.
2. Consent-based alerts and approximate map browsing.
3. Labelled promoted listings and platform-service billing.
4. Additional categories/geographies following policy and supply validation.
5. Native apps only after retention and notification use justify them.

Before promotions/payment work, write pricing, tax/invoicing, refunds, reconciliation and placement rules. Paid visibility never overrides relevance, moderation or availability.

## 16. Quality gates and release workflow

Every feature includes scope/PRD IDs, design reference, acceptance conditions and relevant verification. Pull requests stay focused, explain behavior and include screenshots for meaningful UI changes.

Run type/lint/build checks and meaningful tests. Test domain transitions, public/private projections and ownership at integration level; browser tests cover complete high-risk flows. Avoid tests that merely repeat markup.

Staging deployments precede production. Schema changes use migrations and rollback/forward recovery plans; database recovery is separate from application rollback. No production secret or personal data enters source control.

Visual quality rubric, scored 1–5:
- Hierarchy and composition.
- Typography and bilingual readability.
- Component/spacing consistency.
- Content and honest trust signals.
- Responsive behavior and accessibility.
- Interaction/state completeness.

Require at least 4/5 in each dimension before broad launch, with zero blocking accessibility, security or functionality defects. This is a team review rubric, not proof of commercial effectiveness.

## 17. Measurement and experimentation

First instrument the baseline, then change one meaningful hypothesis at a time. Candidate tests: search placement, category naming, listing fact order and posting-field guidance. Preserve identical disclosure and consent standards.

Use low-traffic moderated usability observation before statistical experiments. Run A/B tests only with defined primary metric, guardrails, sufficient sample and observation period. Guardrails include misleading-report rate, freshness, posting quality and seller contact relevance.

Track by category, language and device without exposing personal information. Contact buttons measure intent; completion remains seller-reported. Publish real testimonials only with consent and verified context.

## 18. Immediate backlog

| Order | Ticket | Completion evidence |
|---|---|---|
| 1 | Confirm category/locality/provider assumptions | Decision register and validated seed specification |
| 2 | Design home/search/detail in both languages | Responsive prototype and task feedback |
| 3 | Design posting/admin/state matrix | Reviewed forms, disclosures and lifecycle screens |
| 4 | Bootstrap app/schema/identity/staging | CI/build, migration and permission evidence |
| 5 | Build posting/media/moderation slice | Three category submissions approved and safely public |
| 6 | Build discovery/contact slice | Buyer mobile flow with truthful contact telemetry |
| 7 | Harden visuals/privacy/operations | Quality rubric and launch-gate evidence |
| 8 | Run pilot and staged launch | Real inventory, metric baseline and operator readiness |

**Next implementation deliverable:** a high-fidelity bilingual prototype of home, search, listing detail and posting, built around the tokens and page specifications above, alongside the provider/locality decisions needed for the backend.
