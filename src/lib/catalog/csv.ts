import type {Item} from '@/types/domain';
function csvCell(value:string|number|null){let text=value===null?'':String(value);if(/^[=+\-@\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
export function itemsCsv(items:readonly Item[]){
 const header=['Name','Category','Rarity','Value (coins)','Demand (1–5)','Trading status','Obtained from'];
 const rows=items.map(i=>[i.name,i.category,i.rarity,i.value,i.demand,i.isTradable===null?'Unknown':i.isTradable?'Tradable':'Not tradable',i.obtainMethod]);
 return '\uFEFF'+[header,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n');
}
