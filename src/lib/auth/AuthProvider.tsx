'use client';
import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getBrowserClient } from '@/lib/supabase/browser';
import { publicEnv as env } from '@/config/publicEnv';
import { trace } from '@/lib/logger';
interface AuthState { session: Session | null; loading: boolean; configured: boolean; }
export const AuthContext = createContext<AuthState>({ session: null, loading: true, configured: env.configured });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(env.configured);
  useEffect(() => {
    if (!env.configured) return;
    const t = trace('auth.session');
    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    const load = async () => {
      try {
        t.step(1, 2, 'cargar cliente de identidad bajo demanda');
        const client = await getBrowserClient();
        if (!client || !mounted) return;
        const { data: subscription } = client.auth.onAuthStateChange((_event, nextSession) => {
          if (mounted) { setSession(nextSession); setLoading(false); }
        });
        unsubscribe = () => subscription.subscription.unsubscribe();
        t.step(2, 2, 'restaurar sesión');
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        if (mounted) { setSession(data.session); setLoading(false); }
        t.ok();
      } catch (error) { t.fail(error); if (mounted) setLoading(false); }
    };
    void load();
    return () => { mounted = false; unsubscribe?.(); };
  }, []);
  return <AuthContext.Provider value={{ session, loading, configured: env.configured }}>{children}</AuthContext.Provider>;
}
