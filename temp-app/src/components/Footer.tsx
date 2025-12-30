import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Crown className="w-6 h-6 text-royal-500 group-hover:text-gold-400 transition-colors" />
            <span className="brand-script text-xl text-white">Royally Tuned</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-white/50">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} Royally Tuned. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

