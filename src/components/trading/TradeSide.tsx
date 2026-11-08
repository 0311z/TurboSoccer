'use client';
import { useEffect, useState } from 'react';
import { Coins, Package, X } from 'lucide-react';
import { ItemImage } from '@/components/items/ItemImage';
import { useItems } from '@/lib/queries/useItems';
import { MAX_COINS, MAX_ITEMS_PER_SIDE, type TradeLine } from '@/lib/trade/calc';
import { ItemPicker } from './ItemPicker';
import { NumberField } from './NumberField';
export function TradeSide({title,subtitle,lines,coins,onChange,onCoins,onValidityChange}:{title:string;subtitle:string;lines:TradeLine[];coins:number;onChange:(lines:TradeLine[])=>void;onCoins:(coins:number)=>void;onValidityChange?:(valid:boolean)=>void}){
 const {data:items=[]}=useItems();const [invalid,setInvalid]=useState<string[]>([]);
 function validity(key:string,valid:boolean){setInvalid(old=>valid?(old.includes(key)?old.filter(x=>x!==key):old):old.includes(key)?old:[...old,key]);}
 useEffect(()=>{onValidityChange?.(!invalid.some(key=>key==='coins'||lines.some(line=>line.itemId===key)));},[invalid,lines,onValidityChange]);
 return <section className="trade-side"><div className="trade-side-heading"><div><h3>{title}</h3><p>{subtitle}</p></div><span className="badge">{lines.length} / {MAX_ITEMS_PER_SIDE} items</span></div><div className="trade-slots">{lines.map(line=>{const item=items.find(entry=>entry.id===line.itemId);return <div className="trade-slot" key={line.itemId}><button type="button" className="remove-item" onClick={()=>onChange(lines.filter(entry=>entry.itemId!==line.itemId))} aria-label={`Remove ${item?.name??'item'}`}><X size={14}/></button><span className="trade-item-art">{item?<ItemImage item={item} size={128}/>:<Package size={30}/>}</span><strong>{item?.name??'Unavailable item'}</strong><span className="slot-value" title={item?.value===null?'No value set yet':undefined}>{item?.value==null?'Value unknown':`${item.value.toLocaleString('en-US')} coins`}</span><NumberField label={`${title}: ${item?.name??'item'} quantity`} value={line.quantity} min={1} max={99} stepper onValidity={valid=>validity(line.itemId,valid)} onChange={quantity=>onChange(lines.map(entry=>entry.itemId===line.itemId?{...entry,quantity}:entry))}/></div>})}{lines.length<MAX_ITEMS_PER_SIDE&&<ItemPicker selected={lines} onSelect={itemId=>onChange([...lines,{itemId,quantity:1}])}/>}</div>{!lines.length&&<p className="trade-side-empty">No items selected. Add an item, coins, or both.</p>}<div className="trade-coins"><span><Coins size={18}/>Additional coins</span><NumberField label={`${title} coins`} value={coins} min={0} max={MAX_COINS} onValidity={valid=>validity('coins',valid)} onChange={onCoins}/></div></section>;
}
