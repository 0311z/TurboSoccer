'use client';
import { useRef, useEffect, useId, useState } from 'react';
import { X } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { trace } from '@/lib/logger';
import { MIN_AGE } from '@/config/limits';
export function OnboardingDialog({ open, onClose, onComplete }: { open: boolean; onClose: () => void; onComplete?: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId=useId();
  const [name, setName] = useState('');
  const [age, setAge] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    const t = trace('auth.onboarding');
    setBusy(true); setError('');
    try {
      if (!age || !/^[A-Za-z0-9_]{3,20}$/.test(name)) { setError('Confirm your age and enter a valid Roblox username (3–20 letters, numbers or underscores).'); return; }
      const client = await getBrowserClient();
      if (!client) { setError('Trading is not connected yet.'); return; }
      t.step(1, 3, 'comprobar sesión');
      const { data, error: sessionError } = await client.auth.getUser();
      if (sessionError || !data.user) throw sessionError || new Error('Missing session');
      t.step(2, 3, 'guardar nombre de Roblox');
      const { error: updateError } = await client.from('profiles').update({ roblox_username: name }).eq('id', data.user.id);
      if (updateError) throw updateError;
      t.step(3, 3, 'confirmar edad mínima');
      const { error: ageError } = await client.rpc('confirm_age');
      if (ageError) throw ageError;
      t.ok(); onComplete?.(); onClose();
    } catch (failure) { setError(t.fail(failure).userMessage); } finally { setBusy(false); }
  }
  return <dialog ref={dialog} className="auth-dialog" onClose={onClose} aria-labelledby={titleId}>
    <button className="dialog-close" onClick={onClose} aria-label="Close onboarding"><X size={20}/></button>
    <h2 id={titleId}>Set up your trader profile</h2>
    <p className="muted">Your Roblox username helps other players find you. It does not verify your account.</p>
    <form onSubmit={event => void save(event)} className="auth-options">
      <label className="field">Roblox username<input value={name} maxLength={20} onChange={event => setName(event.target.value)} autoComplete="off" required/></label>
      <label className="age-checkbox"><input type="checkbox" checked={age} onChange={event => setAge(event.target.checked)}/>I am at least {MIN_AGE} years old</label>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving profile…' : 'Start trading'}</button>
    </form>
  </dialog>;
}
