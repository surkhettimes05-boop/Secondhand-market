-- Revoking contact also withdraws consent from any pending draft.
-- A later review cannot restore a previously withdrawn consent.
begin;
create or replace function public.market_transition(p_id uuid,p_action text) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid := private.market_actor(); item public.market_listings;
begin
  select * into item from public.market_listings where id=p_id for update;
  if item.id is null or item.owner_id<>actor then raise exception 'Not allowed' using errcode='42501'; end if;
  if item.status in ('sold','rented','withdrawn','removed') then raise exception 'Listing is closed'; end if;
  if p_action='revoke_contact' then
    update public.market_listings set contact_blocked=true,
      draft_content=jsonb_set(jsonb_set(draft_content,'{phonePublic}','false'::jsonb),'{whatsapp}','false'::jsonb)
    where id=p_id;
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
commit;
