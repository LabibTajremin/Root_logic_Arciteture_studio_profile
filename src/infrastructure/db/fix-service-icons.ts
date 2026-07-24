import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/infrastructure/db/schema';

const DEMO_TENANT_ID = '00000000-0000-4000-8000-000000000001';

// Monochrome line icons (Iconify / Lucide), keyed by service slug. Rendered black,
// inverted to white in dark mode via the .service-icon CSS rule.
const ICON_FOR_SLUG: Record<string, string> = {
  'interior-design': 'https://api.iconify.design/lucide:sofa.svg',
  architecture: 'https://api.iconify.design/lucide:drafting-compass.svg',
  'space-planning': 'https://api.iconify.design/lucide:layout-dashboard.svg',
  'turnkey-fit-out': 'https://api.iconify.design/lucide:hard-hat.svg',
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, { schema });

  const rows = await db.query.services.findMany({
    where: eq(schema.services.tenantId, DEMO_TENANT_ID),
  });

  let updated = 0;
  for (const svc of rows) {
    if (svc.iconMediaId) continue;
    const iconUrl = ICON_FOR_SLUG[svc.slug];
    if (!iconUrl) continue;

    const mediaId = randomUUID();
    await db.insert(schema.mediaAssets).values({
      id: mediaId,
      tenantId: DEMO_TENANT_ID,
      projectId: null,
      type: 'image',
      storageDriver: 5,
      storageKey: `demo/service-icons/${svc.slug}.svg`,
      url: iconUrl,
      width: 64,
      height: 64,
      altText: `${svc.title} icon`,
      sortOrder: 0,
    });
    await db
      .update(schema.services)
      .set({ iconMediaId: mediaId, updatedAt: new Date() })
      .where(and(eq(schema.services.tenantId, DEMO_TENANT_ID), eq(schema.services.id, svc.id)));
    updated++;
  }

  console.log(`Seeded icons for ${updated} services.`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
