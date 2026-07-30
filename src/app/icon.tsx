import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getSiteSettings } from '@/infrastructure/db/queries/publicQueries';

// Favicon changes are rare — an hour of staleness after the admin saves a new one is fine,
// and it keeps every browser tab request from hitting the DB + storage on every request.
export const revalidate = 3600;

const DEFAULT_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="14" fill="#0f6e6e" />
  <circle cx="50" cy="48" r="30" fill="none" stroke="#ffffff" stroke-width="5" />
  <path
    d="M60 34c7 5 7 15 0 20-6 4-14 4-18-1-3-4-3-8 1-11 3-2 6-1 8 1 1 2 0 4-2 4"
    fill="none"
    stroke="#ffffff"
    stroke-width="5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`;

function defaultIcon(): Response {
  return new Response(DEFAULT_ICON_SVG, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' },
  });
}

/**
 * Admin-configurable favicon: a dedicated upload, falling back to the light logo, then the
 * dark logo, then the built-in mark. Fetches the resolved image server-side and streams it
 * back so this works regardless of which storage driver serves the underlying file.
 */
export default async function Icon() {
  const tenantId = await resolveActiveTenantId();
  if (!tenantId) return defaultIcon();

  const site = await getSiteSettings(tenantId);
  const url = site?.faviconUrl ?? site?.logoLightUrl ?? site?.logoDarkUrl ?? null;
  if (!url) return defaultIcon();

  try {
    const res = await fetch(url);
    if (!res.ok) return defaultIcon();
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') ?? 'image/png';
    return new Response(buffer, {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' },
    });
  } catch {
    return defaultIcon();
  }
}
