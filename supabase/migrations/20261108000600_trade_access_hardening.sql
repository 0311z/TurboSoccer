begin;
revoke create on schema public from public,anon,authenticated;
-- WHY: advisory serialization enforces per-user limits without a profile→listing
-- row-lock inversion when completing a trade also updates the other profile.
create or replace function public.require_trader() returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid=(select auth.uid()); v_roblox text; v_age timestamptz; v_ban timestamptz;
begin
 if v_id is null then raise exception 'Sign in to trade' using errcode='42501'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('tsv.trader:' || v_id::text,0));
 select roblox_username into v_roblox from public.profiles where id=v_id;
 if not found then raise exception 'Profile unavailable' using errcode='42501'; end if;
 select age_confirmed_at,banned_until into v_age,v_ban from public.profile_private where id=v_id;
 if not found or v_age is null or v_roblox is null then raise exception 'Complete your trading profile' using errcode='42501'; end if;
 if v_ban > now() then raise exception 'Trading access restricted' using errcode='42501'; end if;
 return v_id;
end $$;
-- WHY: a narrow helper prevents mutually recursive listing/offer RLS policies.
-- It reveals only whether the current user has an offer on the supplied listing.
create or replace function public.has_listing_offer(p_listing_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select (select auth.uid()) is not null and exists(
  select 1 from public.trade_offers where listing_id=p_listing_id and offerer_id=(select auth.uid())
 )
$$;
revoke execute on function public.has_listing_offer(uuid) from public,anon,authenticated;
grant execute on function public.has_listing_offer(uuid) to anon,authenticated;
drop policy if exists trade_listings_select_public_owner_staff on public.trade_listings;
create policy trade_listings_select_public_owner_staff on public.trade_listings for select to anon,authenticated using(
 (status='open' and expires_at>now()) or owner_id=(select auth.uid()) or (select public.is_staff()) or public.has_listing_offer(id)
);
create or replace function public.complete_listing(p_listing_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid; v_listing public.trade_listings; v_other uuid;
begin
 v_user=public.require_trader();
 select * into v_listing from public.trade_listings where id=p_listing_id for update;
 if not found or v_listing.owner_id<>v_user then raise exception 'Listing not available' using errcode='42501'; end if;
 if v_listing.status<>'pending' then raise exception 'An accepted offer is required'; end if;
 select offerer_id into v_other from public.trade_offers where listing_id=p_listing_id and status='accepted';
 if v_other is null then raise exception 'Accepted offer unavailable'; end if;
 -- WHY: all completions lock both counters in UUID order, preventing reciprocal
 -- trades from acquiring the same two profile rows in opposite orders.
 perform 1 from public.profiles where id in (v_user,v_other) order by id for update;
 update public.trade_listings set status='completed',completed_at=now() where id=p_listing_id;
 update public.profiles set trades_completed=trades_completed+1 where id in (v_user,v_other);
end $$;
create or replace function public.withdraw_offer(p_offer_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid=(select auth.uid()); v_offer public.trade_offers; v_listing public.trade_listings;
begin
 if v_user is null then raise exception 'Sign in first' using errcode='42501'; end if;
 select * into v_offer from public.trade_offers where id=p_offer_id;
 if not found or v_offer.offerer_id<>v_user then raise exception 'Offer unavailable' using errcode='42501'; end if;
 -- WHY: lock the listing before its offer, matching respond_offer/cancel_listing.
 select * into v_listing from public.trade_listings where id=v_offer.listing_id for update;
 if not found then raise exception 'Listing unavailable'; end if;
 select * into v_offer from public.trade_offers where id=p_offer_id for update;
 if not found or v_offer.offerer_id<>v_user or v_offer.status<>'pending' then raise exception 'Offer already resolved'; end if;
 update public.trade_offers set status='withdrawn',responded_at=now() where id=p_offer_id;
end $$;
revoke execute on function public.require_trader(),public.complete_listing(uuid),public.withdraw_offer(uuid) from public,anon,authenticated;
grant execute on function public.complete_listing(uuid),public.withdraw_offer(uuid) to authenticated;
-- WHY: changing a previously verified Roblox handle invalidates the old claim.
create or replace function public.reset_roblox_verification() returns trigger language plpgsql set search_path='' as $$
begin
 if old.roblox_username is distinct from new.roblox_username then
  new.roblox_verified=false; new.roblox_user_id=null;
 end if;
 return new;
end $$;
revoke execute on function public.reset_roblox_verification() from public,anon,authenticated;
drop trigger if exists profiles_reset_roblox_verification on public.profiles;
create trigger profiles_reset_roblox_verification before update of roblox_username on public.profiles for each row execute function public.reset_roblox_verification();
commit;
