import { motion } from 'framer-motion';
import { FileText, Download, Mail, Image, Crown, Users, BarChart3, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { FadeInOnScroll, StaggerContainer, StaggerItem } from '../components/animations';

const features = [
  { icon: BarChart3, title: 'Centralized Royalty Tracking', desc: 'All your royalty data in one dashboard' },
  { icon: Shield, title: 'PRO and MLC Organization', desc: 'Track registrations across all organizations' },
  { icon: FileText, title: 'Metadata Oversight', desc: 'Ensure your metadata is accurate everywhere' },
  { icon: Users, title: 'Built for Teams', desc: 'Perfect for artists, managers, and groups' },
];

export default function Press() {
  // Update page title and meta description
  useEffect(() => {
    document.title = 'Press Kit - Royally Tuned | Music Royalty Management Platform';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Royally Tuned is a music royalty management platform built for independent artists, managers, and musical groups to track PROs, MLC registrations, metadata, and streaming income in one centralized dashboard.');
    }
  }, []);

  return (
    <div className="overflow-hidden">

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-royal-600/20 border border-royal-500/30 mb-8">
              <FileText className="w-4 h-4 text-royal-400" />
              <span className="text-sm text-white/80">Press & Media</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Royally Tuned <span className="gradient-text">Press Kit</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Royally Tuned Simplifies Music Royalty Tracking for Independent Artists, Managers, and Musical Groups
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Description */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeInOnScroll>
            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Crown className="w-6 h-6 text-yellow-400" />
                About Royally Tuned
              </h2>
              <div className="space-y-4 text-white/70 leading-relaxed">
                <p className="text-lg"><strong className="text-white">Short Description:</strong> Royally Tuned is a music royalty management platform that helps independent artists, managers, and musical groups track PROs, MLC registrations, metadata, and streaming income in one centralized dashboard.</p>
                <p><strong className="text-white">Long Description:</strong> Royally Tuned is a music royalty management platform built to simplify how independent artists, managers, and musical groups track and understand their royalties. By centralizing information related to PROs, the MLC, metadata, and streaming income, Royally Tuned helps reduce missed royalties and administrative confusion while giving users greater visibility into their music earnings.</p>
              </div>
            </div>
          </FadeInOnScroll>

          {/* Key Features */}
          <FadeInOnScroll delay={0.1}>
            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
              <StaggerContainer className="grid md:grid-cols-2 gap-6">
                {features.map((feature, i) => (
                  <StaggerItem key={i}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-royal-600/20 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-royal-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                        <p className="text-white/60">{feature.desc}</p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </FadeInOnScroll>

          {/* Target Audience */}
          <FadeInOnScroll delay={0.2}>
            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Who Uses Royally Tuned</h2>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-royal-500 rounded-full" />Independent artists managing their own music catalogs</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-royal-500 rounded-full" />Artist managers overseeing multiple clients</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-royal-500 rounded-full" />Musical groups and bands tracking shared royalties</li>
              </ul>
            </div>
          </FadeInOnScroll>

          {/* Media Assets */}
          <FadeInOnScroll delay={0.3}>
            <div className="glass-card rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Media Assets</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <a href="/logo2.png" download className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <Image className="w-8 h-8 text-royal-400" />
                  <div>
                    <p className="font-semibold text-white">Logo (PNG)</p>
                    <p className="text-sm text-white/50">High-resolution logo</p>
                  </div>
                  <Download className="w-5 h-5 text-white/50 ml-auto" />
                </a>
                <a href="/crown.svg" download className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <Image className="w-8 h-8 text-royal-400" />
                  <div>
                    <p className="font-semibold text-white">Icon (SVG)</p>
                    <p className="text-sm text-white/50">Crown icon</p>
                  </div>
                  <Download className="w-5 h-5 text-white/50 ml-auto" />
                </a>
              </div>
            </div>
          </FadeInOnScroll>

          {/* Contact */}
          <FadeInOnScroll delay={0.4}>
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Media Contact</h2>
              <p className="text-white/70 mb-4">For press inquiries, interviews, or media requests:</p>
              <a href="mailto:press@royallytuned.com" className="inline-flex items-center gap-2 text-royal-400 hover:text-royal-300 transition-colors">
                <Mail className="w-5 h-5" />
                press@royallytuned.com
              </a>
              <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4">
                <Link to="/faq" className="btn-secondary px-6 py-2">View FAQ</Link>
                <Link to="/about" className="btn-secondary px-6 py-2">About Us</Link>
                <Link to="/pricing" className="btn-secondary px-6 py-2">Pricing</Link>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </div>
  );
}

