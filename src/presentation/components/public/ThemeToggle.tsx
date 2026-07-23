'use client';

import { useEffect, useState } from 'react';

type Mode = 'light' | 'dark';

/** Dark/light toggle. Persists to a cookie (read by ThemeScript pre-paint) + localStorage. */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') as Mode | null;
    setMode(
      current ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    );
  }, []);

  function toggle() {
    const next: Mode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    document.documentElement.setAttribute('data-theme', next);
    document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle colour theme"
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-current/15 text-current"
    >
      <span aria-hidden>{mode === 'dark' ? '☀' : '☾'}</span>
    </button>
  );
}
