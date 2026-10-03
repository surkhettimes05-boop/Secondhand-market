begin;
create table public.market_notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 listing_id uuid references public.market_listings(id),
 kind text not null check(kind in ('approve','reject','changes_requested','inquiry','reminder','expired','appeal')),
 event_key text not null,
 body text not null,
 read_at timestamptz,
 created_at timestamptz not null default now(),
 unique(user_id,event_key)
);
create table public.market_appeals (
 id uuid primary key default gen_random_uuid(),
 listing_id uuid not null references public.market_listings(id),
 owner_id uuid not null references auth.users(id),
 body text not null check(length(body) between 20 and 1000),
 status text not null default 'open' check(status in ('open','resolved')),
 resolution text,
 reviewer_id uuid references auth.users(id),
 created_at timestamptz not null default now()
);
create unique index market_one_open_appeal on public.market_appeals(listing_id) where status='open';
alter table public.market_notifications enable row level security;
alter table public.market_appeals enable row level security;
revoke all on public.market_notifications,public.market_appeals from anon,authenticated;
grant select on public.market_notifications,public.market_appeals to authenticated;
create policy notification_read on public.market_notifications for select to authenticated using(user_id=auth.uid());
create policy appeal_read on public.market_appeals for select to authenticated using(owner_id=auth.uid() or public.market_is_moderator());
create function private.market_review_notification() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 insert into public.market_notifications(user_id,listing_id,kind,event_key,body)
 select owner_id,new.listing_id,new.decision,new.id::text,new.reason from public.market_listings where id=new.listing_id
 on conflict do nothing;
 return new;
end $$;
revoke all on function private.market_review_notification() from public;
create trigger market_review_notice after insert on public.market_reviews for each row execute function private.market_review_notification();
create function private.market_inquiry_notification() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 insert into public.market_notifications(user_id,listing_id,kind,event_key,body)
 values(new.recipient_id,new.listing_id,'inquiry',new.id::text,'A new inquiry has arrived.') on conflict do nothing;
 return new;
end $$;
revoke all on function private.market_inquiry_notification() from public;
create trigger market_inquiry_notice after insert on public.market_inquiries for each row execute function private.market_inquiry_notification();
create function public.market_read_notification(p_id uuid) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 update public.market_notifications set read_at=now() where id=p_id and user_id=private.market_actor();
 if not found then raise exception 'Notification unavailable' using errcode='42501'; end if;
end $$;
create function public.market_appeal(p_id uuid,p_body text) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid:=private.market_actor(); target uuid:=gen_random_uuid();
begin
 if length(trim(p_body)) not between 20 and 1000 then raise exception 'Appeal must contain 20–1000 characters'; end if;
 if not exists(select 1 from public.market_listings where id=p_id and owner_id=actor and (status='removed' or review_status in ('rejected','changes_requested')))
 then raise exception 'Appeal unavailable' using errcode='42501'; end if;
 perform private.market_rate('appeal',3,86400);
 insert into public.market_appeals(id,listing_id,owner_id,body) values(target,p_id,actor,trim(p_body));
 return target;
end $$;
create function public.market_resolve_appeal(p_id uuid,p_reason text) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid:=private.market_actor(); item public.market_appeals;
begin
 if not public.market_is_moderator() then raise exception 'Moderator MFA required' using errcode='42501'; end if;
 if length(trim(p_reason)) not between 3 and 1000 then raise exception 'Reason required'; end if;
 select * into item from public.market_appeals where id=p_id and status='open' for update;
 if item.id is null or item.owner_id=actor then raise exception 'Appeal not reviewable'; end if;
 update public.market_appeals set status='resolved',resolution=p_reason,reviewer_id=actor where id=p_id;
 insert into public.market_notifications(user_id,listing_id,kind,event_key,body) values(item.owner_id,item.listing_id,'appeal',p_id::text,p_reason) on conflict do nothing;
 insert into public.market_audit(actor_id,listing_id,action,reason) values(actor,item.listing_id,'appeal_resolved',p_reason);
end $$;
create or replace function public.market_expire() returns integer
language plpgsql security definer set search_path=public,pg_temp as $$
declare changed integer;
begin
 insert into public.market_notifications(user_id,listing_id,kind,event_key,body)
 select owner_id,id,'reminder','reminder:'||id::text||':'||expires_at::text,'Confirm availability before your listing expires.'
 from public.market_listings where status='published' and expires_at>now() and expires_at<=now()+interval '3 days'
 on conflict do nothing;
 insert into public.market_notifications(user_id,listing_id,kind,event_key,body)
 select owner_id,id,'expired','expired:'||id::text||':'||expires_at::text,'Your listing expired. Confirm availability and resubmit it for review.'
 from public.market_listings where status='published' and expires_at<=now() on conflict do nothing;
 update public.market_listings set status='expired',updated_at=now() where status='published' and expires_at<=now();
 get diagnostics changed=row_count;
 delete from private.market_limits where window_start < floor(extract(epoch from now())/86400)::bigint-30 and action in ('submit','appeal');
 return changed;
end $$;
revoke all on function public.market_read_notification(uuid),public.market_appeal(uuid,text),public.market_resolve_appeal(uuid,text) from public,anon;
grant execute on function public.market_read_notification(uuid),public.market_appeal(uuid,text),public.market_resolve_appeal(uuid,text) to authenticated;
commit;
