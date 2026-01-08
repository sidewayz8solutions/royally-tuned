import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FadeInOnScroll, StaggerContainer, StaggerItem } from '../components/animations';

const faqs = [
  {
    question: 'What is Royally Tuned?',
    answer: 'Royally Tuned is a music royalty management platform built for independent artists, managers, and musical groups to track PROs, MLC registrations, metadata, and streaming income in one centralized dashboard.'
  },
  {
    question: 'Who is Royally Tuned for?',
    answer: 'Royally Tuned is designed for independent artists managing their own catalogs, managers overseeing multiple artists or groups, and musical groups and bands splitting royalties across members. Anyone who needs clarity and control over music royalties can use Royally Tuned.'
  },
  {
    question: 'Does Royally Tuned replace BMI, ASCAP, or SESAC?',
    answer: 'No. Royally Tuned does not replace performing rights organizations (PROs). Instead, it helps independent artists, managers, and musical groups track, organize, and monitor registrations and income across those organizations in one place.'
  },
  {
    question: 'What is the MLC and how does Royally Tuned help?',
    answer: 'The Mechanical Licensing Collective (MLC) manages mechanical royalties for streaming in the U.S. Royally Tuned helps users keep track of MLC registrations and ensure metadata is properly aligned to reduce missed royalty payments.'
  },
  {
    question: 'How is Royally Tuned different from SoundExchange?',
    answer: 'SoundExchange collects specific digital performance royalties. Royally Tuned acts as a centralized management layer, helping users see the bigger picture across PROs, the MLC, metadata systems, and streaming income instead of relying on one source.'
  },
  {
    question: 'Can managers use Royally Tuned for multiple artists?',
    answer: 'Yes. Royally Tuned is built to support managers who need to oversee multiple artists or musical groups while keeping royalty data organized and accessible.'
  },
  {
    question: 'Is Royally Tuned good for bands and musical groups?',
    answer: 'Yes. Royally Tuned helps musical groups track royalties, splits, registrations, and metadata so all members understand where income comes from and what is being collected.'
  },
  {
    question: 'Why do artists miss royalties?',
    answer: 'Common reasons include incorrect metadata, incomplete registrations, missing MLC claims, and lack of centralized tracking. Royally Tuned helps reduce these issues by organizing royalty-related information in one dashboard.'
  },
  {
    question: 'Is Royally Tuned beginner-friendly?',
    answer: 'Yes. Royally Tuned is designed to be accessible for independent artists while still powerful enough for managers and groups with larger catalogs.'
  },
  {
    question: 'How do I get started?',
    answer: 'Visit royallytuned.com to create an account and begin organizing your music royalty tracking.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  // Inject FAQ schema and update page title/meta
  useEffect(() => {
    document.title = 'FAQ - Royally Tuned | Music Royalty Tracking for Artists, Managers & Groups';

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Royally Tuned is a music royalty management platform built for independent artists, managers, and musical groups to track PROs, MLC registrations, metadata, and streaming income in one centralized dashboard.');
    }

    // Add FAQ schema
    const existingScript = document.getElementById('faq-schema');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = 'faq-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('faq-schema');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, []);

  return (
    <div className="overflow-hidden">

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-royal-600/20 border border-royal-500/30 mb-8">
              <HelpCircle className="w-4 h-4 text-royal-400" />
              <span className="text-sm text-white/80">Frequently Asked Questions</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Royally Tuned <span className="gradient-text">FAQ</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Music Royalty Tracking for Independent Artists, Managers & Musical Groups
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <StaggerContainer className="space-y-4">
            {faqs.map((faq, index) => (
              <StaggerItem key={index}>
                <div className="glass-card rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                    <ChevronDown className={`w-5 h-5 text-white/50 transition-transform flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openIndex === index && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-6 pb-6">
                      <p className="text-white/60 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* CTA */}
          <FadeInOnScroll delay={0.3}>
            <div className="mt-12 text-center glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-white/60 mb-6">Join thousands of independent artists, managers, and musical groups who trust Royally Tuned.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="btn-primary px-8 py-3">Start Free Trial</Link>
                <Link to="/press" className="btn-secondary px-8 py-3">Press Kit</Link>
              </div>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </div>
  );
}

