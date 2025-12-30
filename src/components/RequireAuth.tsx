import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading, subscriptionStatus } = useAuth();

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
  // We currently store subscription as a tier/status (e.g. 'free', 'pro', 'cancelled', ...)
  // Treat 'pro' as paid access.
  if (subscriptionStatus !== 'pro') {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}

