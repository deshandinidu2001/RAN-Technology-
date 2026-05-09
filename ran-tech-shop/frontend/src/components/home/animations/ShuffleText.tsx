import { useState, useEffect, useRef } from 'react';

interface ShuffleTextProps {
  text: string;
  className?: string;
  shuffleSpeed?: number;
  characters?: string;
  trigger?: 'hover' | 'inView';
}

const ShuffleText: React.FC<ShuffleTextProps> = ({
  text,
  className = '',
  shuffleSpeed = 30,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*',
  trigger = 'inView'
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(false);

  const shuffleAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return text[index];
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setIsAnimating(false);
      }

      iteration += 1 / 3;
    }, shuffleSpeed);
  };

  useEffect(() => {
    if (trigger === 'inView' && ref.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            shuffleAnimation();
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, [trigger, text]);

  return (
    <span
      ref={ref}
      className={`font-mono ${className}`}
      onMouseEnter={trigger === 'hover' ? shuffleAnimation : undefined}
    >
      {displayText}
    </span>
  );
};

export default ShuffleText;
