import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PUBLIC_NAV, PAID_NAV } from '../types';

export function PublicNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, subscriptionStatus } = useAuth();

  const isSubscribed = user && subscriptionStatus === 'active';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo2.png" alt="Royally Tuned" className="h-12 w-auto" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {PUBLIC_NAV.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-gold-400'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {isSubscribed ? (
                <Link
                  to="/app"
                  className="btn-primary text-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="btn-primary text-sm"
                >
                  Start for $35/mo
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass border-b border-white/5"
        >
          <div className="px-6 py-4 space-y-4">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block text-white/70 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/signup"
              onClick={() => setIsOpen(false)}
              className="block btn-primary text-center"
            >
              Start for $35/mo
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

export function AppNav() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-3 group">
            <img src="/logo2.png" alt="Royally Tuned" className="h-12 w-auto" />
          </Link>

          <div className="flex items-center gap-6">
            {PAID_NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-gold-400'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={signOut}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

