import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Lenis from 'lenis';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section with Video Background */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Video Background */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/landpage.mp4"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/80 to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(247,181,0,0.12),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(6,182,212,0.12),transparent_35%)]" />


        {/* Center Content */}
        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-white/60 text-sm sm:text-lg md:text-xl mb-4 sm:mb-6 font-medium tracking-wide">
              Unlock Your Tech Potential
            </p>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 sm:mb-8 break-words">
              <span className="text-white">Premium Tech</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-highlight">
                and Expert Repairs
              </span>
            </h1>

            <p className="text-white/70 text-sm sm:text-lg md:text-xl max-w-3xl mx-auto mb-8 sm:mb-12 font-light">
              Experience cutting-edge technology paired with precision repair services. From premium devices to expert restoration, we've got your tech covered.
            </p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/home')}
                className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-full text-lg transition-all shadow-[0_0_40px_rgba(247,181,0,0.3)]"
              >
                Shop Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/repair-home')}
                className="px-8 py-3 bg-transparent border-2 border-white/30 text-white font-bold rounded-full text-lg hover:border-primary/60 hover:bg-white/5 transition-all"
              >
                Book Repair
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
