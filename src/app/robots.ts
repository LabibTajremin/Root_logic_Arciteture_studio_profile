import type { MetadataRoute } from 'next';
import { getConfig } from '@config/app.config';

export default function robots(): MetadataRoute.Robots {
  let base = 'http://localhost:3000';
  try {
    base = getConfig().appUrl;
  } catch {
    /* fall back during build */
  }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    sitemap: `${base}/sitemap.xml`,
  };
}
