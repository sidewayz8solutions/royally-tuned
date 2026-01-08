import { motion } from 'framer-motion';
import { Scale, Check, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { FadeInOnScroll } from '../../components/animations';

const comparisonData = [
  { feature: 'Distributes music to streaming platforms', royallyTuned: false, competitor: true },
  { feature: 'Centralized royalty tracking dashboard', royallyTuned: true, competitor: false },
  { feature: 'Track PRO registrations (BMI, ASCAP, SESAC)', royallyTuned: true, competitor: false },
  { feature: 'Track MLC registrations', royallyTuned: true, competitor: false },
  { feature: 'Track SoundExchange registrations', royallyTuned: true, competitor: false },
  { feature: 'Metadata management across organizations', royallyTuned: true, competitor: false },
  { feature: 'Multi-artist/manager support', royallyTuned: true, competitor: true },
  { feature: 'Registration checklists', royallyTuned: true, competitor: false },
];

export default function CompareDistroKid() {
  useEffect(() => {
    document.title = 'Royally Tuned vs DistroKid | Music Royalty Management Comparison';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Compare Royally Tuned and DistroKid. Understand how these music industry tools differ for independent artists, managers, and musical groups.');
    }
  }, []);

  return (
    <div className="overflow-hidden">
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-royal-600/20 border border-royal-500/30 mb-8">
              <Scale className="w-4 h-4 text-royal-400" />
              <span className="text-sm text-white/80">Comparison</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Royally Tuned vs <span className="gradient-text">DistroKid</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Understanding how these tools serve independent artists, managers, and musical groups differently
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeInOnScroll>
            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Key Difference</h2>
              <p className="text-white/70 leading-relaxed">
                <strong className="text-white">DistroKid</strong> is a music distribution service that gets your music onto streaming platforms like Spotify, Apple Music, and Amazon Music. They handle the distribution side of the music business.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                <strong className="text-white">Royally Tuned</strong> is a music royalty management platform that helps independent artists, managers, and musical groups track royalty registrations and income across PROs, the MLC, SoundExchange, and other organizations. Royally Tuned complements distribution services by helping you track all the other royalty sources that distribution doesn't cover.
              </p>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={0.1}>
            <div className="glass-card rounded-2xl p-8 mb-8 overflow-x-auto">
              <h2 className="text-2xl font-bold text-white mb-6">Feature Comparison</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 text-white/60 font-medium">Feature</th>
                    <th className="text-center py-4 text-royal-400 font-medium">Royally Tuned</th>
                    <th className="text-center py-4 text-white/60 font-medium">DistroKid</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-4 text-white/80">{row.feature}</td>
                      <td className="py-4 text-center">
                        {row.royallyTuned ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-white/30 mx-auto" />}
                      </td>
                      <td className="py-4 text-center">
                        {row.competitor ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-white/30 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={0.2}>
            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">The Bottom Line</h2>
              <p className="text-white/70 leading-relaxed">
                DistroKid gets your music onto streaming platforms, but streaming royalties are just one piece of the puzzle. Independent artists also need to collect performance royalties (PROs), mechanical royalties (MLC), and neighboring rights (SoundExchange).
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                Royally Tuned helps you track all these registrations in one place. For independent artists, managers, and musical groups, using DistroKid for distribution alongside Royally Tuned for royalty management provides the most complete solution.
              </p>
            </div>
          </FadeInOnScroll>

          <FadeInOnScroll delay={0.3}>
            <div className="text-center glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Organize Your Royalties?</h2>
              <p className="text-white/60 mb-6">Join independent artists, managers, and musical groups who trust Royally Tuned.</p>
              <Link to="/signup" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </div>
  );
}

