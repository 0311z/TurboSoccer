'use client';
import { useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { trace } from '@/lib/logger';
import { fetchMyProfile } from '@/lib/data/profiles';
import { OnboardingDialog } from '@/components/auth/OnboardingDialog';
import { AuthDialog } from '@/components/auth/AuthDialog';
import type { TradeLine } from '@/lib/trade/calc';
import { TradeSide } from './TradeSide';
import { isSafeTradeText } from '@/lib/trade/text';
import { useQueryClient } from '@tanstack/react-query';
export function OfferDialog({ listingId }: { listingId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId=useId();
  const [lines, setLines] = useState<TradeLine[]>([]);
  const [coins, setCoins] = useState(0);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [note,setNote]=useState('');
  const [sent,setSent]=useState(false);
  const queryClient=useQueryClient();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const t = trace('offers.create', { listingId }); setBusy(true);
    try {
      t.step(1, 2, 'Validar sesión y oferta');
      const client = await getBrowserClient();
      if (!client) { setMessage('The marketplace is not connected yet.'); return; }
      if(!isSafeTradeText(note)){setMessage('Keep offers inside Roblox. Links and payment instructions are not allowed.');return;}
      if (!lines.length && !coins) { setMessage('Add items or coins to your offer.'); return; }
      const { data, error: authError } = await client.auth.getSession();
      if (authError) throw authError;
      if (!data.session) { setAuthOpen(true); return; }
      const profile = await fetchMyProfile();
      if (!profile?.ageConfirmed || !profile.roblox_username) { setOnboarding(true); return; }
      t.step(2, 2, 'Enviar oferta mediante RPC');
      const { error } = await client.rpc('create_offer', { p_listing_id: listingId, p_items: lines.map((line) => ({ item_id: line.itemId, quantity: line.quantity })), p_coins: coins, p_message: note });
      if (error) throw error;
      setSent(true);await queryClient.invalidateQueries({queryKey:['trade-detail',listingId]});
      setMessage('Offer sent. The listing owner can review it.'); t.ok();
    } catch (error) { t.fail(error); setMessage('Your offer could not be sent. Check your profile and whether this listing is still open.'); }
    finally { setBusy(false); }
  }
  return <><button className="btn btn-secondary" onClick={() => dialog.current?.showModal()}>Make offer</button><dialog ref={dialog} className="item-picker" onCancel={event=>{if(busy)event.preventDefault();}} aria-busy={busy} aria-labelledby={titleId}><div className="dialog-top"><h2 id={titleId}>Make an offer</h2><button className="icon-button" disabled={busy} aria-label="Close offer dialog" onClick={() => dialog.current?.close()}><X size={18}/></button></div><form onSubmit={submit}><TradeSide title="Your offer" subtitle="Items the owner would receive" lines={lines} coins={coins} onChange={setLines} onCoins={setCoins}/><label className="composer-note">Message <span>Optional · 280 characters</span><textarea value={note} maxLength={280} onChange={event=>setNote(event.target.value)} placeholder="Tell the owner about your offer. No links or payments."/></label><p className="composer-safety">An accepted offer reserves a listing; trading happens inside Roblox.</p>{message && <p role="status" className="calculator-status">{message}</p>}<button className="btn btn-primary composer-submit" disabled={busy||sent}>{sent?'Offer sent':busy ? 'Sending…' : 'Send offer'}</button></form></dialog><OnboardingDialog open={onboarding} onClose={() => setOnboarding(false)} onComplete={() => setMessage('Profile ready. Submit again to continue.')}/><AuthDialog open={authOpen} onClose={() => setAuthOpen(false)}/></>;
}
