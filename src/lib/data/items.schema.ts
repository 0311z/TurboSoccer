import { z } from 'zod';
import type { Item } from '@/types/domain';
const safeValue = z.union([z.number(), z.string().regex(/^\d+$/)]).transform(Number).refine(value => Number.isSafeInteger(value) && value >= 0).nullable();
const row = z.object({
  id: z.uuid(), slug: z.string(), name: z.string(), value: safeValue,
  demand: z.number().int().min(1).max(5).nullable(), image_path: z.string().nullable(),
  description: z.string().nullable(), obtain_method: z.string(), is_tradable: z.boolean().nullable(),
  categories: z.object({ name: z.string(), slug: z.string() }),
  rarities: z.object({ name: z.string() }).nullable(),
});
export function mapItems(input: unknown): Item[] {
  return z.array(row).parse(input).map(item => ({
    id: item.id, slug: item.slug, name: item.name, value: item.value, demand: item.demand,
    image: item.image_path, description: item.description || 'A cosmetic item in Turbo Soccer.',
    obtainMethod: item.obtain_method, isTradable: item.is_tradable,
    category: item.categories.name, categorySlug: item.categories.slug, rarity: item.rarities?.name || null,
  }));
}
