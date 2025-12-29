import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '../lib/supabaseClient';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabaseConfig()) {
      setError('Authentication is not configured. Please contact support.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase!.auth.signUp({ email, password });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-center mb-2">Create Your Account</h1>
            <p className="text-white/60 text-center mb-8">Start getting every dollar you're owed</p>

            {success ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-3xl">✓</span>
                </div>
                <h2 className="text-xl font-semibold text-green-400">Check your email!</h2>
                <p className="text-white/60">We've sent you a confirmation link to complete your sign up.</p>
                <Link to="/" className="inline-block mt-4 text-purple-400 hover:text-purple-300 cursor-pointer">
                  ← Back to Home
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-yellow-500 text-black font-semibold hover:opacity-90 hover:scale-[1.02] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                </button>

                <p className="text-center text-sm text-white/60">
                  Already have an account?{' '}
                  <Link to="/login" className="text-purple-400 hover:text-purple-300 cursor-pointer">
                    Log in
                  </Link>
                </p>

                <p className="text-center text-xs text-white/40">
                  By signing up, you agree to our{' '}
                  <Link to="/terms" className="text-purple-400 hover:underline cursor-pointer">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-purple-400 hover:underline cursor-pointer">Privacy Policy</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

