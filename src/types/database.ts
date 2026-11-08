// SYNC WITH SQL
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export interface CategoryRow { id: number; slug: string; name: string; sort_order: number; icon: string; }
export interface RarityRow { id: number; slug: string; name: string; sort_order: number; color: string; }
export interface ProfileRow {
  id: string; username: string; roblox_username: string | null; roblox_user_id: number | null;
  roblox_verified: boolean; bio: string; role: 'user' | 'moderator' | 'admin' | 'owner';
  reputation: number; trades_completed: number; created_at: string; updated_at: string;
}
export interface ProfilePrivateRow { id: string; age_confirmed_at: string | null; banned_until: string | null; ban_reason: string | null; }
export interface ItemRow {
  id: string; slug: string; name: string; category_id: number; rarity_id: number | null; description: string;
  obtain_method: 'starter' | 'pack' | 'free_legendary_pack' | 'daily_login' | 'level_reward' | 'promo_code' | 'event' | 'shop' | 'beta' | 'unknown';
  obtain_note: string | null; image_path: string | null; value: number | null; demand: number | null;
  status: 'active' | 'retired' | 'upcoming'; is_tradable: boolean | null; released_at: string | null;
  source_url: string | null; created_at: string; updated_at: string;
}
export interface ItemValueHistoryRow { id: number; item_id: string; value: number | null; demand: number | null; reason: string | null; changed_by: string | null; created_at: string; }
export interface TradeListingRow {
  id: string; owner_id: string; status: 'open' | 'pending' | 'completed' | 'cancelled' | 'expired';
  coins_have: number; coins_want: number; note: string; accepts_offers: boolean;
  expires_at: string; created_at: string; updated_at: string; completed_at: string | null;
}
export interface TradeListingItemRow { listing_id: string; item_id: string; side: 'have' | 'want'; quantity: number; }
export interface TradeOfferRow { id: string; listing_id: string; offerer_id: string; status: 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'expired'; message: string; coins_offered: number; created_at: string; responded_at: string | null; }
export interface TradeOfferItemRow { offer_id: string; item_id: string; quantity: number; }
export interface AuditLogRow { id: number; actor_id: string | null; action: string; entity: string; entity_id: string | null; diff: Json; created_at: string; }
