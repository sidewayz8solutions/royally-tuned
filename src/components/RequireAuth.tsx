import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading, subscriptionStatus } = useAuth();
  const location = useLocation();

  // Check if user just completed checkout - allow them through while we refresh their data
  const searchParams = new URLSearchParams(location.search);
  const justPaid = searchParams.get('checkout') === 'success';

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
  // Supabase app_metadata.subscription_status mirrors Stripe status (e.g. 'trialing', 'active', 'canceled').
  // Treat active/trialing (and legacy 'pro') as paid access.
  // Also allow through if ?checkout=success - Dashboard will refresh user data
  const isPaid = subscriptionStatus === 'pro' || subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
  if (!isPaid && !justPaid) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}

