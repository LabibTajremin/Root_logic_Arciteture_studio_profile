'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Scroll reveal via IntersectionObserver. Reads timing/distance from the motion CSS
 * variables (never hardcodes them) and animates once. Content is visible if JS never
 * runs, so a broken bundle never leaves a blank page.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  className,
  delayIndex = 0,
}: {
  children: ReactNode;
  as?: 'div' | 'section' | 'li' | 'article';
  className?: string;
  delayIndex?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style = { transitionDelay: `calc(var(--motion-stagger) * ${delayIndex})` };

  return (
    <Tag
      // @ts-expect-error polymorphic ref across allowed tags
      ref={ref}
      data-reveal
      className={`${shown ? 'is-in' : ''} ${className ?? ''}`}
      style={style}
    >
      {children}
    </Tag>
  );
}
