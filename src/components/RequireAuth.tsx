import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
}

// Key for localStorage to track recent payment
const JUST_PAID_KEY = 'royally_tuned_just_paid';
const JUST_PAID_EXPIRY = 60000; // 60 seconds grace period after payment

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading, subscriptionStatus } = useAuth();
  const location = useLocation();

  // Check if user just completed checkout from URL
  const searchParams = new URLSearchParams(location.search);
  const checkoutSuccess = searchParams.get('checkout') === 'success';

  // Store checkout success in localStorage for persistence across page navigations
  useEffect(() => {
    if (checkoutSuccess) {
      localStorage.setItem(JUST_PAID_KEY, Date.now().toString());
    }
  }, [checkoutSuccess]);

  // Check if user recently paid (within grace period)
  const justPaid = (() => {
    if (checkoutSuccess) return true;
    const stored = localStorage.getItem(JUST_PAID_KEY);
    if (stored) {
      const timestamp = parseInt(stored, 10);
      if (Date.now() - timestamp < JUST_PAID_EXPIRY) {
        return true;
      } else {
        // Expired, clean up
        localStorage.removeItem(JUST_PAID_KEY);
      }
    }
    return false;
  })();

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
        </motion.div>
      </div>
    );
  }

  // Not logged in - redirect to signup
  if (!user) {
    return <Navigate to="/signup" replace />;
  }

  // No active subscription - redirect to pricing
  // Also allow through if user just paid (grace period while webhook processes)
  const isPaid = subscriptionStatus === 'pro' || subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
  
  // If subscription is now valid, clear the justPaid flag
  if (isPaid) {
    localStorage.removeItem(JUST_PAID_KEY);
  }
  
  if (!isPaid && !justPaid) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}

