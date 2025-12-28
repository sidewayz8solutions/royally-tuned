import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  subscriptionStatus: string | null;
  signInWithEmail: (email: string) => Promise<{ error?: string; ok: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const init = async () => {
      const { data } = await supabase!.auth.getUser();
      setUser(data.user ?? null);
      setLoading(false);
    };
    init();

    const { data: sub } = supabase!.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription?.unsubscribe();
  }, []);

  const subscriptionStatus = useMemo(() => {
    const meta = (user?.app_metadata || {}) as Record<string, unknown>;
    return (meta['subscription_status'] as string) || null;
  }, [user]);

  const signInWithEmail = async (email: string) => {
    try {
      if (!supabase) return { ok: false, error: 'Auth not configured' };
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const value: AuthContextValue = { user, loading, subscriptionStatus, signInWithEmail, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

