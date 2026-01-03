import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import RequireAuth from './components/RequireAuth';

// Eager load critical pages (Home, Login, AuthCallback)
import Home from './pages/Home';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';

// Lazy load non-critical pages
const About = lazy(() => import('./pages/About'));
const Pricing = lazy(() => import('./pages/Pricing'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tracks = lazy(() => import('./pages/Tracks'));
const Checklist = lazy(() => import('./pages/Checklist'));
const Toolkit = lazy(() => import('./pages/Toolkit'));
const Profile = lazy(() => import('./pages/Profile'));
const Registrations = lazy(() => import('./pages/Registrations'));
const TrackDetail = lazy(() => import('./pages/TrackDetail'));

// Loading spinner component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Prefetch pages on hover/focus for faster navigation
const prefetchMap: Record<string, () => Promise<unknown>> = {
  '/about': () => import('./pages/About'),
  '/pricing': () => import('./pages/Pricing'),
  '/signup': () => import('./pages/SignUp'),
  '/login': () => import('./pages/Login'),
  '/app': () => import('./pages/Dashboard'),
  '/app/tracks': () => import('./pages/Tracks'),
  '/app/checklist': () => import('./pages/Checklist'),
  '/app/toolkit': () => import('./pages/Toolkit'),
  '/app/profile': () => import('./pages/Profile'),
  '/app/registrations': () => import('./pages/Registrations'),
};

// Prefetch likely next pages based on current route
function usePrefetch() {
  const location = useLocation();

  useEffect(() => {
    const prefetchNext = () => {
      // On home page, prefetch pricing and login
      if (location.pathname === '/') {
        prefetchMap['/pricing']?.();
        prefetchMap['/login']?.();
      }
      // On login, prefetch dashboard
      if (location.pathname === '/login') {
        prefetchMap['/app']?.();
      }
      // On dashboard, prefetch other app pages
      if (location.pathname === '/app') {
        prefetchMap['/app/tracks']?.();
        prefetchMap['/app/toolkit']?.();
      }
    };

    // Delay prefetch to not block initial render
    const timer = setTimeout(prefetchNext, 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);
}

export default function App() {
  usePrefetch();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth Callback - handles magic link redirects */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Public Pages - Marketing & Onboarding */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Route>

          {/* Gated Pages - Subscription Required */}
          <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/tracks" element={<Tracks />} />
            <Route path="/app/tracks/:id" element={<TrackDetail />} />
            <Route path="/app/checklist" element={<Checklist />} />
            <Route path="/app/toolkit" element={<Toolkit />} />
            <Route path="/app/registrations" element={<Registrations />} />
            <Route path="/app/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}