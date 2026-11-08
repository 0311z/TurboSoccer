'use client';
import {useEffect,useState} from 'react';
import {Bookmark,Check} from 'lucide-react';
import {trace} from '@/lib/logger';
import {parseBookmarks} from '@/lib/catalog/bookmarks';
export function SaveItemButton({id,name}:{id:string;name:string}){
 const [saved,setSaved]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{const t=trace('item.saved.restore');try{setSaved(parseBookmarks(localStorage.getItem('tsv-bookmarks')).includes(id));t.ok();}catch(e){t.fail(e);}},[id]);
 function toggle(){const t=trace('item.saved.toggle');try{t.step(1,1,'guardar selección local');const previous=parseBookmarks(localStorage.getItem('tsv-bookmarks')).slice(0,499);const next=previous.includes(id)?previous.filter(item=>item!==id):[...previous,id];localStorage.setItem('tsv-bookmarks',JSON.stringify([...new Set(next)]));setSaved(next.includes(id));setNotice('');t.ok();}catch(e){t.fail(e);setNotice('Browser storage is unavailable.');}}
 return <div className="item-save"><button type="button" className="btn btn-secondary" aria-pressed={saved} aria-label={`${saved?'Unsave':'Save'} ${name}`} onClick={toggle}>{saved?<Check size={16}/>:<Bookmark size={16}/>} {saved?'Saved to garage':'Save item'}</button>{notice&&<p role="status">{notice}</p>}</div>;
}
