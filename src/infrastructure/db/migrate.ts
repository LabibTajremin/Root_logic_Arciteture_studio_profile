import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * Standalone migration runner: applies every SQL file in ./drizzle in order.
 * Uses a single short-lived connection so it is safe to run in CI or on boot.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required to run migrations');
  }
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);
  console.log('Running migrations…');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations applied.');
  await sql.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
