import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface BlurTextProps {
  text: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  delay?: number;
  stepDuration?: number;
  threshold?: number;
  className?: string;
  onAnimationComplete?: () => void;
}

const BlurText: React.FC<BlurTextProps> = ({
  text,
  animateBy = 'words',
  direction = 'top',
  delay = 100,
  stepDuration = 0.35,
  threshold = 0.1,
  className = '',
  onAnimationComplete
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const [hasAnimated, setHasAnimated] = useState(false);

  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  const yOffset = direction === 'top' ? -30 : 30;

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      const timeout = setTimeout(() => {
        onAnimationComplete?.();
      }, elements.length * delay + stepDuration * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, hasAnimated, elements.length, delay, stepDuration, onAnimationComplete]);

  return (
    <div ref={ref} className={`flex flex-wrap gap-x-2 ${className}`}>
      {elements.map((element, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: yOffset, filter: 'blur(10px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{
            duration: stepDuration,
            delay: index * (delay / 1000),
            ease: 'easeOut'
          }}
          className="inline-block"
        >
          {element}
          {animateBy === 'words' && index < elements.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </div>
  );
};

export default BlurText;
