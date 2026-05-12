import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const HeroVideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#0A0A0B] select-none">
      {/* ── Video Background (shifted right) ────────────────── */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translate(8%, ${scrollY * 0.3}px)` }}
      >
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          className="w-full h-full object-cover scale-105"
        >
          <source src="/videos/shop_intro.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Cinematic overlays ────────────────────────────── */}
      <div className="absolute inset-0 z-[1] bg-[#0A0A0B]/55" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0A0A0B]/40 via-transparent to-[#0A0A0B]" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0A0A0B]/85 via-[#0A0A0B]/30 to-transparent" />

      {/* ── Glow orbs ─────────────────────────────────────── */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-[#F7B500]/[0.08] blur-[160px] z-[1] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-[#FF6B35]/[0.06] blur-[160px] z-[1] pointer-events-none" />

      {/* ── Watermark ─────────────────────────────────────── */}
      <motion.span
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-[2] hidden md:block text-[20vw] font-black tracking-tighter text-white/[0.025] leading-none pointer-events-none whitespace-nowrap pr-4"
      >
        SHOP
      </motion.span>

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="relative z-10 h-full flex items-center container mx-auto px-4 lg:px-6 pb-20 md:pb-0">
        <div className="w-full max-w-3xl">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-3 mb-8 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md"
          >
            <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-white/80">
              New Collection · 2026
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] mb-7 tracking-tight"
          >
            <span className="block">Tech Built</span>
            <span className="block">For The{' '}
              <span
                className="inline-block"
                style={{
                  background:
                    'linear-gradient(135deg, #F7B500 0%, #FF6B35 50%, #F7B500 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradient-shift 6s ease infinite',
                }}
              >
                Bold.
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-base md:text-lg text-white/55 leading-relaxed max-w-xl mb-10"
          >
            Premium laptops, components, and gear curated for creators, gamers, and
            professionals. Engineered for performance, priced to move.
          </motion.p>

          {/* CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            <motion.a
              href="/shop"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-3 px-7 py-4 rounded-full text-sm font-bold text-[#0A0A0B] transition-all relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #F7B500, #FF6B35)',
                boxShadow: '0 10px 40px rgba(247,181,0,0.35)',
              }}
            >
              <span className="relative z-10">Shop The Collection</span>
              <svg
                className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>

            <motion.a
              href="/repair-home"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2.5 px-7 py-4 rounded-full text-sm font-medium text-white/75 border border-white/15 hover:border-white/30 hover:text-white hover:bg-white/[0.04] backdrop-blur-md transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Repair Services
            </motion.a>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-14 flex items-center gap-8 md:gap-12"
          >
            {[
              { value: '500+', label: 'Products' },
              { value: '15K+', label: 'Customers' },
              { value: '4.9★', label: 'Rating' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 font-medium mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Scroll Indicator ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-medium">
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent relative overflow-hidden">
          <motion.div
            animate={{ y: [-48, 48] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-x-0 w-px h-4 bg-[#F7B500]"
          />
        </div>
      </motion.div>

      {/* ── Side label (right) ────────────────────────────── */}
      <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-4">
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-medium [writing-mode:vertical-rl] rotate-180">
          Ran Tech · Est 2024
        </span>
        <div className="w-px h-16 bg-white/15" />
      </div>

      {/* ── Bottom fade ───────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-transparent z-[5] pointer-events-none" />

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
};

export default HeroVideoSection;
