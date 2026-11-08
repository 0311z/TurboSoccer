begin;
insert into public.categories(id,slug,name,sort_order,icon) values
 (1,'car-body','Car Bodies',1,'car'),(2,'paint','Paints',2,'palette'),(3,'decal','Decals',3,'paintbrush'),
 (4,'sticker','Stickers',4,'sticker'),(5,'wheels','Wheels',5,'circle'),(6,'boost-trail','Boost Trails',6,'wind'),
 (7,'topper','Toppers',7,'crown'),(8,'horn','Horns',8,'volume-2'),(9,'license-plate','License Plates',9,'rectangle-horizontal'),
 (10,'ball-skin','Ball Skins',10,'circle-dot'),(11,'demolition-effect','Demolition Effects',11,'sparkles'),
 (12,'goal-explosion','Goal Explosions',12,'flame'),(13,'emote','Emotes',13,'smile') on conflict do nothing;
insert into public.rarities(id,slug,name,sort_order,color) values
 (1,'common','Common',1,'#9ca3af'),(2,'rare','Rare',2,'#3b82f6'),(3,'epic','Epic',3,'#a855f7'),
 (4,'legendary','Legendary',4,'#f59e0b'),(5,'exclusive','Exclusive',5,'#ec4899') on conflict do nothing;
-- Fuente aportada por el usuario. Valores, demanda y tradabilidad no verificados permanecen NULL.
insert into public.items(id,slug,name,category_id,rarity_id,obtain_method,obtain_note,value,source_url) values
 ('00000000-0000-4000-8000-000000000001','rally','Rally',1,null,'starter','Starting car body.',null,'https://turbo-soccer.wiki/'),
 ('00000000-0000-4000-8000-000000000002','kombosa','Kombosa',1,null,'unknown',null,null,'https://turbo-soccer.wiki/'),
 ('00000000-0000-4000-8000-000000000003','rocket','Rocket',1,null,'unknown',null,null,'https://turbo-soccer.wiki/'),
 ('00000000-0000-4000-8000-000000000004','racing-stripes','Racing Stripes',3,null,'unknown',null,null,'https://turbo-soccer.wiki/'),
 ('00000000-0000-4000-8000-000000000005','starting-line','Starting Line',3,null,'unknown','Category is provisional: decal or sticker.',null,'https://turbo-soccer.wiki/'),
 ('00000000-0000-4000-8000-000000000006','golden-pineapple','Golden Pineapple',7,null,'unknown',null,null,'https://turbo-soccer.wiki/'),
 ('00000000-0000-4000-8000-000000000007','flip','Flip',9,null,'unknown',null,null,'https://turbo-soccer.wiki/'),
 ('00000000-0000-4000-8000-000000000008','mvp','MVP',9,null,'unknown',null,null,'https://turbo-soccer.wiki/'),
 ('00000000-0000-4000-8000-000000000009','sigma','Sigma',9,null,'unknown',null,null,'https://turbo-soccer.wiki/'),
 ('00000000-0000-4000-8000-000000000010','siren','Siren',8,4,'free_legendary_pack','Free Legendary Pack gift.',null,'https://turbo-soccer.wiki/'),
 ('00000000-0000-4000-8000-000000000011','ice-sun','Ice Sun',5,4,'free_legendary_pack','Free Legendary Pack gift.',null,'https://turbo-soccer.wiki/'),
 ('00000000-0000-4000-8000-000000000012','birthday-cake','Birthday Cake',7,4,'free_legendary_pack','Free Legendary Pack gift.',null,'https://turbo-soccer.wiki/') on conflict do nothing;
commit;
