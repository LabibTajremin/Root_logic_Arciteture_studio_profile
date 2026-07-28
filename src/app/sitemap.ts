import type { MetadataRoute } from 'next';
import { getConfig } from '@config/app.config';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import {
  getPublishedPosts,
  getPublishedProjects,
  getServices,
  getSiteSettings,
} from '@/infrastructure/db/queries/publicQueries';

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
    { url: `${base}/services`, priority: 0.7 },
    { url: `${base}/about`, priority: 0.5 },
    { url: `${base}/team`, priority: 0.5 },
    { url: `${base}/contact`, priority: 0.5 },
  ];

  try {
    const tenantId = await resolveActiveTenantId();
    if (!tenantId) return staticRoutes;

    const [site, projects, services] = await Promise.all([
      getSiteSettings(tenantId),
      getPublishedProjects(tenantId),
      getServices(tenantId),
    ]);

    const dynamicRoutes: MetadataRoute.Sitemap = [
      ...projects.map((p) => ({ url: `${base}/work/${p.slug}`, priority: 0.6 })),
      ...services.map((s) => ({ url: `${base}/services/${s.slug}`, priority: 0.6 })),
    ];

    if (site?.blogEnabled) {
      const posts = await getPublishedPosts(tenantId);
      dynamicRoutes.push(
        { url: `${base}/blog`, priority: 0.5 },
        ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, priority: 0.5 })),
      );
    }

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    /* DB unavailable — return static routes only */
    return staticRoutes;
  }
}
