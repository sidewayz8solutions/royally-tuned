import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
}

// Grace period key for just-paid users (webhook may be delayed)
const JUST_PAID_KEY = 'royally_tuned_just_paid';
const JUST_PAID_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading, subscriptionStatus } = useAuth();
  const location = useLocation();
  const [loadingTooLong, setLoadingTooLong] = useState(false);

  // Check if user just completed checkout from URL
  const searchParams = new URLSearchParams(location.search);
  const checkoutSuccess = searchParams.get('checkout') === 'success';

  // Store checkout success timestamp for grace period
  useEffect(() => {
    if (checkoutSuccess) {
      localStorage.setItem(JUST_PAID_KEY, Date.now().toString());
    }
  }, [checkoutSuccess]);

  // Safety timeout: if loading exceeds 5s, show fallback UI
  useEffect(() => {
    if (!loading) {
      setLoadingTooLong(false);
      return;
    }
    const t = setTimeout(() => setLoadingTooLong(true), 5000);
    return () => clearTimeout(t);
  }, [loading]);

  // Check if within grace period (just paid but webhook may not have arrived)
  const isWithinGracePeriod = (): boolean => {
    const stored = localStorage.getItem(JUST_PAID_KEY);
    if (!stored) return false;
    const timestamp = parseInt(stored, 10);
    if (isNaN(timestamp)) return false;
    return Date.now() - timestamp < JUST_PAID_EXPIRY_MS;
  };

  // Determine if user has paid subscription
  // Accept: 'pro', 'active', 'trialing', 'enterprise'
  const PAID_STATUSES = ['pro', 'active', 'trialing', 'enterprise'];
  const isPaid = subscriptionStatus ? PAID_STATUSES.includes(subscriptionStatus) : false;
  const justPaid = checkoutSuccess || isWithinGracePeriod();

  // Clear grace period once we have confirmed paid status
  useEffect(() => {
    if (isPaid) {
      localStorage.removeItem(JUST_PAID_KEY);
    }
  }, [isPaid]);

  // Debug logging (only in dev)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[RequireAuth]', {
        userId: user?.id,
        subscriptionStatus,
        isPaid,
        justPaid,
        loading,
        path: location.pathname,
      });
    }
  }, [user, subscriptionStatus, isPaid, justPaid, loading, location.pathname]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-4 border-royal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60">Loading your account...</p>
          {loadingTooLong && (
            <div className="text-center text-white/60 text-sm space-y-3 max-w-sm">
              <p>This is taking longer than expected.</p>
              <button
                className="btn-primary px-6 py-2"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // No active subscription and not in grace period → go to pricing
  if (!isPaid && !justPaid) {
    return <Navigate to="/pricing" replace />;
  }

  // User is authenticated and has paid (or just paid) → render children
  return <>{children}</>;
}

