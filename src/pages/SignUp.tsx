import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Mail, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signInWithEmail(email);
    setLoading(false);

    if (result.ok) {
      setStep('sent');
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card rounded-3xl p-10"
        >
          {step === 'email' ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-royal-600/30 to-gold-500/20 flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-gold-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
                <p className="text-white/60">
                  Start claiming your royalties for just $35/month
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-royal-500 focus:ring-1 focus:ring-royal-500 transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-crimson-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="space-y-3 text-sm">
                  {['Full dashboard access', 'All royalty tools', 'Cancel anytime'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/60">
                      <CheckCircle className="w-4 h-4 text-crimson-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-white/40">
                By signing up, you agree to our{' '}
                <Link to="/terms" className="text-royal-400 hover:underline">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-royal-400 hover:underline">Privacy Policy</Link>
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-white/60 mb-6">
                We've sent a magic link to<br />
                <span className="text-white font-medium">{email}</span>
              </p>
              <p className="text-sm text-white/40">
                Click the link in your email to continue. Don't see it? Check your spam folder.
              </p>
              <button
                onClick={() => setStep('email')}
                className="mt-6 text-sm text-royal-400 hover:underline"
              >
                Use a different email
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

