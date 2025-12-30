import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function CreateAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [sessionData, setSessionData] = useState<{ customerId: string; email: string } | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setError('Invalid session. Please complete payment first.');
        setVerifying(false);
        return;
      }

      try {
        const res = await fetch('/api/verify-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else if (data.customerId) {
          setSessionData({ customerId: data.customerId, email: data.email || '' });
          if (data.email) setEmail(data.email);
        }
      } catch {
        setError('Failed to verify payment session.');
      }
      setVerifying(false);
    };

    verifySession();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!supabase) {
      setError('Authentication not configured');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            stripe_customer_id: sessionData?.customerId,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Link Stripe customer to user via API
      if (data.user && sessionData?.customerId) {
        await fetch('/api/link-stripe-customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            customerId: sessionData.customerId,
          }),
        });
      }

      // Redirect to app
      navigate('/app', { replace: true });
    } catch {
      setError('An unexpected error occurred');
    }
    setLoading(false);
  };

  if (verifying) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Loader2 className="w-12 h-12 text-royal-500 animate-spin" />
          <p className="text-white/60">Verifying your payment...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !sessionData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate('/pricing')} className="btn-primary">
            Go to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-3xl p-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600/30 to-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-white/60">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="At least 6 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={loading} className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Create Account <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
