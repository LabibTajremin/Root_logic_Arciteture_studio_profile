/**
 * Vector redraw of the Maapkathi mark — an open ring with a paisley/spiral
 * monogram inside. Pure SVG, so it's infinitely sharp and background-free.
 * Colour is driven by --logo-color (teal in light mode, white in dark mode
 * — see globals.css), not hardcoded, so it tracks the theme automatically.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ color: 'var(--logo-color)' }}
      aria-hidden
    >
      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" />
      <path
        d="M63 34c10 7 10 21 0 28-8 6-19 5-25-2-4-5-4-11 1-15 4-3 9-2 11 1 2 3 0 6-3 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 ${className ?? ''}`}
      style={{ color: 'var(--logo-color)' }}
    >
      <LogoMark className={markClassName ?? 'h-8 w-8'} />
      {showWordmark && (
        <span className="text-sm font-bold tracking-[0.2em]" style={{ color: 'var(--logo-color)' }}>
          MAAPKATHI
        </span>
      )}
    </span>
  );
}
