import { eq, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/infrastructure/db/schema';

const DEMO_TENANT_ID = '00000000-0000-4000-8000-000000000001';

// Illustrated (non-photographic) DiceBear avatars — clearly not real people,
// seeded by name so each team member keeps a stable, distinct avatar.
function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`;
}

const CLIENT_NAMES = [
  'Nord & Vale',
  'Meridian Build',
  'Aurum Interiors',
  'Birch & Stone',
  'Lumen Homes',
  'Kavi Studio',
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, { schema });

  const teamPhotoRows = await db.query.mediaAssets.findMany({
    where: like(schema.mediaAssets.storageKey, 'demo/team/%'),
  });
  for (const row of teamPhotoRows) {
    await db
      .update(schema.mediaAssets)
      .set({ url: avatarUrl(row.altText ?? row.id) })
      .where(eq(schema.mediaAssets.id, row.id));
  }

  const clientRows = await db.query.clients.findMany({
    where: eq(schema.clients.tenantId, DEMO_TENANT_ID),
  });
  for (let i = 0; i < clientRows.length; i++) {
    const row = clientRows[i]!;
    await db
      .update(schema.clients)
      .set({ name: CLIENT_NAMES[i % CLIENT_NAMES.length]! })
      .where(eq(schema.clients.id, row.id));
  }

  console.log(
    `Replaced ${teamPhotoRows.length} team photos with illustrated avatars; renamed ${clientRows.length} clients.`,
  );
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
