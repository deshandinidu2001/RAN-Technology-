import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BlurText, ScrollFloat } from '../animations';

gsap.registerPlugin(ScrollTrigger);

const repairServices = [
  {
    title: 'Screen Replacement',
    description: 'Cracked or damaged screen? We use genuine parts for perfect display restoration.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    price: 'Rs. 15,000',
    time: '2-4 Hours',
    color: '#06B6D4',
    gradient: 'from-[#06B6D4] to-[#0891B2]'
  },
  {
    title: 'Battery Replacement',
    description: 'Restore your laptop\'s battery life with original or high-quality replacements.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    price: 'Rs. 8,000',
    time: '1-2 Hours',
    color: '#10B981',
    gradient: 'from-[#10B981] to-[#059669]'
  },
  {
    title: 'Keyboard Repair',
    description: 'Fix sticky keys, replace damaged keyboards, or upgrade to backlit versions.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1zm3 3h2m2 0h2m2 0h2M6 12h12M8 15h8" />
      </svg>
    ),
    price: 'Rs. 5,000',
    time: '1-3 Hours',
    color: '#F7B500',
    gradient: 'from-[#F7B500] to-[#EAB308]'
  },
  {
    title: 'Data Recovery',
    description: 'Lost important files? Our experts can recover data from damaged drives.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    price: 'Rs. 10,000',
    time: '24-48 Hours',
    color: '#7C3AED',
    gradient: 'from-[#7C3AED] to-[#6D28D9]'
  },
  {
    title: 'Virus Removal',
    description: 'Complete malware removal and security setup to protect your system.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    price: 'Rs. 3,000',
    time: '2-4 Hours',
    color: '#FF6B35',
    gradient: 'from-[#FF6B35] to-[#EA580C]'
  },
  {
    title: 'Hardware Upgrade',
    description: 'RAM, SSD, and other component upgrades for better performance.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    price: 'Rs. 5,000',
    time: '1-2 Hours',
    color: '#EC4899',
    gradient: 'from-[#EC4899] to-[#DB2777]'
  }
];

const RepairSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cards entrance with 3D effect
      gsap.fromTo('.repair-card',
        { 
          y: 100, 
          opacity: 0,
          rotateX: -15,
          transformPerspective: 1000
        },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          stagger: {
            each: 0.1,
            from: 'start'
          },
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Floating decorative elements
      gsap.utils.toArray('.repair-float').forEach((el: any, i) => {
        gsap.to(el, {
          y: `random(-20, 20)`,
          x: `random(-15, 15)`,
          rotation: `random(-10, 10)`,
          duration: 3 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      });

      // Glowing orb animation
      gsap.to('.repair-orb', {
        scale: 1.2,
        opacity: 0.4,
        duration: 4,
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
      className="relative py-32 overflow-hidden bg-gradient-to-b from-[#0f0f14] via-[#0A0A0B] to-[#0A0A0B]"
    >
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        <div className="repair-orb absolute top-20 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#FF6B35]/15 to-transparent rounded-full blur-[150px]" />
        <div className="repair-orb absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-[#F7B500]/10 to-transparent rounded-full blur-[120px]" />
      </motion.div>

      {/* Geometric Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="repair-float absolute top-32 left-[8%] w-16 h-16 border border-[#F7B500]/20 rotate-45 rounded-lg" />
        <div className="repair-float absolute top-48 right-[12%] w-20 h-20 border border-[#06B6D4]/15 rounded-full" />
        <div className="repair-float absolute bottom-40 left-[15%] w-12 h-12 border border-[#7C3AED]/20 rotate-12" />
        <div className="repair-float absolute bottom-24 right-[8%] w-14 h-14 border-2 border-[#FF6B35]/15 rounded-2xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <ScrollFloat className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FF6B35]/20 to-[#F7B500]/20 border border-white/10 rounded-full px-6 py-2 mb-6"
          >
            <svg className="w-5 h-5 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-white/50 text-lg">Fast, reliable, and affordable</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 flex flex-wrap justify-center gap-x-2">
            <span>Get</span>
            <span className="italic text-[#F7B500]" style={{ fontFamily: 'Georgia, serif' }}>professional</span>
            <span>repairs!</span>
          </h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-white/50 text-lg max-w-2xl mx-auto"
          >
            Fast, reliable repairs by certified technicians with genuine parts and warranty
          </motion.p>
        </ScrollFloat>

        {/* Services Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repairServices.map((service, index) => (
            <motion.div
              key={index}
              className="repair-card group"
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-500">
                {/* Top Gradient Line */}
                <div 
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                />

                {/* Hover Glow Effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${service.color}15 0%, transparent 70%)`
                  }}
                />

                <div className="relative p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${service.color}30, ${service.color}10)`,
                        color: service.color 
                      }}
                    >
                      {service.icon}
                    </motion.div>

                    {/* Price Badge */}
                    <div 
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{ 
                        background: `${service.color}20`,
                        color: service.color 
                      }}
                    >
                      From {service.price}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-5 group-hover:text-white/60 transition-colors">
                    {service.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    {/* Time */}
                    <div className="flex items-center gap-2 text-white/40">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">{service.time}</span>
                    </div>

                    {/* Book Button */}
                    <motion.a
                      href="/repair"
                      whileHover={{ x: 3 }}
                      className="flex items-center gap-2 font-semibold text-sm group/btn"
                      style={{ color: service.color }}
                    >
                      <span>Book Now</span>
                      <svg 
                        className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="text-left">
              <h4 className="text-white font-bold text-lg">Need a custom repair?</h4>
              <p className="text-white/50 text-sm">Contact us for a free diagnostic</p>
            </div>
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-[#F7B500] to-[#FF6B35] text-black font-bold rounded-xl text-sm"
            >
              Get Free Quote
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RepairSection;