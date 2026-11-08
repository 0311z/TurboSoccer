import { publicEnv as env } from '@/config/publicEnv';
import type { Item } from '@/types/domain';
export type ItemImageSize = 128 | 256 | 512;
function isSafePath(path: string): boolean {
  return path.length > 0 && path.length <= 512 && path.split('/').every(segment => /^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/.test(segment));
}
export function itemImageUrl(item: Pick<Item, 'image'>, size: ItemImageSize = 256): string | null {
  if (!item.image) return null;
  if (item.image.startsWith('storage:')) {
    const path = item.image.slice('storage:'.length);
    if (!isSafePath(path) || !env.supabaseUrl) return null;
    try {
      const origin = new URL(env.supabaseUrl);
      if (origin.protocol !== 'https:') return null;
      const encoded = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
      return `${origin.origin}/storage/v1/object/public/item-images/${encoded}`;
    } catch { return null; }
  }
  if (!isSafePath(item.image) || item.image.includes('.')) return null;
  return `/${item.image}-${size}.webp`;
}
