import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import About from './pages/About';
import Pricing from './pages/Pricing';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Dashboard from './pages/Dashboard';
import Tracks from './pages/Tracks';
import Checklist from './pages/Checklist';
import Toolkit from './pages/Toolkit';
import Profile from './pages/Profile';
import RequireAuth from './components/RequireAuth';
import AuthCallback from './pages/AuthCallback';

export default function App() {
  return (
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
          <Route path="/app/profile" element={<Profile />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}