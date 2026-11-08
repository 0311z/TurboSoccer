'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, LockKeyhole, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth/useAuth';
import { fetchMyProfile } from '@/lib/data/profiles';
import { useItems } from '@/lib/queries/useItems';
import { AccountGate } from '@/components/account/AccountGate';
import { AppraisalEditor } from './AppraisalEditor';
import '@/components/account/account.css';
export function AdminScreen() {
  const auth = useAuth(), items = useItems(), [selected, setSelected] = useState('');
  const profile = useQuery({ queryKey: ['account-profile', auth.session?.user.id], queryFn: fetchMyProfile, enabled: auth.configured && Boolean(auth.session), staleTime: 30_000, retry: 1 });
  const item = items.data?.find(entry => entry.id === selected) ?? items.data?.[0];
  const staff = profile.data?.role === 'admin' || profile.data?.role === 'owner';
  return <div className="container account-page admin-page"><header className="account-page-heading"><div><span className="eyebrow">COMMUNITY VALUE GOVERNANCE</span><h1>Appraise with evidence.</h1><p>Every change is permission checked, recorded and accountable.</p></div><Link href="/profile/" className="btn btn-secondary"><ArrowLeft size={15}/> My profile</Link></header>{auth.loading || (auth.session && profile.isPending) ? <div className="panel account-state" role="status">Checking your permissions…</div> : !auth.configured || !auth.session ? <AccountGate configured={auth.configured} title="Staff sign-in required."/> : profile.isError ? <div className="panel account-state"><p>Your permissions could not be checked.</p><button className="btn btn-secondary" onClick={() => void profile.refetch()}>Retry</button></div> : !staff ? <section className="panel account-gate"><LockKeyhole size={30}/><h2>This workshop is for appraisers.</h2><p>Only accounts assigned the admin or owner role in the database can change values. You can still inspect the item guide and use the calculator.</p><Link href="/values/" className="btn btn-secondary">Explore items</Link></section> : <><div className="admin-governance"><ShieldCheck size={23}/><p><strong>Server-enforced access.</strong> Changes go through the value RPC. A trigger records the appraisal, history and audit entry in the same transaction.</p></div><label className="field admin-item-select">Choose an item<select value={item?.id ?? ''} onChange={e => setSelected(e.target.value)}>{items.data?.map(entry => <option key={entry.id} value={entry.id}>{entry.name} · {entry.category}</option>)}</select></label>{items.isError && <p className="account-notice" role="status">The latest catalog refresh failed. The cached values may be outdated. <button className="text-link" onClick={() => void items.refetch()}>Retry</button></p>}{item ? <AppraisalEditor key={`${item.id}:${item.value}:${item.demand}`} item={item}/> : <div className="panel account-state">No items are available to appraise.</div>}</>}</div>;
}
