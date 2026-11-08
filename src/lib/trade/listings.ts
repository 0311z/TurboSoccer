import { z } from 'zod';
import { getBrowserClient } from '@/lib/supabase/browser';
import { MAX_COINS } from '@/config/limits';
import { trace } from '@/lib/logger';
export const safeCoins = z.union([z.number(),z.string().regex(/^\d+$/)]).transform(Number).refine(value=>Number.isSafeInteger(value)&&value>=0&&value<=MAX_COINS);
export const listingSchema=z.object({
 id:z.uuid(),owner_id:z.uuid(),status:z.enum(['open','pending','completed','cancelled','expired']),coins_have:safeCoins,coins_want:safeCoins,
 note:z.string().max(280).nullable(),accepts_offers:z.boolean(),created_at:z.string(),expires_at:z.string(),
 profiles:z.object({username:z.string(),trades_completed:z.number().int().nonnegative()}).nullable(),
 trade_listing_items:z.array(z.object({item_id:z.uuid(),side:z.enum(['have','want']),quantity:z.number().int().min(1).max(99)})).max(16),
});
export type Listing=z.infer<typeof listingSchema>;
export const LISTING_FIELDS='id,owner_id,status,coins_have,coins_want,note,accepts_offers,created_at,expires_at,profiles!owner_id(username,trades_completed),trade_listing_items(item_id,side,quantity)';
export async function fetchListings():Promise<Listing[]>{const t=trace('listings.fetch');try{t.step(1,2,'consultar anuncios abiertos');const client=await getBrowserClient();if(!client)return [];const {data,error}=await client.from('trade_listings').select(LISTING_FIELDS).eq('status','open').gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(60);if(error)throw error;t.step(2,2,'validar anuncios y cantidades');const parsed=z.array(listingSchema).parse(data);t.ok({count:parsed.length});return parsed;}catch(error){throw t.fail(error);}}
