import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import RequireAuth from './components/RequireAuth';

// Lazy load pages for faster initial load
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Pricing = lazy(() => import('./pages/Pricing'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Login = lazy(() => import('./pages/Login'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tracks = lazy(() => import('./pages/Tracks'));
const Checklist = lazy(() => import('./pages/Checklist'));
const Toolkit = lazy(() => import('./pages/Toolkit'));
const Profile = lazy(() => import('./pages/Profile'));
const Registrations = lazy(() => import('./pages/Registrations'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
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
            <Route path="/app/checklist" element={<Checklist />} />
            <Route path="/app/toolkit" element={<Toolkit />} />
            <Route path="/app/registrations" element={<Registrations />} />
            <Route path="/app/profile" element={<Profile />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}