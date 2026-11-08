'use client';
import Link from 'next/link';
import { useEffect,useState } from 'react';
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query';
import { ArrowLeft,ArrowRight,Inbox,ShieldCheck } from 'lucide-react';
import { publicEnv as env } from '@/config/publicEnv';
import { trace } from '@/lib/logger';
import { useAuth } from '@/lib/auth/useAuth';
import { fetchTradeDetail,actOnTrade,type TradeAction } from '@/lib/trade/detail';
import { ListingCard } from './ListingCard';
import { OfferCard } from './OfferCard';
import { TradeConfirmation } from './TradeConfirmation';
import './trading.css';
export function TradeDetail(){
 const [id,setId]=useState(''),[parsed,setParsed]=useState(false),[notice,setNotice]=useState('');const [request,setRequest]=useState<{action:TradeAction;id:string}|null>(null);
 const {session,loading}=useAuth();const queryClient=useQueryClient();
 useEffect(()=>{const t=trace('trade.link');try{const value=new URLSearchParams(window.location.search).get('id')??'';if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))setId(value);t.ok();}catch(error){t.fail(error);}finally{setParsed(true);}},[]);
 const query=useQuery({queryKey:['trade-detail',id,session?.user.id],queryFn:()=>fetchTradeDetail(id),enabled:env.configured&&Boolean(id)&&!loading,refetchInterval:30_000,retry:1});
 const mutation=useMutation({mutationFn:({action,id:target}:{action:TradeAction;id:string})=>actOnTrade(action,target),onSuccess:async()=>{setRequest(null);setNotice('Trade updated. The latest status is shown below.');await Promise.all([queryClient.invalidateQueries({queryKey:['trade-detail',id]}),queryClient.invalidateQueries({queryKey:['listings']})]);}});
 function requestAction(action:TradeAction,target:string){mutation.reset();setRequest({action,id:target});}
 if(!env.configured)return <div className="market-empty trade-detail-empty"><ShieldCheck size={36}/><h1>The marketplace is not connected yet</h1><p>Listing management becomes available after the new community database is connected. You can compare items and coins right now.</p><Link className="btn btn-primary" href="/calculator/">Open calculator <ArrowRight size={16}/></Link></div>;
 if(!parsed||loading||query.isPending&&id)return <div className="panel empty-state" role="status">Loading the listing and your session…</div>;
 if(!id)return <div className="market-empty trade-detail-empty"><h1>Choose a trade to review</h1><p>Open a listing from the trading board to view its details and offers.</p><Link className="btn btn-primary" href="/trading/">Browse listings</Link></div>;
 if(query.isError)return <div className="panel empty-state"><h1>This listing could not be loaded</h1><p>Please check your connection and try again.</p><button className="btn btn-primary" onClick={()=>void query.refetch()}>Retry</button></div>;
 if(!query.data)return <div className="panel empty-state"><h1>Listing unavailable</h1><p>It may have expired, been removed, or require the participant’s account to view.</p><Link className="btn btn-secondary" href="/trading/">Back to the board</Link></div>;
 const {listing,offers,userId}=query.data;const owner=userId===listing.owner_id;const open=listing.status==='open'&&new Date(listing.expires_at).getTime()>Date.now();
 return <div className="trade-detail"><Link href="/trading/" className="back-link"><ArrowLeft size={16}/> Back to trading board</Link><div className="trade-detail-heading"><div><span className="eyebrow">{owner?'YOUR LISTING':'TRADE DETAILS'}</span><h1>A closer look at the trade.</h1><p>Confirm every item in Roblox before you exchange.</p></div><span className="badge">{listing.status==='open'&&!open?'EXPIRED':listing.status.toUpperCase()}</span></div>{notice&&<p className="calculator-status" role="status">{notice}</p>}<ListingCard listing={{...listing,status:listing.status==='open'&&!open?'expired':listing.status}} detail/>{owner&&['open','pending'].includes(listing.status)&&<div className="trade-owner-actions"><p>{listing.status==='pending'?'An offer has been accepted. Mark completed only after the in-game exchange.':'Your listing is open. You can review offers below or cancel it.'}</p><div>{listing.status==='pending'&&<button className="btn btn-primary" onClick={()=>requestAction('complete',id)}>Mark completed</button>}<button className="btn btn-secondary" onClick={()=>requestAction('cancel',id)}>Cancel listing</button></div></div>}<section className="trade-offers"><div className="section-heading"><div><span className="eyebrow"><Inbox size={15}/> PARTICIPANT OFFERS</span><h2>{owner?'Offers on your listing':'Your offers'}</h2><p>{owner?'Only you, the offerer and staff can view an offer.':'Offers from other players remain private.'}</p></div><span className="badge">{offers.length}</span></div>{offers.length?<div className="offers-grid">{offers.map(offer=><OfferCard key={offer.id} offer={offer} owner={owner} currentUser={userId} open={open} onAction={requestAction}/>)}</div>:<div className="panel empty-state"><Inbox size={28}/><h3>No visible offers yet</h3><p>{!userId?'Sign in to view offers you have sent.':owner?'The community can send offers while your listing is open.':'You have not sent a visible offer on this listing.'}</p></div>}</section><TradeConfirmation action={request?.action??null} busy={mutation.isPending} error={mutation.isError?'The action could not be completed. Refresh the listing and check that the offer is still available.':''} onConfirm={()=>{if(request)mutation.mutate(request);}} onClose={()=>{if(!mutation.isPending)setRequest(null);}}/></div>;
}
