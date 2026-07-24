import { randomUUID } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/infrastructure/db/schema';

const DEMO_TENANT_ID = '00000000-0000-4000-8000-000000000001';

const BLOG_IMAGES = [
  'https://cdn.stocksnap.io/img-thumbs/960w/VMJ6JJFFWR.jpg',
  'https://cdn.stocksnap.io/img-thumbs/960w/8JQITZ05LX.jpg',
  'https://cdn.stocksnap.io/img-thumbs/960w/EGXWIV409M.jpg',
];

const SUBSERVICES: Record<string, string[]> = {
  'interior-design': ['Residential Interiors', 'Commercial Interiors', 'Styling & Décor'],
  architecture: ['Concept Design', 'Construction Documentation', '3D Visualisation'],
};

const POSTS = [
  {
    title: 'Designing calm: our approach to residential interiors',
    excerpt: 'How we balance light, material, and flow to make a home feel effortless.',
    body: 'A calm home starts with restraint. We begin every residential project by mapping how light moves through the space across the day, then let that rhythm drive the palette and materials.\n\nNatural textures — timber, stone, linen — age gracefully and keep a room feeling grounded. We layer them against a quiet base so the architecture, not the decoration, leads.\n\nThe result is a home that feels considered but never staged: a place that supports the way you actually live.',
  },
  {
    title: 'From concept to completion: how a fit-out really happens',
    excerpt: 'A behind-the-scenes look at the phases of a turnkey project.',
    body: 'Every turnkey fit-out moves through the same arc: discovery, concept, documentation, and delivery. What changes is the detail.\n\nIn discovery we listen — to how a space is used, what frustrates its owners, and what they aspire to. Concept translates that into a spatial idea. Documentation makes it buildable. Delivery makes it real.\n\nGood project management is invisible: the client experiences a smooth handover, not the hundreds of decisions behind it.',
  },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = postgres(url, { max: 1 });

  // Ensure the new columns exist even if migration 0001 hasn't run.
  await sql.unsafe(`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "blog_enabled" boolean DEFAULT false NOT NULL;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "vision_mission_enabled" boolean DEFAULT false NOT NULL;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "vision_text" text;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "mission_text" text;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "logo_show_title" boolean DEFAULT true NOT NULL;
  `);

  const db = drizzle(sql, { schema });

  // Enable blog + vision/mission with demo copy.
  await db
    .update(schema.siteSettings)
    .set({
      blogEnabled: true,
      visionMissionEnabled: true,
      visionText:
        'To make thoughtful, human-centred design the standard for every space in Bangladesh — not a luxury reserved for a few.',
      missionText:
        'We design and deliver interiors and architecture that are beautiful, functional, and built to last, guiding each client from first sketch to final handover.',
    })
    .where(eq(schema.siteSettings.tenantId, DEMO_TENANT_ID));

  // Add sub-services under matching top-level services (idempotent by slug).
  const topServices = await db.query.services.findMany({
    where: and(eq(schema.services.tenantId, DEMO_TENANT_ID), isNull(schema.services.parentId)),
  });
  for (const parent of topServices) {
    const children = SUBSERVICES[parent.slug];
    if (!children) continue;
    for (let i = 0; i < children.length; i++) {
      const title = children[i]!;
      const slug = `${parent.slug}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const exists = await db.query.services.findFirst({
        where: and(eq(schema.services.tenantId, DEMO_TENANT_ID), eq(schema.services.slug, slug)),
      });
      if (exists) continue;
      await db.insert(schema.services).values({
        tenantId: DEMO_TENANT_ID,
        title,
        slug,
        parentId: parent.id,
        excerpt: 'A demo sub-service you can edit or remove.',
        sortOrder: i,
        status: 'published',
      });
    }
  }

  // Demo blog posts with cover images (idempotent by slug).
  for (let i = 0; i < POSTS.length; i++) {
    const p = POSTS[i]!;
    const slug = p.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const exists = await db.query.posts.findFirst({
      where: and(eq(schema.posts.tenantId, DEMO_TENANT_ID), eq(schema.posts.slug, slug)),
    });
    if (exists) continue;
    const mediaId = randomUUID();
    await db.insert(schema.mediaAssets).values({
      id: mediaId,
      tenantId: DEMO_TENANT_ID,
      projectId: null,
      type: 'image',
      storageDriver: 5,
      storageKey: `demo/blog/${i + 1}.jpg`,
      url: BLOG_IMAGES[i % BLOG_IMAGES.length]!,
      width: 1280,
      height: 853,
      altText: p.title,
      sortOrder: i,
    });
    await db.insert(schema.posts).values({
      tenantId: DEMO_TENANT_ID,
      slug,
      title: p.title,
      excerpt: p.excerpt,
      body: p.body,
      coverMediaId: mediaId,
      tags: ['studio', 'design'],
      status: 'published',
      publishedAt: new Date(),
    });
  }

  console.log('Demo enhancements applied: blog, vision/mission, sub-services.');
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
