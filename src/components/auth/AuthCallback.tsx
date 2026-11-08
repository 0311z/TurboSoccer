'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/useAuth';
import { trace } from '@/lib/logger';
export function AuthCallback() {
  const { session, loading, configured } = useAuth();
  const [timedOut, setTimedOut] = useState(false);
  const [denied,setDenied]=useState(false);
  useEffect(() => {
    const t=trace('auth.callback');
    try {
      const query=new URLSearchParams(window.location.search);
      const hash=new URLSearchParams(window.location.hash.slice(1));
      if(query.has('error')||hash.has('error')) {setDenied(true);window.history.replaceState(null,'','/auth/callback/');return;}
      if (session) {t.ok();window.location.replace('/profile/');}
    }catch(error){t.fail(error);setDenied(true);}
    const timer = window.setTimeout(() => setTimedOut(true), 15_000);
    return () => window.clearTimeout(timer);
  }, [session]);
  const failed=timedOut||denied||!configured;
  return <section className="panel empty-state"><div className="auth-symbol">{failed?<AlertCircle size={30}/>:<ShieldCheck size={30}/>}</div><span className="eyebrow">SECURE SIGN-IN</span><h1>{!configured ? 'Sign-in is not connected' : denied?'Sign-in was not completed':timedOut ? 'This sign-in is taking too long' : 'Opening your garage…'}</h1>
    <p className="muted">{!configured?'The catalog and calculator are available now. Account access needs the new community database.':failed?'Return to the trading board to request a new sign-in. No Roblox password is needed.':loading?'Securely restoring your session. You will be redirected automatically.':'Waiting for your identity provider.'}</p>
    <Link href={configured?'/trading/':'/calculator/'} className="btn btn-primary">{configured?'Back to trading':'Open the calculator'}</Link><Link href="/values/" className="text-link">Explore items</Link>
  </section>;
}
