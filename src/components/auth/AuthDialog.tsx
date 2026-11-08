'use client';
import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Mail, ShieldCheck, X } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { publicEnv as env } from '@/config/publicEnv';
import { trace } from '@/lib/logger';
import './auth.css';
export function AuthDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId=useId();
  const trigger = useRef<HTMLElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (open && !dialog.current?.open) { trigger.current=document.activeElement instanceof HTMLElement?document.activeElement:null; dialog.current?.showModal(); }
    if (!open && dialog.current?.open) { dialog.current.close(); trigger.current?.focus(); }
  }, [open]);
  async function signIn(provider: 'discord' | 'google') {
    const t = trace('auth.oauth', { provider });
    setError(''); setBusy(true);
    try {
      const client = await getBrowserClient();
      if (!client) { setError('Sign-in is not connected yet. The catalog and calculator are available without an account.'); return; }
      t.step(1, 1, 'iniciar OAuth con PKCE');
      const { error: authError } = await client.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/auth/callback/` } });
      if (authError) throw authError;
      t.ok();
    } catch (failure) { setError(t.fail(failure).userMessage); } finally { setBusy(false); }
  }
  async function emailSignIn(event: React.FormEvent) {
    event.preventDefault();
    const t=trace('auth.email');setBusy(true);setError('');
    try {
      if (!env.emailAuthEnabled) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254) { setError('Enter a valid email address.');return; }
      t.step(1, 1, 'solicitar enlace de acceso por email');
      const client=await getBrowserClient();if(!client)throw new Error('Authentication unavailable');
      const {error: authError}=await client.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:`${window.location.origin}/auth/callback/`,shouldCreateUser:true}});
      if(authError)throw authError;
      setSent(true);t.ok();
    }catch(failure){setError(t.fail(failure).userMessage);}finally{setBusy(false);}
  }
  return <dialog ref={dialog} className="auth-dialog" onClose={()=>{trigger.current?.focus();onClose();}} onClick={event => { if (event.target === event.currentTarget) onClose(); }} aria-labelledby={titleId}>
    <button className="dialog-close" onClick={onClose} aria-label="Close sign-in"><X size={20}/></button>
    <div className="auth-symbol"><ShieldCheck size={28}/></div><span className="eyebrow">YOUR NEXT FAIR TRADE</span>
    <h2 id={titleId}>Welcome to the garage.</h2><p className="muted">Save your trader profile. Find your next upgrade. Keep every exchange in Roblox.</p>
    {env.configured ? <><div className="auth-options"><button className="btn btn-primary" disabled={busy} onClick={() => void signIn('discord')}>Continue with Discord <ArrowUpRight size={17}/></button><button className="btn btn-secondary" disabled={busy} onClick={() => void signIn('google')}>Continue with Google <ArrowUpRight size={17}/></button></div>{env.emailAuthEnabled&&<form className="auth-email" onSubmit={event=>void emailSignIn(event)}><span>or receive a secure sign-in link</span><label className="field">Email address<input type="email" autoComplete="email" value={email} onChange={event=>{setEmail(event.target.value);setSent(false);}} maxLength={254} required placeholder="you@example.com"/></label><button className="btn btn-secondary" disabled={busy||sent}><Mail size={15}/>{sent?'Check your email':'Email me a sign-in link'}</button>{sent&&<p role="status">If sign-in is available for this address, a link will arrive shortly. Check your spam folder.</p>}</form>}</> : <div className="auth-unavailable"><strong>The community database is not connected yet.</strong><p>You can browse all documented items, save favorites on this device, and compare trades right now.</p><Link href="/calculator/" className="btn btn-secondary" onClick={onClose}>Try the calculator <ArrowUpRight size={15}/></Link></div>}
    {error && <p role="alert" className="form-error">{error}</p>}<p className="auth-fine">Trading is for ages 16+. We never ask for your Roblox password. <Link href="/privacy/" onClick={onClose}>Privacy</Link> · <Link href="/terms/" onClick={onClose}>Terms</Link></p>
  </dialog>;
}
