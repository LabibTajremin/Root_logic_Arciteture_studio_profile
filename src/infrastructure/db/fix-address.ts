import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/infrastructure/db/schema';

const DEMO_TENANT_ID = '00000000-0000-4000-8000-000000000001';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, { schema });

  await db
    .update(schema.siteSettings)
    .set({ address: 'House 6, (2nd Floor) Road 2, Block C, Mirpur, Dhaka, Bangladesh, 1216' })
    .where(eq(schema.siteSettings.tenantId, DEMO_TENANT_ID));

  console.log('Updated demo tenant address.');
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
