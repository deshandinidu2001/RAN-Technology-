import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Two main theme colors: Gold (#F7B500) and Cyan (#06B6D4)
const stats = [
  { 
    value: 10000, 
    suffix: '+', 
    label: 'HAPPY CUSTOMERS', 
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: '#F7B500',
    gradientFrom: '#F7B500',
    gradientTo: '#F59E0B'
  },
  { 
    value: 5000, 
    suffix: '+', 
    label: 'LAPTOPS SOLD', 
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: '#06B6D4',
    gradientFrom: '#06B6D4',
    gradientTo: '#0891B2'
  },
  { 
    value: 8000, 
    suffix: '+', 
    label: 'REPAIRS DONE', 
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: '#F7B500',
    gradientFrom: '#F7B500',
    gradientTo: '#F59E0B'
  },
  { 
    value: 99, 
    suffix: '%', 
    label: 'SATISFACTION RATE', 
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    color: '#06B6D4',
    gradientFrom: '#06B6D4',
    gradientTo: '#F7B500'
  }
];

// Counter component for animated numbers
const AnimatedCounter = ({ value, suffix, isVisible }: { value: number; suffix: string; isVisible: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number;
    const duration = 2000;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, isVisible]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return <span>{formatNumber(count)}{suffix}</span>;
};

const StatsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title word-by-word animation
      const titleWords = titleRef.current?.querySelectorAll('.title-word');
      if (titleWords) {
        gsap.fromTo(titleWords,
          { 
            y: 100, 
            opacity: 0,
            rotateX: -90
          },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Stats cards animation
      gsap.fromTo('.stat-card',
        { 
          y: 60, 
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            onEnter: () => setIsVisible(true)
          }
        }
      );

      // Bottom gradient line animation
      gsap.fromTo('.gradient-line',
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-28 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0A0A0B 0%, #0f1419 50%, #0A0A0B 100%)'
      }}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[#F7B500]/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-[#06B6D4]/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-10 md:mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#06B6D4] font-semibold tracking-[0.3em] uppercase mb-6 text-sm"
          >
            Our Impact
          </motion.p>
          
        {/* 3D Title with word-by-word animation */}
          <div className="overflow-hidden perspective-1000">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white flex flex-wrap justify-center gap-x-2 leading-tight">
              <span className="title-word inline-block" style={{ transformStyle: 'preserve-3d' }}>Why our</span>
              <span className="title-word inline-block italic text-[#F7B500]" style={{ transformStyle: 'preserve-3d', fontFamily: 'Georgia, serif' }}>numbers</span>
              <span className="title-word inline-block" style={{ transformStyle: 'preserve-3d' }}>matter!</span>
            </h2>
          </div>
        </div>

        {/* Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card"
            >
              <div className="relative h-full bg-[#16161a]/80 border border-white/10 rounded-2xl p-4 sm:p-8 text-center overflow-hidden">
                {/* Icon */}
                <div 
                  className="mb-4 flex justify-center"
                  style={{ color: stat.color }}
                >
                  {stat.icon}
                </div>

                {/* Number */}
                <div className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-2 break-words">
                  <AnimatedCounter 
                    value={stat.value} 
                    suffix={stat.suffix}
                    isVisible={isVisible}
                  />
                </div>

                {/* Label */}
                <p className="text-white/50 text-xs font-medium tracking-wider">
                  {stat.label}
                </p>

                {/* Bottom gradient line */}
                <div 
                  className="gradient-line absolute bottom-0 left-0 right-0 h-1 origin-left"
                  style={{ 
                    background: `linear-gradient(90deg, ${stat.gradientFrom}, ${stat.gradientTo})` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
