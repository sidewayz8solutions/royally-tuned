import { Link } from 'react-router-dom';
import { Crown, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Special Thanks Section */}
        <div className="text-center mb-10 pb-10 border-b border-white/5">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm text-white/60 uppercase tracking-widest">Special Thanks</span>
            <Heart className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-white/40 text-sm mb-4">
            To the amazing people who helped promote Royally Tuned
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <a
              href="https://www.tiktok.com/@thegreatsage76"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-pink-400 transition-colors font-medium"
            >
              @thegreatsage76
            </a>
            <span className="text-white/20">•</span>
            <a
              href="https://www.youtube.com/@TheMusaKayaShow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-cyan-400 transition-colors font-medium"
            >
              The Musa & Kaya Show
            </a>
          </div>
        </div>

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

