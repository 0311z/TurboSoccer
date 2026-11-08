export interface Item {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  rarity: string | null;
  value: number | null;
  demand: number | null;
  image: string | null;
  obtainMethod: string;
  description: string;
  isTradable: boolean | null;
}
export interface Profile {
  id: string;
  username: string;
  roblox_username: string | null;
  bio: string | null;
  role: 'user' | 'moderator' | 'admin' | 'owner';
  reputation: number;
  trades_completed: number;
}
