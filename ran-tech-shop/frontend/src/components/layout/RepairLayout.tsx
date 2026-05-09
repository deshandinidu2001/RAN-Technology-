import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RepairHeader from './RepairHeader.tsx';
import Footer from './Footer.tsx';
import ShopBot from '../chat/ShopBot';

const RepairLayout: React.FC = () => {
  const location = useLocation();

  // On every route change inside the repair section, scroll to top and clean up any
  // stale GSAP ScrollTriggers/pin-spacers left behind by the previous page so the
  // new page renders from the top instead of inheriting a pinned scroll position.
  useEffect(() => {
    window.scrollTo(0, 0);
    ScrollTrigger.getAll().forEach((t) => t.kill());
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => window.clearTimeout(id);
  }, [location.pathname]);

  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    enter: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.61, 1, 0.88, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: [0.61, 1, 0.88, 1],
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark">
      {/* Background gradient - Same as Shop section */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-200 to-dark" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Repair Header Navigation */}
      <RepairHeader />

      {/* Main content */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="enter"
            exit="exit"
            variants={pageVariants}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>

      {/* Support Chatbot */}
      <ShopBot />
    </div>
  );
};

export default RepairLayout;
