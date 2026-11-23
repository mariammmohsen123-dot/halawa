import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface AnimatedCounterProps {
  target: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
}

export function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  durationMs = 950,
}: AnimatedCounterProps) {
  const { ref, hasIntersected } = useIntersectionObserver<HTMLSpanElement>({
    threshold: 0.25,
    triggerOnce: true,
  });
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!hasIntersected) return;
    if (reduceMotion) {
      setValue(target);
      return;
    }

    let rafId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [hasIntersected, target, durationMs, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums ltr-inline">
      {prefix}
      {value}
      {suffix}
    </span>
  );
}

interface RevealItemProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export function RevealItem({ children, index = 0, className = 'h-full' }: RevealItemProps) {
  const reduceMotion = useReducedMotion();
  const { ref, hasIntersected } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px',
    triggerOnce: true,
  });

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={
        hasIntersected
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 18, scale: 0.985 }
      }
      transition={{
        duration: 0.42,
        delay: Math.min(index * 0.06, 0.3),
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface InteractiveSpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  isVip?: boolean;
}

export function InteractiveSpotlightCard({
  children,
  className = '',
  isVip = false,
}: InteractiveSpotlightCardProps) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };

  const handleMouseLeave = () => {
    setCoords((prev) => ({ ...prev, visible: false }));
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden ${className}`}
    >
      {!reduceMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: coords.visible ? 1 : 0,
            background: `radial-gradient(360px circle at ${coords.x}px ${coords.y}px, rgba(212, 175, 55, ${
              isVip ? 0.14 : 0.085
            }), transparent 70%)`,
          }}
        />
      )}
      <div className="relative z-10 h-full flex flex-col justify-between">{children}</div>
    </motion.div>
  );
}
