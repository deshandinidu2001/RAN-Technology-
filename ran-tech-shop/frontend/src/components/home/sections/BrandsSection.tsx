import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const keywords = ['Apple', 'ASUS', 'Dell', 'HP', 'Lenovo', 'MSI', 'Acer', 'Microsoft'];
const sharedSectionBackground = '#050505';

/* ── Word with mouse-tracking light effect ── */
const GlowWord = ({ word }: { word: string }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative inline-block text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight cursor-default transition-colors duration-300"
      style={{
        color: hovered ? 'transparent' : '#FFFFFF',
        WebkitTextStroke: '0',
        backgroundImage: hovered
          ? 'linear-gradient(90deg, #F7B500 0%, #FF6B35 100%)'
          : 'none',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
      }}
    >
      {word}
    </span>
  );
};

/* ── Marquee track ── */
const MarqueeTrack = ({
  items,
  reverse = false,
  speed = 30,
}: {
  items: string[];
  reverse?: boolean;
  speed?: number;
}) => {
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden whitespace-nowrap select-none">
      <div
        className={`inline-flex items-center ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {repeated.map((word, i) => (
          <span key={i} className="inline-flex items-center shrink-0 mx-4 md:mx-6">
            <GlowWord word={word} />
            <span className="ml-8 md:ml-12 text-3xl md:text-5xl text-white/[0.06] font-bold">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const BrandsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const panelY = useTransform(scrollYProgress, [0, 1], ['4%', '-4%']);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{
        background: sharedSectionBackground,
      }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute w-[520px] h-[520px] rounded-full blur-[220px] bg-[#F7B500]/[0.025] top-1/2 left-1/3 -translate-y-1/2" />
      </div>

      <motion.div style={{ y: panelY }} className="relative z-10 py-20 md:py-28">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative text-center mb-12 md:mb-16 px-4"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="w-8 h-px bg-[#F7B500]" />
            <span className="text-[#F7B500] text-[11px] tracking-[0.25em] uppercase font-medium">
              Trusted Partners
            </span>
            <span className="w-8 h-px bg-[#F7B500]" />
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
            Premium brands{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F7B500] to-[#FF6B35]">
              we carry.
            </span>
          </h2>
        </motion.div>

        {/* Marquee */}
        <div
          className="relative -mx-16 space-y-3 md:space-y-5"
          style={{ transform: 'rotate(-3deg)' }}
        >
          <MarqueeTrack items={keywords} speed={35} />
          <MarqueeTrack items={[...keywords].reverse()} reverse speed={40} />
        </div>

        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 md:w-56 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 md:w-56 bg-gradient-to-l from-[#080808] via-[#080808]/80 to-transparent z-20" />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="relative text-center text-white/40 text-sm md:text-base max-w-2xl mx-auto mt-12 md:mt-16 px-6 leading-relaxed"
        >
          We partner with the world's most trusted technology brands to bring you authentic,
          warrantied products — every device, every time.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default BrandsSection;
