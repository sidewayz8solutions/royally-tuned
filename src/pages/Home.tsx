import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown, ArrowRight, DollarSign, FileText, BarChart3,
  CheckCircle, Music, Shield, Zap, TrendingUp, Users, Lock,
  ExternalLink, Tag, Sparkles
} from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem, Parallax, Float, TiltCard } from '../components/animations';

// Promo code constant
const PROMO_CODE = 'Royal6234';

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

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

      {/* Promo Code Banner */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeInOnScroll>
            <motion.div
              className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden border-2 border-gold-500/30"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gold-500/10 via-royal-600/10 to-gold-500/10"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 8, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              />
              
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/20 border border-gold-500/40 mb-4">
                  <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
                  <span className="text-sm font-medium text-gold-400">LIMITED TIME OFFER</span>
                  <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
                </div>
                
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                  Special Launch Promo
                </h2>
                
                <p className="text-lg md:text-xl text-white/70 mb-6">
                  Use promo code at checkout
                </p>
                
                <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-royal-600/30 to-gold-500/30 border-2 border-gold-400/50 backdrop-blur-sm mb-6">
                  <Tag className="w-6 h-6 text-gold-400" />
                  <span className="text-3xl md:text-4xl font-bold gradient-text-yellow tracking-wider">
                    {PROMO_CODE}
                  </span>
                </div>
                
                <p className="text-white/60 mb-8 max-w-2xl mx-auto">
                  Join now and start claiming every dollar you've earned. Full access to all royalty tracking tools.
                </p>
                
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 btn-primary text-lg px-8 py-4"
                >
                  <Crown className="w-5 h-5" />
                  Get Started for $35/month
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </FadeInOnScroll>
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
                      <item.icon className="w-6 h-6 text-red-500" />
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
                        <CheckCircle className="w-5 h-5 text-red-500" />
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
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-red-400" />
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

                  <p className="text-xl text-white/60 mb-4 max-w-lg mx-auto">
                    One price. Full access. No hidden fees.<br />
                    <span className="text-gold-400">Cancel anytime.</span>
                  </p>

                  {/* Promo Code Display */}
                  <div className="mb-8 py-4 px-6 rounded-xl bg-gold-500/10 border border-gold-500/30 inline-block">
                    <p className="text-sm text-white/70 mb-1">Use promo code at checkout</p>
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-gold-400" />
                      <span className="text-2xl font-bold gradient-text-yellow tracking-wide">{PROMO_CODE}</span>
                    </div>
                  </div>

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
                        <CheckCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
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

      {/* Featured Partners & Resources Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-royal-950/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <FadeInOnScroll>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Promoted <span className="gradient-text">Resources</span>
              </h2>
              <p className="text-white/50 max-w-2xl mx-auto">
                Tools and creators we recommend to help grow your music career
              </p>
            </div>
          </FadeInOnScroll>

          <StaggerContainer className="grid md:grid-cols-3 gap-6">
            {/* SubmitHub */}
            <StaggerItem>
              <a
                href="https://www.submithub.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block glass-card rounded-2xl p-6 hover:border-royal-400/40 transition-all group h-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-600/20 flex items-center justify-center">
                    <Music className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-royal-300 transition-colors flex items-center gap-2">
                      SubmitHub
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </h3>
                    <span className="text-xs text-purple-400 uppercase tracking-wide">Music Promotion</span>
                  </div>
                </div>
                <p className="text-white/60 text-sm">
                  Submit your music directly to blogs, playlists, and influencers.
                  Get your tracks heard by real curators.
                </p>
              </a>
            </StaggerItem>

            {/* Featured TikTok: Culture Syndicate.live */}
            <StaggerItem>
              <a
                href="https://www.tiktok.com/@thegreatsage76"
                target="_blank"
                rel="noopener noreferrer"
                className="block glass-card rounded-2xl p-6 hover:border-pink-400/40 transition-all group h-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-pink-600/20 flex items-center justify-center">
                    <TikTokIcon className="w-7 h-7 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-pink-300 transition-colors flex items-center gap-2">
                      Culture Syndicate.live
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </h3>
                    <div className="text-xs text-pink-400">@thegreatsage76</div>
                    <span className="text-xs text-pink-400 uppercase tracking-wide">TikTok Creator</span>
                  </div>
                </div>
                <p className="text-white/60 text-sm">
                  Music industry insights, tips, and creative promotion from Culture Syndicate.live.
                  Follow for content to level up your career.
                </p>
              </a>
            </StaggerItem>

            {/* Musa & Kaya Show (promoted via Culture Syndicate.live) */}
            <StaggerItem>
              <a
                href="https://www.tiktok.com/@thegreatsage76"
                target="_blank"
                rel="noopener noreferrer"
                className="block glass-card rounded-2xl p-6 hover:border-pink-400/40 transition-all group h-full"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-pink-600/20 flex items-center justify-center">
                    <TikTokIcon className="w-7 h-7 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-pink-300 transition-colors flex items-center gap-2">
                      Musa & Kaya Show
                      <ExternalLink className="w-4 h-4 text-white/40" />
                    </h3>
                    <div className="text-xs text-cyan-400">Culture Syndicate.live</div>
                    <div className="text-xs text-cyan-400">@thegreatsage76</div>
                  </div>
                </div>
                <p className="text-white/60 text-sm">
                  Music promotion and industry insights from Culture Syndicate.live—your go-to creator for tips and growth.
                </p>
              </a>
            </StaggerItem>
          </StaggerContainer>
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

            <div className="mb-8">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-3 btn-primary text-xl px-12 py-5"
              >
                <Crown className="w-6 h-6" />
                Start Claiming Your Royalties
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500/10 border border-gold-500/30">
              <Tag className="w-4 h-4 text-gold-400" />
              <span className="text-sm text-white/70">Use code</span>
              <span className="text-lg font-bold gradient-text-yellow">{PROMO_CODE}</span>
              <span className="text-sm text-white/70">at checkout</span>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </div>
  );
}

