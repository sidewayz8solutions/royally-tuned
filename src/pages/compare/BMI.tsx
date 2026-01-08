import { motion } from 'framer-motion';
import { Scale, Check, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { FadeInOnScroll } from '../../components/animations';

const comparisonData = [
  { feature: 'Collects performance royalties', royallyTuned: false, competitor: true },
  { feature: 'Centralized royalty tracking dashboard', royallyTuned: true, competitor: false },
  { feature: 'Track multiple PRO registrations', royallyTuned: true, competitor: false },
  { feature: 'Track MLC registrations', royallyTuned: true, competitor: false },
  { feature: 'Metadata management', royallyTuned: true, competitor: false },
  { feature: 'Multi-artist/manager support', royallyTuned: true, competitor: false },
  { feature: 'Streaming income overview', royallyTuned: true, competitor: false },
  { feature: 'Registration checklists', royallyTuned: true, competitor: false },
];

export default function CompareBMI() {
  useEffect(() => {
    document.title = 'Royally Tuned vs BMI | Music Royalty Management Comparison';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Compare Royally Tuned and BMI. Understand how these music royalty tools differ for independent artists, managers, and musical groups.');
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
              Royally Tuned vs <span className="gradient-text">BMI</span>
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
                <strong className="text-white">BMI (Broadcast Music, Inc.)</strong> is a performing rights organization (PRO) that collects and distributes performance royalties when your songs are played publicly—on radio, TV, in venues, or on streaming services.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                <strong className="text-white">Royally Tuned</strong> is a music royalty management platform that helps independent artists, managers, and musical groups track and organize royalty information across multiple organizations—including BMI, ASCAP, SESAC, the MLC, SoundExchange, and more—in one centralized dashboard. Royally Tuned does not replace BMI; it helps you manage your BMI registration alongside all your other royalty sources.
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
                    <th className="text-center py-4 text-white/60 font-medium">BMI</th>
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
                BMI is essential for collecting performance royalties—artists should register with a PRO like BMI, ASCAP, or SESAC. Royally Tuned complements BMI by providing a centralized place to track your BMI registration status alongside MLC, SoundExchange, and other royalty sources.
              </p>
              <p className="text-white/70 leading-relaxed mt-4">
                For independent artists, managers, and musical groups, using Royally Tuned alongside your PRO provides better visibility into your complete royalty picture.
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

