import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Two main theme colors: Gold (#F7B500) and Cyan (#06B6D4)
const services = [
  {
    title: 'Premium Laptops',
    description: 'Curated selection of high-performance laptops from top brands for professionals and gamers.',
    href: '/shop?category=laptops',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    iconBg: '#F7B500'
  },
  {
    title: 'Expert Repairs',
    description: 'Professional laptop repair services with certified technicians and genuine parts.',
    href: '/repair',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    iconBg: '#06B6D4'
  },
  {
    title: 'Custom Builds',
    description: 'Tailored computing solutions designed to meet your specific requirements and budget.',
    href: '/pc-build',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    iconBg: '#F7B500'
  },
  {
    title: 'Tech Support',
    description: '24/7 technical support to ensure your devices are always running at peak performance.',
    href: '/contact',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    iconBg: '#06B6D4'
  }
];

const sharedSectionBackground = '#050505';

const ServicesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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
            stagger: 0.1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: titleRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Subtitle animation
      gsap.fromTo('.services-subtitle',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards stagger animation from bottom
      gsap.fromTo('.service-card',
        { 
          y: 80, 
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 85%',
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
      className="relative py-28 overflow-hidden"
      style={{ background: sharedSectionBackground }}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-[520px] h-[520px] bg-[#F7B500]/[0.025] rounded-full blur-[220px]" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#F7B500] font-semibold tracking-[0.3em] uppercase mb-6 text-sm"
          >
            What We Offer
          </motion.p>
          
          {/* 3D Title with word-by-word animation */}
          <div className="overflow-hidden perspective-1000">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 flex flex-wrap justify-center gap-x-2">
              <span className="title-word inline-block" style={{ transformStyle: 'preserve-3d' }}>Our</span>
              <span className="title-word inline-block italic text-[#F7B500]" style={{ transformStyle: 'preserve-3d', fontFamily: 'Georgia, serif' }}>amazing</span>
              <span className="title-word inline-block" style={{ transformStyle: 'preserve-3d' }}>services!</span>
            </h2>
          </div>
          
          <p className="services-subtitle text-white/50 text-lg max-w-2xl mx-auto">
            Comprehensive technology solutions tailored to power your digital life
          </p>
        </div>

        {/* Services Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Link
              key={index}
              to={service.href}
              className="service-card group block"
            >
              <div className="h-full bg-[#16161a] border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:border-[#F7B500]/30">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-white transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: service.iconBg }}
                >
                  {service.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Learn More Link */}
                <span className="inline-flex items-center gap-2 text-[#F7B500] font-medium text-sm group-hover:gap-3 transition-all duration-300">
                  Learn More
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
