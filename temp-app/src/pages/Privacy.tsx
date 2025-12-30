import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-royal-500" />
            <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          </div>

          <div className="prose prose-invert max-w-none">
            <div className="glass-card rounded-2xl p-8 space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Information We Collect</h2>
                <p className="text-white/60">
                  We collect information you provide directly, including your email address, artist name, 
                  and royalty registration details. This information is used solely to provide our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">How We Use Your Data</h2>
                <p className="text-white/60">
                  Your data is used to auto-fill royalty registration forms, track your earnings, 
                  and provide personalized recommendations. We never sell your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Data Security</h2>
                <p className="text-white/60">
                  We use industry-standard encryption and security practices to protect your data. 
                  Your information is stored securely and accessed only when necessary to provide services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Your Rights</h2>
                <p className="text-white/60">
                  You can request access to, correction of, or deletion of your personal data at any time. 
                  Contact us at privacy@royallytuned.com for any privacy-related requests.
                </p>
              </section>

              <p className="text-sm text-white/40 pt-4 border-t border-white/10">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

