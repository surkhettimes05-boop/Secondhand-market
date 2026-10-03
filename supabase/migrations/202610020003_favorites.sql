begin;
create table public.market_favorites (
 user_id uuid not null references auth.users(id) on delete cascade,
 listing_id uuid not null references public.market_listings(id),
 created_at timestamptz not null default now(),
 primary key(user_id,listing_id)
);
alter table public.market_favorites enable row level security;
revoke all on public.market_favorites from anon,authenticated;
grant select on public.market_favorites to authenticated;
create policy market_favorite_read on public.market_favorites for select to authenticated using(user_id=auth.uid());
create function public.market_favorite(p_id uuid) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare actor uuid:=private.market_actor();
begin
 perform private.market_rate('favorite',120,3600);
 if exists(select 1 from public.market_favorites where user_id=actor and listing_id=p_id) then
   delete from public.market_favorites where user_id=actor and listing_id=p_id;
 else
   if not exists(select 1 from public.market_listings l join public.market_profiles p on p.user_id=l.owner_id where l.id=p_id and l.status='published' and l.expires_at>now() and p.status='active')
   then raise exception 'Listing unavailable'; end if;
   insert into public.market_favorites(user_id,listing_id) values(actor,p_id);
 end if;
 return (select coalesce(jsonb_agg(listing_id),'[]'::jsonb) from public.market_favorites where user_id=actor);
end $$;
revoke all on function public.market_favorite(uuid) from public,anon;
grant execute on function public.market_favorite(uuid) to authenticated;
commit;
