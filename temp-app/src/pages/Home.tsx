import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Check, AlertTriangle, Sparkles, BarChart3, ListChecks, Wrench, Shield } from 'lucide-react'
import { FadeInOnScroll, StaggerContainer, StaggerItem, MagneticButton, TiltCard, Parallax, GradientText } from '../components/animations'
import { useRef } from 'react'

export default function Home() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-block px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
              Stop Losing Your Royalties
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Get <GradientText>Every Dollar</GradientText> You've Earned
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-xl md:text-2xl text-white/60 mb-10 max-w-3xl mx-auto">
            Musicians lose millions in unclaimed royalties every year. We help you find, track, and protect every stream of income you deserve.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <MagneticButton>
              <Link to="/signup" className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-yellow-500 text-black font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30">
                Start for $35/month
              </Link>
            </MagneticButton>
            <Link to="/about" className="px-8 py-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors">
              Learn More
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInOnScroll className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">The Problem</h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">Musicians are losing money they rightfully earned, and most don't even know it</p>
          </FadeInOnScroll>
          <StaggerContainer className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎵', title: 'Complex Systems', desc: 'PROs, MLC, SoundExchange, publishers, distributors — each tracks different royalties with different rules.' },
              { icon: '📊', title: 'Fragmented Data', desc: 'Your money is scattered across dozens of platforms. Missing one registration means losing income forever.' },
              { icon: '💸', title: 'No Visibility', desc: 'Most artists have no way to see what they\'re owed, what\'s missing, or where to look.' },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <TiltCard className="h-full">
                  <div className="glass-card p-8 rounded-3xl space-y-4 h-full border border-white/10 hover:border-purple-500/50 transition-colors duration-500">
                    <Parallax offset={20}><span className="text-5xl block">{item.icon}</span></Parallax>
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <p className="text-white/60 leading-relaxed">{item.desc}</p>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <FadeInOnScroll delay={0.3} className="mt-12 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4 max-w-3xl mx-auto">
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-amber-300 mb-1">The Hard Truth</h4>
              <p className="text-amber-200/70">The music industry holds over $2 billion in unclaimed royalties. Without proper tracking and registration, that money never finds its way to the artists who earned it.</p>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-6xl mx-auto">
          <FadeInOnScroll className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">The Solution</h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">One platform to recover, track, and protect all your music income</p>
          </FadeInOnScroll>
          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🔍', title: 'Royalty Audit', desc: 'We find unclaimed money hiding across platforms.' },
              { icon: '📈', title: 'Complete Visibility', desc: 'See all your royalty streams in one dashboard.' },
              { icon: '🛡️', title: 'Future Protection', desc: 'Never miss another registration or deadline.' },
            ].map((item, i) => (
              <StaggerItem key={i}><div className="text-center space-y-4 group">
                <Parallax offset={20}><span className="text-4xl block group-hover:scale-110 transition-transform duration-300">{item.icon}</span></Parallax>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </div></StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInOnScroll className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-white/60">Powerful tools designed specifically for independent musicians</p>
          </FadeInOnScroll>
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BarChart3, title: 'Dashboard', desc: 'Real-time overview of all earnings and metrics' },
              { icon: ListChecks, title: 'Track Manager', desc: 'Manage all your songs, ISRCs, and splits' },
              { icon: Shield, title: 'Registration Hub', desc: 'Step-by-step guides for every organization' },
              { icon: Wrench, title: 'Toolkit', desc: 'Calculators, forms, and AI-powered analysis' },
            ].map((item, i) => (
              <StaggerItem key={i}><TiltCard><div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-500 group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-white/50">{item.desc}</p>
              </div></TiltCard></StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <FadeInOnScroll className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-white/60">One plan. Everything included. No hidden fees.</p>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.2}>
            <div className="glass-card rounded-3xl p-8 md:p-12 border border-purple-500/30 relative overflow-hidden">
              <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                  <div>
                    <motion.span className="absolute -top-1 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-bold px-4 py-1.5 rounded-full" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>POPULAR</motion.span>
                    <h3 className="text-3xl font-bold mb-2">Pro Membership</h3>
                    <p className="text-white/60">Complete access to all features</p>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-5xl font-bold"><span className="text-purple-400">$35</span><span className="text-xl text-white/50">/month</span></div>
                    <p className="text-sm text-white/50 mt-1">Cancel anytime</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {['AI Statement Parser', 'Unlimited Track Management', 'Complete Registration Hub', 'Streaming Calculator', 'Split Sheet Generator', 'PRO & MLC Guides', 'SoundExchange Setup', 'Priority Support'].map((f, i) => (
                    <div key={i} className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400 flex-shrink-0" /><span className="text-white/80">{f}</span></div>
                  ))}
                </div>
                <MagneticButton className="w-full"><Link to="/signup" className="block text-center px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold hover:opacity-90 transition-opacity duration-300 shadow-lg shadow-purple-500/30">Get Started</Link></MagneticButton>
              </div>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={0.3} className="mt-8 text-center">
            <p className="text-white/50">Think about it: if we help you recover just <span className="text-emerald-400 font-semibold">$100</span> in missed royalties, that's 3 months paid for.</p>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 relative">
        <FadeInOnScroll className="max-w-4xl mx-auto text-center">
          <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get What You're Owed?</h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">Join thousands of musicians who are finally taking control of their royalties. Your music has value — let's make sure you see every penny.</p>
          <MagneticButton>
            <Link to="/signup" className="inline-block px-12 py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_auto] font-semibold text-xl shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 animate-gradient">
              Start for $35/month
            </Link>
          </MagneticButton>
          <p className="mt-6 text-white/40 text-sm">No credit card required to explore. Cancel anytime.</p>
        </FadeInOnScroll>
      </section>
    </div>
  )
}

