import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PublicNav } from '../components/Navigation';
import Footer from '../components/Footer';

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0a] mesh-bg">
      <PublicNav />
      
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="pt-20"
      >
        <Outlet />
      </motion.main>
      
      <Footer />
    </div>
  );
}

