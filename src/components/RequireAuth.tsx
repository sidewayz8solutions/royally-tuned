import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useMemo } from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
}

// Keys for tracking payment state
const JUST_PAID_KEY = 'royally_tuned_just_paid';
const WAS_PREMIUM_KEY = 'royally_tuned_was_premium';
const JUST_PAID_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// Premium statuses
const PREMIUM_STATUSES = ['pro', 'active', 'trialing', 'enterprise'];
// Explicitly free/canceled statuses
const FREE_STATUSES = ['free', 'canceled', 'expired', 'unpaid'];

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading, subscriptionStatus } = useAuth();
  const location = useLocation();

  // Check if user just completed checkout from URL
  const searchParams = new URLSearchParams(location.search);
  const checkoutSuccess = searchParams.get('checkout') === 'success';

  // Store checkout success timestamp for grace period
  useEffect(() => {
    if (checkoutSuccess) {
      localStorage.setItem(JUST_PAID_KEY, Date.now().toString());
    }
  }, [checkoutSuccess]);

  // Check if within grace period
  const isWithinGracePeriod = useMemo(() => {
    const stored = localStorage.getItem(JUST_PAID_KEY);
    if (!stored) return false;
    const timestamp = parseInt(stored, 10);
    if (isNaN(timestamp)) return false;
    return Date.now() - timestamp < JUST_PAID_EXPIRY_MS;
  }, []);

  // Check subscription status
  const statusLower = subscriptionStatus?.toLowerCase() || '';
  const isPremium = PREMIUM_STATUSES.includes(statusLower);
  const isConfirmedFree = FREE_STATUSES.includes(statusLower);
  const justPaid = checkoutSuccess || isWithinGracePeriod;

  // Check if user was previously premium (for returning users with temp null status)
  const wasPreviouslyPremium = useMemo(() => {
    return localStorage.getItem(WAS_PREMIUM_KEY) === 'true';
  }, []);

  // Track premium status - remember when user becomes premium
  useEffect(() => {
    if (isPremium) {
      localStorage.setItem(WAS_PREMIUM_KEY, 'true');
      localStorage.removeItem(JUST_PAID_KEY);
    }
    // Clear premium flag if explicitly canceled/free
    if (isConfirmedFree) {
      localStorage.removeItem(WAS_PREMIUM_KEY);
    }
  }, [isPremium, isConfirmedFree]);

  // Minimal loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-royal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Allow access if:
  // 1. User has confirmed premium status, OR
  // 2. User just paid (grace period), OR
  // 3. User was previously premium AND status is currently unknown (null)
  const hasAccess = isPremium || justPaid || (wasPreviouslyPremium && !isConfirmedFree);

  if (!hasAccess) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}

