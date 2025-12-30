import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { hasSupabaseConfig } from '../lib/supabaseClient';
import { Mail, Loader2, Sparkles } from 'lucide-react';
import { FadeInOnScroll } from '../components/animations';

export default function Login() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setStatus(null);
    const res = await signInWithEmail(email);
    setLoading(false);
    if (!res.ok) setError(res.error || 'Failed to send magic link');
    else setStatus('Check your email for the login link.');
  };

  return (
    <div className="min-h-screen text-white py-16 px-4">
      <div className="max-w-md mx-auto">
        <FadeInOnScroll>
          <div className="glass-card rounded-3xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 mx-auto bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </motion.div>
              <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
              <p className="text-white/50">Sign in to your account</p>
            </div>

            {!hasSupabaseConfig() && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none transition-colors" />
                </div>
              </div>

              <motion.button type="submit" disabled={loading} className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50" whileTap={{ scale: 0.98 }}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send Magic Link'}
              </motion.button>
            </form>

            {status && <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">{status}</div>}
            {error && <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>}

            <p className="text-center text-sm text-white/50 mt-6">Don't have an account? <Link to="/signup" className="text-purple-400 hover:text-purple-300">Sign up</Link></p>
          </div>
        </FadeInOnScroll>
      </div>
    </div>
  );
}

