import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasSupabaseConfig } from '../lib/supabaseClient';
import { Mail, Loader2 } from 'lucide-react';

export default function Login() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);
    const res = await signInWithEmail(email);
    setLoading(false);
    if (!res.ok) setError(res.error || 'Failed to send magic link');
    else setStatus('Check your email for the login link.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
            <p className="text-white/60 text-center mb-8">Sign in to your account</p>

            {!hasSupabaseConfig() && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-yellow-500 text-black font-semibold hover:opacity-90 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Magic Link'}
              </button>
            </form>

            {status && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
                {status}
              </div>
            )}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            <p className="text-center text-sm text-white/60 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-400 hover:text-purple-300 cursor-pointer">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

