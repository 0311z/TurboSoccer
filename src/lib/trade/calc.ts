import type { Item } from '@/types/domain';
import { MAX_COINS, MAX_ITEMS_PER_SIDE, FAIR_THRESHOLD } from '@/config/limits';
export { MAX_COINS, MAX_ITEMS_PER_SIDE, FAIR_THRESHOLD };

export type TradeLine = { itemId: string; quantity: number };
export type TradeDraft = { have: TradeLine[]; want: TradeLine[]; coinsHave: number; coinsWant: number };
export type TradeResult = { sumHave: number; sumWant: number; diff: number; verdict: 'win' | 'fair' | 'loss' | 'unknown'; unknown: string[] };
export const EMPTY_TRADE: TradeDraft = { have: [], want: [], coinsHave: 0, coinsWant: 0 };

export function calculateTrade(draft: TradeDraft, items: Item[]): TradeResult {
  const unknown: string[] = [];
  if (![draft.coinsHave, draft.coinsWant].every((coins) => Number.isSafeInteger(coins) && coins >= 0 && coins <= MAX_COINS)) throw new Error('Invalid coin amount.');
  if ([draft.have, draft.want].some((side) => side.length > MAX_ITEMS_PER_SIDE || new Set(side.map((line) => line.itemId)).size !== side.length || side.some((line) => !Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 99))) throw new Error('Invalid item quantities.');
  const sum = (lines: TradeLine[], coins: number) => lines.reduce((total, line) => {
    const item = items.find((entry) => entry.id === line.itemId);
    if (!item || item.value === null) { unknown.push(item?.name ?? 'Unknown item'); return total; }
    if (!Number.isSafeInteger(item.value) || item.value < 0) throw new Error('Invalid catalog value.');
    const next = total + item.value * line.quantity;
    if (!Number.isSafeInteger(next)) throw new Error('Trade total exceeds the safe integer range.');
    return next;
  }, coins);
  const sumHave = sum(draft.have, draft.coinsHave);
  const sumWant = sum(draft.want, draft.coinsWant);
  const diff = (sumHave - sumWant) / Math.max(sumHave, sumWant, 1);
  return { sumHave, sumWant, diff, unknown: Array.from(new Set(unknown)), verdict: unknown.length ? 'unknown' : Math.abs(diff) <= FAIR_THRESHOLD ? 'fair' : diff > 0 ? 'win' : 'loss' };
}
