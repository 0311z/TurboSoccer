import { getBrowserClient } from '@/lib/supabase/browser';
import { trace } from '@/lib/logger';
export interface ItemSignals {
  trend: 'unknown' | 'stable' | 'rising' | 'falling';
  changePercent: number | null;
  offering: number | null;
  seeking: number | null;
  history: { value: number | null; demand: number | null; created_at: string; reason: string | null }[];
}
export async function fetchItemSignals(itemId: string): Promise<ItemSignals> {
  const t = trace('items.signals', { itemId });
  try {
    const client = await getBrowserClient();
    if (!client) return { trend: 'unknown', changePercent: null, offering: null, seeking: null, history: [] };
    t.step(1, 2, 'consultar tendencia, mercado e historial');
    const results = await Promise.all([
      client.from('item_trends').select('trend,change_percent').eq('item_id', itemId).maybeSingle(),
      client.from('item_market_stats').select('offering_count,seeking_count').eq('item_id', itemId).maybeSingle(),
      client.from('item_value_history').select('value,demand,created_at,reason').eq('item_id', itemId).order('created_at', { ascending: false }).limit(60),
    ]);
    for (const result of results) if (result.error) throw result.error;
    t.step(2, 2, 'validar señales públicas');
    const {trendSchema,statsSchema,historySchema}=await import('@/lib/data/itemSignals.schema');
    const trend = results[0]?.data ? trendSchema.parse(results[0].data) : null;
    const stats = results[1]?.data ? statsSchema.parse(results[1].data) : null;
    const history = historySchema.parse(results[2]?.data || []).reverse();
    t.ok();
    return { trend: trend?.trend || 'unknown', changePercent: trend?.change_percent ?? null, offering: stats?.offering_count ?? 0, seeking: stats?.seeking_count ?? 0, history };
  } catch (error) { throw t.fail(error); }
}
