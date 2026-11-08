'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, ArrowUpRight, UserRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/useAuth';
import { fetchMyProfile, signOut } from '@/lib/data/profiles';
import { AccountGate } from './AccountGate';
import { ProfileForm } from './ProfileForm';
import { AccountListings } from './AccountListings';
import { AccountPrivacy } from './AccountPrivacy';
import './account.css';
export function AccountScreen() {
  const { configured, loading, session } = useAuth(), cache = useQueryClient();
  const [notice, setNotice] = useState(''), [signingOut, setSigningOut] = useState(false);
  const query = useQuery({ queryKey: ['account-profile', session?.user.id], queryFn: fetchMyProfile, enabled: configured && Boolean(session), staleTime: 30_000, retry: 1 });
  async function leave() { setSigningOut(true); try { await signOut(); cache.clear(); setNotice('You have signed out.'); } catch { setNotice('Sign-out failed. Please try again.'); } finally { setSigningOut(false); } }
  function saved() { setNotice('Your changes have been saved.'); void query.refetch(); }
  if (loading) return <div className="container account-page"><div className="panel account-state" role="status">Restoring your session…</div></div>;
  if (!configured || !session) return <div className="container account-page"><div className="account-page-heading"><span className="eyebrow">THE PERSONAL GARAGE</span><h1>Your profile.<br/><span>Your next chapter.</span></h1></div>{notice && <p className="account-notice" role="status">{notice}</p>}<AccountGate configured={configured}/></div>;
  return <div className="container account-page"><header className="account-page-heading"><div><span className="eyebrow">THE PERSONAL GARAGE</span><h1>Your trading profile.</h1><p>Manage your identity, your listings and your privacy.</p></div><button className="btn btn-secondary" onClick={() => void leave()} disabled={signingOut}><LogOut size={16}/>{signingOut ? 'Signing out…' : 'Sign out'}</button></header>{notice && <p className="account-notice" role="status">{notice}</p>}{query.isPending ? <div className="panel account-state" role="status">Loading your profile…</div> : query.isError ? <div className="panel account-state"><p>Your profile could not be loaded.</p><button className="btn btn-secondary" onClick={() => void query.refetch()}>Retry</button></div> : !query.data ? <div className="panel account-state"><p>Your profile is not available yet. Refresh after signing in.</p><button className="btn btn-secondary" onClick={() => void query.refetch()}>Refresh profile</button></div> : <><div className="account-summary"><div className="account-avatar"><UserRound size={30}/></div><div><h2>{query.data.username}</h2><Link className="text-link" href={`/u/?name=${encodeURIComponent(query.data.username)}`}>View public profile <ArrowUpRight size={14}/></Link></div><div className="account-reputation"><strong>{query.data.trades_completed}</strong><span>listings marked complete</span></div>{['admin', 'owner'].includes(query.data.role) && <Link href="/admin/" className="btn btn-secondary"><ShieldCheck size={16}/> Value editor</Link>}</div><ProfileForm key={`${query.data.username}:${query.data.roblox_username}:${query.data.bio}:${query.data.ageConfirmed}`} profile={query.data} onSaved={saved}/><AccountListings userId={session.user.id}/><AccountPrivacy profile={query.data} onDeleted={() => { cache.clear(); setNotice('Your trading account has been deleted.'); }}/></>}</div>;
}
