import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  initialInView?: boolean;
}

export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0.14,
    rootMargin = '0px 0px -36px 0px',
    triggerOnce = true,
    initialInView = false,
  } = options;

  const reduceMotion = useReducedMotion();
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState<boolean>(
    initialInView || Boolean(reduceMotion)
  );
  const [hasIntersected, setHasIntersected] = useState<boolean>(
    initialInView || Boolean(reduceMotion)
  );

  useEffect(() => {
    if (reduceMotion) {
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setIsIntersecting(true);
          setHasIntersected(true);
          if (triggerOnce) {
            observer.unobserve(element);
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, reduceMotion]);

  return {
    ref,
    isIntersecting,
    hasIntersected,
  };
}
