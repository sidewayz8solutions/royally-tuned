import { motion } from 'framer-motion';
import { Crown, Heart, Target, Users, TrendingUp, Shield } from 'lucide-react';
import { FadeInOnScroll, StaggerContainer, StaggerItem, Parallax } from '../components/animations';
import { Link } from 'react-router-dom';

export default function About() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-royal-600/20 border border-royal-500/30 mb-8">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm text-white/80">Built by Musicians, for Musicians</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Why We Built
              <span className="block gradient-text">Royally Tuned</span>
            </h1>
            
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Because independent artists deserve to keep every dollar they've earned.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Story */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-royal-950/20 to-transparent">
        <div className="max-w-4xl mx-auto">
          <FadeInOnScroll>
            <div className="glass-card rounded-3xl p-12 space-y-8">
              <h2 className="text-3xl font-bold text-white">The Broken System</h2>
              
              <div className="space-y-6 text-lg text-white/70 leading-relaxed">
                <p>
                  <span className="text-gold-400 font-semibold">Billions of dollars</span> in music 
                  royalties go unclaimed every year. Not because artists don't deserve them—but 
                  because the system is impossibly complex.
                </p>
                
                <p>
                  Performance royalties. Mechanical royalties. Neighboring rights. Sync licensing.
                  Each one requires registration with different organizations, different forms, 
                  different deadlines. Miss one, and you're leaving money on the table.
                </p>
                
                <p>
                  Major labels have entire departments dedicated to tracking royalties. 
                  <span className="text-red-500"> Independent artists? They're on their own.</span>
                </p>
                
                <p className="text-white">
                  We built Royally Tuned to change that.
                </p>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeInOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-xl text-white/50 max-w-2xl mx-auto">
                Empowering independent artists with the tools that major labels take for granted
              </p>
            </div>
          </FadeInOnScroll>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'Simplify', desc: 'One-time data entry that auto-fills every registration form you need.' },
              { icon: Shield, title: 'Protect', desc: 'Never miss a deadline or registration that costs you royalties.' },
              { icon: TrendingUp, title: 'Maximize', desc: 'Track every revenue stream and ensure you capture it all.' },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <div className="glass-card rounded-2xl p-8 text-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500/30 to-yellow-500/20 flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/50">{item.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* For Artists */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Parallax offset={20}>
            <FadeInOnScroll>
              <div className="glass-card rounded-3xl p-12 glow-purple">
                <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">
                  Artist-First. Always.
                </h2>
                <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto">
                  We're not a label. We're not a distributor. We're a tool built to put more 
                  money in your pocket—period. Your success is our only metric.
                </p>
                <Link to="/signup" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Join the Movement
                </Link>
              </div>
            </FadeInOnScroll>
          </Parallax>
        </div>
      </section>
    </div>
  );
}

