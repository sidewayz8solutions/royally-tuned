import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
}

// Keys for localStorage to track payment state
const JUST_PAID_KEY = 'royally_tuned_just_paid';
const LAST_KNOWN_PAID_KEY = 'royally_tuned_last_known_paid';
const JUST_PAID_EXPIRY = 5 * 60 * 1000; // 5 minutes grace period after payment/webhook delay

// Optional env flag to bypass subscription gating for debugging.
// Set VITE_BYPASS_SUBSCRIPTION_GUARD="true" to allow any logged-in user
// through RequireAuth regardless of subscription status.
const BYPASS_SUBSCRIPTION_GUARD = import.meta.env.VITE_BYPASS_SUBSCRIPTION_GUARD === 'true';

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading, subscriptionStatus } = useAuth();
  const location = useLocation();
  const [justPaid, setJustPaid] = useState(false);
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  // Check if user just completed checkout from URL
  const searchParams = new URLSearchParams(location.search);
  const checkoutSuccess = searchParams.get('checkout') === 'success';

  // Store checkout success in localStorage for persistence across page navigations
  useEffect(() => {
    if (checkoutSuccess) {
      localStorage.setItem(JUST_PAID_KEY, Date.now().toString());
    }
  }, [checkoutSuccess]);

  // Safety: if loading exceeds 4s, surface a fallback UI so users aren't stuck on a spinner
  useEffect(() => {
    if (!loading) {
      setLoadingTooLong(false);
      return;
    }
    const t = setTimeout(() => setLoadingTooLong(true), 4000);
    return () => clearTimeout(t);
  }, [loading]);

  // Check if user recently paid (within grace period)
  useEffect(() => {
    if (checkoutSuccess) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setJustPaid(true);
      return;
    }
    
    const stored = localStorage.getItem(JUST_PAID_KEY);
    if (stored) {
      const timestamp = parseInt(stored, 10);
      if (Date.now() - timestamp < JUST_PAID_EXPIRY) {
        setJustPaid(true);
      } else {
        // Expired, clean up
        localStorage.removeItem(JUST_PAID_KEY);
        setJustPaid(false);
      }
    } else {
      setJustPaid(false);
    }
  }, [checkoutSuccess]);

  // Normalize paid statuses
  const paidStatuses = new Set(['pro', 'active', 'trialing', 'enterprise']);
  const isPaid = subscriptionStatus ? paidStatuses.has(subscriptionStatus) : false;

  // Expose auth/debug info globally and optionally log for troubleshooting.
  if (typeof window !== 'undefined') {
    const debugPayload = {
      userId: user?.id ?? null,
      subscriptionStatus,
      isPaid,
      bypassSubscription: BYPASS_SUBSCRIPTION_GUARD,
      justPaid,
      loading,
      path: location.pathname + location.search,
      lastKnownPaid: window.localStorage.getItem(LAST_KNOWN_PAID_KEY) === 'true',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-console
    (window as any).__RT_AUTH_DEBUG__ = debugPayload;
    // eslint-disable-next-line no-console
    console.debug('[RequireAuth]', debugPayload);
  }

  // Persist last known paid to survive transient auth jitter
  if (isPaid) {
    localStorage.setItem(LAST_KNOWN_PAID_KEY, 'true');
    localStorage.removeItem(JUST_PAID_KEY);
  }
  const lastKnownPaid = localStorage.getItem(LAST_KNOWN_PAID_KEY) === 'true';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-4 border-royal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60">Loading...</p>
          {loadingTooLong && (
            <div className="text-center text-white/60 text-sm space-y-3 max-w-sm">
              <p>Auth is taking longer than expected.</p>
              <div className="flex items-center gap-2 justify-center flex-wrap">
                <button
                  className="btn-primary px-4 py-2"
                  onClick={() => {
                    // Allow a manual retry of auth
                    window.location.reload();
                  }}
                >
                  Retry
                </button>
                <button
                  className="bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10"
                  onClick={() => {
                    // If they just paid or have last known paid, let them through
                    localStorage.setItem(LAST_KNOWN_PAID_KEY, 'true');
                    setLoadingTooLong(false);
                  }}
                >
                  Continue anyway
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Not logged in - redirect to signup
  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  // No active subscription - redirect to pricing unless just paid or cached paid
  // or we explicitly bypass the guard via env var (useful for debugging).
  if (!BYPASS_SUBSCRIPTION_GUARD && !isPaid && !justPaid && !lastKnownPaid) {
    return <Navigate to="/pricing" replace />;
  }

  const showOverlay = typeof window !== 'undefined' && window.localStorage.getItem('rt_debug_overlay') === '1';

  return (
    <>
      {showOverlay && (
        <div className="fixed bottom-4 left-4 z-[9999] rounded bg-black/80 px-3 py-2 text-xs text-white/80">
          <div className="font-semibold mb-1">Auth Debug</div>
          <div>user: {user?.id ?? 'null'}</div>
          <div>status: {subscriptionStatus ?? 'null'}</div>
          <div>paid: {String(isPaid)} / lastKnownPaid: {String(lastKnownPaid)}</div>
          <div>bypass: {String(BYPASS_SUBSCRIPTION_GUARD)} / justPaid: {String(justPaid)}</div>
        </div>
      )}
      {children}
    </>
  );
}

