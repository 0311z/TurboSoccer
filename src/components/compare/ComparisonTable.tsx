import Link from 'next/link';
import {X,ArrowUpRight} from 'lucide-react';
import type {Item} from '@/types/domain';
import {ItemImage} from '@/components/items/ItemImage';
import {RarityBadge} from '@/components/items/RarityBadge';
import {comparisonTradePath} from '@/lib/catalog/comparisonTrade';
const origins:Record<string,string>={starter:'Starter garage',pack:'Cosmetic pack',free_legendary_pack:'Free Legendary Pack',daily_login:'Daily login reward',level_reward:'Level reward',promo_code:'Promotional code',event:'Event reward',shop:'In-game shop',beta:'Beta reward'};
export function ComparisonTable({items,remove}:{items:Item[];remove:(slug:string)=>void}) {
 const tradePath=comparisonTradePath(items);
 const rows=[
  {name:'Category',render:(item:Item)=><Link href={`/values/${item.categorySlug}/`}>{item.category}</Link>},
  {name:'Rarity',render:(item:Item)=><RarityBadge rarity={item.rarity}/>},
  {name:'Estimated value',render:(item:Item)=>item.value===null?<span className="compare-unknown">Not valued yet</span>:<strong>{item.value.toLocaleString('en-US')} coins</strong>},
  {name:'Demand',render:(item:Item)=>item.demand===null?<span className="compare-unknown">Unknown</span>:`${item.demand} / 5`},
  {name:'Trading availability',render:(item:Item)=>item.isTradable===null?<span className="compare-unknown">Not verified</span>:item.isTradable?'Tradable':'Not tradable'},
  {name:'How to obtain',render:(item:Item)=>origins[item.obtainMethod]??'Not documented'},
  {name:'Description',render:(item:Item)=>item.description},
 ];
 return <><div className="comparison-scroll" role="region" aria-label="Item comparison table. Scroll horizontally to see all items." tabIndex={0}><table className="comparison-table"><caption className="sr-only">Compare Turbo Soccer items. Missing values remain unknown.</caption><thead><tr><th scope="col">ITEM DETAILS</th>{items.map(item=><th scope="col" key={item.id}><button className="compare-remove" onClick={()=>remove(item.slug)} aria-label={`Remove ${item.name} from comparison`}><X size={17}/></button><ItemImage item={item} size={128}/><Link href={`/items/${item.slug}/`}>{item.name} <ArrowUpRight size={14}/></Link></th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.name}><th scope="row">{row.name}</th>{items.map(item=><td key={item.id}>{row.render(item)}</td>)}</tr>)}</tbody></table></div>{tradePath&&<div className="compare-trade"><div><strong>Ready to check this trade?</strong><p>You receive {items[0]?.name} and give {items[1]?.name}. Adjust quantities in the calculator.</p></div><Link href={tradePath} className="btn btn-primary">Open in calculator <ArrowUpRight size={16}/></Link></div>}</>;
}
