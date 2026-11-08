import type {Item} from '@/types/domain';
export const MAX_COMPARE_ITEMS = 4;
export function parseComparison(query:string, items:readonly Item[]) {
 const raw = new URLSearchParams(query).get('items');
 if (!raw) return {slugs:[] as string[], rejected:false};
 if (raw.length > 500) return {slugs:[] as string[], rejected:true};
 const requested = raw.split(',');
 const unique = [...new Set(requested)];
 const valid = unique.filter(slug => items.some(item => item.slug === slug));
 return {slugs:valid.slice(0,MAX_COMPARE_ITEMS), rejected:valid.length !== requested.length || valid.length > MAX_COMPARE_ITEMS};
}
export function comparisonPath(slugs:readonly string[]) {
 const params = new URLSearchParams();
 if (slugs.length) params.set('items',[...new Set(slugs)].slice(0,MAX_COMPARE_ITEMS).join(','));
 return '/compare/' + (params.size ? '?' + params.toString() : '');
}
export function catalogCoverage(items:readonly Item[]) {
 return {total:items.length, valued:items.filter(item=>item.value!==null).length,
  demand:items.filter(item=>item.demand!==null).length, tradability:items.filter(item=>item.isTradable!==null).length};
}
