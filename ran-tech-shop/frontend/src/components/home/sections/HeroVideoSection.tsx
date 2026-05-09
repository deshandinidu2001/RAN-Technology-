import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Slide data ────────────────────────────────────────────── */
interface Slide {
  video: string;
  watermark: string;
  heading: string[];
  accentLine: number;
  subtitle: string;
  cta: { label: string; href: string };
  accent: string;
}

const slides: Slide[] = [
  {
    video: '/videos/hero_vedio.mp4',
    watermark: 'LAPTOP',
    heading: ['Elevate Your', 'Experience With', 'Premium Laptops'],
    accentLine: 1,
    subtitle:
      'Discover the latest laptops engineered for performance, portability, and style all at unbeatable prices.',
    cta: { label: 'Shop The Collection', href: '/shop' },
    accent: '#F7B500',
  },
  {
    video: '/videos/landpage.mp4',
    watermark: 'REPAIR',
    heading: ['Expert Repairs', 'You Can', 'Trust'],
    accentLine: 1,
    subtitle:
      'From cracked screens to motherboard issues our certified technicians bring your devices back to life.',
    cta: { label: 'Book A Repair', href: '/repair/booking' },
    accent: '#7C3AED',
  },
];

const AUTOPLAY_MS = 8000;

/* ─── Component ─────────────────────────────────────────────── */
const HeroVideoSection = () => {
  const [active, setActive] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = slides.length;
  const go = useCallback(
    (idx: number) => {
      setActive((idx + total) % total);
    },
    [total]
  );
  const next = useCallback(() => go(active + 1), [active, go]);
  const prev = useCallback(() => go(active - 1), [active, go]);

  /* autoplay */
  useEffect(() => {
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, next]);

  /* play active video */
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [active]);

  const slide = slides[active];

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#0A0A0B] select-none">
      {/* ── Background videos ─────────────────────────────── */}
      {slides.map((s, i) => (
        <div
          key={s.video}
          className="absolute inset-0 z-0 transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          <video
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={s.video} type="video/mp4" />
          </video>
        </div>
      ))}

      {/* ── Overlays ──────────────────────────────────────── */}
      <div className="absolute inset-0 z-[1] bg-[#0A0A0B]/60" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0A0A0B] via-[#0A0A0B]/70 to-transparent" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0A0A0B] via-transparent to-[#0A0A0B]/30" />

      {/* ── Watermark ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.span
          key={`wm-${active}`}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.8 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[2] hidden md:block text-[18vw] font-black tracking-tighter text-white/[0.03] leading-none pointer-events-none select-none whitespace-nowrap pr-6"
        >
          {slide.watermark}
        </motion.span>
      </AnimatePresence>

      {/* ── Content — centered left ──────────────────────── */}
      <div className="relative z-10 h-full flex items-center inset-x-0 mx-auto w-full container px-4 lg:px-6 pb-28 md:pb-0">
        <div className="w-full max-w-3xl px-2 sm:px-4 lg:px-6">
          <AnimatePresence mode="wait">
            <motion.div key={`content-${active}`}>
              {/* Heading — clean sans-serif */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.15 } }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.08] mb-6 tracking-tight break-words"
              >
                {slide.heading.map((line, li) => (
                  <span
                    key={li}
                    className="block"
                    style={
                      li === slide.accentLine
                        ? {
                            background: `linear-gradient(90deg, ${slide.accent}, ${slide.accent}cc)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }
                        : undefined
                    }
                  >
                    {line}
                  </span>
                ))}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, delay: 0.4 },
                }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="text-sm md:text-base text-white/50 leading-relaxed max-w-lg mb-9"
              >
                {slide.subtitle}
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, delay: 0.55 },
                }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="flex flex-wrap items-center gap-4"
              >
                <motion.a
                  href={slide.cta.href}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold text-[#0A0A0B] transition-shadow"
                  style={{
                    background: slide.accent,
                    boxShadow: `0 4px 24px ${slide.accent}40`,
                  }}
                >
                  {slide.cta.label}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </motion.a>

                <motion.a
                  href="/about"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-white/60 border border-white/10 hover:border-white/20 hover:text-white transition-all"
                >
                  Explore More
                </motion.a>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Navigation: bottom-left ───────────────────────── */}
      <div className="absolute bottom-10 inset-x-0 z-20 flex items-center container mx-auto w-full px-4 lg:px-6">
        <div className="px-4 lg:px-6 flex items-center gap-3 w-full">
          <button
          onClick={prev}
          aria-label="Previous slide"
          className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/25 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Progress dots */}
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className="relative"
          >
            <div
              className={`rounded-full transition-all duration-500 ${
                i === active ? 'w-8 h-2' : 'w-2 h-2'
              }`}
              style={{
                background:
                  i === active
                    ? slide.accent
                    : 'rgba(255,255,255,0.2)',
              }}
            />
          </button>
        ))}

        <button
          onClick={next}
          aria-label="Next slide"
          className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/25 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        </div>
      </div>

      {/* ── Bottom fade ───────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0A0A0B] to-transparent z-[5] pointer-events-none" />
    </section>
  );
};

export default HeroVideoSection;
