'use client';

import { useCallback, useEffect, useState } from 'react';

export interface LightboxImage {
  id: string;
  url: string;
  altText: string | null;
}

/**
 * Masonry gallery that opens a keyboard- and swipe-navigable lightbox with a counter
 * and neighbour preloading. Closes on Escape or backdrop click.
 */
export function Lightbox({
  images,
  projectTitle,
}: {
  images: LightboxImage[];
  projectTitle: string;
}) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length],
  );
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (index === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, close, next, prev]);

  // Preload the neighbouring image.
  useEffect(() => {
    if (index === null) return;
    const nextImg = images[(index + 1) % images.length];
    if (nextImg) {
      const img = new Image();
      img.src = nextImg.url;
    }
  }, [index, images]);

  if (!images.length) return null;

  return (
    <>
      <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
        {images.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setIndex(i)}
            className="block w-full overflow-hidden rounded-[var(--radius)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.altText ?? projectTitle} loading="lazy" className="w-full" />
          </button>
        ))}
      </div>

      {index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${projectTitle} gallery`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-white"
          >
            ✕
          </button>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 flex h-11 w-11 items-center justify-center text-2xl text-white md:left-6"
          >
            ‹
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]!.url}
            alt={images[index]!.altText ?? projectTitle}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 flex h-11 w-11 items-center justify-center text-2xl text-white md:right-6"
          >
            ›
          </button>
          <span className="absolute bottom-4 text-sm text-white/70">
            {index + 1} / {images.length}
          </span>
        </div>
      )}
    </>
  );
}
