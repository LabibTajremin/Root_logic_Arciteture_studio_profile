import { randomUUID } from 'node:crypto';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/infrastructure/db/schema';

export type TestDb = ReturnType<typeof drizzle<typeof schema>>;

let sql: ReturnType<typeof postgres> | null = null;

export function getTestDb(): TestDb {
  if (!sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is required for integration tests');
    sql = postgres(url, { max: 5 });
  }
  return drizzle(sql, { schema });
}

export async function closeTestDb(): Promise<void> {
  if (sql) {
    await sql.end();
    sql = null;
  }
}

/** Create an isolated tenant + admin user for a test; returns their ids. */
export async function createTenant(db: TestDb): Promise<{ tenantId: string; userId: string }> {
  const tenantId = randomUUID();
  const slug = `t-${tenantId.slice(0, 8)}`;
  await db.insert(schema.tenants).values({ id: tenantId, slug });
  const [user] = await db
    .insert(schema.users)
    .values({
      tenantId,
      email: `admin-${tenantId.slice(0, 8)}@test.local`,
      passwordHash: 'x',
      role: 'admin',
      name: 'Test Admin',
    })
    .returning();
  return { tenantId, userId: user!.id };
}

/** Remove a tenant's rows so tests don't accumulate data. */
export async function cleanupTenant(db: TestDb, tenantId: string): Promise<void> {
  const { eq } = await import('drizzle-orm');
  await db.delete(schema.mediaAssets).where(eq(schema.mediaAssets.tenantId, tenantId));
  await db.delete(schema.projects).where(eq(schema.projects.tenantId, tenantId));
  await db.delete(schema.members).where(eq(schema.members.tenantId, tenantId));
  await db.delete(schema.users).where(eq(schema.users.tenantId, tenantId));
  await db.delete(schema.tenants).where(eq(schema.tenants.id, tenantId));
}
