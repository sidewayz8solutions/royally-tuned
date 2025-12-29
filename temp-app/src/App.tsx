import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './Dashboard';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Footer from './components/Footer';

// Top Navigation Bar for public pages
function TopNav() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  // Don't show on dashboard (home when logged in)
  if (isHome) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <img src="/rt1.png" alt="Royally Tuned" className="w-10 h-10 object-contain" />
          <span className="brand-script text-xl bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
            Royally Tuned
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer"
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={`text-sm transition-colors cursor-pointer ${location.pathname === '/about' ? 'text-purple-400' : 'text-white/70 hover:text-white'}`}
          >
            About
          </Link>
          <Link 
            to="/pricing" 
            className={`text-sm transition-colors cursor-pointer ${location.pathname === '/pricing' ? 'text-purple-400' : 'text-white/70 hover:text-white'}`}
          >
            Pricing
          </Link>
          <Link 
            to="/signup" 
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-yellow-500 text-black font-semibold text-sm hover:opacity-90 hover:scale-105 transition-all cursor-pointer"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}

// Layout wrapper for public pages
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Main Dashboard - no public layout */}
      <Route path="/" element={<Dashboard />} />
      
      {/* Public Pages with layout */}
      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
      <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
      <Route path="/signup" element={<PublicLayout><SignUp /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
    </Routes>
  );
}
