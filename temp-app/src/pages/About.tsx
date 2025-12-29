import { Link } from 'react-router-dom';
import { Music, DollarSign, Shield, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
          About Royally Tuned
        </h1>

        <p className="text-xl text-white/70 mb-12">
          We're on a mission to help musicians get every dollar they've earned.
        </p>

        {/* The Problem */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4 text-white">The Problem We Discovered</h2>
          <div className="glass-card rounded-2xl p-6 space-y-4 text-white/80">
            <p>
              Too many musicians are leaving money on the table—not because they don't deserve it, but because the royalty system is impossibly complex.
            </p>
            <p>
              Between PROs (ASCAP, BMI, SESAC), the MLC, SoundExchange, neighboring rights societies, and publisher statements, even the most organized artist can miss payments they're owed.
            </p>
            <p>
              We've seen artists lose thousands of dollars simply because they didn't know which organizations to register with or how to read their royalty statements.
            </p>
          </div>
        </section>

        {/* Our Solution */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4 text-white">Our Solution</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Music, title: 'Track Everything', desc: 'One dashboard for all your songs, ISRCs, splits, and registrations.' },
              { icon: DollarSign, title: 'Find Missing Money', desc: 'AI-powered statement analysis to identify unclaimed royalties.' },
              { icon: Shield, title: 'Protect Your Rights', desc: 'Step-by-step guides to register with every organization that owes you money.' },
              { icon: Zap, title: 'Save Time', desc: 'Stop drowning in spreadsheets. We organize everything automatically.' },
            ].map((item, i) => (
              <div key={i} className="glass-card rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600/20 to-yellow-500/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4 text-white">Our Mission</h2>
          <div className="glass-card rounded-2xl p-6 border-l-4 border-purple-500">
            <p className="text-lg text-white/80 italic">
              "To simplify music royalties so artists can focus on what they do best—making music. You create the art. We make sure you get paid for it."
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Your Money?</h2>
          <Link 
            to="/signup" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-yellow-500 text-black font-bold text-lg hover:opacity-90 hover:scale-105 transition-all cursor-pointer shadow-lg shadow-purple-500/25"
          >
            Start Free Audit →
          </Link>
        </div>
      </div>
    </div>
  );
}

