import { getBrowserClient } from '@/lib/supabase/browser';
import { trace } from '@/lib/logger';
import { seedItems } from '@/lib/data/seed';
import type { Item } from '@/types/domain';
export async function fetchItems(): Promise<Item[]> {
  const t = trace('items.fetchAll');
  try {
    const client = await getBrowserClient();
    if (!client) return seedItems;
    t.step(1, 2, 'consultar catálogo público');
    const { data, error } = await client.from('items').select('*, categories(name,slug), rarities(name)').order('name').abortSignal(AbortSignal.timeout(12_000));
    if (error) throw error;
    t.step(2, 2, 'validar valores seguros');
    const { mapItems } = await import('@/lib/data/items.schema');
    const result = mapItems(data);
    t.ok({ count: result.length });
    return result;
  } catch (error) { throw t.fail(error); }
}
