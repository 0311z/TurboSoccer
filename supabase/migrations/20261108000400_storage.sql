begin;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('item-images','item-images',true,5242880,array['image/webp','image/png','image/jpeg','image/avif'])
 on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
alter table storage.objects enable row level security;
drop policy if exists item_images_select_public on storage.objects;
create policy item_images_select_public on storage.objects for select to anon,authenticated using(bucket_id='item-images');
drop policy if exists item_images_insert_staff on storage.objects;
create policy item_images_insert_staff on storage.objects for insert to authenticated with check(bucket_id='item-images' and (select public.is_staff()));
drop policy if exists item_images_update_staff on storage.objects;
create policy item_images_update_staff on storage.objects for update to authenticated using(bucket_id='item-images' and (select public.is_staff())) with check(bucket_id='item-images' and (select public.is_staff()));
drop policy if exists item_images_delete_staff on storage.objects;
create policy item_images_delete_staff on storage.objects for delete to authenticated using(bucket_id='item-images' and (select public.is_staff()));
commit;
