'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/presentation/components/public/Logo';
import { ThemeToggle } from '@/presentation/components/public/ThemeToggle';

export interface NavItem {
  label: string;
  href: string;
}

/**
 * Transparent-over-hero header that solidifies to a frosted bar on scroll. Mobile gets
 * a full-screen overlay menu with staggered links. Tap targets are >= 44px.
 */
export function SiteHeader({
  studioName,
  nav,
  phone,
}: {
  studioName: string;
  nav: NavItem[];
  phone: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-current/10 bg-[var(--background)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" aria-label={studioName}>
          <Logo />
        </Link>

        <nav
          className="hidden items-center gap-6 md:flex"
          style={{ fontFamily: 'var(--font-nav)' }}
        >
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm opacity-80 hover:opacity-100">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="hidden min-h-11 items-center rounded-full bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] md:inline-flex"
            >
              Call us
            </a>
          )}
          <ThemeToggle />
          <Link
            href="/admin"
            aria-label="Admin login"
            title="Admin login"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-current/15 text-current"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3Z" />
            </svg>
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center md:hidden"
          >
            <span aria-hidden>☰</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--background)] p-6 md:hidden">
          <div className="flex items-center justify-between">
            <Logo />
            <span className="sr-only">{studioName}</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center"
            >
              <span aria-hidden>✕</span>
            </button>
          </div>
          <nav className="mt-10 flex flex-col gap-6">
            {nav.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                data-reveal
                className="is-in text-2xl"
                style={{ transitionDelay: `calc(var(--motion-stagger) * ${i})` }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
