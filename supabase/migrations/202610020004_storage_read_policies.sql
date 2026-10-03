-- Anonymous reads must not depend on a moderator-only predicate.
-- PostgreSQL checks function privileges in policy expressions even when another OR branch matches.
begin;
drop policy market_photo_read on storage.objects;
create policy market_photo_public_read on storage.objects for select to anon,authenticated
using (bucket_id='market-media' and public.market_public_media(name));
create policy market_photo_private_read on storage.objects for select to authenticated
using (bucket_id='market-media' and auth.uid() is not null
  and (split_part(name,'/',1)=auth.uid()::text or public.market_is_moderator()));
commit;
