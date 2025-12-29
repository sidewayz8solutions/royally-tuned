import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
          Terms of Service
        </h1>

        <div className="prose prose-invert prose-purple max-w-none space-y-6 text-white/80">
          <p className="text-lg">Last updated: December 2024</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Acceptance of Terms</h2>
            <p>By accessing and using Royally Tuned, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Description of Service</h2>
            <p>Royally Tuned provides music royalty tracking, analysis, and management tools. We help artists understand and organize their royalty income from various sources including streaming platforms, PROs, and publishers.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to provide accurate information and to update it as necessary.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Subscription & Billing</h2>
            <p>Some features require a paid subscription. Subscriptions are billed monthly at $35/month. You may cancel at any time, and cancellation will take effect at the end of your billing period.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Limitation of Liability</h2>
            <p>Royally Tuned is not a financial advisor and does not guarantee any specific outcomes. We provide tools to help you track and understand your royalties, but all financial decisions remain your responsibility.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Contact</h2>
            <p>For questions about these Terms of Service, contact us at support@royallytuned.com</p>
          </section>
        </div>

        <div className="mt-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-yellow-500 text-black font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

