import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Home } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PUBLIC_NAV, PAID_NAV } from '../types';
import ArtistSelector from './ArtistSelector';

// Paid statuses that grant access
const PAID_STATUSES = ['pro', 'active', 'trialing', 'enterprise'];

export function PublicNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, subscriptionStatus, signOut } = useAuth();

  const isPaid = subscriptionStatus ? PAID_STATUSES.includes(subscriptionStatus) : false;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo2.png" alt="Royally Tuned" className="h-12 w-auto" />
              <span className="brand-script text-2xl text-white">Royally Tuned</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {PUBLIC_NAV.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-yellow-400 font-semibold'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Auth-aware buttons */}
              {user ? (
                <>
                  {isPaid && (
                    <Link to="/app" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={signOut}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary text-sm"
                  >
                    Start for $35/mo
                  </Link>
                </>
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
            {user ? (
              <>
                {isPaid && (
                  <Link
                    to="/app"
                    onClick={() => setIsOpen(false)}
                    className="block text-white/70 hover:text-white"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="block text-white/50 hover:text-white w-full text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-white/70 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block btn-primary text-center"
                >
                  Start for $35/mo
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}

export function AppNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/app" className="flex items-center gap-2 sm:gap-3 group">
                <img src="/logo2.png" alt="Royally Tuned" className="h-10 sm:h-12 w-auto" />
                <span className="brand-script text-xl sm:text-2xl text-white hidden xs:inline">Royally Tuned</span>
              </Link>

              {/* Artist Selector - shows only if user manages multiple artists */}
              <div className="ml-1 sm:ml-[4%]">
                <ArtistSelector />
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Home link to public site */}
              <Link
                to="/"
                className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              {PAID_NAV.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-yellow-400 font-semibold'
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-white p-2"
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
          className="lg:hidden glass border-b border-white/5"
        >
          <div className="px-6 py-4 space-y-4">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-white/70 hover:text-white"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            {PAID_NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-yellow-400 font-semibold'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="block text-white/50 hover:text-white w-full text-left text-sm"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

