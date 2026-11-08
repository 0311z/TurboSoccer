-- Ejecutar SOLO en un proyecto nuevo después de las seis migraciones, incluida 006_trade_access_hardening.
-- Las transacciones con DO capturan fallos esperados sin dejar la sesión abortada.
-- 1: todas las tablas de aplicación deben devolver relrowsecurity=true (11 filas).
select relname,relrowsecurity from pg_class where oid in ('public.categories'::regclass,'public.rarities'::regclass,'public.profiles'::regclass,'public.profile_private'::regclass,'public.items'::regclass,'public.item_value_history'::regclass,'public.trade_listings'::regclass,'public.trade_listing_items'::regclass,'public.trade_offers'::regclass,'public.trade_offer_items'::regclass,'public.audit_log'::regclass);
-- 2: sin escrituras directas; solo las tres columnas de perfil deben tener UPDATE.
select grantee,table_name,privilege_type from information_schema.role_table_grants where grantee in ('anon','authenticated') and table_schema='public' and privilege_type<>'SELECT';
-- 3: exactamente username, roblox_username y bio con UPDATE para authenticated.
select column_name from information_schema.column_privileges where grantee='authenticated' and table_schema='public' and table_name='profiles' and privilege_type='UPDATE';
-- 4: anon ve 12 ítems; todos tienen value NULL en una BD nueva.
begin; set local role anon; select count(*),count(value) from public.items; rollback;
-- 5: anon ve vistas; trends unknown; mercado sin anuncios = 0/0.
begin; set local role anon; select * from public.item_trends limit 3; select * from public.item_market_stats limit 3; rollback;
-- 6: anon no tiene acceso a datos privados ni RPC de negocio.
select has_table_privilege('anon','public.profile_private','SELECT') as must_be_false,has_function_privilege('anon','public.create_listing(jsonb,jsonb,bigint,bigint,text)','EXECUTE') as must_be_false,has_function_privilege('anon','public.withdraw_offer(uuid)','EXECUTE') as must_be_false;
-- 7: autenticado sin JWT no ve perfiles privados ni ofertas.
begin; set local role authenticated; select count(*) from public.profile_private; select count(*) from public.trade_offers; rollback;
-- 8: staff helpers sin sesión deben ser false; ping devuelve una fecha.
begin; set local role anon; select public.is_staff(),public.has_listing_offer('00000000-0000-4000-8000-000000000001'),public.ping(); rollback;
-- 9: autenticado sin sesión no puede crear anuncio. Debe mostrar NOTICE de rechazo.
begin; set local role authenticated;
do $$ begin perform public.create_listing('[]','[]',1,0,''); raise exception 'FAIL: se permitió sin sesión'; exception when insufficient_privilege then raise notice 'PASS: sesión exigida'; end $$;
rollback;
-- 10: anon no puede cambiar valores, ni authenticated puede cambiar roles.
select has_function_privilege('anon','public.set_item_value(uuid,bigint,smallint,text)','EXECUTE') as must_be_false,has_column_privilege('authenticated','public.profiles','role','UPDATE') as must_be_false;
-- 11: helpers internos no son invocables por API.
select has_function_privilege('authenticated','public.require_trader()','EXECUTE') as must_be_false,has_function_privilege('authenticated','public.validate_trade_items(jsonb)','EXECUTE') as must_be_false;
-- 12: todas las funciones SECURITY DEFINER tienen search_path vacío.
select p.proname,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prosecdef;
-- PRUEBAS DE INTEGRACIÓN PENDIENTES: con dos usuarios OAuth reales, comprobar onboarding,
-- creación atómica, RLS cruzada, duplicados, límite/cooldown concurrentes, aceptar/completar
-- una sola vez, veto a pagos y URLs, y borrado de cuenta.
-- Comprobar que el ofertante sigue viendo su anuncio cuando pasa a pending/completed,
-- que otro usuario no ve ese anuncio cerrado, y que solo el ofertante retira su oferta.
-- Ejecutar create_offer y complete_listing concurrentes: la operación debe terminar o
-- rechazar estado ya resuelto, sin inversión de bloqueos perfil→anuncio.
-- Tras una verificación manual, cambiar roblox_username debe limpiar roblox_verified
-- y roblox_user_id; un UPDATE directo de esos campos sigue denegado.
-- Los contadores son declaraciones del propietario, no pruebas de entrega en Roblox.
-- No simular JWT en producción.
