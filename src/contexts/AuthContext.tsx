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

	// Verify subscription with backend API (checks Stripe and updates profile)
	const verifySubscriptionWithAPI = useCallback(async (userId: string): Promise<string | null> => {
		try {
			const response = await fetch('/api/verify-subscription', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId }),
			});
			if (response.ok) {
				const data = await response.json();
				console.log('Subscription verified via API:', data);
				return data.status || null;
			}
		} catch (e) {
			console.warn('Failed to verify subscription via API:', e);
		}
		return null;
	}, []);

	// Fetch subscription status from profiles table (source of truth)
	// If profile doesn't exist or status is null, verify with backend API
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const fetchSubscriptionFromDB = useCallback(async (userId: string, _userEmail?: string) => {
		if (!supabase) return null;
		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('subscription_status')
				.eq('id', userId)
				.single();

			if (error) {
				// If profile doesn't exist (PGRST116 = no rows), verify with API
				if (error.code === 'PGRST116') {
					console.log('Profile not found, verifying with API...');
					return await verifySubscriptionWithAPI(userId);
				} else {
					console.warn('Could not fetch subscription from profiles:', error.message);
				}
				return null;
			}

			// If status is null or free, verify with API in case Stripe has updated
			const status = data?.subscription_status;
			if (!status || status === 'free') {
				console.log('Status is', status, '- verifying with API...');
				const apiStatus = await verifySubscriptionWithAPI(userId);
				if (apiStatus && apiStatus !== 'free') {
					return apiStatus;
				}
			}

			return status || null;
		} catch (e) {
			console.warn('Failed to fetch subscription:', e);
			return null;
		}
	}, [verifySubscriptionWithAPI]);

	const refreshUser = useCallback(async () => {
		if (!supabase || !user) return;
		// Fetch fresh subscription status from database (pass email for profile creation fallback)
		const status = await fetchSubscriptionFromDB(user.id, user.email || undefined);
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
				// Pass email for profile creation fallback if profile doesn't exist
				if (data.user) {
					fetchSubscriptionFromDB(data.user.id, data.user.email || undefined).then(status => {
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
				const status = await fetchSubscriptionFromDB(session.user.id, session.user.email || undefined);
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

