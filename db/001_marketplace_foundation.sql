-- Proposed PostgreSQL baseline. Not applied or connected to the prototype.
-- Review alongside PRD before use. This is not a production-complete schema.
BEGIN;
CREATE TYPE account_state AS ENUM ('active', 'suspended', 'deletion_pending');
CREATE TYPE listing_category AS ENUM ('rent', 'land', 'items');
CREATE TYPE listing_state AS ENUM (
 'draft', 'pending_review', 'changes_requested', 'rejected', 'published',
 'paused', 'expired', 'sold', 'rented', 'withdrawn', 'removed'
);
CREATE TYPE revision_state AS ENUM ('draft', 'pending_review', 'approved', 'changes_requested', 'rejected');
CREATE TABLE users (
 id uuid PRIMARY KEY,
 identity_subject text UNIQUE NOT NULL,
 display_name text NOT NULL CHECK (length(display_name) BETWEEN 1 AND 100),
 language text NOT NULL DEFAULT 'en' CHECK (language IN ('en','ne')),
 state account_state NOT NULL DEFAULT 'active',
 phone_verified_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 deleted_at timestamptz
);
-- Protected phone data is kept separate from public profiles.
CREATE TABLE user_contacts (
 user_id uuid PRIMARY KEY REFERENCES users(id),
 encrypted_phone bytea NOT NULL,
 phone_lookup_hash text UNIQUE NOT NULL,
 changed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE localities (
 id uuid PRIMARY KEY,
 name_en text NOT NULL,
 name_ne text NOT NULL,
 municipality text NOT NULL DEFAULT 'Birendranagar',
 ward_number integer CHECK (ward_number BETWEEN 1 AND 99),
 aliases text[] NOT NULL DEFAULT '{}',
 validated_at timestamptz
);
CREATE TABLE listings (
 id uuid PRIMARY KEY,
 seller_id uuid NOT NULL REFERENCES users(id),
 category listing_category NOT NULL,
 state listing_state NOT NULL DEFAULT 'draft',
 approved_revision_id uuid,
 pending_revision_id uuid,
 confirmed_available_at timestamptz,
 expires_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 deleted_at timestamptz,
 CHECK (state <> 'published' OR
   (approved_revision_id IS NOT NULL AND confirmed_available_at IS NOT NULL AND expires_at IS NOT NULL))
);
CREATE TABLE listing_revisions (
 id uuid PRIMARY KEY,
 listing_id uuid NOT NULL REFERENCES listings(id),
 version integer NOT NULL CHECK (version > 0),
 state revision_state NOT NULL DEFAULT 'draft',
 title text NOT NULL CHECK (length(title) BETWEEN 10 AND 100),
 description text NOT NULL CHECK (length(description) BETWEEN 30 AND 3000),
 price_paisa bigint NOT NULL CHECK (price_paisa > 0),
 locality_id uuid NOT NULL REFERENCES localities(id),
 public_landmark text,
 seller_role text NOT NULL CHECK (seller_role IN ('owner','broker','individual','shop')),
 contact_consent boolean NOT NULL DEFAULT false,
 whatsapp_enabled boolean NOT NULL DEFAULT false,
 category_details jsonb NOT NULL CHECK (jsonb_typeof(category_details) = 'object'),
 policy_version text NOT NULL,
 submitted_at timestamptz,
 reviewed_at timestamptz,
 reviewer_id uuid REFERENCES users(id),
 decision_reason text,
 UNIQUE (listing_id, version),
 UNIQUE (listing_id, id),
 CHECK (NOT whatsapp_enabled OR contact_consent)
);
-- Composite foreign keys prevent attaching a revision from another listing.
ALTER TABLE listings ADD CONSTRAINT approved_revision_owner
 FOREIGN KEY (id, approved_revision_id) REFERENCES listing_revisions(listing_id, id);
ALTER TABLE listings ADD CONSTRAINT pending_revision_owner
 FOREIGN KEY (id, pending_revision_id) REFERENCES listing_revisions(listing_id, id);
CREATE TABLE private_listing_locations (
 listing_id uuid PRIMARY KEY REFERENCES listings(id),
 encrypted_address bytea,
 encrypted_coordinates bytea
);
CREATE TABLE media (
 id uuid PRIMARY KEY,
 owner_id uuid NOT NULL REFERENCES users(id),
 revision_id uuid NOT NULL REFERENCES listing_revisions(id),
 original_object_key text NOT NULL UNIQUE,
 derivative_object_key text,
 processing_state text NOT NULL CHECK (processing_state IN ('incoming','processing','ready','rejected')),
 sort_order integer NOT NULL CHECK (sort_order BETWEEN 0 AND 9),
 UNIQUE (revision_id, sort_order)
);
CREATE TABLE favorites (
 user_id uuid NOT NULL REFERENCES users(id),
 listing_id uuid NOT NULL REFERENCES listings(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (user_id, listing_id)
);
CREATE TABLE audit_events (
 id uuid PRIMARY KEY,
 actor_id uuid REFERENCES users(id),
 listing_id uuid REFERENCES listings(id),
 action text NOT NULL,
 reason text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX listings_seller_idx ON listings(seller_id, state);
CREATE INDEX listings_discovery_idx ON listings(category, expires_at, created_at DESC) WHERE state = 'published' AND deleted_at IS NULL;
CREATE INDEX revisions_price_locality_idx ON listing_revisions(locality_id, price_paisa);
-- Server queries MUST also enforce expiry, account state, moderation and consent.
-- No public generic table access; use explicit column allowlists.
-- Next migrations add structured category constraints, inquiries/reports/appeals,
-- admin roles, notifications, policy consent, retention and durable job records.
COMMIT;
