import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, CheckCircle, ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react';
import { FadeInOnScroll, TiltCard, StaggerContainer, StaggerItem } from '../components/animations';
import { useAuth } from '../contexts/AuthContext';

export default function Pricing() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startCheckout = async () => {
    // If somehow we don't have a user yet, send them to signup first
    if (!user) {
      window.location.href = '/signup';
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError(data?.error || 'Unable to start checkout. Please try again.');
      }
    } catch {
      setError('Unable to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If we arrive from email confirmation with checkout=start, immediately kick off Stripe Checkout
  useEffect(() => {
    if (searchParams.get('checkout') === 'start' && user) {
      startCheckout();
    }
    // We intentionally only react to changes in the query param and user
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user]);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Simple, Transparent
              <span className="block gradient-text-yellow">Pricing</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              One plan. All features. No surprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-12 px-6">
        <div className="max-w-lg mx-auto">
          <FadeInOnScroll>
            <TiltCard>
              <div className="glass-card rounded-3xl p-10 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-royal-600/10 via-transparent to-gold-500/10"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
                
                  <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Crown className="w-8 h-8 text-gold-400" />
                    <span className="text-xl font-semibold text-white">Full Access</span>
                  </div>

                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-6xl font-bold gradient-text-yellow">$35</span>
                      <span className="text-xl text-white/50">/month</span>
                    </div>
                    <p className="text-white/50 mt-2">Cancel anytime. No contracts.</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[
                      'Unlimited track management',
                      'Dashboard with real-time analytics',
                      'Stream & royalty calculator',
                      'One-time data entry system',
                      'Form parsing from photos',
                      'Registration checklist & tracker',
                      'All pre-filled forms',
                      'Profile customization',
                      'Priority support',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={startCheckout}
                    className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? 'Redirecting to checkout...' : 'Get Started'}
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {error && (
                    <p className="mt-3 text-sm text-red-400 text-center">
                      {error}
                    </p>
                  )}
                </div>
              </div>
            </TiltCard>
          </FadeInOnScroll>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                The <span className="text-red-500">ROI</span> Is Clear
              </h2>
              <p className="text-xl text-white/50">
                $35/month vs. thousands in lost royalties
              </p>
            </div>
          </FadeInOnScroll>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, stat: '$1,000+', label: 'Average unclaimed royalties per artist annually' },
              { icon: Shield, stat: '6+', label: 'Organizations you need to register with' },
              { icon: BarChart3, stat: '28x', label: 'Return on your $35/month investment' },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <div className="glass-card rounded-2xl p-8 text-center">
                  <div className="w-14 h-14 rounded-xl bg-royal-600/20 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-red-500" />
                  </div>
                  <div className="text-3xl font-bold text-gold-400 mb-2">{item.stat}</div>
                  <p className="text-sm text-white/50">{item.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-royal-950/10 to-transparent">
        <div className="max-w-3xl mx-auto">
          <FadeInOnScroll>
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
          </FadeInOnScroll>

          <div className="space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. Cancel with one click from your profile. No questions asked.' },
              { q: 'Is there a free trial?', a: 'We don\'t offer a free trial, but you can cancel within the first 7 days for a full refund.' },
              { q: 'What payment methods do you accept?', a: 'All major credit cards through our secure Stripe integration.' },
              { q: 'Do you take a cut of my royalties?', a: 'Absolutely not. You keep 100% of your royalties. We just help you find and claim them.' },
            ].map((item, i) => (
              <FadeInOnScroll key={i} delay={i * 0.1}>
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.q}</h3>
                  <p className="text-white/60">{item.a}</p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

