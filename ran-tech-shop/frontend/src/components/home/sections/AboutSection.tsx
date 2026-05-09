import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';

const aboutFeatures = [
  {
    title: 'Quality First',
    description: 'Every product undergoes rigorous testing before reaching our customers.',
    accent: '#F7B500',
  },
  {
    title: 'Expert Team',
    description: 'Certified technicians with years of experience in laptop repair.',
    accent: '#06B6D4',
  },
  {
    title: 'Fast Service',
    description: 'Same-day repairs and express delivery options available.',
    accent: '#FF6B35',
  },
  {
    title: 'Warranty',
    description: 'Comprehensive warranty coverage on all products and repairs.',
    accent: '#7C3AED',
  },
];

/* ── Scroll-driven heading: slide-up with clip mask ──────────────── */
const RevealHeading = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 90%', 'start 55%'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['40%', '0%']);
  const clip = useTransform(
    scrollYProgress,
    [0, 1],
    ['inset(0 0 100% 0)', 'inset(0 0 0% 0)']
  );
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.6, 1]);

  return (
    <h2 ref={ref}>
      <motion.span
        style={{ y, clipPath: clip, opacity, display: 'inline-block' }}
      >
        {children}
      </motion.span>
    </h2>
  );
};

const AboutSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Smoothed progress drives parallax on the image + the marquee.
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.4 });
  const imageY = useTransform(smooth, [0, 1], ['8%', '-8%']);
  const imageScale = useTransform(smooth, [0, 0.5, 1], [1.05, 1, 1.05]);
  const marqueeX = useTransform(smooth, [0, 1], ['-10%', '10%']);
  const eyebrowWidth = useTransform(smooth, [0, 0.3], [0, 64]);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 md:py-40 overflow-hidden bg-[#0A0A0B]"
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full blur-[180px] bg-[#F7B500]/[0.05]" />
        <div className="absolute -bottom-40 left-0 w-[420px] h-[420px] rounded-full blur-[160px] bg-[#FF6B35]/[0.04]" />
      </div>

      {/* Diagonal marquee text. drifts with scroll */}
      <motion.div
        style={{ x: marqueeX }}
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 whitespace-nowrap select-none"
      >
        <span className="text-[20vw] font-black text-white/[0.025] tracking-tighter">
          TRUSTED · CRAFTED · DELIVERED ·
        </span>
      </motion.div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* ── Left column ── */}
          <div className="lg:col-span-7">
            {/* Editorial eyebrow with animated rule */}
            <div className="flex items-center gap-4 mb-8">
              <motion.span
                style={{ width: eyebrowWidth }}
                className="h-px bg-gradient-to-r from-[#F7B500] to-[#FF6B35] block"
              />
              <span className="text-[#F7B500] text-[11px] tracking-[0.3em] uppercase font-medium">
                About RAN, Est. 2015
              </span>
            </div>

            {/* Heading. matches the shared shop home title style
                ("text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black"
                 with an italic Georgia accent word in primary gold). */}
            <div className="mb-10">
              <RevealHeading>
                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white flex flex-wrap gap-x-3 leading-[1.05] tracking-tight">
                  <span>Your</span>
                  <span
                    className="italic text-[#F7B500]"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    trusted
                  </span>
                  <span>tech partner.</span>
                </span>
              </RevealHeading>
            </div>

            {/* Body. line by line */}
            <div className="max-w-xl space-y-2 mb-14 overflow-hidden">
              {[
                'Since 2015, RAN Technology has been at the forefront of',
                'delivering premium laptops and expert repair services.',
                'Built on quality, trusted by thousands across the nation.',
              ].map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ y: '110%', opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{
                    duration: 0.7,
                    delay: 0.15 + i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-white/55 text-base md:text-lg leading-relaxed"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {/* Feature ledger. list, not grid: more editorial */}
            <ul className="border-t border-white/[0.08]">
              {aboutFeatures.map((f, i) => (
                <motion.li
                  key={f.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative border-b border-white/[0.08]"
                >
                  <div className="grid grid-cols-12 items-center py-5 gap-4 transition-colors hover:bg-white/[0.015]">
                    {/* Index */}
                    <span className="col-span-2 md:col-span-1 text-white/25 text-xs font-mono">
                      0{i + 1}
                    </span>
                    {/* Title with animated underline */}
                    <div className="col-span-4 md:col-span-3">
                      <span
                        className="text-white text-base md:text-lg font-semibold tracking-tight relative inline-block"
                        style={{ color: 'inherit' }}
                      >
                        {f.title}
                        <span
                          className="absolute left-0 -bottom-1 h-[2px] w-0 group-hover:w-full transition-[width] duration-500 ease-out"
                          style={{ backgroundColor: f.accent }}
                        />
                      </span>
                    </div>
                    {/* Description */}
                    <p className="col-span-6 md:col-span-7 text-white/45 text-sm md:text-[15px] leading-snug">
                      {f.description}
                    </p>
                    {/* Accent dot */}
                    <span
                      className="hidden md:block col-span-1 justify-self-end w-1.5 h-1.5 rounded-full transition-transform duration-500 group-hover:scale-[2.2]"
                      style={{ backgroundColor: f.accent }}
                    />
                  </div>
                </motion.li>
              ))}
            </ul>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-12"
            >
              <a
                href="/about"
                className="group inline-flex items-center gap-3 text-[#F7B500] font-semibold text-base"
              >
                <span className="relative">
                  Learn more about us
                  <span className="absolute left-0 -bottom-0.5 h-px w-full bg-[#F7B500] origin-left scale-x-100 group-hover:scale-x-0 transition-transform duration-500" />
                </span>
                <span className="w-9 h-9 rounded-full border border-[#F7B500]/40 flex items-center justify-center group-hover:bg-[#F7B500] group-hover:text-black transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>
            </motion.div>
          </div>

          {/* ── Right column. image with clip-path reveal ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <motion.div
              ref={imageRef}
              initial={{ clipPath: 'inset(0 100% 0 0 round 24px)' }}
              whileInView={{ clipPath: 'inset(0 0% 0 0 round 24px)' }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
              className="relative"
            >
              <motion.div
                style={{ y: imageY, scale: imageScale }}
                className="aspect-[4/5] overflow-hidden rounded-3xl bg-[#0F0F11] border border-white/[0.06]"
              >
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&h=1100&fit=crop"
                  alt="RAN Technology HQ"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900';
                  }}
                />
                {/* Top fade */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0A0A0B] to-transparent" />
                {/* Bottom fade */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-transparent" />

                {/* Caption */}
                <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-white/40 mb-1.5">
                      Headquarters
                    </p>
                    <p className="text-white font-semibold text-lg leading-tight">
                      RAN Technology HQ
                    </p>
                    <p className="text-white/45 text-xs mt-0.5">Monaragala · Sri Lanka</p>
                  </div>
                  <span className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                </div>
              </motion.div>

              {/* Vertical year strip */}
              <div className="hidden lg:flex absolute -right-3 top-0 bottom-0 flex-col items-center justify-between text-[10px] font-mono text-white/25 py-8 tracking-[0.3em] [writing-mode:vertical-rl]">
                <span>EST · 2015</span>
                <span>RAN · TECH</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
