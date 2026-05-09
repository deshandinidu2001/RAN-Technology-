import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  toggleActions?: string;
  pin?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

export const useScrollAnimation = (
  animation: (element: Element, gsapInstance: typeof gsap) => gsap.core.Timeline | gsap.core.Tween,
  options: ScrollAnimationOptions = {}
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const {
      trigger = element,
      start = 'top 80%',
      end = 'bottom 20%',
      scrub = false,
      markers = false,
      toggleActions = 'play none none reverse',
      pin = false,
      onEnter,
      onLeave,
      onEnterBack,
      onLeaveBack,
    } = options;

    // Create animation
    animationRef.current = animation(element, gsap);

    // Create ScrollTrigger
    ScrollTrigger.create({
      trigger,
      start,
      end,
      scrub,
      markers,
      toggleActions,
      pin,
      animation: animationRef.current,
      onEnter,
      onLeave,
      onEnterBack,
      onLeaveBack,
    });

    return () => {
      animationRef.current?.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [animation, options]);

  return elementRef;
};

// Fade in animation
export const useFadeIn = (
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  options: ScrollAnimationOptions = {}
) => {
  const getDirection = useCallback(() => {
    switch (direction) {
      case 'up':
        return { y: 50, x: 0 };
      case 'down':
        return { y: -50, x: 0 };
      case 'left':
        return { y: 0, x: 50 };
      case 'right':
        return { y: 0, x: -50 };
    }
  }, [direction]);

  return useScrollAnimation(
    (element, gsapInstance) => {
      const { x, y } = getDirection();
      return gsapInstance.fromTo(
        element,
        { opacity: 0, x, y },
        { opacity: 1, x: 0, y: 0, duration: 1, ease: 'power3.out' }
      );
    },
    options
  );
};

// Scale in animation
export const useScaleIn = (options: ScrollAnimationOptions = {}) => {
  return useScrollAnimation(
    (element, gsapInstance) => {
      return gsapInstance.fromTo(
        element,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
      );
    },
    options
  );
};

// Stagger children animation
export const useStaggerAnimation = (
  childSelector: string,
  options: ScrollAnimationOptions = {}
) => {
  return useScrollAnimation(
    (element, gsapInstance) => {
      const children = element.querySelectorAll(childSelector);
      return gsapInstance.fromTo(
        children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );
    },
    options
  );
};

// Parallax effect
export const useParallax = (speed: number = 0.5) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.to(element, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [speed]);

  return elementRef;
};

// Text reveal animation
export const useTextReveal = (options: ScrollAnimationOptions = {}) => {
  return useScrollAnimation(
    (element, gsapInstance) => {
      const text = element.textContent || '';
      const chars = text.split('');

      element.innerHTML = chars
        .map((char) => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('');

      const charElements = element.querySelectorAll('span');

      return gsapInstance.fromTo(
        charElements,
        { opacity: 0, y: 20, rotateX: -90 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.4,
          stagger: 0.02,
          ease: 'back.out(1.7)',
        }
      );
    },
    options
  );
};

// Counter animation
export const useCounter = (
  endValue: number,
  duration: number = 2
) => {
  const elementRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef({ value: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(valueRef.current, {
          value: endValue,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            if (element) {
              element.textContent = Math.round(valueRef.current.value).toLocaleString();
            }
          },
        });
      },
      once: true,
    });

    return () => {
      trigger.kill();
    };
  }, [endValue, duration]);

  return elementRef;
};

export default useScrollAnimation;
