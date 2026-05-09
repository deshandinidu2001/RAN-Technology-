import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Import sections
import {
  HeroVideoSection,
  ServicesSection,
  StatsSection,
  ProductShowcase,
  AboutSection,
  TestimonialsSection,
  CTASection,
  BrandsSection,
  VideoShowcaseSection
} from '../components/home/sections';

gsap.registerPlugin(ScrollTrigger);

// Color palette
const colors = {
  primary: '#F7B500',
  secondary: '#FF6B35',
  accent: '#7C3AED',
  highlight: '#06B6D4',
  dark: '#0A0A0B',
};

const Home = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset scroll position on mount
    window.scrollTo(0, 0);

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

    // Integrate Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Scroll progress indicator
    if (progressRef.current && containerRef.current) {
      gsap.to(progressRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3
        }
      });
    }

    // Refresh ScrollTrigger after a slightly longer delay to ensure DOM is ready and entry animations have finished
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      clearTimeout(refreshTimer);
      lenis.destroy();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-x-hidden"
      style={{ backgroundColor: colors.dark }}
    >
      {/* Scroll Progress Indicator */}
      <div
        ref={progressRef}
        className="fixed top-0 left-0 right-0 h-1 z-[100] origin-left"
        style={{
          background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,
          transform: 'scaleX(0)'
        }}
      />

      {/* Section 1: Hero Video */}
      <HeroVideoSection />

      {/* Section 2: Brands Marquee */}
      <BrandsSection />

      {/* Section 3: Services Grid */}
      <ServicesSection />

      {/* Section 4: Product Horizontal Scroll */}
      <ProductShowcase />

      {/* Section 5: Video Showcase */}
      <VideoShowcaseSection />

      {/* Section 6: About Company */}
      <AboutSection />

      {/* Section 6: Testimonials */}
      <TestimonialsSection />

      {/* Section 8: Stats Counter */}
      <StatsSection />

      {/* Section 9: Final CTA */}
      <CTASection />
    </div>
  );
};

export default Home;
