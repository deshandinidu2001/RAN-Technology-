import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Laptop, Monitor, Smartphone, KeyboardIcon, Wrench, PcCase, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import type { RepairReview } from '../types';
import { useAuthStore } from '../store/authStore';

gsap.registerPlugin(ScrollTrigger);

/* ─── Constants ──────────────────────────────────────────────── */
type ServiceItem = { icon: string; title: string; description: string; price: string; image?: string };

const FALLBACK_SERVICE_IMAGES: Record<string, string> = {
  Laptop: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1600&q=80',
  Monitor: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1600&q=80',
  Smartphone: 'https://images.unsplash.com/photo-1592434134753-a70baf7979d5?w=1600&q=80',
  KeyboardIcon: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1600&q=80',
  Wrench: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1600&q=80',
  PcCase: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1600&q=80',
};

const FALLBACK_SERVICES: ServiceItem[] = [
  { icon: 'Laptop', title: 'Laptop Repair', description: 'Screen replacement, keyboard repair, battery replacement, and more.', price: 'From Rs. 500', image: FALLBACK_SERVICE_IMAGES.Laptop },
  { icon: 'Monitor', title: 'Desktop Repair', description: 'Hardware upgrades, troubleshooting, virus removal, and optimization.', price: 'From Rs. 400', image: FALLBACK_SERVICE_IMAGES.PcCase },
  { icon: 'Smartphone', title: 'Phone Repair', description: 'Screen repair, battery replacement, water damage recovery.', price: 'From Rs. 300', image: FALLBACK_SERVICE_IMAGES.Smartphone },
  { icon: 'Monitor', title: 'Monitor Repair', description: 'Dead pixels, backlight issues, power problems fixed.', price: 'From Rs. 600', image: FALLBACK_SERVICE_IMAGES.Monitor },
  { icon: 'KeyboardIcon', title: 'Peripheral Repair', description: 'Keyboards, mice, headsets, and other accessories.', price: 'From Rs. 200', image: FALLBACK_SERVICE_IMAGES.KeyboardIcon },
  { icon: 'Wrench', title: 'Custom Builds', description: 'Custom PC building and hardware installation services.', price: 'From Rs. 1,000', image: FALLBACK_SERVICE_IMAGES.Wrench },
];

/** Pick a Lucide icon name based on product fields */
const pickServiceIcon = (p: { name?: string; subcategory?: string; serviceType?: string }): string => {
  const t = `${p.name || ''} ${p.subcategory || ''} ${p.serviceType || ''}`.toLowerCase();
  if (t.includes('laptop')) return 'Laptop';
  if (t.includes('phone') || t.includes('mobile')) return 'Smartphone';
  if (t.includes('monitor') || t.includes('display') || t.includes('desktop')) return 'Monitor';
  if (t.includes('keyboard') || t.includes('peripheral') || t.includes('mouse')) return 'KeyboardIcon';
  if (t.includes('build') || t.includes('custom')) return 'Wrench';
  return 'PcCase';
};

const STATS = [
  { value: '5000+', label: 'Devices Repaired' },
  { value: '98%', label: 'Success Rate' },
  { value: '24hrs', label: 'Avg Turnaround' },
  { value: '90 Days', label: 'Warranty' },
] as const;

type UpgradeItem = { icon: ReactNode; title: string; description: string; price: string };

const UPGRADE_ICONS: Record<string, ReactNode> = {
  ram: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5.36 0a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" /></svg>
  ),
  ssd: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  ),
  battery: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  cooling: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
  ),
  default: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
  ),
};

const pickUpgradeIcon = (name: string): ReactNode => {
  const n = name.toLowerCase();
  if (n.includes('ram') || n.includes('memory')) return UPGRADE_ICONS.ram;
  if (n.includes('ssd') || n.includes('storage') || n.includes('hdd') || n.includes('nvme')) return UPGRADE_ICONS.ssd;
  if (n.includes('battery')) return UPGRADE_ICONS.battery;
  if (n.includes('cool') || n.includes('thermal') || n.includes('fan')) return UPGRADE_ICONS.cooling;
  return UPGRADE_ICONS.default;
};

const FALLBACK_UPGRADES: UpgradeItem[] = [
  { icon: UPGRADE_ICONS.ram, title: 'RAM Upgrade', description: 'Boost performance with DDR4/DDR5 RAM', price: 'From Rs. 2,000' },
  { icon: UPGRADE_ICONS.ssd, title: 'SSD Upgrade', description: 'Replace HDD with fast NVMe SSD', price: 'From Rs. 3,000' },
  { icon: UPGRADE_ICONS.battery, title: 'Battery Replacement', description: 'New battery installation for laptops', price: 'From Rs. 1,500' },
  { icon: UPGRADE_ICONS.cooling, title: 'Cooling Upgrade', description: 'Better thermal management solution', price: 'From Rs. 1,000' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Book Online', desc: 'Schedule a convenient time slot through our booking system' },
  { step: '02', title: 'Drop Off', desc: 'Bring your device to our service center' },
  { step: '03', title: 'We Repair', desc: 'Expert technicians diagnose and fix your device' },
  { step: '04', title: 'Pick Up', desc: 'Collect your fully restored device' },
] as const;

const FEATURES = [
  { icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  ), title: 'Expert Technicians', desc: 'Certified professionals with years of experience' },
  { icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  ), title: 'Fast Service', desc: '24-hour average turnaround on most repairs' },
  { icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7.268-4.394a1.5 1.5 0 10-2.122-2.122l-.841.84-.172-.172a1.5 1.5 0 10-2.122 2.122l3.264 3.264a1.5 1.5 0 002.122 0l3.071-3.071zM12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ), title: '90-Day Warranty', desc: 'Full warranty on all repair services' },
] as const;

const FALLBACK_REVIEWS: LocalReview[] = [
  { id: 1, name: 'Chamara Bandara', rating: 5, text: 'Fixed my laptop screen within 2 hours! Outstanding service at a very fair price. Best tech shop in Monaragala.', device: 'Dell Inspiron 15' },
  { id: 2, name: 'Nadeeka Perera', rating: 5, text: 'Excellent RAM upgrade service. My laptop performance improved dramatically. Highly recommended!', device: 'ASUS VivoBook' },
  { id: 3, name: 'Pradeep Kumara', rating: 5, text: 'Very professional team. Fixed my gaming laptop overheating issue same day. Great work!', device: 'ASUS ROG Strix' },
  { id: 4, name: 'Sanduni Jayawardena', rating: 5, text: 'SSD upgrade was done perfectly. My laptop boots in seconds now. Thank you RAN Technology!', device: 'HP Pavilion 15' },
  { id: 5, name: 'Ruwan Dissanayake', rating: 5, text: 'Came from Wellawaya for the service, completely worth the trip. Repaired my laptop motherboard!', device: 'Lenovo ThinkPad' },
];

/* ─── Types ───────────────────────────────────────────────────── */
interface LocalReview { id: number; name: string; rating: number; text: string; device: string }
interface NewReviewForm { name: string; rating: number; text: string; device: string }

/* ─── Animation Helpers ──────────────────────────────────────── */

/** Split-text reveal. words slide up from behind a mask */
const RevealText = ({ children, className = '', delay = 0 }: { children: string; className?: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {children.split(' ').map((word, i) => (
        <span key={i} className="overflow-hidden inline-block mr-[0.3em]">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', rotate: 2 }}
            animate={isInView ? { y: '0%', rotate: 0 } : { y: '110%', rotate: 2 }}
            transition={{ duration: 0.8, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

/** Animated counter with count-up effect */
const Counter = ({ target, suffix = '', className = '' }: { target: number; suffix?: string; className?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);
  return <span ref={ref} className={className}>{count}{suffix}</span>;
};

/** Infinite horizontal marquee */
const Marquee = ({ children, reverse = false, speed = 40 }: { children: ReactNode; reverse?: boolean; speed?: number }) => (
  <div className="overflow-hidden whitespace-nowrap select-none">
    <motion.div
      className="inline-flex"
      animate={{ x: reverse ? ['0%', '-50%'] : ['-50%', '0%'] }}
      transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
    >
      {children}
      {children}
    </motion.div>
  </div>
);

/** Magnetic hover button */
const MagneticButton = ({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const RepairHome = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const { user, isAuthenticated } = useAuthStore();

  const [reviews, setReviews] = useState<LocalReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newReview, setNewReview] = useState<NewReviewForm>({ name: '', rating: 5, text: '', device: '' });

  // Pre-fill the review name when the user is logged in
  useEffect(() => {
    if (user?.name) {
      setNewReview(prev => prev.name ? prev : { ...prev, name: user.name });
    }
  }, [user]);
  const [services, setServices] = useState<ServiceItem[]>(FALLBACK_SERVICES);
  const [upgrades, setUpgrades] = useState<UpgradeItem[]>(FALLBACK_UPGRADES);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get('/repairs/reviews');
        const list = Array.isArray(data) ? data : data.reviews || [];
        setReviews(list.map((r: RepairReview, i: number) => ({
          id: i + 1, name: r.userName, rating: r.rating, text: r.comment, device: r.serviceName || r.serviceType,
        })));
      } catch {
        setReviews([...FALLBACK_REVIEWS]);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Fetch repair services & upgrades from DB (admin-curated via Product.featured)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Fetch all services in one call, then split client-side.
        // "Upgrade Your Device" section -> serviceType === 'upgrade'
        // "What We Repair" section -> everything else (repair, maintenance, data, ...)
        const res = await api.get('/repairs/services');
        const allItems: any[] = res.data?.services ?? [];

        const upgradeItems = allItems.filter(i => (i.serviceType || '').toLowerCase() === 'upgrade');
        const repairItems = allItems.filter(i => (i.serviceType || '').toLowerCase() !== 'upgrade');

        // Admin curation: only items the admin marked as featured ("on home").
        // If none marked, show all so the page never goes empty.
        const pickFeatured = (items: any[]) => {
          const featured = items.filter(i => i.featured);
          return featured.length > 0 ? featured : items;
        };

        const repairs = pickFeatured(repairItems);
        if (repairs.length > 0) {
          setServices(repairs.map(p => {
            const icon = pickServiceIcon(p);
            return {
              icon,
              title: p.name,
              description: p.description || '',
              price: typeof p.price === 'number' ? `From Rs. ${p.price.toLocaleString()}` : 'From Rs. ',
              image: p.image || FALLBACK_SERVICE_IMAGES[icon] || FALLBACK_SERVICE_IMAGES.Laptop,
            };
          }));
        }

        const ups = pickFeatured(upgradeItems);
        if (ups.length > 0) {
          setUpgrades(ups.map(p => ({
            icon: pickUpgradeIcon(p.name || ''),
            title: p.name,
            description: p.description || '',
            price: typeof p.price === 'number' ? `From Rs. ${p.price.toLocaleString()}` : 'From Rs. ',
          })));
        }
      } catch {
        // keep fallbacks
      }
    };
    fetchServices();
  }, []);

  // Smooth scroll + progress bar
  useEffect(() => {
    // Reset scroll on (re)mount so we don't land in a previous pin/scrub position
    window.scrollTo(0, 0);

    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    if (progressRef.current && containerRef.current) {
      gsap.to(progressRef.current, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
      });
    }

    // After the page transition + DOM settle, refresh ScrollTrigger so pins/triggers
    // measure against the new layout (fixes blank-page on remount from another route)
    const refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 250);

    return () => {
      clearTimeout(refreshTimer);
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  // Review submission
  const handleAddReview = useCallback(async () => {
    if (!newReview.name || !newReview.text || !newReview.device) return;
    setSubmitLoading(true);
    try {
      await api.post('/repairs/reviews', {
        userName: newReview.name, serviceType: 'hardware', serviceName: newReview.device,
        rating: newReview.rating, comment: newReview.text,
      });
    } catch { /* silent */ } finally {
      setReviews(prev => [...prev, { id: prev.length + 1, ...newReview }]);
      setNewReview({ name: '', rating: 5, text: '', device: '' });
      setShowReviewForm(false);
      setSubmitLoading(false);
    }
  }, [newReview]);

  return (
    <div ref={containerRef}
      className="relative min-h-screen bg-black overflow-x-hidden"
    >
      {/* Scroll Progress */}
      <div ref={progressRef} className="fixed top-0 left-0 right-0 h-[2px] bg-white z-[100] origin-left" style={{ transform: 'scaleX(0)' }} />

      <HeroSection navigate={navigate} />
      <MarqueeSection />
      <ServicesSection navigate={navigate} services={services} />
      <ProcessSection />
      <UpgradesSection upgrades={upgrades} />
      <CustomBuildSection navigate={navigate} />
      <ReviewsSection reviews={reviews} reviewsLoading={reviewsLoading} showReviewForm={showReviewForm}
        setShowReviewForm={setShowReviewForm} newReview={newReview} setNewReview={setNewReview}
        handleAddReview={handleAddReview} submitLoading={submitLoading}
        isAuthenticated={isAuthenticated} userName={user?.name} navigate={navigate}
      />
      <FeaturesSection />
      <CTASection navigate={navigate} />
    </div>
  );
};

/* ─── Hero Section ───────────────────────────────────────────── */
const HeroSection = ({ navigate }: { navigate: (path: string) => void }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center bg-black overflow-hidden pt-24 pb-32 lg:pt-0 lg:pb-0">
      {/* Background Video on Right */}
      <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
        <video
          className="w-full h-full object-cover opacity-80"
          src="/videos/repair.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
      </div>

      {/* Dot grid background */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Parallax watermark */}
      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block text-[20vw] font-black text-white/[0.02] select-none leading-none tracking-tighter pointer-events-none"
        style={{ y: textY }}
      >
        RAN
      </motion.div>

      {/* Corner brackets */}
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5, duration: 1 }}
        className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-white/10" />
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-white/10" />

      <motion.div style={{ y: textY, opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 w-full container mx-auto px-4 lg:px-6"
      >
        <div className="w-full">
        {/* Label */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="flex items-center gap-4 mb-12"
        >
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-px w-16 bg-white/40 origin-left" />
          <span className="text-xs font-mono tracking-[0.3em] text-white/40 uppercase">Professional Device Repair</span>
        </motion.div>

        {/* Main heading. masked word reveal */}
        <div className="space-y-2 mb-12">
          <div className="overflow-hidden">
            <motion.h1 initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(2.25rem,10vw,9rem)] font-extralight text-white leading-[0.95] tracking-tight"
            >
              Expert
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1 initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ delay: 0.45, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(2.25rem,10vw,9rem)] font-black text-white leading-[0.95] tracking-tight"
            >
              Device
            </motion.h1>
          </div>
          <div className="overflow-hidden flex items-end gap-6">
            <motion.h1 initial={{ y: '100%' }} animate={{ y: 0 }}
              transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(3rem,10vw,9rem)] font-extralight text-white/30 leading-[0.9] tracking-tight"
            >
              Repair
            </motion.h1>
            <motion.div initial={{ width: 0 }} animate={{ width: '30%' }}
              transition={{ delay: 1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-[2px] bg-white/20 mb-6 hidden lg:block" />
          </div>
        </div>

        {/* Description */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-lg text-white/50 font-light max-w-lg mb-12 leading-relaxed"
        >
          Certified technicians. Premium parts. Precision service. We restore your devices to peak performance.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <MagneticButton onClick={() => navigate('/repair')}
            className="group px-10 py-5 bg-white text-black font-medium text-sm tracking-wide flex items-center gap-3"
          >
            <span>Schedule Repair</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </MagneticButton>

          <MagneticButton onClick={() => navigate('/repair-contact')}
            className="px-10 py-5 border border-white/20 text-white font-medium text-sm tracking-wide hover:bg-white/5 transition-colors duration-500"
          >
            Get Quote
          </MagneticButton>
        </motion.div>

        {/* Bottom stats row with counters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 1 }}
          className="flex flex-wrap items-center gap-6 sm:gap-10 mt-12 sm:mt-20 pt-8 border-t border-white/10"
        >
          {([
            { target: 5000, suffix: '+', label: 'Devices Repaired' },
            { target: 98, suffix: '%', label: 'Success Rate' },
            { target: 24, suffix: 'hr', label: 'Avg Turnaround' },
            { target: 90, suffix: ' day', label: 'Warranty' },
          ] as const).map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.1 }} className="flex flex-col"
            >
              <span className="text-3xl font-light text-white tracking-tight">
                <Counter target={stat.target} suffix={stat.suffix} />
              </span>
              <span className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-[10px] text-white/30 tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
};

/* ─── Marquee Stats ──────────────────────────────────────────── */
const MarqueeSection = () => (
  <section className="py-6 bg-black border-y border-white/5 overflow-hidden">
    <Marquee speed={35}>
      {['5000+ Devices Repaired', '98% Success Rate', '24hr Turnaround', '90-Day Warranty',
        'Certified Technicians', 'Premium Parts', 'Free Diagnostics'].map((item) => (
        <span key={item} className="inline-flex items-center gap-6 mx-8">
          <span className="text-sm font-light text-white/30 tracking-wider uppercase">{item}</span>
          <span className="w-1.5 h-1.5 bg-white/10 rotate-45" />
        </span>
      ))}
    </Marquee>
  </section>
);

/* ─── Services. Image Card Grid ─────────────────────────────── */
const ServicesSection = ({ navigate, services }: { navigate: (path: string) => void; services: ServiceItem[] }) => {
  const iconMap: Record<string, typeof Laptop> = { Laptop, Monitor, Smartphone, KeyboardIcon, Wrench, PcCase };

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6 relative">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-20 flex items-end justify-between flex-wrap gap-6"
        >
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-12 bg-black/20" />
              <span className="text-xs font-mono tracking-[0.3em] text-black/40 uppercase">Services</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-light text-black tracking-tight">
              <RevealText>What We Repair</RevealText>
            </h2>
          </div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="text-sm text-black/40 max-w-xs leading-relaxed"
          >
            Premium parts. Certified hands. Every repair is diagnosed, documented, and warrantied.
          </motion.p>
        </motion.div>

        {/* Image card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Wrench;
            const image = service.image || FALLBACK_SERVICE_IMAGES.Laptop;

            return (
              <motion.article
                key={`${service.title}-${index}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: index * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => navigate('/repair')}
                whileHover="hover"
                className="group relative aspect-[4/5] cursor-pointer overflow-hidden bg-white border border-black/10 hover:border-black/30 transition-colors duration-500"
              >
                {/* Full-bleed image */}
                <motion.div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${image})` }}
                  variants={{ hover: { scale: 1.08 } }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* White overlay + gradient */}
                <div className="absolute inset-0 bg-white/15 group-hover:bg-white/5 transition-colors duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/30 to-transparent" />

                {/* Animated accent corner */}
                <motion.div
                  className="absolute top-5 left-5 w-8 h-8 border-l border-t border-black/0 group-hover:border-black/50 transition-colors duration-500"
                  variants={{ hover: { width: 48, height: 48 } }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                  className="absolute bottom-5 right-5 w-8 h-8 border-r border-b border-black/0 group-hover:border-black/50 transition-colors duration-500"
                  variants={{ hover: { width: 48, height: 48 } }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Index badge */}
                <div className="absolute top-6 right-6 z-10">
                  <span className="text-[10px] font-mono text-black/40 tracking-[0.3em]">
                    {String(index + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Icon. animated up on hover */}
                <motion.div
                  className="absolute top-6 left-6 z-10 w-12 h-12 flex items-center justify-center border border-black/20 backdrop-blur-sm bg-white/60"
                  variants={{ hover: { y: -4, borderColor: 'rgba(0,0,0,0.5)' } }}
                  transition={{ duration: 0.4 }}
                >
                  <IconComponent className="w-5 h-5 text-black" />
                </motion.div>

                {/* Content overlay */}
                <div className="absolute inset-x-0 bottom-0 p-7 z-10">
                  <motion.h3
                    className="text-2xl md:text-3xl font-light text-black tracking-tight mb-3 leading-tight"
                    variants={{ hover: { y: -6 } }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {service.title}
                  </motion.h3>

                  {/* Description. slides up on hover */}
                  <motion.p
                    className="text-xs text-black/60 leading-relaxed mb-4 line-clamp-2"
                    initial={{ opacity: 0.7 }}
                    variants={{ hover: { opacity: 1 } }}
                  >
                    {service.description}
                  </motion.p>

                  <div className="flex items-center justify-between pt-4 border-t border-black/15">
                    <span className="text-xs font-mono text-black/70 tracking-wider">{service.price}</span>
                    <motion.div
                      className="flex items-center gap-2 text-xs text-black/60 font-mono uppercase tracking-wider"
                      variants={{ hover: { x: 4, color: '#000000' } }}
                      transition={{ duration: 0.4 }}
                    >
                      <span>Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.div>
                  </div>
                </div>

                {/* Bottom accent bar that fills on hover */}
                <motion.div
                  className="absolute bottom-0 left-0 h-[2px] bg-black origin-left"
                  initial={{ scaleX: 0, width: '100%' }}
                  variants={{ hover: { scaleX: 1 } }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.article>
            );
          })}
        </div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-14 flex items-center justify-center"
        >
          <button
            onClick={() => navigate('/repair')}
            className="group inline-flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-black/60 hover:text-black transition-colors duration-300"
          >
            <span className="h-px w-10 bg-black/30 group-hover:w-16 group-hover:bg-black transition-all duration-500" />
            Book Any Repair
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

/* ─── Process Section ────────────────────────────────────────── */
const ProcessSection = () => {
  const ref = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-120px' });
  const progress = useMotionValue(0);
  const lineProgress = useTransform(progress, [0, 1], [0, 1]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!ref.current || !pinRef.current) return;
    // Skip pin/scrub on small screens. it traps mobile scroll & overlays content
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setActiveIndex(PROCESS_STEPS.length - 1);
      progress.set(1);
      return;
    }

    let trigger: ScrollTrigger | null = null;
    // Defer creation so the parent's Lenis + ticker are wired to ScrollTrigger
    // before we create this trigger; otherwise measurements happen pre-smooth-scroll.
    const setupTimer = setTimeout(() => {
      if (!ref.current || !pinRef.current) return;
      trigger = ScrollTrigger.create({
        trigger: ref.current,
        pin: pinRef.current,
        pinSpacing: true,
        start: 'top top',
        end: '+=1500',
        scrub: 0.25,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const value = self.progress;
          progress.set(value);
          setActiveIndex(
            Math.min(PROCESS_STEPS.length - 1, Math.floor(value * PROCESS_STEPS.length))
          );
        },
      });
      ScrollTrigger.refresh();
    }, 350);

    return () => {
      clearTimeout(setupTimer);
      trigger?.kill();
    };
  }, [progress]);

  return (
    <section ref={ref} className="relative bg-black">
      <div ref={pinRef} className="relative min-h-screen bg-black overflow-hidden flex items-center py-20 md:py-24">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

      <div className="relative z-10 w-full container mx-auto px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 md:mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-white/25" />
            <span className="text-xs font-mono tracking-[0.32em] text-white/45 uppercase">Repair Process</span>
          </div>
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-end">
            <h2 className="lg:col-span-6 text-5xl md:text-7xl font-light text-white tracking-tight leading-[0.95]">
              <RevealText>How It Works</RevealText>
            </h2>
            <p className="lg:col-span-4 text-sm md:text-base text-white/50 leading-relaxed max-w-xl">
              A clear four-step repair flow, from booking to pickup, designed to keep your device moving without confusion.
            </p>
          </div>
        </motion.div>

        <div className="relative">
          <div className="absolute top-10 left-0 right-0 h-px bg-white/10 hidden lg:block" />
          <motion.div
            className="absolute top-10 left-0 right-0 h-px bg-white hidden lg:block origin-left"
            style={{ scaleX: lineProgress }}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {PROCESS_STEPS.map((step, i) => {
              const isActive = i === activeIndex;
              const isPassed = i < activeIndex;

              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 34 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  animate={{
                    y: isActive ? -10 : 0,
                    opacity: isActive || isPassed || isInView ? 1 : 0.65,
                  }}
                  transition={{ duration: 0.45, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <motion.div
                    whileHover={{ y: -6 }}
                    animate={{
                      backgroundColor: isActive ? '#ffffff' : '#111111',
                      borderColor: isActive || isPassed ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.10)',
                      color: isActive ? '#000000' : '#ffffff',
                    }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className={`group h-full min-h-[260px] border p-7 md:p-8 transition-colors duration-500 ${
                      isActive
                        ? 'shadow-[0_24px_70px_rgba(255,255,255,0.08)]'
                        : 'hover:border-white/35'
                    }`}
                  >
                    <div className="flex items-start mb-12">
                      <div
                        className={`h-16 w-16 flex items-center justify-center border font-mono text-2xl font-light ${
                          isActive ? 'border-black/20 text-black' : isPassed ? 'border-white/35 text-white' : 'border-white/15 text-white/55'
                        }`}
                      >
                        {step.step}
                      </div>
                    </div>

                    <p
                      className={`text-[10px] font-mono tracking-[0.26em] uppercase mb-4 ${
                        isActive ? 'text-black/45' : isPassed ? 'text-white/45' : 'text-white/35'
                      }`}
                    >
                      {isActive ? 'Active Step' : isPassed ? 'Completed' : `Step ${step.step}`}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-medium tracking-tight mb-4">
                      {step.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${isActive ? 'text-black/58' : 'text-white/52'}`}>
                      {step.desc}
                    </p>
                  </motion.div>

                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 h-px bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-white origin-left"
              style={{ scaleX: lineProgress }}
            />
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

/* ─── Upgrades Section ───────────────────────────────────────── */
const UpgradesSection = ({ upgrades }: { upgrades: UpgradeItem[] }) => (
  <section className="py-32 bg-white">
    <div className="container mx-auto px-4 lg:px-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="mb-20"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-black/20" />
          <span className="text-xs font-mono tracking-[0.3em] text-black/40 uppercase">Upgrades</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-light text-black tracking-tight">
          <RevealText>Upgrade Your Device</RevealText>
        </h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-sm text-black/40 mt-6 max-w-lg"
        >
          Enhance your device's performance with our professional upgrade services.
        </motion.p>
      </motion.div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1">
        {upgrades.map((upgrade, i) => (
          <motion.div key={upgrade.title}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.7 }}
            whileHover="hovered"
            className="group relative bg-black/[0.02] border border-black/5 hover:border-black/20 p-10 transition-all duration-700 cursor-pointer overflow-hidden"
          >
            {/* Hover fill */}
            <motion.div className="absolute inset-0 bg-black/[0.03]"
              initial={{ y: '100%' }}
              variants={{ hovered: { y: '0%' } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />

            <div className="relative z-10">
              <motion.div className="text-5xl mb-6 text-black"
                variants={{ hovered: { scale: 1.2, rotate: 5 } }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {upgrade.icon}
              </motion.div>

              <h3 className="text-lg font-medium text-black mb-3 tracking-tight">{upgrade.title}</h3>
              <p className="text-xs text-black/40 mb-6 leading-relaxed">{upgrade.description}</p>

              {/* Price → Learn more slide */}
              <div className="h-6 overflow-hidden">
                <div className="group-hover:-translate-y-6 transition-transform duration-300">
                  <div className="text-sm font-mono text-black/60 h-6">{upgrade.price}</div>
                  <div className="text-sm font-mono text-black h-6 flex items-center gap-2">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Custom Build Section (white) ───────────────────────────── */
const CustomBuildSection = ({ navigate }: { navigate: (path: string) => void }) => {
  const buildSteps = [
    { num: '01', label: 'Choose Components', desc: 'Pick CPU, GPU, RAM, storage and case from our curated catalog.' },
    { num: '02', label: 'Free Assembly', desc: 'Certified technicians cable-manage and assemble your build.' },
    { num: '03', label: '72h Stress Tested', desc: 'Every PC ships only after a full thermal & stability run.' },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  // Parallax: title drifts up, grid drifts opposite, badge bar slides
  const titleY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const gridY = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const badgeX = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);
  const stepsY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={sectionRef} className="relative py-32 bg-black overflow-hidden border-y border-white/5">
      {/* Parallax grid background */}
      <motion.div style={{ y: gridY }} className="absolute inset-0 opacity-[0.05] pointer-events-none"
        aria-hidden
      >
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </motion.div>

      {/* Floating accent words drifting horizontally */}
      <motion.div style={{ x: badgeX }} aria-hidden
        className="absolute -top-4 left-0 right-0 whitespace-nowrap text-[120px] md:text-[200px] font-black tracking-tighter text-white/[0.03] select-none pointer-events-none leading-none"
      >
        BUILD · ASSEMBLE · STRESS-TEST · BUILD · ASSEMBLE
      </motion.div>

      <div className="container mx-auto px-4 lg:px-6 relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left — copy */}
          <motion.div style={{ y: titleY }} className="lg:col-span-6">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4 mb-6"
            >
              <motion.div className="h-px bg-white/20"
                initial={{ width: 0 }} whileInView={{ width: 48 }} viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="text-xs font-mono tracking-[0.3em] text-white/40 uppercase">Custom Build</span>
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-light text-white tracking-tight">
              <RevealText>Build Your</RevealText>
            </h2>
            <h2 className="text-5xl md:text-7xl font-light text-white/25 tracking-tight">
              <RevealText delay={0.25}>Dream PC</RevealText>
            </h2>

            <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-sm text-white/50 mt-8 max-w-md leading-relaxed"
            >
              Configure a workstation, gaming rig, or content-creation beast — component by component.
              We handle assembly, cable management, and 72-hour stress testing so it arrives ready to run.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 mt-10"
            >
              <motion.button onClick={() => navigate('/pc-build')}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black text-sm font-medium hover:bg-white/85 transition-colors"
              >
                Start Building
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button onClick={() => navigate('/repair-contact')}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/15 text-white text-sm font-medium hover:bg-white/[0.06] transition-colors"
              >
                Talk to a Specialist
              </motion.button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="flex items-center gap-6 mt-10 text-[10px] tracking-[0.25em] uppercase text-white/40"
            >
              <span>Free Assembly</span>
              <span className="w-1 h-1 bg-white/30 rotate-45" />
              <span>2-Year Warranty</span>
              <span className="w-1 h-1 bg-white/30 rotate-45" />
              <span>Stress Tested</span>
            </motion.div>
          </motion.div>

          {/* Right — process steps with stagger + parallax */}
          <motion.div style={{ y: stepsY }} className="lg:col-span-6 space-y-px bg-white/[0.06]">
            {buildSteps.map((s, i) => (
              <motion.div key={s.num}
                initial={{ opacity: 0, x: 40, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ x: -4 }}
                className="group relative bg-white/[0.04] p-8 md:p-10 hover:bg-white/[0.08] transition-colors duration-500 cursor-pointer"
              >
                <div className="flex items-start gap-6">
                  <span className="text-xs font-mono text-white/30 tracking-[0.3em] mt-1.5">{s.num}</span>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-light text-white tracking-tight mb-2">{s.label}</h3>
                    <p className="text-xs text-white/50 leading-relaxed max-w-md">{s.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
                </div>
                {/* Hover progress underline */}
                <motion.div className="absolute left-0 bottom-0 h-px bg-white origin-left"
                  initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ width: '100%' }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ─── Reviews Section ────────────────────────────────────────── */
const ReviewsSection = ({
  reviews, reviewsLoading, showReviewForm, setShowReviewForm,
  newReview, setNewReview, handleAddReview, submitLoading,
  isAuthenticated, userName, navigate,
}: {
  reviews: LocalReview[]; reviewsLoading: boolean; showReviewForm: boolean;
  setShowReviewForm: (s: boolean) => void; newReview: NewReviewForm;
  setNewReview: (r: NewReviewForm) => void; handleAddReview: () => void; submitLoading: boolean;
  isAuthenticated: boolean; userName?: string; navigate: (path: string) => void;
}) => {
  const [activeReview, setActiveReview] = useState(0);

  // Auto-rotate
  useEffect(() => {
    if (reviews.length === 0) return;
    const timer = setInterval(() => setActiveReview(prev => (prev + 1) % reviews.length), 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-black/20" />
            <span className="text-xs font-mono tracking-[0.3em] text-black/40 uppercase">Reviews</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-light text-black tracking-tight">
            <RevealText>What Customers Say</RevealText>
          </h2>
        </motion.div>

        {reviewsLoading ? (
          <div className="flex justify-center py-20">
            <motion.div className="w-12 h-12 border-2 border-black border-t-transparent"
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-black/40 py-20">No reviews yet. Be the first!</p>
        ) : (
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Large active review */}
            <AnimatePresence mode="wait">
              <motion.div key={activeReview}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span className="text-[8rem] font-serif text-black/5 leading-none block -mb-16"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                >"</motion.span>

                <p className="text-2xl md:text-3xl font-light text-black leading-relaxed mb-8">
                  {reviews[activeReview]?.text}
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black flex items-center justify-center text-white text-sm font-medium">
                    {reviews[activeReview]?.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-black">{reviews[activeReview]?.name}</div>
                    <div className="text-xs text-black/40">{reviews[activeReview]?.device}</div>
                  </div>
                  <div className="flex gap-0.5 ml-auto">
                    {[...Array(reviews[activeReview]?.rating || 0)].map((_, j) => (
                      <motion.span key={j} initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }} transition={{ delay: j * 0.08 }}
                        className="text-black text-sm"
                      >★</motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Review list */}
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review, i) => (
                <motion.button key={review.id}
                  onClick={() => setActiveReview(i)}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className={`w-full text-left p-6 border transition-all duration-500 ${
                    i === activeReview ? 'border-black bg-black/[0.02]' : 'border-black/10 hover:border-black/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-black">{review.name}</span>
                    <span className="text-xs text-black/30">{review.device}</span>
                  </div>
                  <p className="text-xs text-black/50 line-clamp-2">{review.text}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Review form toggle */}
        <div className="mt-16 text-center">
          {!showReviewForm ? (
            <MagneticButton
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                  return;
                }
                setShowReviewForm(true);
              }}
              className="px-10 py-4 bg-black text-white text-sm font-medium tracking-wide hover:bg-black/90 transition-colors"
            >
              {isAuthenticated ? 'Share Your Experience' : 'Log in to Share Your Experience'}
            </MagneticButton>
          ) : (
            <ReviewForm newReview={newReview} setNewReview={setNewReview} handleAddReview={handleAddReview}
              setShowReviewForm={setShowReviewForm} submitLoading={submitLoading}
              userName={userName}
            />
          )}
        </div>
      </div>
    </section>
  );
};

/* ─── Review Form ────────────────────────────────────────────── */
const ReviewForm = ({
  newReview, setNewReview, handleAddReview, setShowReviewForm, submitLoading, userName,
}: {
  newReview: NewReviewForm; setNewReview: (r: NewReviewForm) => void;
  handleAddReview: () => void; setShowReviewForm: (s: boolean) => void; submitLoading: boolean;
  userName?: string;
}) => (
  <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="max-w-2xl mx-auto text-left"
  >
    <h3 className="text-2xl font-light text-black mb-8 tracking-tight">Add Your Review</h3>
    <div className="space-y-6">
      {/* Underline-style inputs */}
      <input type="text" placeholder="Your Name" value={newReview.name}
        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
        readOnly={!!userName}
        className={`w-full py-4 bg-transparent border-b border-black/10 focus:border-black text-black placeholder-black/30 focus:outline-none text-sm transition-colors duration-300 ${userName ? 'cursor-not-allowed opacity-80' : ''}`}
      />
      <input type="text" placeholder="Device Model (e.g., MacBook Pro, Dell XPS)" value={newReview.device}
        onChange={(e) => setNewReview({ ...newReview, device: e.target.value })}
        className="w-full py-4 bg-transparent border-b border-black/10 focus:border-black text-black placeholder-black/30 focus:outline-none text-sm transition-colors duration-300"
      />
      <select value={newReview.rating}
        onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
        className="w-full py-4 bg-transparent border-b border-black/10 focus:border-black text-black text-sm focus:outline-none transition-colors duration-300"
      >
        <option value="5">★★★★★ Excellent</option>
        <option value="4">★★★★ Good</option>
        <option value="3">★★★ Average</option>
        <option value="2">★★ Poor</option>
        <option value="1">★ Very Poor</option>
      </select>
      <textarea placeholder="Share your experience..." value={newReview.text}
        onChange={(e) => setNewReview({ ...newReview, text: e.target.value })} rows={4}
        className="w-full py-4 bg-transparent border-b border-black/10 focus:border-black text-black placeholder-black/30 focus:outline-none text-sm resize-none transition-colors duration-300"
      />
      <div className="flex gap-4 pt-4">
        <motion.button whileHover={{ scale: submitLoading ? 1 : 1.02 }}
          whileTap={{ scale: submitLoading ? 1 : 0.98 }}
          onClick={handleAddReview} disabled={submitLoading}
          className="flex-1 py-4 bg-black text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitLoading ? (
            <>
              <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Posting...
            </>
          ) : 'Post Review'}
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowReviewForm(false)} disabled={submitLoading}
          className="flex-1 py-4 border border-black text-black text-sm font-medium hover:bg-black/5 disabled:opacity-50 transition-colors"
        >
          Cancel
        </motion.button>
      </div>
    </div>
  </motion.div>
);

/* ─── Features Section ───────────────────────────────────────── */
const FeaturesSection = () => (
  <section className="py-32 bg-black">
    <div className="container mx-auto px-4 lg:px-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="mb-20"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-12 bg-white/20" />
          <span className="text-xs font-mono tracking-[0.3em] text-white/40 uppercase">Why Choose Us</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-light text-white tracking-tight">
          <RevealText>Why We're The Best</RevealText>
        </h2>
      </motion.div>

      {/* Feature cards */}
      <div className="grid md:grid-cols-3 gap-1">
        {FEATURES.map((feature, i) => (
          <motion.div key={feature.title}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.7 }}
            className="group relative p-12 border border-white/5 hover:border-white/15 transition-all duration-700 overflow-hidden cursor-default"
          >
            {/* Animated corner accents */}
            <div className="absolute top-0 left-0 w-0 h-0 border-t border-l border-white/0 group-hover:w-8 group-hover:h-8 group-hover:border-white/30 transition-all duration-500" />
            <div className="absolute bottom-0 right-0 w-0 h-0 border-b border-r border-white/0 group-hover:w-8 group-hover:h-8 group-hover:border-white/30 transition-all duration-500" />

            <motion.div className="text-5xl mb-8"
              whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}
            >
              {feature.icon}
            </motion.div>

            <h3 className="text-xl font-medium text-white mb-4 tracking-tight group-hover:translate-x-1 transition-transform duration-500">
              {feature.title}
            </h3>
            <p className="text-sm text-white/40 group-hover:text-white/60 leading-relaxed transition-colors duration-500">
              {feature.desc}
            </p>

            {/* Bottom line animation */}
            <div className="mt-8 h-px bg-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── CTA Section ────────────────────────────────────────────── */
const CTASection = ({ navigate }: { navigate: (path: string) => void }) => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [100, -50]);

  return (
    <section ref={ref} className="relative py-40 bg-black border-t border-white/5 overflow-hidden">
      {/* Dot grid background */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <motion.div style={{ y }} className="relative z-10 container mx-auto px-4 lg:px-6 text-center">
        {/* Large heading */}
        <div className="mb-10">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight">
            <RevealText>Ready to</RevealText>
          </h2>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-extralight text-white/30">
            <RevealText delay={0.3}>Repair?</RevealText>
          </h2>
        </div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-sm text-white/40 mb-12 max-w-md mx-auto leading-relaxed"
        >
          Schedule your repair today and get your device back in perfect condition with our expert service.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
        >
          <MagneticButton onClick={() => navigate('/repair')}
            className="group inline-flex items-center gap-4 px-12 py-6 bg-white text-black font-medium text-lg tracking-wide"
          >
            <span>Book Your Repair</span>
            <motion.div animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </MagneticButton>
        </motion.div>

        {/* Decorative footer */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex items-center justify-center gap-8 mt-16 text-xs text-white/20"
        >
          <span className="tracking-widest uppercase">Expert Service</span>
          <span className="w-1 h-1 bg-white/20 rotate-45" />
          <span className="tracking-widest uppercase">Premium Parts</span>
          <span className="w-1 h-1 bg-white/20 rotate-45" />
          <span className="tracking-widest uppercase">90-Day Warranty</span>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default RepairHome;
