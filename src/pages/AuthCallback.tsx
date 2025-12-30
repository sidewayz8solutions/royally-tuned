import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>('Verifying your email...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        setError('Auth not configured');
        return;
      }

      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        
        if (code) {
          // Exchange the code to complete email verification
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Auth callback exchange error:', exchangeError);
            setError(exchangeError.message);
            return;
          }
          
          // Sign out immediately - we want user to login with their password
          await supabase.auth.signOut();
          
          // Clean the URL
          window.history.replaceState({}, document.title, url.pathname);
          
          // Show success and redirect to login
          setMessage('Email verified! Redirecting to login...');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
          return;
        }

        // No code found - check if there's a hash fragment (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          // Implicit flow - sign out and redirect to login
          await supabase.auth.signOut();
          setMessage('Email verified! Redirecting to login...');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 2000);
          return;
        }

        // No auth params found
        setError('Invalid verification link. Please try signing up again.');
        setTimeout(() => navigate('/signup', { replace: true }), 3000);
        
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
          <p className="text-white/60">Redirecting...</p>
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
        <p className="text-white/60">{message}</p>
      </motion.div>
    </div>
  );
}

