import { eq, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/infrastructure/db/schema';

/**
 * One-off: swaps every remaining /api/placeholder gradient image (from a plain
 * `pnpm db:seed` run) for real CC0 (public domain) interior-design photography from
 * StockSnap.io. Safe to re-run — only touches rows still pointing at /api/placeholder,
 * so once every row has a real photo this becomes a no-op.
 */

const DEMO_TENANT_ID = '00000000-0000-4000-8000-000000000001';

const REPLACEMENT_IMAGES = [
  'https://cdn.stocksnap.io/img-thumbs/960w/HIH67XC5G0.jpg',
  'https://cdn.stocksnap.io/img-thumbs/960w/TQNWBTLHLY.jpg',
  'https://cdn.stocksnap.io/img-thumbs/960w/VMJ6JJFFWR.jpg',
  'https://cdn.stocksnap.io/img-thumbs/960w/EGXWIV409M.jpg',
  'https://cdn.stocksnap.io/img-thumbs/960w/3ZX53UFU8B.jpg',
  'https://cdn.stocksnap.io/img-thumbs/960w/QUU0AQABSN.jpg',
  'https://cdn.stocksnap.io/img-thumbs/960w/3TJ6NCTIRT.jpg',
  'https://cdn.stocksnap.io/img-thumbs/960w/SX2H0BU5EG.jpg',
  'https://cdn.stocksnap.io/img-thumbs/960w/8JQITZ05LX.jpg',
  'https://cdn.stocksnap.io/img-thumbs/960w/CTKGR7O9UB.jpg',
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, { schema });

  await db
    .update(schema.siteSettings)
    .set({ studioName: 'Maapkathi' })
    .where(eq(schema.siteSettings.tenantId, DEMO_TENANT_ID));

  await db
    .update(schema.seoSettings)
    .set({
      defaultTitle: 'Maapkathi',
      defaultDescription: 'Maapkathi — interior & architecture portfolio.',
    })
    .where(eq(schema.seoSettings.tenantId, DEMO_TENANT_ID));

  const rows = await db.query.mediaAssets.findMany({
    where: like(schema.mediaAssets.url, '/api/placeholder%'),
  });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    await db
      .update(schema.mediaAssets)
      .set({ url: REPLACEMENT_IMAGES[i % REPLACEMENT_IMAGES.length]! })
      .where(eq(schema.mediaAssets.id, row.id));
  }

  await db
    .update(schema.heroSlides)
    .set({ eyebrow: 'Maapkathi' })
    .where(eq(schema.heroSlides.tenantId, DEMO_TENANT_ID));

  console.log(
    `Renamed studio to Maapkathi; replaced ${rows.length} placeholder images; updated hero eyebrow.`,
  );
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
