import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import type {Item} from '@/types/domain';
import {ItemImage} from './ItemImage';
import {RarityBadge} from './RarityBadge';
export function RelatedItems({item,items}:{item:Item;items:Item[]}){
 const same=items.filter(candidate=>candidate.id!==item.id&&candidate.categorySlug===item.categorySlug);
 const related=(same.length?same:items.filter(candidate=>candidate.id!==item.id)).slice(0,3);
 if(!related.length)return null;
 return <section className="related-items"><div className="section-heading"><div><span className="eyebrow">KEEP EXPLORING</span><h2>{same.length?`More ${item.category.toLowerCase()}. More possibilities.`:'A little more garage inspiration.'}</h2></div><Link href={same.length?`/values/${item.categorySlug}/`:'/values/'} className="text-link">Browse items <ArrowUpRight size={15}/></Link></div><div className="related-grid">{related.map(candidate=><Link className="related-card" href={`/items/${candidate.slug}/`} key={candidate.id}><ItemImage item={candidate} size={128}/><div><RarityBadge rarity={candidate.rarity}/><h3>{candidate.name}</h3><p>{candidate.category}</p></div><span title={candidate.value===null?'No value set yet':`${candidate.value} coins`}>{candidate.value===null?'—':new Intl.NumberFormat('en-US',{notation:'compact'}).format(candidate.value)}</span><ArrowUpRight size={16}/></Link>)}</div></section>;
}
