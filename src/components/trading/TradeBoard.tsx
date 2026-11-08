'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Search, ShieldCheck, SlidersHorizontal, RefreshCw, ArrowLeftRight, CircleHelp } from 'lucide-react';
import Link from 'next/link';
import { publicEnv as env } from '@/config/publicEnv';
import { useItems } from '@/lib/queries/useItems';
import { trace } from '@/lib/logger';
import { queryKeys } from '@/lib/queries/keys';
import { fetchListings } from '@/lib/trade/listings';
import { ListingComposer } from './ListingComposer';
import { ListingCard } from './ListingCard';
import './trading.css';
export function TradeBoard() {
  const { data: seedItems = [] } = useItems();
  const [search, setSearch] = useState('');
  useEffect(() => { const t=trace('marketplace.filters'); try { setSearch(new URLSearchParams(window.location.search).get('q')??''); t.ok(); } catch(error) { t.fail(error); } }, []);
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const t = trace('marketplace.connectivity');
    const update = () => setOnline(navigator.onLine);
    try { t.step(1, 1, 'Observar conexión'); update(); window.addEventListener('online', update); window.addEventListener('offline', update); t.ok(); }
    catch (error) { t.fail(error); }
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  const [offersOnly, setOffersOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const query = useQuery({ queryKey: queryKeys.listings, queryFn: fetchListings, staleTime: 30_000, refetchInterval: 60_000 });
  const connected = env.configured;
  const listings = (query.data ?? []).filter((listing) => (!offersOnly || listing.accepts_offers) && (!search || listing.note?.toLowerCase().includes(search.toLowerCase()) || listing.profiles?.username.toLowerCase().includes(search.toLowerCase()) || listing.trade_listing_items.some((line) => seedItems.find((item) => item.id === line.item_id)?.name.toLowerCase().includes(search.toLowerCase()))));
  if (sort === 'oldest') listings.reverse();
  return <div className="trade-board"><div className="market-heading"><div><span className="eyebrow">THE COMMUNITY MARKETPLACE</span><h1>Good items. <span>Great trades.</span></h1><p>Find what you want. Offer what you have. Keep every trade in Roblox.</p></div><ListingComposer/></div><div className="market-safety"><ShieldCheck size={19}/><p><strong>Trade smart. Stay safe.</strong> Never trade for real money, accounts or items outside Roblox. Never send first.</p><Link href="/disclaimer/">Safety guide <ArrowRight size={14}/></Link></div>
    <div className="board-toolbar"><label className="board-search"><Search size={17}/><input aria-label="Search listings" placeholder="Search items, traders, or notes" value={search} onChange={(event) => setSearch(event.target.value)}/></label><button className={`btn btn-secondary ${offersOnly ? 'filter-on' : ''}`} aria-pressed={offersOnly} onClick={() => setOffersOnly(!offersOnly)}><SlidersHorizontal size={15}/>Accepts offers</button><label className="board-sort">Sort by<select aria-label="Sort listings" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label></div>
    {!online && <p className="calculator-status" role="status">You’re offline. Showing cached listings. Reconnect to refresh.</p>}
    <div className="board-count"><span>{connected?`${listings.length} open listings`:'Market data unavailable'}</span><span><i className={connected ? 'live-dot' : 'offline-dot'}/>{connected ? 'Refreshes every minute' : 'Marketplace awaiting connection'}</span><button onClick={() => query.refetch()} aria-label="Refresh listings"><RefreshCw size={13}/></button></div>
    {query.isPending && <div className="board-skeleton" aria-label="Loading listings"><div/><div/><div/></div>}
    {query.isError && <div className="market-empty"><CircleHelp size={32}/><h2>Couldn’t load the marketplace</h2><p>The connection may be temporarily unavailable. Please try again.</p><button className="btn btn-secondary" onClick={() => query.refetch()}>Retry</button></div>}
    {!query.isPending && !query.isError && !listings.length && <div className="market-empty"><div className="market-empty-icon"><ArrowLeftRight size={32}/></div><span className="eyebrow">YOUR NEXT TRADE IS AHEAD</span><h2>{search || offersOnly ? 'No matching listings' : connected ? 'Be the first to make a move' : 'A new home for your next trade'}</h2><p>{search || offersOnly ? 'Try another item or clear your filters to explore all open listings.' : connected ? 'No open listings yet. Create one to let the community know what you have and what you’re looking for.' : 'The marketplace is getting ready. In the meantime, explore the catalog and compare a trade — no account needed.'}</p><div>{search || offersOnly ? <button className="btn btn-secondary" onClick={() => { setSearch(''); setOffersOnly(false); }}>Clear filters</button> : <><Link className="btn btn-primary" href="/values/">Explore item values <ArrowRight size={15}/></Link><Link className="btn btn-secondary" href="/calculator/">Open calculator</Link></>}</div></div>}
    {listings.length > 0 && <div className="listings-grid">{listings.map((listing) => <ListingCard key={listing.id} listing={listing}/>)}</div>}
    <div className="market-bottom"><ShieldCheck size={17}/><p>All listings expire after 7 days. Values are estimates, never a promise. Always verify items before accepting.</p></div>
  </div>;
}
