import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/** Applies migrations once against the test database before the integration suite. */
export async function setup() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'Integration tests require DATABASE_URL (start Postgres and set it, or run via CI).',
    );
  }
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: './drizzle' });
  await sql.end();
}
