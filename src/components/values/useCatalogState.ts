'use client';
import {useEffect,useState} from 'react';
import {trace} from '@/lib/logger';
import {parseBookmarks} from '@/lib/catalog/bookmarks';
import {defaultFilters,filtersQuery,parseFilters,type CatalogFilters} from '@/lib/catalog/filters';
export function useCatalogState(initialCategory='all'){
 const [filters,setFilters]=useState<CatalogFilters>({...defaultFilters,category:initialCategory});
 const [bookmarks,setBookmarks]=useState<string[]>([]),[offline,setOffline]=useState(false),[ready,setReady]=useState(false),[storageError,setStorageError]=useState('');
 useEffect(()=>{
  const restore=()=>{const t=trace('catalog.restore');try{t.step(1,1,'restaurar filtros de URL');setFilters(parseFilters(window.location.search,initialCategory));t.ok();}catch(e){t.fail(e);}};
  restore();const restoreBookmarks=()=>{const t=trace('catalog.bookmarks.restore');try{setBookmarks(parseBookmarks(localStorage.getItem('tsv-bookmarks')));t.ok();}catch(e){t.fail(e);setStorageError('Saved items could not be restored.');}};restoreBookmarks();
  const storage=(event:StorageEvent)=>{if(event.key==='tsv-bookmarks'||event.key===null)restoreBookmarks();};const cleared=()=>setBookmarks([]);window.addEventListener('storage',storage);window.addEventListener('tsv-local-data-cleared',cleared);
  setReady(true);const connectivity=()=>setOffline(!navigator.onLine);connectivity();
  const shortcut=(event:KeyboardEvent)=>{if(event.key==='/'&&!(event.target instanceof HTMLInputElement)&&!(event.target instanceof HTMLTextAreaElement)&&!(event.target instanceof HTMLSelectElement)&&!(event.target instanceof HTMLElement&&event.target.isContentEditable)){event.preventDefault();document.getElementById('item-search')?.focus();}};
  window.addEventListener('popstate',restore);window.addEventListener('online',connectivity);window.addEventListener('offline',connectivity);window.addEventListener('keydown',shortcut);
  return()=>{window.removeEventListener('storage',storage);window.removeEventListener('tsv-local-data-cleared',cleared);window.removeEventListener('popstate',restore);window.removeEventListener('online',connectivity);window.removeEventListener('offline',connectivity);window.removeEventListener('keydown',shortcut);};
 },[initialCategory]);
 function update(patch:Partial<CatalogFilters>,replace=false){
  const next={...filters,...patch,page:patch.page??1};setFilters(next);const t=trace('catalog.filters');
  try{const q=filtersQuery(next,initialCategory);const target=window.location.pathname+(q?'?'+q:'')+window.location.hash;window.history[replace?'replaceState':'pushState'](null,'',target);t.ok();}catch(e){t.fail(e);}
 }
 function bookmark(id:string){const next=bookmarks.includes(id)?bookmarks.filter(x=>x!==id):[...bookmarks,id];setBookmarks(next);const t=trace('catalog.bookmarks.save');try{localStorage.setItem('tsv-bookmarks',JSON.stringify(next));setStorageError('');t.ok();}catch(e){t.fail(e);setStorageError('Browser storage is unavailable. Saved items will last for this visit.');}}
 function clear(){update({...defaultFilters,category:initialCategory});}
 return {filters,update,clear,bookmarks,bookmark,offline,ready,storageError};
}
