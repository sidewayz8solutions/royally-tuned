import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        setError('Auth not configured');
        return;
      }

      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          return;
        }

        if (data.session) {
          // Successfully authenticated
          const subscriptionStatus = data.session.user?.app_metadata?.subscription_status;

          if (subscriptionStatus === 'active') {
            // Existing subscriber → take them straight into the app
            navigate('/app', { replace: true });
          } else {
            // New or non-subscribed user → send to pricing (user clicks Pay)
            navigate('/pricing', { replace: true });
          }
        } else {
          // No session found - might still be processing
          // Wait a moment and check again
          setTimeout(async () => {
            if (!supabase) return;
            const { data: retryData, error: retryError } = await supabase.auth.getSession();
            if (retryError || !retryData.session) {
              setError('Unable to verify your email. Please try signing in again.');
              setTimeout(() => navigate('/signup', { replace: true }), 3000);
            } else {
              const status = retryData.session.user?.app_metadata?.subscription_status;
              navigate(status === 'active' ? '/app' : '/pricing', { replace: true });
            }
          }, 1000);
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-white/60">Redirecting to sign up...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-12 h-12 border-4 border-royal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/60">Verifying your email...</p>
      </motion.div>
    </div>
  );
}

