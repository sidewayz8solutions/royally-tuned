import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, Eye, EyeOff, Check, Sparkles } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '../lib/supabaseClient';
import { FadeInOnScroll } from '../components/animations';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasSupabaseConfig()) { setError('Authentication is not configured.'); return; }
    setLoading(true); setError(null);
    try {
      const { error } = await supabase!.auth.signUp({ email, password });
      if (error) throw error;
      setSuccess(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'Sign up failed'); }
    finally { setLoading(false); }
  };

  const features = ['AI Statement Parser', 'Track Management', 'Registration Hub', 'Streaming Calculator', 'Split Sheet Generator', 'Priority Support'];

  return (
    <div className="min-h-screen text-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Value Prop */}
          <FadeInOnScroll>
            <span className="inline-block px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">Pro Membership</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Start Getting <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Every Dollar</span> You're Owed</h1>
            <p className="text-xl text-white/60 mb-8">Join thousands of musicians who are finally taking control of their royalties.</p>
            <div className="glass-card rounded-2xl p-6 mb-8 border border-purple-500/20">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-purple-400">$35</span><span className="text-white/50">/month</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {features.map((f, i) => (<div key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-emerald-400 shrink-0" /><span className="text-white/70">{f}</span></div>))}
              </div>
            </div>
            <p className="text-white/40 text-sm">Cancel anytime. No hidden fees. You keep 100% of your royalties.</p>
          </FadeInOnScroll>

          {/* Right - Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <div className="glass-card rounded-3xl p-8 border border-white/10">
              {success ? (
                <div className="text-center space-y-4 py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-emerald-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-emerald-400">Check your email!</h2>
                  <p className="text-white/60">We've sent a confirmation link. After confirming, you'll be redirected to complete your subscription.</p>
                  <Link to="/" className="inline-block mt-4 text-purple-400 hover:text-purple-300">← Back to Home</Link>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
                  <p className="text-white/50 mb-6">Then complete payment to unlock all features</p>
                  <motion.form onSubmit={submit} className="space-y-5">
                    {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none transition-colors" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                      </div>
                    </div>
                    <motion.button type="submit" disabled={loading} className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50" whileTap={{ scale: 0.98 }}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account & Continue'}
                    </motion.button>
                    <p className="text-center text-sm text-white/50">Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300">Log in</Link></p>
                    <p className="text-center text-xs text-white/30">By signing up, you agree to our <Link to="/terms" className="text-purple-400 hover:underline">Terms</Link> and <Link to="/privacy" className="text-purple-400 hover:underline">Privacy Policy</Link></p>
                  </motion.form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

