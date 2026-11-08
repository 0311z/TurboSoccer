import type { Item } from '@/types/domain';
const documented: [string, string, string, string, string | null, string][] = [
  ['Rally', 'rally', 'Car bodies', 'car-body', null, 'starter'],
  ['Kombosa', 'kombosa', 'Car bodies', 'car-body', null, 'unknown'],
  ['Rocket', 'rocket', 'Car bodies', 'car-body', null, 'unknown'],
  ['Racing Stripes', 'racing-stripes', 'Decals', 'decal', null, 'unknown'],
  ['Starting Line', 'starting-line', 'Stickers', 'sticker', null, 'unknown'],
  ['Golden Pineapple', 'golden-pineapple', 'Toppers', 'topper', null, 'unknown'],
  ['Flip', 'flip', 'License plates', 'license-plate', null, 'unknown'],
  ['MVP', 'mvp', 'License plates', 'license-plate', null, 'unknown'],
  ['Sigma', 'sigma', 'License plates', 'license-plate', null, 'unknown'],
  ['Siren', 'siren', 'Horns', 'horn', 'Legendary', 'free_legendary_pack'],
  ['Ice Sun', 'ice-sun', 'Wheels', 'wheels', 'Legendary', 'free_legendary_pack'],
  ['Birthday Cake', 'birthday-cake', 'Toppers', 'topper', 'Legendary', 'free_legendary_pack'],
];
export const seedItems: Item[] = documented.map(([name, slug, category, categorySlug, rarity, obtainMethod], index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  name, slug, category, categorySlug, rarity, obtainMethod,
  value: null, demand: null, image: null, isTradable: null,
  description: obtainMethod === 'starter' ? 'The starting car body in Turbo Soccer. Cosmetic only.' : obtainMethod === 'free_legendary_pack' ? 'A cosmetic included in the Free Legendary Pack. Pack odds are not documented.' : 'A documented Turbo Soccer cosmetic. Value, demand and trading availability have not been verified.',
}));
export const categories = ['All items', 'Car bodies', 'Wheels', 'Toppers', 'Decals', 'Stickers', 'Horns', 'License plates'];
