import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown, ArrowRight, DollarSign, FileText, BarChart3,
  CheckCircle, Music, Shield, Zap, TrendingUp, Users, Lock
} from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem, Parallax, Float, TiltCard } from '../components/animations';

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-royal-600/20 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-500/15 rounded-full blur-[100px]"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Hero Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <Float y={8}>
              <img
                src="/logo2.png"
                alt="Royally Tuned"
                className="h-64 md:h-88 w-auto mx-auto drop-shadow-[0_0_40px_rgba(124,58,237,0.5)]"
              />
            </Float>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Get Paid
            <span className="block gradient-text-accent">What You're Owed</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-white/60 max-w-2xl mx-auto mb-10"
          >
            Stop leaving money on the table. Royally Tuned simplifies royalty registrations,
            tracks your earnings, and ensures you capture 100% of what you've earned.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/signup"
              className="group flex items-center gap-2 btn-primary text-lg px-8 py-4"
            >
              Start for $35/month
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="text-white/60 hover:text-white transition-colors"
            >
              Learn how it works →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <FadeInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                The <span className="text-crimson-500">Problem</span>
              </h2>
              <p className="text-xl text-white/50 max-w-2xl mx-auto">
                Musicians are losing thousands every year to a broken system
              </p>
            </div>
          </FadeInOnScroll>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: 'Complex Registrations', desc: 'PROs, MLC, SoundExchange, distributors—each with different forms and requirements.' },
              { icon: Users, title: 'Fragmented Platforms', desc: 'Your royalties are scattered across dozens of organizations with no unified view.' },
              { icon: DollarSign, title: 'Lost Revenue', desc: 'Billions in royalties go unclaimed each year because artists miss critical registrations.' },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <TiltCard>
                  <div className="glass-card rounded-2xl p-8 h-full">
                    <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center mb-6">
                      <item.icon className="w-7 h-7 text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                    <p className="text-white/50">{item.desc}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-royal-950/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <FadeInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                The <span className="gradient-text">Solution</span>
              </h2>
              <p className="text-xl text-white/50 max-w-2xl mx-auto">
                One platform to manage all your royalty registrations
              </p>
            </div>
          </FadeInOnScroll>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeInOnScroll delay={0.2}>
              <div className="space-y-8">
                {[
                  { icon: Zap, title: 'One-Time Data Entry', desc: 'Enter your info once. We auto-fill every form.' },
                  { icon: FileText, title: 'Smart Form Parsing', desc: 'Upload photos of forms—we extract and populate the data.' },
                  { icon: Shield, title: 'Centralized Management', desc: 'Track all registrations, deadlines, and earnings in one place.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-royal-600/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-royal-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-white/50">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeInOnScroll>

            <Parallax offset={30}>
              <FadeInOnScroll delay={0.4}>
                <div className="glass-card rounded-3xl p-8 glow-purple">
                  <div className="space-y-4">
                    {['PRO Registration', 'SoundExchange', 'MLC Registration', 'Distributor Setup'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">{item}</span>
                        <span className="ml-auto text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">Complete</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInOnScroll>
            </Parallax>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                What You <span className="gradient-text-yellow">Get</span>
              </h2>
              <p className="text-xl text-white/50 max-w-2xl mx-auto">
                Everything you need to take control of your royalties
              </p>
            </div>
          </FadeInOnScroll>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: 'Dashboard', desc: 'Real-time earnings overview with beautiful charts and analytics', locked: true },
              { icon: Music, title: 'Track Management', desc: 'Add songs, manage metadata, and track per-song performance', locked: true },
              { icon: CheckCircle, title: 'Registration Checklist', desc: 'Step-by-step compliance guide with progress tracking', locked: true },
              { icon: TrendingUp, title: 'Stream Calculator', desc: 'Estimate earnings across all royalty types', locked: true },
              { icon: FileText, title: 'Forms Hub', desc: 'Pre-filled registration forms ready for submission', locked: true },
              { icon: Users, title: 'Profile & Settings', desc: 'Customize your experience and manage your account', locked: true },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <div className="glass-card rounded-2xl p-6 h-full relative overflow-hidden group">
                  <div className="absolute top-3 right-3">
                    <Lock className="w-4 h-4 text-gold-500" />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-royal-600/20 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-royal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/50">{item.desc}</p>
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-gold-500/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <FadeInOnScroll>
            <TiltCard>
              <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-royal-600/10 via-gold-500/10 to-royal-600/10"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 10, repeat: Infinity }}
                  style={{ backgroundSize: '200% 200%' }}
                />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/20 border border-gold-500/30 mb-6">
                    <Crown className="w-4 h-4 text-gold-400" />
                    <span className="text-sm text-gold-400">Simple Pricing</span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    <span className="text-6xl md:text-7xl gradient-text-yellow">$35</span>
                    <span className="text-xl text-white/50">/month</span>
                  </h2>

                  <p className="text-xl text-white/60 mb-8 max-w-lg mx-auto">
                    One price. Full access. No hidden fees.<br />
                    <span className="text-gold-400">Cancel anytime.</span>
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 text-left max-w-md mx-auto mb-8">
                    {[
                      'Unlimited track management',
                      'All royalty calculators',
                      'Form auto-fill & parsing',
                      'Registration checklist',
                      'Earnings dashboard',
                      'Priority support',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-white/70">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 btn-primary text-lg px-10 py-4"
                  >
                    Get Started Now
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <p className="mt-6 text-sm text-white/40">
                    The average musician loses $1,000+ yearly in unclaimed royalties.
                  </p>
                </div>
              </div>
            </TiltCard>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-royal-600/20 rounded-full blur-[150px]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeInOnScroll>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Your Music Deserves
              <span className="block gradient-text-accent">Every Dollar It Earns</span>
            </h2>

            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Stop letting royalties slip through the cracks. Join thousands of independent
              artists who've taken control of their earnings with Royally Tuned.
            </p>

            <Link
              to="/signup"
              className="group inline-flex items-center gap-3 btn-primary text-xl px-12 py-5"
            >
              <Crown className="w-6 h-6" />
              Start Claiming Your Royalties
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeInOnScroll>
        </div>
      </section>
    </div>
  );
}

