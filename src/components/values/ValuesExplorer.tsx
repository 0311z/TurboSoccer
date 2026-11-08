'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {ArrowRight,ArrowLeft,Database,SearchX,Info,RefreshCw,Check} from 'lucide-react';
import {useItems} from '@/lib/queries/useItems';
import {useMarketSignals} from '@/lib/queries/useMarketSignals';
import {filterItems,PAGE_SIZE,activeFilterCount} from '@/lib/catalog/filters';
import {trace} from '@/lib/logger';
import type {Item} from '@/types/domain';
import {CatalogCoverage} from './CatalogCoverage';
import {ValuesFilters} from './ValuesFilters';
import {ValuesTable} from './ValuesTable';
import {useCatalogState} from './useCatalogState';
import './catalog.css';
export function ValuesExplorer({home=false,initialData,initialCategory='all',title}:{home?:boolean;initialData?:Item[];initialCategory?:string;title?:string}){
 const {data:items=[],isPending,isError,refetch}=useItems(initialData);
 const {data:signals}=useMarketSignals();
 const {filters,update,clear,bookmarks,bookmark,offline,storageError}=useCatalogState(initialCategory);
 const [notice,setNotice]=useState('');
 const filtered=useMemo(()=>filterItems(items,filters,bookmarks),[items,filters,bookmarks]);
 const pageSize=home?6:PAGE_SIZE,pages=Math.max(1,Math.ceil(filtered.length/pageSize)),page=Math.min(filters.page,pages),offset=(page-1)*pageSize;
 const visible=filtered.slice(offset,offset+pageSize),count=activeFilterCount(filters);
 async function download(){const t=trace('catalog.export',{count:filtered.length});try{t.step(1,1,'exportar catálogo filtrado sin convertir NULL');const {itemsCsv}=await import('@/lib/catalog/csv');const blob=new Blob([itemsCsv(filtered)],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='turbo-soccer-values.csv';document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice(`Exported ${filtered.length} items. Unknown values are blank in the CSV.`);t.ok();}catch(e){t.fail(e);setNotice('The export could not be created. Please try again.');}}
 return <section className="values-section" aria-label="Item catalog"><div className="section-heading"><div><span className="eyebrow"><Database size={14}/> THE ITEM DIRECTORY</span>{home?<h2>The garage, decoded.</h2>:<h1>{title??'Find your next favorite.'}</h1>}<p>Documented items. Transparent values. Better decisions.</p></div>{home?<Link href="/values/" className="text-link">Explore the full catalog <ArrowRight size={16}/></Link>:<span className="catalog-counter">{items.length} documented items</span>}</div><CatalogCoverage items={items}/><ValuesFilters filters={filters} update={update} clear={clear} onExport={download} count={filtered.length} savedCount={bookmarks.filter(id=>items.some(item=>item.id===id)).length}/>
 <div className="catalog-results-summary" aria-live="polite"><span><strong>{filtered.length}</strong> {filtered.length===1?'item':'items'}{count>0?` · ${count} active ${count===1?'filter':'filters'}`:''}</span><span><i className="live-dot"/> {offline?'Offline snapshot':'Community catalog'}</span></div>{(offline||isError)&&<p className="data-notice" role="status">{offline?'You are offline. Showing the saved catalog snapshot.':'The latest refresh failed. Showing the cached catalog.'} {isError&&<button className="text-link" onClick={()=>void refetch()}>Retry</button>}</p>}{storageError&&<p className="data-notice" role="status">{storageError}</p>}{notice&&<p className="catalog-export-notice" role="status"><Check size={14}/>{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss export notice">×</button></p>}
 {isPending?<div className="skeleton-table" aria-label="Loading items"/>:isError&&!items.length?<div className="empty-state"><RefreshCw size={28}/><h2>The catalog could not be loaded</h2><p>Please check your connection and try again.</p><button className="btn btn-secondary" onClick={()=>void refetch()}>Retry</button></div>:visible.length?<ValuesTable items={visible} signals={signals} view={filters.view} bookmarks={bookmarks} onBookmark={bookmark} sort={filters.sort} onSort={sort=>update({sort})}/>:<div className="empty-state"><SearchX size={32}/><h2>{filters.saved?'Your saved garage is empty.':'No items match these filters.'}</h2><p>{filters.saved?'Save items with the bookmark button. They stay in this browser, without an account.':initialCategory!=='all'&&!count?'No verified items have been documented in this category yet.':'Try another name, category or rarity. Unknown values are always shown honestly.'}</p><button className="btn btn-secondary" onClick={clear}>Reset filters</button>{initialCategory!=='all'&&<Link className="text-link" href="/values/">Browse all categories <ArrowRight size={15}/></Link>}</div>}
 <div className="table-footer"><span>Showing {filtered.length?offset+1:0}–{Math.min(offset+pageSize,filtered.length)} of {filtered.length} <span className="dot-divider">·</span> Values in coins</span>{pages>1&&<nav className="catalog-pagination" aria-label="Catalog pages"><button aria-label="Previous page" disabled={page<=1} onClick={()=>update({page:page-1})}><ArrowLeft size={16}/></button><span>Page {page} of {pages}</span><button aria-label="Next page" disabled={page>=pages} onClick={()=>update({page:page+1})}><ArrowRight size={16}/></button></nav>}</div><p className="value-disclaimer"><Info size={15}/> A dash means no value has been set. Unknown is never treated as zero.</p></section>;
}
