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
        // Supabase email confirmations may return either:
        // - PKCE flow: ?code=... (needs exchangeCodeForSession)
        // - Implicit flow: #access_token=... (getSession will pick this up)
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Auth callback exchange error:', exchangeError);
            setError(exchangeError.message);
            return;
          }
          // Clean the URL (remove code) to avoid repeated exchanges on refresh
          window.history.replaceState({}, document.title, url.pathname);
        }

        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          return;
        }

        if (data.session) {
          // Successfully authenticated
          const sub = data.session.user?.app_metadata?.subscription_status;
          const isPaid = sub === 'pro' || sub === 'active';
          navigate(isPaid ? '/app' : '/pricing', { replace: true });
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
              const isPaid = status === 'pro' || status === 'active';
              navigate(isPaid ? '/app' : '/pricing', { replace: true });
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

