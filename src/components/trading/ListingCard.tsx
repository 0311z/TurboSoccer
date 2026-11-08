'use client';
import Link from 'next/link';
import { ArrowRight,Coins,Package,UserRound } from 'lucide-react';
import { useItems } from '@/lib/queries/useItems';
import { useAuth } from '@/lib/auth/useAuth';
import { calculateTrade,type TradeResult } from '@/lib/trade/calc';
import type { Listing } from '@/lib/trade/listings';
import { OfferDialog } from './OfferDialog';
import { FairnessMeter } from './FairnessMeter';
export function ListingCard({listing,detail=false}:{listing:Listing;detail?:boolean}){
 const {data:items=[]}=useItems();const {session}=useAuth();
 const lines=(side:'have'|'want')=>listing.trade_listing_items.filter(line=>line.side===side).map(line=>({itemId:line.item_id,quantity:line.quantity}));
 const have=lines('have'),want=lines('want');let result:TradeResult;
 try{result=calculateTrade({have,want,coinsHave:listing.coins_have,coinsWant:listing.coins_want},items);}catch{result={sumHave:listing.coins_have,sumWant:listing.coins_want,diff:0,verdict:'unknown',unknown:['Total outside safe range']};}
 function sideContent(side:'have'|'want',coins:number){return <div className="listing-side"><span className="listing-side-label">{side==='have'?'OFFERING':'LOOKING FOR'}</span><div className="listing-items">{lines(side).map(line=>{const item=items.find(entry=>entry.id===line.itemId);return <Link key={line.itemId} href={item?`/items/${item.slug}/`:'/values/'} title={item?.name}><span><Package size={19}/></span>{item?.name??'Unavailable item'} <small>×{line.quantity}</small></Link>})}{coins>0&&<span className="listing-coins"><Coins size={16}/>{coins.toLocaleString('en-US')} coins</span>}</div></div>}
 return <article className="listing-card"><header><span className="trader-avatar">{listing.profiles?.username.slice(0,1).toUpperCase()??'T'}</span><div><strong>{listing.profiles?.username??'Trader'}</strong><small title="Completed through this site by the listing owner. Not verified in Roblox."><UserRound size={12}/>{listing.profiles?.trades_completed??0} site-reported trades</small></div><span className="badge listing-verdict">{listing.status.toUpperCase()}</span></header><div className="listing-trade">{sideContent('have',listing.coins_have)}<ArrowRight className="listing-arrow" size={18}/>{sideContent('want',listing.coins_want)}</div>{listing.note&&<p className="listing-note">{listing.note}</p>}<FairnessMeter result={result} compact/><footer><Link href={`/calculator/?trade=${encodeURIComponent(JSON.stringify({have,want,coinsHave:listing.coins_have,coinsWant:listing.coins_want}))}`}>Compare this trade <ArrowRight size={14}/></Link>{detail?listing.accepts_offers&&listing.status==='open'&&session?.user.id!==listing.owner_id&&<OfferDialog listingId={listing.id}/>:<Link className="btn btn-secondary" href={`/trade/?id=${listing.id}`}>{session?.user.id===listing.owner_id?'Manage listing':'View listing'} <ArrowRight size={14}/></Link>}</footer></article>;
}
