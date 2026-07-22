import { randomUUID } from 'node:crypto';
import { hash } from '@node-rs/argon2';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '@/infrastructure/db/schema';

/**
 * Idempotent demo seed: creates the demo tenant, the admin from env (argon2id), the
 * three settings rows, and rich demo content — including hero carousel images and a
 * demo video — so a fresh install looks alive. Every media row is a normal DB record
 * the admin can replace from the panel; nothing here is hardcoded in components.
 */

const DEMO_TENANT_ID = '00000000-0000-4000-8000-000000000001';
const LOCAL_DRIVER_CODE = 3;
const DEFAULT_ADMIN_PASSWORD = 'change-this-on-first-login';

// Stable public placeholder media. Admin swaps these out; they are not bundled assets.
const img = (seed: string, w = 1600, h = 2000) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const DEMO_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required to seed');
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, { schema });

  // ── tenant ────────────────────────────────────────────────────────────────
  await db
    .insert(schema.tenants)
    .values({ id: DEMO_TENANT_ID, slug: 'demo-studio', plan: 'demo', status: 'active' })
    .onConflictDoNothing();

  // ── admin from env (argon2id) ───────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'owner@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME ?? 'Studio Owner';
  const existingAdmin = await db.query.users.findFirst({
    where: eq(schema.users.email, adminEmail),
  });
  if (!existingAdmin) {
    const passwordHash = await hash(adminPassword, {
      algorithm: 2, // argon2id
    });
    await db.insert(schema.users).values({
      tenantId: DEMO_TENANT_ID,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      name: adminName,
      isActive: true,
      // Force a password change on first login while the sentinel is still in place.
      mustChangePassword: adminPassword === DEFAULT_ADMIN_PASSWORD,
    });
    console.log(`Created admin ${adminEmail}`);
  } else {
    console.log(`Admin ${adminEmail} already exists — skipping`);
  }

  // A demo editor so RBAC (and the verification workflow) can be exercised end-to-end.
  const editorEmail = process.env.EDITOR_EMAIL ?? 'editor@example.com';
  const editorExists = await db.query.users.findFirst({
    where: eq(schema.users.email, editorEmail),
  });
  if (!editorExists) {
    const editorHash = await hash(process.env.EDITOR_PASSWORD ?? 'editor-password', {
      algorithm: 2,
    });
    await db.insert(schema.users).values({
      tenantId: DEMO_TENANT_ID,
      email: editorEmail,
      passwordHash: editorHash,
      role: 'editor',
      name: 'Demo Editor',
      isActive: true,
    });
    console.log(`Created editor ${editorEmail}`);
  }

  // ── settings ────────────────────────────────────────────────────────────────
  await db
    .insert(schema.siteSettings)
    .values({
      tenantId: DEMO_TENANT_ID,
      studioName: 'Maapkathi Demo Studio',
      tagline: 'Interiors with intent.',
      contactEmail: 'hello@demo-studio.test',
      contactPhone: '+880 1700 000000',
      whatsapp: '+8801700000000',
      address: 'House 12, Road 7, Dhanmondi, Dhaka',
      socials: { instagram: 'https://instagram.com', facebook: 'https://facebook.com' },
      editorVerificationRequired: true,
    })
    .onConflictDoNothing();
  await db.insert(schema.themeSettings).values({ tenantId: DEMO_TENANT_ID }).onConflictDoNothing();
  await db
    .insert(schema.seoSettings)
    .values({
      tenantId: DEMO_TENANT_ID,
      defaultTitle: 'Maapkathi Demo Studio',
      defaultDescription: 'A demo interior & architecture portfolio built on Maapkathi Studio.',
    })
    .onConflictDoNothing();

  // Skip content seeding if it already ran, keeping the seed idempotent.
  const projectCount = await db.query.projects.findFirst({
    where: eq(schema.projects.tenantId, DEMO_TENANT_ID),
  });
  if (projectCount) {
    console.log('Demo content already present — skipping content seed');
    await sql.end();
    return;
  }

  // ── categories ──────────────────────────────────────────────────────────────
  const categoryRows = [
    { name: 'Residential', slug: 'residential' },
    { name: 'Commercial', slug: 'commercial' },
    { name: 'Hospitality', slug: 'hospitality' },
  ].map((c, i) => ({ id: randomUUID(), tenantId: DEMO_TENANT_ID, sortOrder: i, ...c }));
  await db.insert(schema.categories).values(categoryRows);

  const adminUser = await db.query.users.findFirst({
    where: eq(schema.users.email, adminEmail),
  });
  const createdBy = adminUser!.id;

  // ── media: hero images + demo video + project covers + gallery ───────────────
  const heroImageIds = [0, 1, 2].map(() => randomUUID());
  const heroVideoId = randomUUID();
  const heroMedia = [
    ...heroImageIds.map((id, i) => ({
      id,
      tenantId: DEMO_TENANT_ID,
      projectId: null,
      type: 'image' as const,
      storageDriver: LOCAL_DRIVER_CODE,
      storageKey: `demo/hero-${i + 1}.jpg`,
      url: img(`hero${i + 1}`, 2400, 1350),
      width: 2400,
      height: 1350,
      altText: `Demo hero image ${i + 1}`,
      sortOrder: i,
    })),
    {
      id: heroVideoId,
      tenantId: DEMO_TENANT_ID,
      projectId: null,
      type: 'video' as const,
      storageDriver: LOCAL_DRIVER_CODE,
      storageKey: 'demo/hero-loop.mp4',
      url: DEMO_VIDEO_URL,
      durationS: 15,
      altText: 'Demo hero background video',
      sortOrder: 0,
    },
  ];
  await db.insert(schema.mediaAssets).values(heroMedia);

  // ── 6 demo projects, each with a cover + a small gallery ─────────────────────
  const demoProjects = [
    { title: 'Riverside Villa', cat: 0, featured: true, status: 'published', location: 'Dhaka' },
    { title: 'Skyline Penthouse', cat: 0, featured: true, status: 'published', location: 'Dhaka' },
    { title: 'Atrium Offices', cat: 1, featured: false, status: 'published', location: 'Gulshan' },
    { title: 'Courtyard Café', cat: 2, featured: true, status: 'published', location: 'Banani' },
    { title: 'Lakeview Retreat', cat: 2, featured: false, status: 'published', location: 'Sylhet' },
    { title: 'Studio Loft', cat: 0, featured: false, status: 'draft', location: 'Dhaka' },
  ];

  for (const [i, p] of demoProjects.entries()) {
    const projectId = randomUUID();
    const coverId = randomUUID();
    const galleryIds = [randomUUID(), randomUUID(), randomUUID()];
    const slug = p.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    await db.insert(schema.mediaAssets).values([
      {
        id: coverId,
        tenantId: DEMO_TENANT_ID,
        projectId,
        type: 'image',
        storageDriver: LOCAL_DRIVER_CODE,
        storageKey: `demo/${slug}/cover.jpg`,
        url: img(`${slug}-cover`, 1200, 1500),
        width: 1200,
        height: 1500,
        altText: `${p.title} — cover`,
        sortOrder: 0,
      },
      ...galleryIds.map((id, g) => ({
        id,
        tenantId: DEMO_TENANT_ID,
        projectId,
        type: 'image' as const,
        storageDriver: LOCAL_DRIVER_CODE,
        storageKey: `demo/${slug}/gallery-${g + 1}.jpg`,
        url: img(`${slug}-g${g + 1}`, 1600, 1067),
        width: 1600,
        height: 1067,
        altText: `${p.title} — gallery ${g + 1}`,
        sortOrder: g + 1,
      })),
    ]);

    await db.insert(schema.projects).values({
      id: projectId,
      tenantId: DEMO_TENANT_ID,
      slug,
      title: p.title,
      summary: `${p.title} is a demo project showcasing the ${categoryRows[p.cat]!.name.toLowerCase()} portfolio layout.`,
      body: 'Replace this narrative from the admin panel. Every field, image and video here is editable.',
      categoryId: categoryRows[p.cat]!.id,
      status: p.status,
      isFeatured: p.featured,
      sortOrder: i,
      location: p.location,
      clientName: 'Demo Client',
      areaSqft: 1800 + i * 250,
      coverMediaId: coverId,
      createdBy,
      completedAt: new Date(2023, i, 15),
    });
  }

  // ── hero slides (carousel) referencing the demo images + video ───────────────
  await db.insert(schema.heroSlides).values([
    {
      tenantId: DEMO_TENANT_ID,
      eyebrow: 'Maapkathi Demo Studio',
      headline: 'Spaces designed around how you live',
      kickerWord: 'design',
      body: 'A demo hero — swap these images and the background video from the admin panel.',
      imageMediaId: heroImageIds[0],
      videoMediaId: heroVideoId,
      ctaLabel: 'View our work',
      ctaHref: '/work',
      sortOrder: 0,
    },
    {
      tenantId: DEMO_TENANT_ID,
      eyebrow: 'Interiors',
      headline: 'Craft in every corner',
      kickerWord: 'quality',
      imageMediaId: heroImageIds[1],
      ctaLabel: 'Our services',
      ctaHref: '/services',
      sortOrder: 1,
    },
    {
      tenantId: DEMO_TENANT_ID,
      eyebrow: 'Architecture',
      headline: 'From concept to completion',
      kickerWord: 'studio',
      imageMediaId: heroImageIds[2],
      ctaLabel: 'About us',
      ctaHref: '/about',
      sortOrder: 2,
    },
  ]);

  // ── supporting homepage content ──────────────────────────────────────────────
  await db.insert(schema.members).values(
    [
      { name: 'Ayesha Rahman', roleTitle: 'Principal Architect' },
      { name: 'Tanvir Ahmed', roleTitle: 'Design Lead' },
      { name: 'Nusrat Jahan', roleTitle: 'Interior Designer' },
      { name: 'Rafiul Islam', roleTitle: 'Project Manager' },
    ].map((m, i) => ({
      tenantId: DEMO_TENANT_ID,
      name: m.name,
      roleTitle: m.roleTitle,
      bio: 'Demo team member — editable from the admin panel.',
      socials: [{ platform: 'linkedin', url: 'https://linkedin.com' }],
      sortOrder: i,
      status: 'published',
    })),
  );

  await db.insert(schema.services).values(
    [
      { title: 'Interior Design', slug: 'interior-design' },
      { title: 'Architecture', slug: 'architecture' },
      { title: 'Space Planning', slug: 'space-planning' },
      { title: 'Turnkey Fit-out', slug: 'turnkey-fit-out' },
    ].map((s, i) => ({
      tenantId: DEMO_TENANT_ID,
      title: s.title,
      slug: s.slug,
      excerpt: 'A demo service description you can edit.',
      sortOrder: i,
      status: 'published',
    })),
  );

  await db.insert(schema.stats).values(
    [
      { label: 'Projects delivered', valueNumber: 120, suffix: '+' },
      { label: 'Years of practice', valueNumber: 12, suffix: '' },
      { label: 'Cities', valueNumber: 8, suffix: '' },
      { label: 'Awards', valueNumber: 15, suffix: '' },
    ].map((s, i) => ({ tenantId: DEMO_TENANT_ID, ...s, sortOrder: i })),
  );

  await db.insert(schema.testimonials).values(
    [
      {
        authorName: 'Farhana K.',
        company: 'Homeowner',
        quote: 'They understood our space better than we did.',
      },
      { authorName: 'Imran H.', company: 'Café Owner', quote: 'Beautiful, functional, on time.' },
      { authorName: 'Sadia M.', company: 'Developer', quote: 'A studio that sweats the details.' },
    ].map((t, i) => ({
      tenantId: DEMO_TENANT_ID,
      ...t,
      rating: 5,
      sortOrder: i,
      status: 'published',
    })),
  );

  await db.insert(schema.clients).values(
    Array.from({ length: 6 }).map((_, i) => ({
      tenantId: DEMO_TENANT_ID,
      name: `Client ${i + 1}`,
      website: 'https://example.com',
      sortOrder: i,
      isFeatured: i < 3,
    })),
  );

  await db.insert(schema.faqs).values(
    [
      {
        question: 'How long does a project take?',
        answer: 'Typically 3–6 months depending on scope.',
      },
      { question: 'Do you work outside Dhaka?', answer: 'Yes, across Bangladesh and remotely.' },
      {
        question: 'What is your fee structure?',
        answer: 'A demo answer — edit this in the admin panel.',
      },
    ].map((f, i) => ({ tenantId: DEMO_TENANT_ID, ...f, sortOrder: i, status: 'published' })),
  );

  console.log('Demo content seeded.');
  await sql.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
