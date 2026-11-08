import { getBrowserClient } from '@/lib/supabase/browser';
import { trace } from '@/lib/logger';
export interface MarketSignal { trend:'unknown'|'stable'|'rising'|'falling';changePercent:number|null;offering:number|null;seeking:number|null; }
export async function fetchMarketSignals():Promise<Record<string,MarketSignal>> {
 const t=trace('items.marketSignals');
 try {
  const client=await getBrowserClient();if(!client)return {};
  t.step(1,2,'consultar señales públicas del catálogo');
  const results=await Promise.all([client.from('item_trends').select('item_id,trend,change_percent').abortSignal(AbortSignal.timeout(12_000)),client.from('item_market_stats').select('item_id,offering_count,seeking_count').abortSignal(AbortSignal.timeout(12_000))]);
  for(const result of results)if(result.error)throw result.error;
  t.step(2,2,'validar señales por identificador');
  const {parseMarketSignals}=await import('@/lib/data/marketSignals.schema');
  const signals=parseMarketSignals(results[0]?.data,results[1]?.data);t.ok();return signals;
 }catch(error){throw t.fail(error);}
}
