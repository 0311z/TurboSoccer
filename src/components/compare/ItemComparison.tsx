'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {GitCompareArrows,Share2,Plus,Info,RotateCcw} from 'lucide-react';
import type {Item} from '@/types/domain';
import {useItems} from '@/lib/queries/useItems';
import {MAX_COMPARE_ITEMS,parseComparison,comparisonPath} from '@/lib/catalog/compare';
import {trace} from '@/lib/logger';
import {ComparisonTable} from './ComparisonTable';
import './compare.css';
export function ItemComparison({initialItems}:{initialItems:Item[]}) {
 const {data:items=initialItems,isError,refetch}=useItems(initialItems);
 const [slugs,setSlugs]=useState<string[]>([]),[notice,setNotice]=useState(''),[shareUrl,setShareUrl]=useState('');
 const [search,setSearch]=useState(''),[ready,setReady]=useState(false);
 useEffect(()=>{
  const restore=()=>{const result=parseComparison(window.location.search,items);setSlugs(result.slugs);setShareUrl('');setNotice(result.rejected?'Some items in this link are unavailable, repeated, or exceed the four item limit. Showing the supported items.':'');setReady(true);};
  restore();window.addEventListener('popstate',restore);return()=>window.removeEventListener('popstate',restore);
 },[items]);
 const selected=slugs.flatMap(slug=>{const item=items.find(item=>item.slug===slug);return item?[item]:[];});
 const available=items.filter(item=>!slugs.includes(item.slug)&&`${item.name} ${item.category}`.toLowerCase().includes(search.trim().toLowerCase()));
 function update(next:string[]) {
  const t=trace('compare.update');try{t.step(1,1,'actualizar comparación compartible');window.history.pushState(null,'',comparisonPath(next));setSlugs(next);setShareUrl('');setNotice('');t.ok();}catch(error){t.fail(error);setNotice('The comparison could not be updated. Please try again.');}
 }
 async function share() {
  const t=trace('compare.share');try{t.step(1,2,'crear enlace de comparación');const url=new URL(comparisonPath(slugs),window.location.origin).toString();setShareUrl(url);t.step(2,2,'copiar enlace');await navigator.clipboard.writeText(url);setNotice('Comparison link copied. It contains the selected items, not a frozen price snapshot.');t.ok();}catch(error){t.fail(error);setNotice('Clipboard unavailable. Copy the link below.');}
 }
 return <section className="compare-workspace" aria-label="Item comparison"><div className="compare-toolbar"><span><GitCompareArrows size={19}/> <strong>{slugs.length} / {MAX_COMPARE_ITEMS}</strong> items selected</span><div><button className="btn btn-secondary" disabled={!ready||!slugs.length} onClick={()=>update([])}><RotateCcw size={16}/> Clear</button><button className="btn btn-primary" disabled={!ready||!slugs.length} onClick={()=>void share()}><Share2 size={16}/> Share comparison</button></div></div>
 {isError&&<p className="data-notice" role="status">The latest catalog refresh failed. Showing the cached catalog. <button className="text-link" onClick={()=>void refetch()}>Retry</button></p>}
 {notice&&<p className="data-notice" role="status">{notice}</p>}{shareUrl&&<label className="compare-share">Shareable comparison<input readOnly value={shareUrl} onFocus={event=>event.target.select()}/></label>}
 {!ready?<p role="status">Loading your comparison…</p>:<><div className="compare-picker"><label>Find an item<input type="search" value={search} maxLength={100} onChange={event=>setSearch(event.target.value)} placeholder="Search names or categories" disabled={slugs.length>=MAX_COMPARE_ITEMS}/></label><label><span><Plus size={14}/> Add to comparison</span><select value="" disabled={slugs.length>=MAX_COMPARE_ITEMS||!available.length} onChange={event=>{if(event.target.value){update([...slugs,event.target.value]);setSearch('');}}}><option value="">{slugs.length>=MAX_COMPARE_ITEMS?'Four items selected':available.length?'Choose an item…':'No matching items'}</option>{available.map(item=><option value={item.slug} key={item.id}>{item.name} · {item.category}</option>)}</select></label></div>
 <p className="compare-count" role="status">{selected.length===MAX_COMPARE_ITEMS?'Comparison full. Remove an item to add another.':`${selected.length} selected. Add up to ${MAX_COMPARE_ITEMS-selected.length} more.`}</p>
 {selected.length?<ComparisonTable items={selected} remove={slug=>update(slugs.filter(entry=>entry!==slug))}/>:<div className="compare-empty"><GitCompareArrows size={36}/><h2>Your next upgrade, side by side.</h2><p>Choose up to four items to compare their value, demand, rarity and origin. No account needed.</p><Link href="/values/" className="text-link">Browse the item directory <Plus size={15}/></Link></div>}</>}
 <p className="compare-note"><Info size={16}/> Values are community estimates in coins. Unknown is never zero. Sharing a comparison uses the latest available catalog when opened; it does not lock prices or confirm that an item can be traded.</p></section>;
}
