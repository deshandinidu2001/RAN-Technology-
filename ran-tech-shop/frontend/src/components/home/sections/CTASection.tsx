import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BlurText, RotatingText } from '../animations';

gsap.registerPlugin(ScrollTrigger);

const CTASection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [80, 0]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animated gradient orbs
      gsap.to('.cta-orb-1', {
        x: 50,
        y: -30,
        scale: 1.1,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.cta-orb-2', {
        x: -40,
        y: 40,
        scale: 0.9,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.cta-orb-3', {
        x: 30,
        y: 50,
        scale: 1.15,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Floating particles
      gsap.utils.toArray('.cta-particle').forEach((particle: any, i) => {
        gsap.to(particle, {
          y: `random(-40, 40)`,
          x: `random(-30, 30)`,
          rotation: `random(-20, 20)`,
          duration: 3 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      });

      // CTA button glow pulse
      gsap.to('.cta-glow', {
        opacity: 0.8,
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-40 overflow-hidden"
    >
      {/* Animated Gradient Orbs Background */}
      <div className="absolute inset-0">
        <div className="cta-orb-1 absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#F7B500]/30 via-[#FF6B35]/20 to-transparent blur-[120px]" />
        <div className="cta-orb-2 absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#06B6D4]/25 via-[#7C3AED]/15 to-transparent blur-[100px]" />
        <div className="cta-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#7C3AED]/20 to-transparent blur-[80px]" />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-transparent to-[#0A0A0B]" />

      {/* Geometric Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="cta-particle absolute"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{
                background: ['#F7B500', '#06B6D4', '#7C3AED', '#FF6B35'][i % 4],
                opacity: 0.3 + Math.random() * 0.4
              }}
            />
          </div>
        ))}

        {/* Geometric Shapes */}
        <div className="cta-particle absolute top-20 left-[15%] w-20 h-20 border border-[#F7B500]/20 rotate-45" />
        <div className="cta-particle absolute bottom-32 right-[20%] w-16 h-16 border border-[#06B6D4]/20 rotate-12 rounded-full" />
        <div className="cta-particle absolute top-1/3 right-[10%] w-24 h-24 border border-[#7C3AED]/20 rounded-2xl" />
      </div>

      <motion.div
        ref={contentRef}
        style={{ scale, opacity, y }}
        className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10"
      >
        <div className="max-w-5xl mx-auto">
          {/* Content Card */}
          <div className="relative overflow-hidden rounded-[28px] sm:rounded-[40px] p-1 bg-gradient-to-br from-white/20 via-white/5 to-transparent">
            <div className="bg-[#0f0f14]/90 backdrop-blur-2xl rounded-[26px] sm:rounded-[38px] p-6 sm:p-10 md:p-16 text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 mb-8"
              >
                <div className="flex -space-x-2">
                  {['#F7B500', '#06B6D4', '#7C3AED'].map((color, i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-[#0f0f14] flex items-center justify-center"
                      style={{ background: color }}
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ))}
                </div>
                <span className="text-white/60 text-sm font-medium ml-2">Trusted by 10,000+ customers</span>
              </motion.div>

              {/* Main Heading */}
              <div className="mb-6">
                <BlurText
                  text="Ready to Upgrade"
                  animateBy="words"
                  direction="bottom"
                  delay={100}
                  className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight break-words"
                />
                <div 
                  className="inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #F7B500, #FF6B35)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  <BlurText
                    text="Your Tech?"
                    animateBy="words"
                    direction="bottom"
                    delay={200}
                    className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-tight"
                  />
                </div>
              </div>

              {/* Rotating Subtitle */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center justify-center gap-2 text-base sm:text-xl md:text-2xl text-white/60 mb-8 md:mb-12"
              >
                <span>Experience</span>
                <RotatingText
                  texts={['Premium Quality', 'Expert Service', 'Best Prices', 'Fast Delivery', 'Warranty Support']}
                  className="text-[#F7B500] font-bold"
                  rotationInterval={2500}
                />
                <span>with us</span>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                {/* Primary CTA */}
                <div className="relative group">
                  <div className="cta-glow absolute inset-0 bg-gradient-to-r from-[#F7B500] to-[#FF6B35] rounded-2xl blur-xl opacity-50" />
                  <motion.a
                    href="/shop"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative inline-flex items-center gap-3 px-7 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-[#F7B500] to-[#FF6B35] text-black font-bold rounded-2xl text-lg shadow-2xl group-hover:shadow-[#F7B500]/30"
                  >
                    <span>Browse Products</span>
                    <motion.svg 
                      className="w-5 h-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </motion.svg>
                  </motion.a>
                </div>

                {/* Secondary CTA */}
                <motion.a
                  href="/repair"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative overflow-hidden inline-flex items-center gap-3 px-7 sm:px-10 py-4 sm:py-5 bg-white/5 border border-white/20 backdrop-blur-sm text-white font-bold rounded-2xl text-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                >
                  <span>Book Repair</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </motion.a>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="mt-14 pt-10 border-t border-white/10"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Secure Payment', color: '#10B981' },
                    { icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', label: 'Free Delivery', color: '#06B6D4' },
                    { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Warranty', color: '#F7B500' },
                    { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', label: '24/7 Support', color: '#7C3AED' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5 }}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ background: `${item.color}20` }}
                      >
                        <svg 
                          className="w-6 h-6" 
                          style={{ color: item.color }}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                        </svg>
                      </div>
                      <span className="text-white/50 text-sm font-medium">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;