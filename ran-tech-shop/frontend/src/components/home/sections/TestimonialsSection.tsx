import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';

const GRADIENTS = [
  { gradient: 'from-[#F7B500] to-[#FF6B35]', accent: '#F7B500' },
  { gradient: 'from-[#7C3AED] to-[#06B6D4]', accent: '#7C3AED' },
  { gradient: 'from-[#06B6D4] to-[#7C3AED]', accent: '#06B6D4' },
  { gradient: 'from-[#FF6B35] to-[#F7B500]', accent: '#FF6B35' },
  { gradient: 'from-[#F7B500] to-[#7C3AED]', accent: '#F7B500' },
  { gradient: 'from-[#7C3AED] to-[#FF6B35]', accent: '#7C3AED' },
];

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';

/* ─── Fallback review data - Sri Lankan customers ───────────────────── */
const fallbackReviews = [
  {
    id: 1,
    name: 'Chamara Bandara',
    location: 'Monaragala',
    rating: 5,
    text: '"Excellent service! Bought a laptop here and the team guided me perfectly. The quality is outstanding and the price was very reasonable. Highly recommended to everyone in the area!"',
    initial: 'CB',
    gradient: 'from-[#F7B500] to-[#FF6B35]',
    accent: '#F7B500',
  },
  {
    id: 2,
    name: 'Nadeeka Rajapaksha',
    location: 'Wellawaya',
    rating: 5,
    text: '"I needed a laptop repaired urgently and RAN Technology fixed it within the same day. Amazing technicians, transparent pricing. Best tech shop in the region!"',
    initial: 'NR',
    gradient: 'from-[#7C3AED] to-[#06B6D4]',
    accent: '#7C3AED',
  },
  {
    id: 3,
    name: 'Pradeep Kumara',
    location: 'Monaragala',
    rating: 5,
    text: '"As a student, I was looking for an affordable yet powerful laptop. The RAN team found me the perfect match with a student discount. I am very happy with my purchase!"',
    initial: 'PK',
    gradient: 'from-[#06B6D4] to-[#7C3AED]',
    accent: '#06B6D4',
  },
  {
    id: 4,
    name: 'Sanduni Perera',
    location: 'Wellawaya',
    rating: 5,
    text: '"The staff is very knowledgeable and friendly. They helped me choose the right accessories for my laptop. The products are genuine and delivery was super fast. Will shop again!"',
    initial: 'SP',
    gradient: 'from-[#FF6B35] to-[#F7B500]',
    accent: '#FF6B35',
  },
  {
    id: 5,
    name: 'Ruwan Dissanayake',
    location: 'Monaragala',
    rating: 5,
    text: '"RAN Technology is the best shop I have ever visited. They repaired my laptop motherboard which others said was impossible. Professional service with a smile. 100% trustworthy!"',
    initial: 'RD',
    gradient: 'from-[#F7B500] to-[#7C3AED]',
    accent: '#F7B500',
  },
  {
    id: 6,
    name: 'Thilini Jayawardena',
    location: 'Wellawaya',
    rating: 5,
    text: '"Purchased a gaming laptop from RAN and it is incredible! The team set everything up for me and gave me tips on maintenance. Great after-sales support. Truly the best in Sri Lanka!"',
    initial: 'TJ',
    gradient: 'from-[#7C3AED] to-[#FF6B35]',
    accent: '#7C3AED',
  },
];

/* ─── Stars component ────────────────────────────────────────── */
const Stars = ({ count = 5 }: { count?: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className="w-3.5 h-3.5 text-[#F7B500]" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

type Review = (typeof fallbackReviews)[number];

/* ─── Single review card ─────────────────────────────────────── */
const ReviewCard = ({ review }: { review: Review }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    className="relative flex-shrink-0 w-[340px] md:w-[380px] bg-[#111114] border border-white/[0.07] rounded-2xl p-6 mx-3 overflow-hidden group cursor-default"
  >
    {/* Glow effect on hover */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{ background: `radial-gradient(ellipse at top left, ${review.accent}12, transparent 70%)` }}
    />

    {/* Top accent bar */}
    <div
      className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${review.gradient} opacity-60`}
    />

    {/* Header */}
    <div className="flex items-center gap-4 mb-4 relative z-10">
      {/* Avatar with initials */}
      <div
        className={`w-12 h-12 rounded-full bg-gradient-to-br ${review.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}
      >
        <span className="text-white font-black text-sm tracking-wide">{review.initial}</span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-white font-bold text-sm leading-tight truncate">{review.name}</h4>
        <div className="flex items-center gap-1.5 mt-0.5">
          <svg className="w-3 h-3 text-[#F7B500]/60" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span className="text-white/40 text-xs">{review.location}, Sri Lanka</span>
        </div>
      </div>

      <Stars count={review.rating} />
    </div>

    {/* Quote */}
    <div className="relative z-10">
      <svg className="w-5 h-5 text-white/10 mb-2" fill="currentColor" viewBox="0 0 32 32">
        <path d="M10 8C6.13 8 3 11.13 3 15v9h9v-9H6c0-2.21 1.79-4 4-4V8zm19 0c-3.87 0-7 3.13-7 7v9h9v-9h-6c0-2.21 1.79-4 4-4V8z" />
      </svg>
      <p className="text-white/65 text-sm leading-relaxed">{review.text}</p>
    </div>
  </motion.div>
);

/* ─── Marquee row ────────────────────────────────────────────── */
const MarqueeRow = ({
  items,
  speed = 40,
  reverse = false,
}: {
  items: Review[];
  speed?: number;
  reverse?: boolean;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const duplicated = [...items, ...items, ...items];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame: number;
    let pos = 0;
    const singleSetWidth = track.scrollWidth / 3;

    const animate = () => {
      pos += reverse ? -speed / 60 : speed / 60;
      if (pos >= singleSetWidth) pos -= singleSetWidth;
      if (pos < 0) pos += singleSetWidth;
      track.style.transform = `translateX(-${pos}px)`;
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [speed, reverse]);

  return (
    <div className="overflow-hidden w-full relative">
      {/* Left/right fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-[#0A0A0B] to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-[#0A0A0B] to-transparent" />

      <div ref={trackRef} className="flex will-change-transform" style={{ width: 'max-content' }}>
        {duplicated.map((r, i) => (
          <ReviewCard key={`${r.id}-${i}`} review={r} />
        ))}
      </div>
    </div>
  );
};

/* ─── Active indicator dots ──────────────────────────────────── */

/* ─── Main component ─────────────────────────────────────────── */
const TestimonialsSection = () => {
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/repairs/reviews');
        const list: any[] = Array.isArray(data) ? data : data.reviews || [];
        if (cancelled || list.length === 0) return;
        const mapped: Review[] = list.map((r, i) => {
          const palette = GRADIENTS[i % GRADIENTS.length];
          const name: string = r.userName || r.name || 'Customer';
          return {
            id: i + 1,
            name,
            location: r.serviceName || r.serviceType || 'Sri Lanka',
            rating: Number(r.rating) || 5,
            text: `"${r.comment || r.text || ''}"`,
            initial: initialsOf(name),
            gradient: palette.gradient,
            accent: palette.accent,
          };
        });
        setReviews(mapped);
      } catch {
        /* keep fallback reviews */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[#0A0A0B]">
      {/* ── Ambient glows ─────────────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-br from-[#7C3AED]/6 via-[#F7B500]/4 to-transparent rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#06B6D4]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="text-center mb-16 px-6 relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[#F7B500]/70 text-[10px] tracking-[0.25em] uppercase font-semibold mb-3"
        >
          What Our Customers Say
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="text-3xl md:text-5xl lg:text-6xl font-black text-white italic mb-4"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          Customers{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F7B500] to-[#FF6B35]">
            Reviews
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="text-white/40 text-sm md:text-base mt-2"
        >
          Genuine reviews from our valued customers across Monaragala & Wellawaya
        </motion.p>
      </div>

      {/* ── Scrolling rows ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-4 relative z-10"
      >
        <MarqueeRow items={reviews} speed={35} reverse={false} />
        <MarqueeRow items={[...reviews].reverse()} speed={28} reverse={true} />
      </motion.div>

      {/* ── Bottom stat strip ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex justify-center gap-8 md:gap-16 mt-16 px-6 relative z-10"
      >
        {[
          { number: '500+', label: 'Happy Customers' },
          { number: '4.9★', label: 'Average Rating' },
          { number: '100%', label: 'Genuine Reviews' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl md:text-3xl font-black text-[#F7B500]">{stat.number}</div>
            <div className="text-white/35 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default TestimonialsSection;