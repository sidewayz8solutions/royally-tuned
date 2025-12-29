import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full border-t border-purple-900/30 bg-black/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/rt1.png" alt="Royally Tuned" className="w-10 h-10 object-contain" />
            <span className="brand-script text-xl bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
              Royally Tuned
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link to="/" className="text-white/60 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-white/60 hover:text-white transition-colors">
              About
            </Link>
            <Link to="/pricing" className="text-white/60 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link to="/privacy" className="text-white/60 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/60 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Royally Tuned. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

