import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VideoShowcaseSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;

    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      v.muted = false;
      setMuted(false);
      v.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#0A0A0B]">
      {/* ── Video container with aspect ratio ──────────────── */}
      <div className="relative w-full" style={{ aspectRatio: '21 / 9' }}>
        {/* Background video */}
        <video
          ref={videoRef}
          autoPlay
          muted={muted}
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/landpage.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Top gradient for smooth transition from section above */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0A0A0B] to-transparent z-[2] pointer-events-none" />

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A0A0B] to-transparent z-[2] pointer-events-none" />

        {/* ── Centered content ─────────────────────────────── */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight max-w-4xl mb-4 italic"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            Experience The Tech Advantage With Modern Equipment
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="text-sm md:text-base text-white/60 max-w-xl mb-8 font-light"
          >
            Unlock Your Full Potential with the Latest Cutting-Edge Tech Gear
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcaseSection;
