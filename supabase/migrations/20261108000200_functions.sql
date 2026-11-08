begin;
create or replace function public.is_staff() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=(select auth.uid()) and role in ('moderator','admin','owner'))
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=(select auth.uid()) and role in ('admin','owner'))
$$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
declare v_name text;
begin
 v_name='player_' || substr(replace(new.id::text,'-',''),1,8);
 loop
  begin
   insert into public.profiles(id,username) values(new.id,v_name);
   exit;
  exception when unique_violation then v_name='player_' || substr(replace(gen_random_uuid()::text,'-',''),1,12);
  end;
 end loop;
 insert into public.profile_private(id) values(new.id) on conflict do nothing;
 return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create or replace function public.log_item_change() returns trigger language plpgsql security definer set search_path='' as $$
declare v_actor uuid;
begin
 if old.value is not distinct from new.value and old.demand is not distinct from new.demand then return new; end if;
 select id into v_actor from public.profiles where id=(select auth.uid());
 insert into public.item_value_history(item_id,value,demand,reason,changed_by)
 values(new.id,new.value,new.demand,nullif(current_setting('tsv.change_reason',true),''),v_actor);
 insert into public.audit_log(actor_id,action,entity,entity_id,diff)
 values(v_actor,'item.value.update','items',new.id,jsonb_build_object('before',jsonb_build_object('value',old.value,'demand',old.demand),'after',jsonb_build_object('value',new.value,'demand',new.demand)));
 return new;
end $$;
drop trigger if exists item_change_audit on public.items;
create trigger item_change_audit after update of value,demand on public.items for each row execute function public.log_item_change();
-- Interno: bloqueo por perfil evita carreras entre operaciones del mismo usuario.
create or replace function public.require_trader() returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid=(select auth.uid()); v_roblox text; v_age timestamptz; v_ban timestamptz;
begin
 if v_id is null then raise exception 'Sign in to trade' using errcode='42501'; end if;
 select roblox_username into v_roblox from public.profiles where id=v_id for update;
 if not found then raise exception 'Profile unavailable' using errcode='42501'; end if;
 select age_confirmed_at,banned_until into v_age,v_ban from public.profile_private where id=v_id;
 if v_age is null or v_roblox is null then raise exception 'Complete your trading profile' using errcode='42501'; end if;
 if v_ban > now() then raise exception 'Trading access restricted' using errcode='42501'; end if;
 return v_id;
end $$;
create or replace function public.validate_trade_text(p_text text) returns void language plpgsql immutable set search_path='' as $$
begin
 if p_text is null or char_length(p_text)>280 then raise exception 'Message must be 0–280 characters'; end if;
 if p_text ~* '(https?\s*:|www\s*\.|[a-z0-9-]+\s*\.\s*[a-z]{2,}\M|discord\s*\.|paypal|cashapp|cash\s*app|venmo|crypto|bitcoin|real\s*money|\mdollars?\M|\meuros?\M|\mcash\M|\musd\M|\meur\M|\mrobux\M|\maccounts?\M|[$€£])'
 then raise exception 'Links, accounts and real-money payments are not allowed'; end if;
end $$;
-- SYNC WITH SQL: MAX_ITEMS_PER_SIDE=8 (límite de producto, no del juego).
create or replace function public.validate_trade_items(p_items jsonb) returns void language plpgsql stable security definer set search_path='' as $$
declare v_entry jsonb; v_id uuid; v_quantity integer;
begin
 if p_items is null or jsonb_typeof(p_items)<>'array' then raise exception 'Items must be an array'; end if;
 if jsonb_array_length(p_items)>8 then raise exception 'At most 8 item types per side'; end if;
 for v_entry in select value from jsonb_array_elements(p_items) loop
  if jsonb_typeof(v_entry)<>'object' or jsonb_typeof(v_entry->'item_id') is distinct from 'string'
   or jsonb_typeof(v_entry->'quantity') is distinct from 'number' then raise exception 'Invalid item entry'; end if;
  if (v_entry->>'quantity') !~ '^[0-9]{1,2}$' then raise exception 'Invalid item quantity'; end if;
  v_id=(v_entry->>'item_id')::uuid; v_quantity=(v_entry->>'quantity')::integer;
  if v_quantity not between 1 and 99 then raise exception 'Quantity must be 1–99'; end if;
  if not exists(select 1 from public.items where id=v_id and status='active' and is_tradable is distinct from false)
  then raise exception 'Item unavailable for trading'; end if;
 end loop;
 if (select count(*) from jsonb_array_elements(p_items)) <> (select count(distinct value->>'item_id') from jsonb_array_elements(p_items))
 then raise exception 'Combine repeated items into one quantity'; end if;
end $$;
create or replace function public.confirm_age() returns void language plpgsql security definer set search_path='' as $$
begin
 if (select auth.uid()) is null then raise exception 'Sign in first' using errcode='42501'; end if;
 update public.profile_private set age_confirmed_at=coalesce(age_confirmed_at,now()) where id=(select auth.uid());
 if not found then raise exception 'Profile unavailable'; end if;
end $$;
create or replace function public.set_item_value(p_item_id uuid,p_value bigint,p_demand smallint,p_reason text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Administrator access required' using errcode='42501'; end if;
 if p_value<0 or p_value>9007199254740991 or (p_demand is not null and p_demand not between 1 and 5)
 then raise exception 'Value or demand out of range'; end if;
 if p_reason is null or char_length(trim(p_reason)) not between 1 and 280 then raise exception 'A reason is required'; end if;
 perform set_config('tsv.change_reason',p_reason,true);
 update public.items set value=p_value,demand=p_demand where id=p_item_id;
 if not found then raise exception 'Item not found'; end if;
end $$;
create or replace function public.create_listing(p_have jsonb,p_want jsonb,p_coins_have bigint,p_coins_want bigint,p_note text) returns uuid language plpgsql security definer set search_path='' as $$
declare v_owner uuid; v_id uuid;
begin
 v_owner=public.require_trader();
 perform public.validate_trade_items(p_have); perform public.validate_trade_items(p_want); perform public.validate_trade_text(p_note);
 -- SYNC WITH SQL: MAX_COINS=1000000000000; MAX_OPEN_LISTINGS_PER_USER=10; LISTING_COOLDOWN_SECONDS=30.
 if p_coins_have is null or p_coins_want is null or p_coins_have not between 0 and 1000000000000 or p_coins_want not between 0 and 1000000000000
 then raise exception 'Coins out of range'; end if;
 if jsonb_array_length(p_have)+jsonb_array_length(p_want)=0 and p_coins_have+p_coins_want=0 then raise exception 'Add items or coins'; end if;
 if (select count(*) from public.trade_listings where owner_id=v_owner and status in ('open','pending') and expires_at>now())>=10
 then raise exception 'Maximum 10 active listings'; end if;
 if exists(select 1 from public.trade_listings where owner_id=v_owner and created_at>now()-interval '30 seconds')
 then raise exception 'Wait 30 seconds between listings'; end if;
 insert into public.trade_listings(owner_id,coins_have,coins_want,note) values(v_owner,p_coins_have,p_coins_want,p_note) returning id into v_id;
 insert into public.trade_listing_items(listing_id,item_id,side,quantity)
 select v_id,(value->>'item_id')::uuid,'have',(value->>'quantity')::smallint from jsonb_array_elements(p_have)
 union all select v_id,(value->>'item_id')::uuid,'want',(value->>'quantity')::smallint from jsonb_array_elements(p_want);
 return v_id;
end $$;
create or replace function public.create_offer(p_listing_id uuid,p_items jsonb,p_coins bigint,p_message text) returns uuid language plpgsql security definer set search_path='' as $$
declare v_user uuid; v_listing public.trade_listings; v_id uuid;
begin
 v_user=public.require_trader(); perform public.validate_trade_items(p_items); perform public.validate_trade_text(p_message);
 if p_coins is null or p_coins not between 0 and 1000000000000 then raise exception 'Coins out of range'; end if;
 if jsonb_array_length(p_items)=0 and p_coins=0 then raise exception 'Add items or coins'; end if;
 select * into v_listing from public.trade_listings where id=p_listing_id for update;
 if not found or v_listing.status<>'open' or v_listing.expires_at<=now() or not v_listing.accepts_offers then raise exception 'Listing is unavailable'; end if;
 if v_listing.owner_id=v_user then raise exception 'You cannot offer on your own listing'; end if;
 -- SYNC WITH SQL: MAX_PENDING_OFFERS_PER_LISTING=25.
 if (select count(*) from public.trade_offers where listing_id=p_listing_id and status='pending')>=25 then raise exception 'Offer limit reached'; end if;
 insert into public.trade_offers(listing_id,offerer_id,coins_offered,message) values(p_listing_id,v_user,p_coins,p_message) returning id into v_id;
 insert into public.trade_offer_items(offer_id,item_id,quantity)
 select v_id,(value->>'item_id')::uuid,(value->>'quantity')::smallint from jsonb_array_elements(p_items);
 return v_id;
end $$;
create or replace function public.respond_offer(p_offer_id uuid,p_accept boolean) returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid; v_offer public.trade_offers; v_listing public.trade_listings;
begin
 v_user=public.require_trader();
 if p_accept is null then raise exception 'Response required'; end if;
 select * into v_offer from public.trade_offers where id=p_offer_id;
 if not found then raise exception 'Offer not found'; end if;
 select * into v_listing from public.trade_listings where id=v_offer.listing_id for update;
 if v_listing.owner_id<>v_user then raise exception 'Only the listing owner can respond' using errcode='42501'; end if;
 if v_listing.status<>'open' or v_listing.expires_at<=now() then raise exception 'Listing is unavailable'; end if;
 select * into v_offer from public.trade_offers where id=p_offer_id for update;
 if v_offer.status<>'pending' then raise exception 'Offer already resolved'; end if;
 if p_accept and exists(select 1 from public.profile_private where id=v_offer.offerer_id and banned_until>now()) then raise exception 'Offerer unavailable'; end if;
 update public.trade_offers set status=case when p_accept then 'accepted' else 'declined' end,responded_at=now() where id=p_offer_id;
 if p_accept then
  update public.trade_listings set status='pending' where id=v_listing.id;
  update public.trade_offers set status='declined',responded_at=now() where listing_id=v_listing.id and status='pending';
 end if;
end $$;
create or replace function public.cancel_listing(p_listing_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid=(select auth.uid()); v_listing public.trade_listings;
begin
 if v_user is null then raise exception 'Sign in first' using errcode='42501'; end if;
 select * into v_listing from public.trade_listings where id=p_listing_id for update;
 if not found or v_listing.owner_id<>v_user then raise exception 'Listing not available' using errcode='42501'; end if;
 if v_listing.status not in ('open','pending') then raise exception 'Listing already resolved'; end if;
 update public.trade_listings set status='cancelled' where id=p_listing_id;
 update public.trade_offers set status='declined',responded_at=now() where listing_id=p_listing_id and status in ('pending','accepted');
end $$;
create or replace function public.complete_listing(p_listing_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare v_user uuid; v_listing public.trade_listings; v_other uuid;
begin
 v_user=public.require_trader();
 select * into v_listing from public.trade_listings where id=p_listing_id for update;
 if not found or v_listing.owner_id<>v_user then raise exception 'Listing not available' using errcode='42501'; end if;
 if v_listing.status<>'pending' then raise exception 'An accepted offer is required'; end if;
 select offerer_id into v_other from public.trade_offers where listing_id=p_listing_id and status='accepted';
 if v_other is null then raise exception 'Accepted offer unavailable'; end if;
 update public.trade_listings set status='completed',completed_at=now() where id=p_listing_id;
 update public.profiles set trades_completed=trades_completed+1 where id in (v_user,v_other);
end $$;
create or replace function public.delete_my_account() returns void language plpgsql security definer set search_path='' as $$
begin
 if (select auth.uid()) is null then raise exception 'Sign in first' using errcode='42501'; end if;
 delete from auth.users where id=(select auth.uid());
end $$;
create or replace function public.ping() returns timestamptz language sql stable security definer set search_path='' as $$ select now() $$;
commit;
