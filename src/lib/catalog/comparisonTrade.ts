import type {Item} from '@/types/domain';
export function comparisonTradePath(items:readonly Item[]) {
 const [receive,give] = items;
 if (items.length !== 2 || !receive || !give || items.some(item => item.isTradable === false)) return null;
 const trade = {have:[{itemId:receive.id,quantity:1}],want:[{itemId:give.id,quantity:1}],coinsHave:0,coinsWant:0};
 return '/calculator/?' + new URLSearchParams({trade:JSON.stringify(trade)}).toString();
}
