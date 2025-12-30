import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, FileText, Download, TrendingUp, Music, Radio, Disc } from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem, TiltCard } from '../components/animations';

// Royalty rates (approximate industry averages)
const RATES = {
  performance: 0.0015, // PRO royalty per stream
  mechanical: 0.0009,  // Mechanical royalty per stream
  neighboring: 0.0008, // SoundExchange per stream
};

export default function Toolkit() {
  const [streams, setStreams] = useState(100000);
  const [activeTab, setActiveTab] = useState<'calculator' | 'forms'>('calculator');

  const earnings = {
    performance: streams * RATES.performance,
    mechanical: streams * RATES.mechanical,
    neighboring: streams * RATES.neighboring,
    total: streams * (RATES.performance + RATES.mechanical + RATES.neighboring),
  };

  const forms = [
    { name: 'BMI Songwriter Application', type: 'PRO', status: 'ready' },
    { name: 'ASCAP Member Application', type: 'PRO', status: 'ready' },
    { name: 'MLC Registration Form', type: 'Mechanical', status: 'ready' },
    { name: 'SoundExchange Artist Form', type: 'Neighboring', status: 'ready' },
    { name: 'Copyright Registration (PA)', type: 'Copyright', status: 'ready' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6">
      <FadeInOnScroll>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Toolkit</h1>
          <p className="text-white/50">Tools to calculate earnings and manage registrations</p>
        </div>
      </FadeInOnScroll>

      {/* Tabs */}
      <FadeInOnScroll delay={0.1}>
        <div className="flex gap-2 mb-8">
          {[
            { id: 'calculator', label: 'Stream Calculator', icon: Calculator },
            { id: 'forms', label: 'Forms Hub', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'calculator' | 'forms')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-royal-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </FadeInOnScroll>

      {activeTab === 'calculator' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Input */}
          <FadeInOnScroll delay={0.2}>
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Calculate Your Earnings</h2>

              <div className="mb-8">
                <label className="block text-sm text-white/70 mb-4">Monthly Streams</label>
                <input
                  type="range"
                  min="1000"
                  max="10000000"
                  step="1000"
                  value={streams}
                  onChange={(e) => setStreams(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-white/40">1K</span>
                  <span className="text-2xl font-bold text-gold-400">{(streams / 1000).toLocaleString()}K</span>
                  <span className="text-xs text-white/40">10M</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Estimated Monthly Total</span>
                </div>
                <span className="text-4xl font-bold text-white">${earnings.total.toFixed(2)}</span>
              </div>
            </div>
          </FadeInOnScroll>

          {/* Breakdown */}
          <FadeInOnScroll delay={0.3}>
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Earnings Breakdown</h2>

              <div className="space-y-4">
                {[
                  { label: 'Performance Royalties', value: earnings.performance, icon: Music, desc: 'From PROs (BMI, ASCAP, SESAC)' },
                  { label: 'Mechanical Royalties', value: earnings.mechanical, icon: Disc, desc: 'From The MLC' },
                  { label: 'Neighboring Rights', value: earnings.neighboring, icon: Radio, desc: 'From SoundExchange' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-royal-600/20 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-royal-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-xs text-white/40">{item.desc}</p>
                    </div>
                    <span className="text-green-400 font-semibold">${item.value.toFixed(2)}</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-xs text-white/30 mt-6">
                * Estimates based on industry average rates. Actual rates vary by platform, territory, and agreement.
              </p>
            </div>
          </FadeInOnScroll>
        </div>
      )}

      {activeTab === 'forms' && (
        <StaggerContainer className="grid md:grid-cols-2 gap-4">
          {forms.map((form, i) => (
            <StaggerItem key={i}>
              <TiltCard>
                <div className="glass-card rounded-xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-royal-600/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-royal-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{form.name}</h3>
                    <p className="text-sm text-white/50">{form.type}</p>
                  </div>
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}