import { NavLink, Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

export default function Layout() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 mesh-bg" />
        <motion.div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute top-1/3 right-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity }} />
        <motion.div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/rt1.png" alt="Royally Tuned" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
              <span className="brand-script text-xl bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
                Royally Tuned
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink to="/" end className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-purple-400' : 'text-white/70 hover:text-white'}`}>Home</NavLink>
              <NavLink to="/about" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-purple-400' : 'text-white/70 hover:text-white'}`}>About</NavLink>
              <NavLink to="/pricing" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-purple-400' : 'text-white/70 hover:text-white'}`}>Pricing</NavLink>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors hidden sm:block">Login</Link>
              <Link 
                to="/signup" 
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-yellow-500 text-black font-semibold text-sm hover:opacity-90 hover:scale-105 transition-all shadow-lg shadow-purple-500/20"
              >
                Start for $35/mo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-16 relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

