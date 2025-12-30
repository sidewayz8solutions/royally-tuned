import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextValue {
	user: User | null;
	loading: boolean;
	subscriptionStatus: string | null;
	signUp: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
	signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
	signOut: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [dbSubscriptionStatus, setDbSubscriptionStatus] = useState<string | null>(null);

	// Fetch subscription status from profiles table (source of truth)
	const fetchSubscriptionFromDB = useCallback(async (userId: string) => {
		if (!supabase) return null;
		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('subscription_status')
				.eq('id', userId)
				.single();
			if (error) {
				console.warn('Could not fetch subscription from profiles:', error.message);
				return null;
			}
			return data?.subscription_status || null;
		} catch (e) {
			console.warn('Failed to fetch subscription:', e);
			return null;
		}
	}, []);

	const refreshUser = useCallback(async () => {
		if (!supabase || !user) return;
		// Fetch fresh subscription status from database
		const status = await fetchSubscriptionFromDB(user.id);
		if (status) {
			setDbSubscriptionStatus(status);
		}
		// Also try to refresh the session
		const { data } = await supabase.auth.refreshSession();
		if (data.user) {
			setUser(data.user);
		}
	}, [user, fetchSubscriptionFromDB]);

	useEffect(() => {
		if (!supabase) {
			setLoading(false);
			return;
		}
		let isMounted = true;
		// Failsafe: never stay in loading state forever
		const loadingTimeout = setTimeout(() => {
			if (isMounted) setLoading(false);
		}, 3000);

		const init = async () => {
			try {
				const { data } = await supabase!.auth.getUser();
				if (!isMounted) return;
				setUser(data.user ?? null);
				// Also fetch DB subscription status (don't block on failure)
				if (data.user) {
					fetchSubscriptionFromDB(data.user.id).then(status => {
						if (status && isMounted) setDbSubscriptionStatus(status);
					});
				}
			} catch (e) {
				console.warn('Init auth load failed', e);
			} finally {
				if (isMounted) setLoading(false);
			}
		};
		init();

		const { data: sub } = supabase!.auth.onAuthStateChange(async (_, session) => {
			setUser(session?.user ?? null);
			if (session?.user) {
				const status = await fetchSubscriptionFromDB(session.user.id);
				if (status) setDbSubscriptionStatus(status);
			} else {
				setDbSubscriptionStatus(null);
			}
		});
		return () => {
			isMounted = false;
			sub.subscription?.unsubscribe();
			clearTimeout(loadingTimeout);
		};
	}, [fetchSubscriptionFromDB]);

	// Combine app_metadata status with DB status - DB takes priority
	const subscriptionStatus = useMemo(() => {
		// First check DB status (most up-to-date)
		if (dbSubscriptionStatus) return dbSubscriptionStatus;
		// Fallback to app_metadata
		const meta = (user?.app_metadata || {}) as Record<string, unknown>;
		return (meta['subscription_status'] as string) || null;
	}, [user, dbSubscriptionStatus]);

	// Standard email + password sign-up.
	// Note: if your Supabase project requires email confirmation,
	// the user will need to confirm their email before they can log in.
	const signUp = async (email: string, password: string) => {
		try {
			if (!supabase) return { ok: false, error: 'Auth not configured' };

			const { error } = await supabase.auth.signUp({
				email,
				password,
			});
			if (error) return { ok: false, error: error.message };
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

	const value: AuthContextValue = { user, loading, subscriptionStatus, signUp, signIn, signOut, refreshUser };
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}

