'use client';
import { useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import { AuthDialog } from '@/components/auth/AuthDialog';
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const [open, setOpen] = useState(false);
  if (loading) return <div className="panel empty-state" role="status">Loading your session…</div>;
  if (session) return <>{children}</>;
  return <div className="panel empty-state"><h2>Your trader profile starts here</h2><p className="muted">Sign in to create listings and make offers.</p>
    <button className="btn btn-primary" onClick={() => setOpen(true)}>Sign in to trade</button><AuthDialog open={open} onClose={() => setOpen(false)}/></div>;
}
