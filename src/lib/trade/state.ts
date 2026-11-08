import { MAX_COINS, MAX_ITEMS_PER_SIDE, type TradeDraft, type TradeLine } from './calc';
export const DRAFT_VERSION = 1;
export const MAX_TRADE_LINK_LENGTH = 8000;
function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function exactKeys(value: Record<string, unknown>, keys: string[]) { return Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key)); }
function side(value: unknown): value is TradeLine[] {
  return Array.isArray(value) && value.length <= MAX_ITEMS_PER_SIDE && value.every(entry => object(entry) && exactKeys(entry, ['itemId', 'quantity']) && typeof entry.itemId === 'string' && entry.itemId.length > 0 && entry.itemId.length <= 100 && typeof entry.quantity === 'number' && Number.isSafeInteger(entry.quantity) && entry.quantity >= 1 && entry.quantity <= 99) && new Set(value.map(entry => entry.itemId)).size === value.length;
}
export function parseTrade(value: unknown, itemIds?: string[]): TradeDraft | null {
  if (!object(value) || !exactKeys(value, ['have','want','coinsHave','coinsWant']) || !side(value.have) || !side(value.want)) return null;
  if (![value.coinsHave,value.coinsWant].every(coins => typeof coins === 'number' && Number.isSafeInteger(coins) && coins >= 0 && coins <= MAX_COINS)) return null;
  if (itemIds && [...value.have,...value.want].some(line => !itemIds.includes(line.itemId))) return null;
  return { have: value.have, want: value.want, coinsHave: Number(value.coinsHave), coinsWant: Number(value.coinsWant) };
}
export function parseStoredTrade(value: unknown): TradeDraft | null {
  const direct=parseTrade(value); if(direct)return direct;
  if(!object(value) || ![0,DRAFT_VERSION].includes(Number(value.version)) || typeof value.version !== 'number' || !object(value.state))return null;
  return parseTrade(value.state.draft);
}
export function parseTradeText(text: string, itemIds?: string[]): TradeDraft | null {
  if(text.length>MAX_TRADE_LINK_LENGTH)return null;
  try { return parseTrade(JSON.parse(text),itemIds); } catch { return null; }
}
export function integerInput(text: string,min: number,max: number): number | null {
  if(!/^\d+$/.test(text))return null;
  const value=Number(text);return Number.isSafeInteger(value)&&value>=min&&value<=max?value:null;
}
