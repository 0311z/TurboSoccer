'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Search, X, ArrowUpRight, Package, ArrowRight, SearchX } from 'lucide-react';
import { useItems } from '@/lib/queries/useItems';
export function SearchDialog({onClose}:{onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);const input=useRef<HTMLInputElement>(null);const [query,setQuery]=useState('');const {data:items=[]}=useItems();
 useEffect(()=>{dialog.current?.showModal();input.current?.focus();},[]);
 const results=items.filter(i=>`${i.name} ${i.category}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0,8);
 return <dialog ref={dialog} className="search-dialog" aria-labelledby="search-dialog-title" onClose={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><h2 id="search-dialog-title" className="sr-only">Search the item catalog</h2><div className="global-search-input"><Search size={21}/><input ref={input} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search an item or category..." aria-label="Search items"/><button className="icon-button" onClick={onClose} aria-label="Close search"><X size={18}/></button></div><div className="search-results"><p className="eyebrow">{query?'MATCHING ITEMS':'EXPLORE THE GARAGE'}</p>{results.length?results.map(item=><Link key={item.id} href={`/items/${item.slug}/`} onClick={onClose}><span className={`search-item-icon search-${item.categorySlug}`}><Package size={21}/></span><span><strong>{item.name}</strong><small>{item.category}</small></span><ArrowUpRight size={16}/></Link>):<div className="search-no-results"><SearchX size={28}/><p>No matching items. Try a different name.</p></div>}</div><div className="search-dialog-footer"><span><kbd>tab</kbd> navigate <kbd>esc</kbd> close</span><Link href={`/values/?q=${encodeURIComponent(query)}`} onClick={onClose}>Browse all items <ArrowRight size={14}/></Link></div></dialog>;
}
