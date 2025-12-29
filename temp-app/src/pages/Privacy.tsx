import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>

        <div className="prose prose-invert prose-purple max-w-none space-y-6 text-white/80">
          <p className="text-lg">Last updated: December 2024</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, upload royalty statements, or contact us for support. This may include your name, email address, and music-related financial data.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, process your royalty data, and communicate with you about your account and our services.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information. Your royalty data is encrypted and stored securely. We never share your financial data with third parties without your explicit consent.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information at any time. You can export your data or request account deletion through your dashboard or by contacting support.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at support@royallytuned.com</p>
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

