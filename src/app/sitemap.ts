import type { MetadataRoute } from 'next';
import { getConfig } from '@config/app.config';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getPublishedProjects } from '@/infrastructure/db/queries/publicQueries';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let base = 'http://localhost:3000';
  try {
    base = getConfig().appUrl;
  } catch {
    /* fall back during build */
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/work`, priority: 0.8 },
    { url: `${base}/team`, priority: 0.5 },
    { url: `${base}/contact`, priority: 0.5 },
  ];

  try {
    const tenantId = await resolveActiveTenantId();
    if (tenantId) {
      const projects = await getPublishedProjects(tenantId);
      return [
        ...staticRoutes,
        ...projects.map((p) => ({ url: `${base}/work/${p.slug}`, priority: 0.6 })),
      ];
    }
  } catch {
    /* DB unavailable — return static routes only */
  }
  return staticRoutes;
}
