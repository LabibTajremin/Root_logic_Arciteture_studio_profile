import { and, asc, eq, sql as dsql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/infrastructure/db/schema';
import { hashPassword } from '@/infrastructure/auth/password';

/**
 * Resets the admin login (email + password) directly in the database — for when the
 * admin is locked out and can't use the Account page.
 *
 *   NEW_ADMIN_EMAIL=... NEW_ADMIN_PASSWORD=... pnpm admin:reset
 *
 * Targets the admin whose email is CURRENT_ADMIN_EMAIL if given, otherwise the oldest
 * admin account. Credentials come from env so they never land in the repo.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  const newEmail = process.env.NEW_ADMIN_EMAIL?.trim().toLowerCase();
  const newPassword = process.env.NEW_ADMIN_PASSWORD;
  const currentEmail = process.env.CURRENT_ADMIN_EMAIL?.trim().toLowerCase();

  if (!url) throw new Error('DATABASE_URL is required');
  if (!newEmail || !newPassword) {
    throw new Error('NEW_ADMIN_EMAIL and NEW_ADMIN_PASSWORD are required');
  }
  if (newPassword.length < 8) throw new Error('NEW_ADMIN_PASSWORD must be at least 8 characters');

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    const admin = await db.query.users.findFirst({
      where: currentEmail
        ? and(eq(schema.users.role, 'admin'), eq(dsql`lower(${schema.users.email})`, currentEmail))
        : eq(schema.users.role, 'admin'),
      orderBy: [asc(schema.users.createdAt)],
    });
    if (!admin) throw new Error('No matching admin user found');

    await db
      .update(schema.users)
      .set({
        email: newEmail,
        passwordHash: await hashPassword(newPassword),
        isActive: true,
        mustChangePassword: false,
      })
      .where(eq(schema.users.id, admin.id));

    console.log(`Admin ${admin.email} reset → login is now ${newEmail}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Reset failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
