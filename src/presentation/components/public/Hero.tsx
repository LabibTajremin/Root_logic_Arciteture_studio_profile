'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { HeroSlideView } from '@/infrastructure/db/queries/publicQueries';

/**
 * Lightweight custom hero: full-viewport (100svh to avoid the mobile URL-bar jump),
 * crossfading slides with a Ken-Burns drift, a dark scrim so text always passes
 * contrast, and a muted poster-first video when present. No slider plugin.
 */
export function Hero({ slides }: { slides: HeroSlideView[] }) {
  const [index, setIndex] = useState(0);
  const hasSlides = slides.length > 0;

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!hasSlides) return null;
  const active = slides[index]!;

  return (
    <section className="relative flex h-[100svh] min-h-[560px] items-end overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== index}
          className="absolute inset-0"
          style={{
            opacity: i === index ? 1 : 0,
            transition: 'opacity var(--motion-duration) var(--motion-ease)',
          }}
        >
          {slide.videoUrl && i === index ? (
            <video
              className="h-full w-full object-cover"
              src={slide.videoUrl}
              poster={slide.imageUrl ?? undefined}
              muted
              loop
              autoPlay
              playsInline
            />
          ) : slide.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.imageUrl}
              alt=""
              className="h-full w-full object-cover"
              style={{ animation: 'kenburns calc(var(--motion-duration) * 24) ease-out both' }}
            />
          ) : (
            <div className="h-full w-full bg-[var(--accent)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />
        </div>
      ))}

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 text-white md:px-6 md:pb-24">
        {active.eyebrow && (
          <p className="mb-3 text-xs uppercase tracking-[0.2em] opacity-80">{active.eyebrow}</p>
        )}
        <h1
          className="max-w-3xl text-[clamp(2.4rem,7vw,5.5rem)] font-semibold leading-[0.98] tracking-tight"
          style={{ fontFamily: 'var(--font-hero)' }}
        >
          {active.headline}{' '}
          {active.kickerWord && <span className="text-[var(--accent)]">{active.kickerWord}</span>}
        </h1>
        {active.body && <p className="mt-4 max-w-xl text-base opacity-90">{active.body}</p>}
        {active.ctaLabel && active.ctaHref && (
          <Link
            href={active.ctaHref}
            className="mt-8 inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-6 font-medium text-[var(--accent-foreground)]"
          >
            {active.ctaLabel}
          </Link>
        )}

        {slides.length > 1 && (
          <div className="mt-10 flex gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? 32 : 12,
                  background: i === index ? 'var(--accent)' : 'rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
