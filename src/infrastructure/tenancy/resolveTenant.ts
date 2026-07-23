import { asc, eq, or } from 'drizzle-orm';
import { getConfig } from '@config/app.config';
import { getDb } from '@/infrastructure/db/client';
import { tenants } from '@/infrastructure/db/schema';

/**
 * Maps a request host to a tenant. In single-tenant mode the one tenant is always
 * returned. In multi-tenant SaaS mode the host must match a tenant's custom domain or
 * a subdomain slug — an unknown host resolves to null so the caller returns 404 (never
 * a cross-tenant leak or a default tenant).
 */
export async function resolveTenantByHost(host: string | null): Promise<string | null> {
  if (getConfig().deployment.mode === 'single-tenant') {
    const [row] = await getDb()
      .select({ id: tenants.id })
      .from(tenants)
      .orderBy(asc(tenants.createdAt))
      .limit(1);
    return row?.id ?? null;
  }

  if (!host) return null;
  const hostname = host.split(':')[0]!.toLowerCase();
  const sub = hostname.split('.')[0]!;

  const [row] = await getDb()
    .select({ id: tenants.id })
    .from(tenants)
    .where(or(eq(tenants.customDomain, hostname), eq(tenants.slug, sub)))
    .limit(1);
  return row?.id ?? null;
}

/** Parse the subdomain slug from a host (pure; used by the resolver and its tests). */
export function subdomainOf(host: string | null): string | null {
  if (!host) return null;
  const hostname = host.split(':')[0]!.toLowerCase();
  const parts = hostname.split('.');
  if (parts.length < 2) return null;
  return parts[0]!;
}
