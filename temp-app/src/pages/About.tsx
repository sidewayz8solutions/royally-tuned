import { Link } from 'react-router-dom';
import { Music, DollarSign, Shield, Zap } from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem, GradientText, TiltCard, MagneticButton } from '../components/animations';

export default function About() {
  return (
    <div className="min-h-screen text-white">
      {/* Hero */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeInOnScroll>
            <span className="inline-block px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">Our Story</span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Built by Musicians, <GradientText>For Musicians</GradientText></h1>
            <p className="text-xl text-white/60 leading-relaxed">We discovered a painful truth: musicians everywhere are losing money they rightfully earned. We built Royally Tuned to fix that.</p>
          </FadeInOnScroll>
        </div>
      </section>

      {/* The Discovery */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <StaggerContainer className="space-y-8">
            {[
              { title: 'The Discovery', content: 'It started when a friend asked us to help track down missing royalties. What we found shocked us: thousands of dollars sitting unclaimed across multiple organizations, simply because the system is designed to be confusing.' },
              { title: 'The Complexity', content: 'Royalty systems are complex: PROs like ASCAP and BMI, the MLC, SoundExchange, distributors, streaming platforms, and publishers all track different royalties. Missing a single step can mean missed income—potentially for life.' },
              { title: 'The Mission', content: 'We built Royally Tuned to be the tool we wished existed: one place to see everything, track everything, and ensure you never miss another dollar. We believe every creator deserves to be paid for their work.' },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <div className="glass-card p-8 rounded-2xl border border-white/10">
                  <h3 className="text-2xl font-semibold mb-4 text-purple-400">{item.title}</h3>
                  <p className="text-white/70 leading-relaxed text-lg">{item.content}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <FadeInOnScroll className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Built</h2>
            <p className="text-white/60">One platform to recover, track, and protect your music income</p>
          </FadeInOnScroll>
          <StaggerContainer className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Music, title: 'Track Everything', desc: 'One dashboard for all your songs, ISRCs, splits, and registrations.' },
              { icon: DollarSign, title: 'Find Missing Money', desc: 'AI-powered statement analysis to identify unclaimed royalties.' },
              { icon: Shield, title: 'Protect Your Rights', desc: 'Step-by-step guides to register with every organization that owes you money.' },
              { icon: Zap, title: 'Save Time', desc: 'Stop drowning in spreadsheets. We organize everything automatically.' },
            ].map((item, i) => (
              <StaggerItem key={i}><TiltCard className="h-full"><div className="glass-card rounded-2xl p-6 h-full border border-white/10 hover:border-purple-500/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </div></TiltCard></StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <FadeInOnScroll className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Your Money?</h2>
          <p className="text-white/60 mb-8">Join thousands of musicians who are finally taking control of their royalties.</p>
          <MagneticButton>
            <Link to="/signup" className="inline-block px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300">
              Start for $35/month
            </Link>
          </MagneticButton>
        </FadeInOnScroll>
      </section>
    </div>
  );
}

