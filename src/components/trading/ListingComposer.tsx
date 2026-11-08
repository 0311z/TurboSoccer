'use client';
import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, X, ShieldCheck } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { queryKeys } from '@/lib/queries/keys';
import { trace } from '@/lib/logger';
import { fetchMyProfile } from '@/lib/data/profiles';
import { OnboardingDialog } from '@/components/auth/OnboardingDialog';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { EMPTY_TRADE, type TradeDraft } from '@/lib/trade/calc';
import { TradeSide } from './TradeSide';
import { isSafeTradeText } from '@/lib/trade/text';
import Link from 'next/link';

export function ListingComposer() {
  const dialog = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<TradeDraft>(EMPTY_TRADE);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [createdId,setCreatedId]=useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const t = trace('listings.create');
    setMessage(''); setBusy(true);
    try {
      t.step(1, 3, 'Validar anuncio');
      if (!isSafeTradeText(note)) { setMessage('Keep trades in Roblox. Links and real-money payments are not allowed.'); return; }
      if (!draft.have.length && !draft.want.length && !draft.coinsHave && !draft.coinsWant) { setMessage('Add at least one item or some coins.'); return; }
      const client = await getBrowserClient();
      if (!client) { setMessage('The marketplace is not connected yet. You can still explore items and use the calculator.'); return; }
      const { data: session, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session.session) { setAuthOpen(true); return; }
      const profile = await fetchMyProfile();
      if (!profile?.ageConfirmed || !profile.roblox_username) { setOnboarding(true); return; }
      t.step(2, 3, 'Crear anuncio mediante RPC');
      const { data:created,error } = await client.rpc('create_listing', { p_have: draft.have.map((line) => ({ item_id: line.itemId, quantity: line.quantity })), p_want: draft.want.map((line) => ({ item_id: line.itemId, quantity: line.quantity })), p_coins_have: draft.coinsHave, p_coins_want: draft.coinsWant, p_note: note });
      if (error) throw error;
      t.step(3, 3, 'Actualizar tablón');
      await queryClient.invalidateQueries({ queryKey: queryKeys.listings });
      if(typeof created==='string')setCreatedId(created);
      setMessage('Your listing is live. It expires in seven days.'); setDraft(EMPTY_TRADE); setNote(''); t.ok();
    } catch (error) { t.fail(error); setMessage('Could not post this listing. Check your age and Roblox profile, wait 30 seconds, and try again. Limit: 10 open listings.'); }
    finally { setBusy(false); }
  }
  return <><button className="btn btn-primary" onClick={() => dialog.current?.showModal()}><Plus size={16}/>Create listing</button><dialog className="listing-composer item-picker" ref={dialog} onCancel={event=>{if(busy)event.preventDefault();}} aria-busy={busy} aria-labelledby="composer-title"><div className="dialog-top"><div><span className="eyebrow">FIND YOUR NEXT TRADE</span><h2 id="composer-title">Create a listing</h2></div><button className="icon-button" disabled={busy} aria-label="Close listing composer" onClick={() => dialog.current?.close()}><X size={20}/></button></div><form onSubmit={submit}><div className="trade-sides"><TradeSide title="You offer" subtitle="Items you have" lines={draft.have} coins={draft.coinsHave} onChange={(have) => setDraft({ ...draft, have })} onCoins={(coinsHave) => setDraft({ ...draft, coinsHave })}/><TradeSide title="You want" subtitle="Items you are looking for" lines={draft.want} coins={draft.coinsWant} onChange={(want) => setDraft({ ...draft, want })} onCoins={(coinsWant) => setDraft({ ...draft, coinsWant })}/></div><label className="composer-note">Trade note <span>Optional · 280 characters max</span><textarea maxLength={280} value={note} onChange={(event) => setNote(event.target.value)} placeholder="What are you looking for? No links or real-money trades."/></label><p className="composer-safety"><ShieldCheck size={15}/>Never send first. Complete every trade inside Roblox.</p>{message && <p className="calculator-status" role="status">{message}</p>}{createdId&&<Link className="btn btn-secondary composer-submit" href={`/trade/?id=${createdId}`}>Manage your listing</Link>}<button className="btn btn-primary composer-submit" disabled={busy}>{busy ? 'Posting listing…' : 'Post listing'}</button></form></dialog><OnboardingDialog open={onboarding} onClose={() => setOnboarding(false)} onComplete={() => setMessage('Profile ready. Submit again to continue.')}/><AuthDialog open={authOpen} onClose={() => setAuthOpen(false)}/></>;
}
