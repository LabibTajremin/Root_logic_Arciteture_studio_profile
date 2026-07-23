import { asc } from 'drizzle-orm';
import { getDb } from '@/infrastructure/db/client';
import { tenants } from '@/infrastructure/db/schema';

/**
 * Resolves the active tenant. In single-tenant (self-host) mode there is exactly one
 * tenant row, so we return it. Multi-tenant host resolution is added in Phase 12.
 */
export async function resolveActiveTenantId(): Promise<string | null> {
  const [row] = await getDb()
    .select({ id: tenants.id })
    .from(tenants)
    .orderBy(asc(tenants.createdAt))
    .limit(1);
  return row?.id ?? null;
}
