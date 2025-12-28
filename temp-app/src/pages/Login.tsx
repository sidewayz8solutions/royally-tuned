import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hasSupabaseConfig } from '../lib/supabaseClient';
import { Mail, LogIn } from 'lucide-react';

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
    <div className="glass-card rounded-2xl p-6 max-w-md">
      {!hasSupabaseConfig() && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <LogIn className="w-5 h-5 text-purple-400" />
        Sign in
      </h3>
      <p className="text-sm text-gray-400 mb-4">Enter your email to receive a magic link.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Email</label>
          <div className="flex items-center gap-2 bg-black/50 border border-purple-700/20 rounded-xl px-3">
            <Mail className="w-4 h-4 text-gray-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent py-3 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60"
        >
          {loading ? 'Sending...' : 'Send Magic Link'}
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
    </div>
  );
}

