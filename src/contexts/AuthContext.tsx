import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextValue {
	user: User | null;
	loading: boolean;
	subscriptionStatus: string | null;
	signUp: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
	signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
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

	// Standard email + password sign-up.
	// After creating the user, we immediately sign them in so that
	// hitting /pricing can go straight into Stripe Checkout.
	const signUp = async (email: string, password: string) => {
		try {
			if (!supabase) return { ok: false, error: 'Auth not configured' };

			const { error: signUpError } = await supabase.auth.signUp({
				email,
				password,
			});
			if (signUpError) return { ok: false, error: signUpError.message };

			// Try to sign them in right away so they have a session.
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (signInError) return { ok: false, error: signInError.message };

			return { ok: true };
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
		}
	};

	// Standard email + password login
	const signIn = async (email: string, password: string) => {
		try {
			if (!supabase) return { ok: false, error: 'Auth not configured' };

			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
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

	const value: AuthContextValue = { user, loading, subscriptionStatus, signUp, signIn, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

