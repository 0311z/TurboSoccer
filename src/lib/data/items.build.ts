import { getBuildClient } from '@/lib/supabase/build';
import { seedItems } from '@/lib/data/seed';
import { mapItems } from '@/lib/data/items.schema';
import { trace } from '@/lib/logger';
export async function getBuildItems() {
  const t = trace('items.build');
  try {
    const client = getBuildClient();
    if (!client) { t.ok('Catálogo versionado: Supabase no configurado.'); return seedItems; }
    t.step(1, 1, 'consultar snapshot para exportación');
    const { data, error } = await client.from('items').select('*, categories(name,slug), rarities(name)').order('name').abortSignal(AbortSignal.timeout(8000));
    if (error) throw error;
    const result = mapItems(data);
    t.ok({ count: result.length });
    return result.length ? result : seedItems;
  } catch (error) { t.fail(error, { fallback: 'seed versionado' }); return seedItems; }
}
