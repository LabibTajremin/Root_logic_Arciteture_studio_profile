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
      <path
        d="M50 8a42 42 0 1 1 -29.7 71.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M50 25 A25 25 0 0 1 50 75 A12.5 12.5 0 0 1 50 50 A12.5 12.5 0 0 0 50 25 Z"
        fill="currentColor"
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
