import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ScrollVelocityProps {
  texts: string[];
  velocity?: number;
  className?: string;
  numCopies?: number;
}

const ScrollVelocity: React.FC<ScrollVelocityProps> = ({
  texts,
  velocity = 100,
  className = '',
  numCopies = 6
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  
  const baseX = useTransform(scrollY, [0, 1000], [0, -velocity * 5]);
  const smoothX = useSpring(baseX, { damping: 50, stiffness: 400 });

  return (
    <div ref={containerRef} className="overflow-hidden py-4">
      {texts.map((text, textIndex) => (
        <motion.div
          key={textIndex}
          className="flex whitespace-nowrap"
          style={{ x: textIndex % 2 === 0 ? smoothX : useTransform(smoothX, v => -v) }}
        >
          {Array.from({ length: numCopies }).map((_, i) => (
            <span 
              key={i} 
              className={`mx-4 text-2xl md:text-4xl font-bold ${className}`}
              style={{ opacity: 0.3 + (i % 3) * 0.2 }}
            >
              {text}
            </span>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export default ScrollVelocity;
