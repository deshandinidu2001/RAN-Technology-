import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

interface ScrollFloatProps {
  children: React.ReactNode;
  className?: string;
  floatAmount?: number;
  scrollMultiplier?: number;
}

const ScrollFloat: React.FC<ScrollFloatProps> = ({
  children,
  className = '',
  floatAmount = 50,
  scrollMultiplier = 1
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], [floatAmount * scrollMultiplier, -floatAmount * scrollMultiplier]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.9, 1, 1, 0.9]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, scale }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollFloat;
