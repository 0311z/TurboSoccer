'use client';
import Link from 'next/link';
import { useState } from 'react';
import { LockKeyhole, Cable, ArrowRight } from 'lucide-react';
import { AuthDialog } from '@/components/auth/AuthDialog';
export function AccountGate({ configured, title = 'Your garage, all in one place.' }: { configured: boolean; title?: string }) {
  const [open, setOpen] = useState(false);
  return <section className="panel account-gate"><span className="account-gate-icon">{configured ? <LockKeyhole size={28}/> : <Cable size={28}/>}</span><span className="eyebrow">YOUR TRADING ACCOUNT</span><h2>{title}</h2><p>{configured ? 'Sign in to update your profile, manage your listings and take control of your data.' : 'Accounts need a new community database connection. You can still explore every documented item and compare trades without signing in.'}</p><div>{configured && <button className="btn btn-primary" onClick={() => setOpen(true)}>Sign in <ArrowRight size={16}/></button>}<Link href="/values/" className="btn btn-secondary">Explore the catalog</Link><Link href="/calculator/" className="text-link">Open calculator <ArrowRight size={14}/></Link></div><AuthDialog open={open} onClose={() => setOpen(false)}/></section>;
}
