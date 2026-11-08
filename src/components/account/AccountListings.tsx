'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { fetchAccountListings } from '@/lib/data/account';
export function AccountListings({ userId }: { userId: string }) {
  const query = useQuery({ queryKey: ['account-listings', userId], queryFn: fetchAccountListings, staleTime: 30_000 });
  return <section className="panel account-listings"><div className="account-section-title"><ArrowLeftRight size={20}/><div><h2>Your recent listings</h2><p>Keep track of what you have put on the board.</p></div><Link href="/trading/" className="text-link">Trading board <ArrowUpRight size={14}/></Link></div>{query.isPending ? <p className="account-state" role="status">Loading your listings…</p> : query.isError ? <div className="account-state"><p>We couldn’t load your listings.</p><button className="btn btn-secondary" onClick={() => void query.refetch()}>Retry</button></div> : !query.data?.length ? <div className="account-state"><p>No listings yet. Start with what is already in your garage.</p><Link className="btn btn-secondary" href="/trading/">Create your first listing</Link></div> : <ul>{query.data.map(listing => <li key={listing.id}><div><strong>{listing.note || 'Item trade'}</strong><small>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(listing.created_at))} · UTC</small></div><span className="badge">{listing.status}</span><Link href={`/trade/?id=${listing.id}`} className="icon-button" aria-label="Manage listing"><ArrowUpRight size={17}/></Link></li>)}</ul>}</section>;
}
