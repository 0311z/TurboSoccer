import type {Item} from '@/types/domain';
import {catalogCategories,rarityNames} from './categories';
export const catalogSorts=['featured','name-asc','name-desc','value-desc','value-asc','demand-desc','rarity-desc'] as const;
export type CatalogSort=typeof catalogSorts[number];
export interface CatalogFilters{q:string;category:string;rarity:string;known:'all'|'known'|'unknown';saved:boolean;view:'table'|'grid';sort:CatalogSort;page:number}
export const defaultFilters:CatalogFilters={q:'',category:'all',rarity:'all',known:'all',saved:false,view:'table',sort:'featured',page:1};
export const PAGE_SIZE=12;
export function parseFilters(query:string,category='all'):CatalogFilters{
 const p=new URLSearchParams(query);const c=p.get('category')??category,r=p.get('rarity')??'all',k=p.get('known'),sort=p.get('sort');
 const parsedPage=Number(p.get('page')??1);
 return {q:(p.get('q')??'').slice(0,100),category:catalogCategories.some(x=>x.slug===c)?c:'all',rarity:r==='unknown'||rarityNames.some(x=>x.toLowerCase()===r)?r:'all',known:k==='known'||k==='unknown'?k:'all',saved:p.get('saved')==='1',view:p.get('view')==='grid'?'grid':'table',sort:catalogSorts.some(x=>x===sort)?sort as CatalogSort:'featured',page:Number.isSafeInteger(parsedPage)&&parsedPage>=1&&parsedPage<=10000?parsedPage:1};
}
export function filtersQuery(filters:CatalogFilters,initialCategory='all'){
 const p=new URLSearchParams();if(filters.q)p.set('q',filters.q);if(filters.category!==initialCategory)p.set('category',filters.category);if(filters.rarity!=='all')p.set('rarity',filters.rarity);if(filters.known!=='all')p.set('known',filters.known);if(filters.saved)p.set('saved','1');if(filters.view!=='table')p.set('view',filters.view);if(filters.sort!=='featured')p.set('sort',filters.sort);if(filters.page>1)p.set('page',String(filters.page));return p.toString();
}
const featured=['ice-sun','rally','siren','birthday-cake','golden-pineapple','rocket'];
const rank=(slug:string)=>{const n=featured.indexOf(slug);return n<0?100:n;};
function nullableCompare(a:number|null,b:number|null,direction:number){return a===null?b===null?0:1:b===null?-1:(a-b)*direction;}
export function filterItems(items:Item[],filters:CatalogFilters,bookmarks:readonly string[]){
 const q=filters.q.trim().toLocaleLowerCase('en-US');
 return items.filter(item=>(filters.category==='all'||item.categorySlug===filters.category)&&(filters.rarity==='all'||(filters.rarity==='unknown'?item.rarity===null:item.rarity?.toLowerCase()===filters.rarity))&&(filters.known==='all'||(filters.known==='known'?item.value!==null:item.value===null))&&(!filters.saved||bookmarks.includes(item.id))&&(!q||`${item.name} ${item.category}`.toLocaleLowerCase('en-US').includes(q))).sort((a,b)=>{
  let order=0;
  if(filters.sort==='name-asc'||filters.sort==='name-desc')order=a.name.localeCompare(b.name,'en-US')*(filters.sort==='name-asc'?1:-1);
  else if(filters.sort==='value-desc'||filters.sort==='value-asc')order=nullableCompare(a.value,b.value,filters.sort==='value-asc'?1:-1);
  else if(filters.sort==='demand-desc')order=nullableCompare(a.demand,b.demand,-1);
  else if(filters.sort==='rarity-desc')order=nullableCompare(a.rarity===null?null:rarityNames.findIndex(r=>r===a.rarity),b.rarity===null?null:rarityNames.findIndex(r=>r===b.rarity),-1);
  else order=rank(a.slug)-rank(b.slug);
  return order||a.name.localeCompare(b.name,'en-US');
 });
}
export function activeFilterCount(f:CatalogFilters){return Number(Boolean(f.q))+Number(f.category!=='all')+Number(f.rarity!=='all')+Number(f.known!=='all')+Number(f.saved);}
