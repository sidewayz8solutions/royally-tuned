import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem, TiltCard } from '../components/animations';

export default function Pricing({ onSelect }: { onSelect?: () => void }) {
  const tiers = [
    { name: 'Free', price: '$0', period: '', desc: 'Explore the platform', features: ['View sample dashboard', 'Learn about royalties', 'Basic calculator'], popular: false },
    { name: 'Pro', price: '$35', period: '/month', desc: 'Everything you need', features: ['AI Statement Parser', 'Unlimited Track Management', 'Complete Registration Hub', 'Streaming Calculator', 'Split Sheet Generator', 'PRO & MLC Guides', 'SoundExchange Setup', 'Priority Support'], popular: true },
  ];

  return (
    <div className="min-h-screen text-white py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <FadeInOnScroll className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-white/60">One plan. Everything included. No hidden fees.</p>
        </FadeInOnScroll>

        {/* Pricing Cards */}
        <StaggerContainer className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {tiers.map((t) => (
            <StaggerItem key={t.name}>
              <TiltCard className="h-full">
                <div className={`glass-card rounded-3xl p-8 h-full border ${t.popular ? 'border-purple-500' : 'border-white/10'} relative overflow-hidden`}>
                  {t.popular && (
                    <>
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
                    <motion.span className="absolute -top-1 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold px-4 py-1.5 rounded-full" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>POPULAR</motion.span>
                    </>
                  )}
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className={`w-5 h-5 ${t.popular ? 'text-purple-400' : 'text-white/40'}`} />
                      <h3 className="text-xl font-bold">{t.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-bold">{t.price}</span>
                      {t.period && <span className="text-white/50">{t.period}</span>}
                    </div>
                    <p className="text-white/50 mb-6">{t.desc}</p>
                    <ul className="space-y-3 mb-8">
                      {t.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3"><Check className={`w-5 h-5 shrink-0 ${t.popular ? 'text-emerald-400' : 'text-white/40'}`} /><span className="text-white/80">{f}</span></li>
                      ))}
                    </ul>
                    <Link to="/signup" onClick={onSelect} className={`block text-center w-full px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${t.popular ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-500/30' : 'bg-white/10 hover:bg-white/20'}`}>
                      {t.popular ? 'Start Pro' : 'Get Started'}
                    </Link>
                  </div>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* FAQ */}
        <FadeInOnScroll>
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <StaggerContainer className="grid md:grid-cols-2 gap-6">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes! No contracts, no commitments. Cancel your subscription anytime from your dashboard.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards through our secure payment processor, Stripe.' },
              { q: 'Is there a free trial?', a: 'You can explore basic features for free. Pro features unlock immediately after subscription.' },
              { q: 'Do you take a cut of my royalties?', a: 'Never. You keep 100% of your royalties. We only charge a flat monthly fee.' },
            ].map((faq, i) => (
              <StaggerItem key={i}><div className="glass-card rounded-xl p-6 border border-white/10">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-white/60 text-sm">{faq.a}</p>
              </div></StaggerItem>
            ))}
          </StaggerContainer>
        </FadeInOnScroll>
      </div>
    </div>
  );
}

