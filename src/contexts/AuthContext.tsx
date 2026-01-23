import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextValue {
	user: User | null;
	loading: boolean;
	subscriptionStatus: string | null;
	signUp: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
	signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
	signInWithMagicLink: (email: string) => Promise<{ ok: boolean; error?: string }>;
	signOut: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Cache key for subscription status
const SUBSCRIPTION_CACHE_KEY = 'rt_sub_status';
const SUBSCRIPTION_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours - premium users stay premium

// Get cached subscription status
function getCachedSubscription(): string | null {
	try {
		const cached = localStorage.getItem(SUBSCRIPTION_CACHE_KEY);
		if (!cached) return null;
		const { status, timestamp } = JSON.parse(cached);
		if (Date.now() - timestamp > SUBSCRIPTION_CACHE_EXPIRY) {
			localStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
			return null;
		}
		return status;
	} catch {
		return null;
	}
}

// Set cached subscription status
function setCachedSubscription(status: string | null) {
	if (status) {
		localStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify({ status, timestamp: Date.now() }));
	} else {
		localStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
	}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	// Initialize with cached values for instant render
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [dbSubscriptionStatus, setDbSubscriptionStatus] = useState<string | null>(() => getCachedSubscription());

	// Verify subscription with backend API (checks Stripe and updates profile)
	const verifySubscriptionWithAPI = useCallback(async (userId: string): Promise<string | null> => {
		try {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

			const response = await fetch('/api/verify-subscription', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId }),
				signal: controller.signal,
			});
			clearTimeout(timeout);

			if (response.ok) {
				const data = await response.json();
				return data.status || null;
			}
		} catch (e) {
			// Silently fail - don't block on API errors
		}
		return null;
	}, []);

	// Fetch subscription status from profiles table - fast, no API call
	const fetchSubscriptionFromDB = useCallback(async (userId: string, forceAPICheck = false) => {
		if (!supabase) return null;
		try {
			const { data, error } = await supabase
				.from('profiles')
				.select('subscription_status')
				.eq('id', userId)
				.single();

			if (error) {
				// Only call API if forced and profile doesn't exist
				if (error.code === 'PGRST116' && forceAPICheck) {
					return await verifySubscriptionWithAPI(userId);
				}
				return null;
			}

			const status = data?.subscription_status;

			// Only call API if explicitly forced (after checkout)
			if (forceAPICheck && (!status || status === 'free')) {
				const apiStatus = await verifySubscriptionWithAPI(userId);
				if (apiStatus && apiStatus !== 'free') {
					setCachedSubscription(apiStatus);
					return apiStatus;
				}
			}

			if (status) setCachedSubscription(status);
			return status || null;
		} catch {
			return null;
		}
	}, [verifySubscriptionWithAPI]);

	const refreshUser = useCallback(async () => {
		if (!supabase || !user) return;
		const status = await fetchSubscriptionFromDB(user.id, true);
		if (status) setDbSubscriptionStatus(status);
		const { data } = await supabase.auth.refreshSession();
		if (data.user) setUser(data.user);
	}, [user, fetchSubscriptionFromDB]);

	useEffect(() => {
		if (!supabase) {
			setLoading(false);
			return;
		}
		let isMounted = true;

		const init = async () => {
			try {
				// Use getSession() - much faster than getUser() as it uses cached session
				const { data: { session } } = await supabase!.auth.getSession();
				if (!isMounted) return;

				setUser(session?.user ?? null);
				setLoading(false); // Set loading false IMMEDIATELY after getting session

				// Fetch subscription status in background (non-blocking)
				if (session?.user) {
					fetchSubscriptionFromDB(session.user.id).then(status => {
						if (status && isMounted) setDbSubscriptionStatus(status);
					});
				}
			} catch {
				if (isMounted) setLoading(false);
			}
		};
		init();

		const { data: sub } = supabase.auth.onAuthStateChange(async (_, session) => {
			setUser(session?.user ?? null);
			if (session?.user) {
				// Background fetch - don't await
				fetchSubscriptionFromDB(session.user.id).then(status => {
					if (status) setDbSubscriptionStatus(status);
				});
			} else {
				setDbSubscriptionStatus(null);
				setCachedSubscription(null);
			}
		});

		return () => {
			isMounted = false;
			sub.subscription?.unsubscribe();
		};
	}, [fetchSubscriptionFromDB]);

	// Combine cached/DB status with app_metadata
	const subscriptionStatus = useMemo(() => {
		if (dbSubscriptionStatus) return dbSubscriptionStatus;
		const meta = (user?.app_metadata || {}) as Record<string, unknown>;
		return (meta['subscription_status'] as string) || null;
	}, [user, dbSubscriptionStatus]);

		// Standard email + password sign-up.
		// Desired product flow: after signup, user should go to Login (not stay signed in).
		// NOTE: To truly have "No confirmation email", disable email confirmations in Supabase Dashboard
		// (Auth → Providers → Email → Confirm email = OFF). Code cannot override that setting.
	const signUp = async (email: string, password: string) => {
		try {
			if (!supabase) return { ok: false, error: 'Auth not configured' };

				// Explicit redirect target avoids relying on Supabase Auth "Site URL" defaults.
				// Make sure this URL is added to Supabase Auth Redirect URLs allow-list.
				const { error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						emailRedirectTo: `${window.location.origin}/auth/callback`,
					},
				});

				if (error) {
					const msg = error.message.toLowerCase();
					if (msg.includes('already registered') || msg.includes('already exists')) {
						return { ok: false, error: 'This email is already registered. Please log in instead.' };
					}
					// Supabase sometimes returns a generic 500 here when Auth is misconfigured
					// (hooks/email templates/captcha/site url). Provide a more actionable message.
					if ((error as any)?.status === 500) {
						return {
							ok: false,
							error:
								'Signup failed (Supabase Auth 500). This is usually caused by an Auth configuration issue (Hooks, Email Templates, Captcha, or missing/invalid Site URL / Redirect URLs). Please check Supabase Dashboard → Authentication settings and try again.',
						};
					}
					return { ok: false, error: error.message };
				}

				// If confirmations are OFF, Supabase will create a session. We don't want the user
				// to stay signed in after signup (we want them to log in and then go to payment).
				try {
					await supabase.auth.signOut();
				} catch {
					// ignore
				}

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

	// Magic link login - sends email with login link
	const signInWithMagicLink = async (email: string) => {
		try {
			if (!supabase) return { ok: false, error: 'Auth not configured' };

			const { error } = await supabase.auth.signInWithOtp({
				email,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback?type=magiclink`,
				},
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

	const value: AuthContextValue = { user, loading, subscriptionStatus, signUp, signIn, signInWithMagicLink, signOut, refreshUser };
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}

