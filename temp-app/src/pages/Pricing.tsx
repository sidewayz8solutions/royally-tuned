import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';

export default function Pricing() {
  const features = [
    'AI Statement Parser',
    'Stream Calculator',
    'Track Manager',
    'Registration Hub',
    'PRO & MLC Registration Guides',
    'SoundExchange Setup',
    'Neighboring Rights',
    'Export & Analytics',
    'Priority Support',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            One plan. <span className="bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">Everything included.</span>
          </h1>
          <p className="text-xl text-white/60">Simple pricing. No hidden fees. Cancel anytime.</p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-16">
          <div className="glass-card rounded-3xl p-8 border-2 border-purple-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-yellow-500 text-black text-xs font-bold px-4 py-1 rounded-bl-xl">
              BEST VALUE
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">Pro</h2>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-extrabold">$35</span>
              <span className="text-white/60">/month</span>
            </div>
            <p className="text-white/60 mb-6">Full access to all features</p>

            <ul className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              to="/signup" 
              className="block w-full text-center px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-yellow-500 text-black font-bold text-lg hover:opacity-90 hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-purple-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          {[
            { q: 'Can I cancel anytime?', a: 'Yes! No contracts, no commitments. Cancel your subscription anytime from your dashboard.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit cards through our secure payment processor, Stripe.' },
            { q: 'Is there a free trial?', a: 'We offer a free royalty audit so you can see the value before subscribing.' },
            { q: 'Do you take a cut of my royalties?', a: 'Never. You keep 100% of your royalties. We only charge a flat monthly fee.' },
          ].map((faq, i) => (
            <div key={i} className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-white/60">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

