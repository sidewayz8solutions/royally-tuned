import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppNav } from '../components/Navigation';
import Footer from '../components/Footer';

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AppNav />
      
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="pt-24 pb-12 min-h-[calc(100vh-80px)]"
      >
        <Outlet />
      </motion.main>
      
      <Footer />
    </div>
  );
}

