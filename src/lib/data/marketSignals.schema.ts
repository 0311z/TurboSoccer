import { z } from 'zod';
import type { MarketSignal } from './marketSignals';
const number=z.union([z.number(),z.string().regex(/^\d+$/)]).transform(Number).refine(n=>Number.isSafeInteger(n)&&n>=0);
const trends=z.array(z.object({item_id:z.uuid(),trend:z.enum(['unknown','stable','rising','falling']),change_percent:z.union([z.number(),z.string()]).transform(Number).refine(Number.isFinite).nullable()}));
const stats=z.array(z.object({item_id:z.uuid(),offering_count:number,seeking_count:number}));
export function parseMarketSignals(trendInput:unknown,statsInput:unknown):Record<string,MarketSignal>{
 const result:Record<string,MarketSignal>={};
 for(const row of trends.parse(trendInput??[]))result[row.item_id]={trend:row.trend,changePercent:row.change_percent,offering:null,seeking:null};
 for(const row of stats.parse(statsInput??[]))result[row.item_id]={trend:result[row.item_id]?.trend??'unknown',changePercent:result[row.item_id]?.changePercent??null,offering:row.offering_count,seeking:row.seeking_count};
 return result;
}
