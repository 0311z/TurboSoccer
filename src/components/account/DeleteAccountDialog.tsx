'use client';
import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, TriangleAlert } from 'lucide-react';
import { deleteMyAccount } from '@/lib/data/account';
export function DeleteAccountDialog({ open, onClose, onDeleted }: { open: boolean; onClose: () => void; onDeleted: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null), [confirmation, setConfirmation] = useState('');
  const mutation = useMutation({ mutationFn: deleteMyAccount, onSuccess: onDeleted });
  useEffect(() => { if (open && !dialog.current?.open) { setConfirmation(''); mutation.reset(); dialog.current?.showModal(); } if (!open && dialog.current?.open) dialog.current.close(); }, [open]);
  return <dialog ref={dialog} className="account-delete-dialog" onClose={onClose} onCancel={event => { if (mutation.isPending) event.preventDefault(); }} aria-busy={mutation.isPending} aria-labelledby="delete-account-title"><button className="dialog-close" onClick={onClose} aria-label="Close account deletion" disabled={mutation.isPending}><X size={20}/></button><TriangleAlert className="danger-icon" size={29}/><h2 id="delete-account-title">Delete your trading account?</h2><p>Your profile, listings and offers will be permanently removed. This does not delete your Roblox account or in-game items. Historical audit entries may remain without your account identifier.</p><label className="field">Type DELETE to confirm<input autoComplete="off" value={confirmation} onChange={e => setConfirmation(e.target.value)} spellCheck={false} disabled={mutation.isPending}/></label>{mutation.isError && <p className="form-error" role="alert">Account deletion failed. Your account has not been confirmed as deleted. Please retry.</p>}<div className="account-dialog-actions"><button className="btn btn-secondary" onClick={onClose} disabled={mutation.isPending}>Keep my account</button><button className="btn btn-danger" disabled={confirmation !== 'DELETE' || mutation.isPending} onClick={() => mutation.mutate(confirmation)}>{mutation.isPending ? 'Deleting…' : 'Delete permanently'}</button></div></dialog>;
}
