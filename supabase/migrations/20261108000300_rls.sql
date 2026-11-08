begin;
alter table public.categories enable row level security;
alter table public.rarities enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_private enable row level security;
alter table public.items enable row level security;
alter table public.item_value_history enable row level security;
alter table public.trade_listings enable row level security;
alter table public.trade_listing_items enable row level security;
alter table public.trade_offers enable row level security;
alter table public.trade_offer_items enable row level security;
alter table public.audit_log enable row level security;
revoke all on table public.categories,public.rarities,public.profiles,public.profile_private,public.items,public.item_value_history,public.trade_listings,public.trade_listing_items,public.trade_offers,public.trade_offer_items,public.audit_log from public,anon,authenticated;
revoke all on sequence public.item_value_history_id_seq,public.audit_log_id_seq from public,anon,authenticated;
grant usage on schema public to anon,authenticated;
grant select on public.categories,public.rarities,public.profiles,public.items,public.item_value_history,public.trade_listings,public.trade_listing_items to anon,authenticated;
grant select on public.profile_private,public.trade_offers,public.trade_offer_items,public.audit_log to authenticated;
grant update(username,roblox_username,bio) on public.profiles to authenticated;
drop policy if exists categories_select_public on public.categories;
create policy categories_select_public on public.categories for select to anon,authenticated using(true);
drop policy if exists rarities_select_public on public.rarities;
create policy rarities_select_public on public.rarities for select to anon,authenticated using(true);
drop policy if exists items_select_public on public.items;
create policy items_select_public on public.items for select to anon,authenticated using(true);
drop policy if exists item_value_history_select_public on public.item_value_history;
create policy item_value_history_select_public on public.item_value_history for select to anon,authenticated using(true);
drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public on public.profiles for select to anon,authenticated using(true);
drop policy if exists profiles_update_owner on public.profiles;
create policy profiles_update_owner on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
drop policy if exists profile_private_select_owner_staff on public.profile_private;
create policy profile_private_select_owner_staff on public.profile_private for select to authenticated using(id=(select auth.uid()) or (select public.is_staff()));
drop policy if exists trade_listings_select_public_owner_staff on public.trade_listings;
create policy trade_listings_select_public_owner_staff on public.trade_listings for select to anon,authenticated using(
 (status='open' and expires_at>now()) or owner_id=(select auth.uid()) or (select public.is_staff())
);
drop policy if exists trade_listing_items_select_visible on public.trade_listing_items;
create policy trade_listing_items_select_visible on public.trade_listing_items for select to anon,authenticated using(
 exists(select 1 from public.trade_listings l where l.id=listing_id)
);
drop policy if exists trade_offers_select_participants_staff on public.trade_offers;
create policy trade_offers_select_participants_staff on public.trade_offers for select to authenticated using(
 offerer_id=(select auth.uid()) or (select public.is_staff()) or exists(select 1 from public.trade_listings l where l.id=listing_id and l.owner_id=(select auth.uid()))
);
drop policy if exists trade_offer_items_select_participants_staff on public.trade_offer_items;
create policy trade_offer_items_select_participants_staff on public.trade_offer_items for select to authenticated using(
 exists(select 1 from public.trade_offers o where o.id=offer_id)
);
drop policy if exists audit_log_select_staff on public.audit_log;
create policy audit_log_select_staff on public.audit_log for select to authenticated using((select public.is_staff()));
create or replace view public.item_trends with (security_invoker=true) as
 select i.id as item_id,
 case when i.value is null or h.value is null or h.value=0 then null else (i.value-h.value)::numeric/h.value*100 end as change_percent,
 -- SYNC WITH SQL: TREND_THRESHOLD=0.05; exactamente 5% se considera estable.
 case when i.value is null or h.value is null or h.value=0 then 'unknown'
 when (i.value-h.value)::numeric/h.value>0.05 then 'rising'
 when (i.value-h.value)::numeric/h.value< -0.05 then 'falling' else 'stable' end as trend
 from public.items i left join lateral (
 select value from public.item_value_history where item_id=i.id and created_at<=now()-interval '7 days' order by created_at desc,id desc limit 1
 ) h on true;
create or replace view public.item_market_stats with (security_invoker=true) as
 select i.id as item_id,
 count(distinct l.id) filter(where li.side='have') as offering_count,
 count(distinct l.id) filter(where li.side='want') as seeking_count
 from public.items i left join public.trade_listing_items li on li.item_id=i.id
 left join public.trade_listings l on l.id=li.listing_id and l.status='open' and l.expires_at>now()
 group by i.id;
revoke all on public.item_trends,public.item_market_stats from public,anon,authenticated;
grant select on public.item_trends,public.item_market_stats to anon,authenticated;
revoke execute on function public.is_staff(),public.is_admin(),public.touch_updated_at(),public.handle_new_user(),public.log_item_change(),public.require_trader(),public.validate_trade_text(text),public.validate_trade_items(jsonb),public.confirm_age(),public.set_item_value(uuid,bigint,smallint,text),public.create_listing(jsonb,jsonb,bigint,bigint,text),public.create_offer(uuid,jsonb,bigint,text),public.respond_offer(uuid,boolean),public.cancel_listing(uuid),public.complete_listing(uuid),public.delete_my_account(),public.ping() from public,anon,authenticated;
grant execute on function public.is_staff() to anon,authenticated;
grant execute on function public.is_admin(),public.confirm_age(),public.set_item_value(uuid,bigint,smallint,text),public.create_listing(jsonb,jsonb,bigint,bigint,text),public.create_offer(uuid,jsonb,bigint,text),public.respond_offer(uuid,boolean),public.cancel_listing(uuid),public.complete_listing(uuid),public.delete_my_account() to authenticated;
grant execute on function public.ping() to anon,authenticated;
commit;
