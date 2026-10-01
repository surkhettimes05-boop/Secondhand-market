-- Executable Supabase migration; supersedes db/001_marketplace_foundation.sql.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table public.market_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Seller' check (length(display_name) between 1 and 100),
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now()
);
create table private.market_moderators (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table private.market_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  window_start bigint not null,
  total integer not null,
  primary key (user_id, action, window_start)
);
create table public.market_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.market_profiles(user_id),
  category text not null check (category in ('rent','land','items')),
  status text not null default 'draft' check (status in ('draft','published','paused','expired','sold','rented','withdrawn','removed')),
  review_status text not null default 'draft' check (review_status in ('draft','pending','changes_requested','rejected','none')),
  draft_content jsonb not null default '{}',
  approved_content jsonb,
  review_note text,
  contact_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  expires_at timestamptz,
  check (status <> 'published' or (approved_content is not null and confirmed_at is not null and expires_at is not null))
);
create table public.market_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.market_listings(id),
  owner_id uuid not null references public.market_profiles(user_id),
  path text not null unique,
  created_at timestamptz not null default now()
);
create table public.market_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.market_listings(id),
  moderator_id uuid not null references auth.users(id),
  decision text not null,
  reason text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);
create table public.market_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.market_listings(id),
  reporter_id uuid not null references auth.users(id),
  reason text not null check (reason in ('unavailable','misleading','duplicate','scam','prohibited','privacy')),
  detail text not null default '' check (length(detail) <= 1000),
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  resolution text,
  created_at timestamptz not null default now()
);
create table public.market_inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.market_listings(id),
  sender_id uuid not null references auth.users(id),
  recipient_id uuid not null references auth.users(id),
  body text not null check (length(body) between 20 and 1000),
  share_phone boolean not null default false,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);
create table public.market_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  listing_id uuid references public.market_listings(id),
  action text not null,
  reason text,
  created_at timestamptz not null default now()
);
create index market_owner on public.market_listings(owner_id, updated_at desc);
create index market_discovery on public.market_listings(category, expires_at) where status = 'published';
create index market_queue on public.market_listings(updated_at) where review_status = 'pending';
create index market_inbox on public.market_inquiries(recipient_id, created_at desc);

create function private.market_actor() returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid := auth.uid();
begin
  if actor is null or not exists (
    select 1 from auth.users u join public.market_profiles p on p.user_id = u.id
    where u.id = actor and u.phone_confirmed_at is not null and p.status = 'active'
  ) then raise exception 'Verified active account required' using errcode = '42501'; end if;
  -- Serializes actor mutations so quotas remain correct under concurrent requests.
  perform 1 from public.market_profiles where user_id = actor for update;
  return actor;
end $$;
revoke all on function private.market_actor() from public;
create function public.market_moderator_member() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from private.market_moderators m join public.market_profiles p on p.user_id=m.user_id
    where m.user_id=auth.uid() and p.status='active');
$$;
create function public.market_is_moderator() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select public.market_moderator_member() and coalesce(auth.jwt()->>'aal','aal1') = 'aal2';
$$;
create function private.market_rate(action_name text, maximum integer, seconds integer) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare actor uuid := private.market_actor(); used integer;
begin
  insert into private.market_limits(user_id,action,window_start,total)
  values (actor,action_name,floor(extract(epoch from now())/seconds)::bigint,1)
  on conflict (user_id,action,window_start) do update set total=private.market_limits.total+1
  returning total into used;
  if used > maximum then raise exception 'Action limit reached; try again later' using errcode='P0001'; end if;
end $$;
revoke all on function private.market_rate(text,integer,integer) from public;

create function private.market_new_profile() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  insert into public.market_profiles(user_id,display_name) values(new.id,'Seller') on conflict do nothing;
  return new;
end $$;
revoke all on function private.market_new_profile() from public;
create trigger market_profile_created after insert on auth.users for each row execute function private.market_new_profile();
insert into public.market_profiles(user_id) select id from auth.users on conflict do nothing;

alter table public.market_profiles enable row level security;
alter table public.market_listings enable row level security;
alter table public.market_media enable row level security;
alter table public.market_reviews enable row level security;
alter table public.market_reports enable row level security;
alter table public.market_inquiries enable row level security;
alter table public.market_audit enable row level security;
create policy profiles_read on public.market_profiles for select to authenticated using (user_id=auth.uid() or public.market_is_moderator());
create policy listings_read on public.market_listings for select to authenticated using (owner_id=auth.uid() or public.market_is_moderator());
create policy media_read on public.market_media for select to authenticated using (owner_id=auth.uid() or public.market_is_moderator());
create policy reviews_read on public.market_reviews for select to authenticated using (public.market_is_moderator());
create policy reports_read on public.market_reports for select to authenticated using (reporter_id=auth.uid() or public.market_is_moderator());
create policy inquiries_read on public.market_inquiries for select to authenticated using (sender_id=auth.uid() or recipient_id=auth.uid());
create policy audit_read on public.market_audit for select to authenticated using (public.market_is_moderator());
revoke all on public.market_profiles,public.market_listings,public.market_media,public.market_reviews,public.market_reports,public.market_inquiries,public.market_audit from anon,authenticated;
grant select on public.market_profiles,public.market_listings,public.market_media,public.market_reviews,public.market_reports,public.market_inquiries,public.market_audit to authenticated;

create function public.market_save_draft(p_id uuid, p_category text, p_content jsonb) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid := private.market_actor(); item public.market_listings; target uuid := coalesce(p_id,gen_random_uuid());
begin
  perform private.market_rate('draft',120,3600);
  if p_category not in ('rent','land','items') or jsonb_typeof(p_content)<>'object' or octet_length(p_content::text)>30000 then
    raise exception 'Invalid draft';
  end if;
  if p_id is null then
    if (select count(*) from public.market_listings where owner_id=actor and status='draft')>=10 then raise exception 'Draft quota reached'; end if;
    insert into public.market_listings(id,owner_id,category,draft_content) values(target,actor,p_category,p_content);
  else
    select * into item from public.market_listings where id=target for update;
    if item.id is null or item.owner_id<>actor then raise exception 'Not allowed' using errcode='42501'; end if;
    if item.status in ('sold','rented','withdrawn','removed') or item.review_status='pending' then raise exception 'Listing is not editable'; end if;
    if item.approved_content is not null and item.category<>p_category then raise exception 'Published category cannot change'; end if;
    update public.market_listings set category=p_category,draft_content=p_content,review_status='draft',updated_at=now() where id=target;
  end if;
  return target;
end $$;

create function private.market_validate(item public.market_listings) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare c jsonb := item.draft_content; d jsonb := c->'details'; photo text;
begin
  if jsonb_typeof(c)<>'object' or length(trim(coalesce(c->>'title',''))) not between 10 and 100
     or length(trim(coalesce(c->>'description',''))) not between 30 and 3000
     or coalesce(c->>'pricePaisa','') !~ '^[0-9]{1,15}$' or (c->>'pricePaisa')::numeric<=0
     or c->>'locality' is distinct from 'Birendranagar'
     or jsonb_typeof(c->'phonePublic') is distinct from 'boolean'
     or jsonb_typeof(c->'whatsapp') is distinct from 'boolean'
     or (c->>'whatsapp')::boolean and not (c->>'phonePublic')::boolean
     or c->>'policyVersion' is distinct from '2026-10-01'
     or c->'termsAccepted' is distinct from 'true'::jsonb
     or jsonb_typeof(c->'photos') is distinct from 'array'
     or jsonb_array_length(c->'photos') not between 1 and 10
     or jsonb_typeof(d) is distinct from 'object'
  then raise exception 'Complete all required listing fields'; end if;
  if ((c->>'title')||' '||(c->>'description')) ~ '(\+?977)?[98][0-9]{9}' then raise exception 'Keep phone numbers out of public text'; end if;
  if exists(select 1 from jsonb_each(d) where jsonb_typeof(value)='string'
    and (length(value#>>'{}')>1000 or (value#>>'{}') ~ '[98][0-9]{9}')) then raise exception 'Public details contain invalid text or phone numbers'; end if;
  for photo in select jsonb_array_elements_text(c->'photos') loop
    if not exists(select 1 from public.market_media where listing_id=item.id and owner_id=item.owner_id and path=photo)
    then raise exception 'Photo does not belong to this listing'; end if;
  end loop;
  if item.category='rent' then
    if coalesce(c->>'role','') not in ('owner','broker') or coalesce(d->>'subtype','') not in ('room','flat','house')
       or coalesce(d->>'bedrooms','') !~ '^[0-9]{1,3}$' or (d->>'bedrooms')::int not between 1 and 100
       or coalesce(d->>'depositPaisa','') !~ '^[0-9]{1,15}$'
       or length(trim(coalesce(d->>'water','')))=0 or length(trim(coalesce(d->>'bathroom','')))=0
       or coalesce(d->>'availableDate','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
       or length(trim(coalesce(d->>'parking','')))=0 or length(trim(coalesce(d->>'charges','')))=0
       or length(trim(coalesce(d->>'brokerFee','')))=0
    then raise exception 'Rental disclosures incomplete'; end if;
  elsif item.category='land' then
    if coalesce(c->>'role','') not in ('owner','broker') or coalesce(d->>'area','') !~ '^[0-9]+(\.[0-9]+)?$'
       or (d->>'area')::numeric<=0 or (d->>'area')::numeric>1000000000
       or coalesce(d->>'areaUnit','') not in ('sqft','sqm','aana','kattha')
       or length(trim(coalesce(d->>'roadAccess','')))=0 or length(trim(coalesce(d->>'brokerFee','')))=0
       or d->'ownershipDeclared' is distinct from 'true'::jsonb
    then raise exception 'Land disclosures incomplete'; end if;
  else
    if coalesce(c->>'role','') not in ('individual','shop') or coalesce(d->>'subcategory','') not in ('furniture','appliances','electronics','household')
       or coalesce(d->>'condition','') not in ('like_new','good','fair','needs_repair')
       or length(trim(coalesce(d->>'defects','')))=0 or length(trim(coalesce(d->>'pickup','')))=0
    then raise exception 'Item disclosures incomplete'; end if;
  end if;
end $$;
revoke all on function private.market_validate(public.market_listings) from public;

create function public.market_submit(p_id uuid) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid := private.market_actor(); item public.market_listings;
begin
  select * into item from public.market_listings where id=p_id for update;
  if item.id is null or item.owner_id<>actor then raise exception 'Not allowed' using errcode='42501'; end if;
  if item.review_status='pending' then return; end if;
  if item.status in ('sold','rented','withdrawn','removed') then raise exception 'Listing cannot be submitted'; end if;
  perform private.market_validate(item);
  perform private.market_rate('submit',3,86400);
  if (select count(*) from public.market_listings where owner_id=actor and id<>p_id and (status='published' or review_status='pending'))>=5
  then raise exception 'Active listing quota reached'; end if;
  update public.market_listings set review_status='pending',review_note=null,updated_at=now() where id=p_id;
  insert into public.market_audit(actor_id,listing_id,action) values(actor,p_id,'submitted');
end $$;

create function public.market_register_media(p_id uuid,p_path text) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid := private.market_actor(); item public.market_listings;
begin
  select * into item from public.market_listings where id=p_id for update;
  if item.id is null or item.owner_id<>actor then raise exception 'Not allowed' using errcode='42501'; end if;
  if item.review_status='pending' or item.status in ('sold','rented','withdrawn','removed') then raise exception 'Listing is not editable'; end if;
  if p_path !~ ('^'||actor::text||'/'||p_id::text||'/[a-f0-9-]{36}\.webp$')
     or not exists(select 1 from storage.objects where bucket_id='market-media' and name=p_path)
  then raise exception 'Invalid processed media'; end if;
  if (select count(*) from public.market_media where listing_id=p_id)>=20 then raise exception 'Photo limit reached'; end if;
  perform private.market_rate('media',30,3600);
  insert into public.market_media(listing_id,owner_id,path) values(p_id,actor,p_path);
end $$;

create function public.market_review(p_id uuid,p_decision text,p_reason text) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid := private.market_actor(); item public.market_listings;
begin
  if not public.market_is_moderator() then raise exception 'Moderator MFA required' using errcode='42501'; end if;
  if p_decision not in ('approve','changes_requested','reject') or length(trim(p_reason)) not between 3 and 1000 then raise exception 'Decision and reason required'; end if;
  select * into item from public.market_listings where id=p_id for update;
  if item.id is null or item.review_status<>'pending' or item.status in ('sold','rented','withdrawn','removed')
     or not exists(select 1 from public.market_profiles where user_id=item.owner_id and status='active')
  then raise exception 'Listing is not reviewable'; end if;
  if item.owner_id=actor then raise exception 'Cannot review your own listing'; end if;
  if p_decision='approve' then
    perform private.market_validate(item);
    update public.market_listings set approved_content=draft_content,status='published',review_status='none',
      confirmed_at=now(),expires_at=now()+interval '30 days',contact_blocked=false,review_note=p_reason,updated_at=now() where id=p_id;
  else
    update public.market_listings set review_status=case when p_decision='reject' then 'rejected' else 'changes_requested' end,
      review_note=p_reason,updated_at=now() where id=p_id;
  end if;
  insert into public.market_reviews(listing_id,moderator_id,decision,reason,snapshot) values(p_id,actor,p_decision,p_reason,item.draft_content);
  insert into public.market_audit(actor_id,listing_id,action,reason) values(actor,p_id,p_decision,p_reason);
end $$;

create function public.market_transition(p_id uuid,p_action text) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid := private.market_actor(); item public.market_listings;
begin
  select * into item from public.market_listings where id=p_id for update;
  if item.id is null or item.owner_id<>actor then raise exception 'Not allowed' using errcode='42501'; end if;
  if item.status in ('sold','rented','withdrawn','removed') then raise exception 'Listing is closed'; end if;
  if p_action='revoke_contact' then
    update public.market_listings set contact_blocked=true where id=p_id;
  elsif p_action='pause' and item.status='published' then
    update public.market_listings set status='paused',review_status=case when review_status='pending' then 'draft' else review_status end where id=p_id;
  elsif p_action='resume' and item.status='paused' and item.expires_at>now() then
    update public.market_listings set status='published' where id=p_id;
  elsif p_action='renew' and item.status='published' and item.expires_at>now() then
    update public.market_listings set confirmed_at=now(),expires_at=now()+interval '30 days' where id=p_id;
  elsif p_action in ('sold','rented','withdrawn') then
    if p_action='rented' and item.category<>'rent' or p_action='sold' and item.category='rent' then raise exception 'Wrong completion state'; end if;
    update public.market_listings set status=p_action,review_status='none' where id=p_id;
  else raise exception 'Invalid transition; expired listings require resubmission'; end if;
  update public.market_listings set updated_at=now() where id=p_id;
  insert into public.market_audit(actor_id,listing_id,action) values(actor,p_id,p_action);
end $$;

create function private.market_public_content(c jsonb) returns jsonb
language sql immutable set search_path=public,pg_temp as $$
select jsonb_build_object('title',c->'title','description',c->'description','pricePaisa',c->'pricePaisa',
 'locality',c->'locality','role',c->'role','details',(select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) from jsonb_each(c->'details') where key in ('subtype','bedrooms','depositPaisa','availableDate','water','bathroom','parking','charges','brokerFee','area','areaUnit','roadAccess','ownershipDeclared','subcategory','condition','defects','pickup')),'photos',c->'photos');
$$;
revoke all on function private.market_public_content(jsonb) from public;
create function public.market_catalog() returns jsonb
language sql stable security definer set search_path=public,pg_temp as $$
select coalesce(jsonb_agg(jsonb_build_object('id',l.id,'category',l.category,'content',private.market_public_content(l.approved_content),
 'confirmedAt',l.confirmed_at,'expiresAt',l.expires_at) order by l.created_at desc),'[]'::jsonb)
from (select * from public.market_listings where status='published' and expires_at>now() order by created_at desc limit 500) l
join public.market_profiles p on p.user_id=l.owner_id and p.status='active';
$$;
create function public.market_public_media(p_path text) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
select exists(select 1 from public.market_listings l join public.market_profiles p on p.user_id=l.owner_id
 where l.status='published' and l.expires_at>now() and p.status='active'
 and l.approved_content->'photos' ? p_path);
$$;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('market-media','market-media',false,10485760,array['image/webp']) on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=array['image/webp'];
-- No client INSERT/UPDATE/DELETE policy. Only the server's image-processing service writes.
create policy market_photo_read on storage.objects for select to anon,authenticated
using(bucket_id='market-media' and (public.market_public_media(name) or
  (auth.uid() is not null and (split_part(name,'/',1)=auth.uid()::text or public.market_is_moderator()))));

create function public.market_contact(p_id uuid) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid := private.market_actor(); item public.market_listings; phone_number text;
begin
  perform private.market_rate('contact',20,3600);
  select l.* into item from public.market_listings l join public.market_profiles p on p.user_id=l.owner_id
   where l.id=p_id and l.status='published' and l.expires_at>now() and p.status='active';
  if item.id is null or item.contact_blocked or item.approved_content->'phonePublic' is distinct from 'true'::jsonb then raise exception 'Contact unavailable'; end if;
  select phone into phone_number from auth.users where id=item.owner_id and phone_confirmed_at is not null;
  if phone_number is null then raise exception 'Contact unavailable'; end if;
  return jsonb_build_object('phone',phone_number,'whatsapp',item.approved_content->'whatsapp');
end $$;
create function public.market_inquire(p_id uuid,p_body text,p_share_phone boolean) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid := private.market_actor(); recipient uuid; target uuid:=gen_random_uuid();
begin
  if length(trim(p_body)) not between 20 and 1000 then raise exception 'Inquiry must contain 20–1000 characters'; end if;
  select l.owner_id into recipient from public.market_listings l join public.market_profiles p on p.user_id=l.owner_id
   where l.id=p_id and l.status='published' and l.expires_at>now() and p.status='active';
  if recipient is null or recipient=actor then raise exception 'Inquiry unavailable'; end if;
  perform private.market_rate('inquiry',10,3600);
  insert into public.market_inquiries(id,listing_id,sender_id,recipient_id,body,share_phone) values(target,p_id,actor,recipient,trim(p_body),coalesce(p_share_phone,false));
  return target;
end $$;
create function public.market_inbox() returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid:=private.market_actor();
begin
 return (select coalesce(jsonb_agg(jsonb_build_object('id',i.id,'listingId',i.listing_id,'title',coalesce(l.approved_content->>'title',l.draft_content->>'title'),
  'body',i.body,'received',i.recipient_id=actor,'createdAt',i.created_at,
  'senderPhone',case when i.recipient_id=actor and i.share_phone then u.phone else null end) order by i.created_at desc),'[]'::jsonb)
  from public.market_inquiries i join public.market_listings l on l.id=i.listing_id join auth.users u on u.id=i.sender_id
  where i.sender_id=actor or i.recipient_id=actor);
end $$;
create function public.market_report(p_id uuid,p_reason text,p_detail text) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid:=private.market_actor(); target uuid:=gen_random_uuid();
begin
  perform private.market_rate('report',10,3600);
  if not exists(select 1 from public.market_listings where id=p_id and approved_content is not null) then raise exception 'Listing unavailable'; end if;
  if p_reason not in ('unavailable','misleading','duplicate','scam','prohibited','privacy') or length(coalesce(p_detail,''))>1000 then raise exception 'Invalid report'; end if;
  insert into public.market_reports(id,listing_id,reporter_id,reason,detail) values(target,p_id,actor,p_reason,coalesce(p_detail,''));
  return target;
end $$;
create function public.market_moderate(p_id uuid,p_action text,p_reason text) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid:=private.market_actor();
begin
  if not public.market_is_moderator() then raise exception 'Moderator MFA required' using errcode='42501'; end if;
  if p_action not in ('hide','reinstate') or length(trim(p_reason)) not between 3 and 1000 then raise exception 'Invalid moderation action'; end if;
  if p_action='hide' then
    update public.market_listings set status='removed',review_status='none',review_note=p_reason,updated_at=now() where id=p_id and status not in ('sold','rented','withdrawn');
  else
    update public.market_listings set status=case when expires_at>now() then 'published' else 'expired' end,review_note=p_reason,updated_at=now()
    where id=p_id and status='removed' and approved_content is not null and exists(select 1 from public.market_profiles where user_id=owner_id and status='active');
  end if;
  if not found then raise exception 'Action not applicable'; end if;
  insert into public.market_audit(actor_id,listing_id,action,reason) values(actor,p_id,p_action,p_reason);
end $$;
create function public.market_resolve_report(p_id uuid,p_status text,p_reason text) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  perform private.market_actor();
  if not public.market_is_moderator() then raise exception 'Moderator MFA required' using errcode='42501'; end if;
  if p_status not in ('resolved','dismissed') or length(trim(p_reason)) not between 3 and 1000 then raise exception 'Resolution required'; end if;
  update public.market_reports set status=p_status,resolution=p_reason where id=p_id and status='open';
  if not found then raise exception 'Report is not open'; end if;
end $$;
-- Expiry is enforced on every read/contact, regardless of scheduler health.
create function public.market_expire() returns integer
language plpgsql security definer set search_path=public,pg_temp as $$
declare changed integer;
begin
 update public.market_listings set status='expired',updated_at=now() where status='published' and expires_at<=now();
 get diagnostics changed=row_count;
 return changed;
end $$;
revoke all on function public.market_expire() from public,anon,authenticated;
grant execute on function public.market_expire() to service_role;

-- PostgreSQL functions default to PUBLIC execute: explicitly close that default.
revoke all on function public.market_moderator_member(),public.market_is_moderator(),public.market_save_draft(uuid,text,jsonb),
 public.market_submit(uuid),public.market_register_media(uuid,text),public.market_review(uuid,text,text),
 public.market_transition(uuid,text),public.market_contact(uuid),public.market_inquire(uuid,text,boolean),
 public.market_inbox(),public.market_report(uuid,text,text),public.market_moderate(uuid,text,text),
 public.market_resolve_report(uuid,text,text) from public,anon;
grant execute on function public.market_moderator_member(),public.market_is_moderator(),public.market_save_draft(uuid,text,jsonb),
 public.market_submit(uuid),public.market_register_media(uuid,text),public.market_review(uuid,text,text),
 public.market_transition(uuid,text),public.market_contact(uuid),public.market_inquire(uuid,text,boolean),
 public.market_inbox(),public.market_report(uuid,text,text),public.market_moderate(uuid,text,text),
 public.market_resolve_report(uuid,text,text) to authenticated;
revoke all on function public.market_catalog(),public.market_public_media(text) from public;
grant execute on function public.market_catalog(),public.market_public_media(text) to anon,authenticated;
commit;
