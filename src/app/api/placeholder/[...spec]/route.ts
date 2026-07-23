import { NextResponse } from 'next/server';

/**
 * Deterministic SVG placeholder so demo content renders offline with no external image
 * host. /api/placeholder/1200/1500?label=Villa&hue=8 → a tinted gradient with a label.
 * Real installs replace these media URLs from the admin panel.
 */
export async function GET(request: Request, { params }: { params: Promise<{ spec?: string[] }> }) {
  const { spec = [] } = await params;
  const width = clampInt(spec[0], 1200, 16, 4000);
  const height = clampInt(spec[1], 1500, 16, 4000);
  const url = new URL(request.url);
  const label = url.searchParams.get('label') ?? '';
  const hue = clampInt(url.searchParams.get('hue'), hashHue(label), 0, 360);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 30% 32%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 24) % 360} 34% 20%)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="50%" fill="rgba(255,255,255,0.72)" font-family="Georgia, serif" font-size="${Math.round(Math.min(width, height) / 12)}" text-anchor="middle" dominant-baseline="middle">${escapeXml(label)}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

function clampInt(raw: string | null | undefined, fallback: number, min: number, max: number) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function hashHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);
}
