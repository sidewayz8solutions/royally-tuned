import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-royal-500" />
            <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
          </div>

          <div className="glass-card rounded-2xl p-8 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Service Description</h2>
              <p className="text-white/60">
                Royally Tuned provides tools to help musicians manage royalty registrations,
                track earnings, and streamline administrative tasks. We do not collect or
                distribute royalties on your behalf.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Subscription Terms</h2>
              <p className="text-white/60">
                Your subscription will automatically renew each month at $35/month unless cancelled.
                You may cancel at any time through your profile settings. Cancellation takes effect
                at the end of the current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">User Responsibilities</h2>
              <p className="text-white/60">
                You are responsible for the accuracy of information you provide. While we help
                auto-fill forms, you should review all submissions before submitting to any
                organization.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Limitations</h2>
              <p className="text-white/60">
                Royally Tuned is a management tool and does not guarantee approval of registrations
                or collection of royalties. We are not liable for decisions made by PROs, labels,
                or other organizations.
              </p>
            </section>

            <p className="text-sm text-white/40 pt-4 border-t border-white/10">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}