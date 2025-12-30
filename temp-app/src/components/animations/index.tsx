import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useRef, type ReactNode, useState } from 'react';

// Page transition wrapper
export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// Scroll-triggered fade in
export const FadeInOnScroll = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered children animation container
export const StaggerContainer = ({ children, className = '', staggerDelay = 0.1 }: { children: ReactNode; className?: string; staggerDelay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Magnetic button effect
export const MagneticButton = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.15;
    const y = (clientY - top - height / 2) * 0.15;
    setPosition({ x, y });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 3D tilt card effect
export const TiltCard = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setRotateX(-y * 10);
    setRotateY(x * 10);
  };

  const reset = () => { setRotateX(0); setRotateY(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ rotateX, rotateY }}
      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Parallax scroll effect
export const Parallax = ({ children, offset = 50 }: { children: ReactNode; offset?: number }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
};

// Smooth number counter
export const SmoothCounter = ({ value, duration = 2 }: { value: number; duration?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { duration: duration * 1000 });
  const [display, setDisplay] = useState(0);

  if (isInView && spring.get() === 0) spring.set(value);
  spring.on('change', (v) => setDisplay(Math.round(v)));

  return <span ref={ref}>{display.toLocaleString()}</span>;
};

// Gradient text with animation
export const GradientText = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <motion.span
    className={`bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-[length:200%_auto] ${className}`}
    animate={{ backgroundPosition: ['0% center', '200% center'] }}
    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
  >
    {children}
  </motion.span>
);

// Floating element
export const Float = ({ children, delay = 0, y = 10 }: { children: ReactNode; delay?: number; y?: number }) => (
  <motion.div
    animate={{ y: [-y, y, -y] }}
    transition={{ duration: 4, repeat: Infinity, delay, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

