import { useRef, useEffect, useState } from 'react';
import { useInView, useSpring, useMotionValue } from 'framer-motion';

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  className?: string;
  separator?: string;
  suffix?: string;
  prefix?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

const CountUp: React.FC<CountUpProps> = ({
  to,
  from = 0,
  duration = 2,
  delay = 0,
  className = '',
  separator = '',
  suffix = '',
  prefix = '',
  onStart,
  onEnd
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(from);
  
  const count = useMotionValue(from);
  const rounded = useSpring(count, {
    damping: 50,
    stiffness: 100,
    duration: duration * 1000
  });

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        onStart?.();
        count.set(to);
      }, delay * 1000);

      return () => clearTimeout(timeout);
    }
  }, [isInView, to, delay, count, onStart]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      const value = Math.round(latest);
      if (separator) {
        setDisplayValue(value);
      } else {
        setDisplayValue(value);
      }
      
      if (Math.round(latest) === to) {
        onEnd?.();
      }
    });

    return () => unsubscribe();
  }, [rounded, separator, to, onEnd]);

  const formatNumber = (num: number) => {
    if (separator) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }
    return num.toString();
  };

  return (
    <span ref={ref} className={className}>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
};

export default CountUp;
