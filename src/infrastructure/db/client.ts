import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getConfig } from '@config/app.config';
import * as schema from '@/infrastructure/db/schema';

/**
 * Single shared postgres-js pool + Drizzle instance. Lazily created so importing this
 * module never opens a connection (matters for build and tests).
 */
let sql: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getSql() {
  if (!sql) {
    sql = postgres(getConfig().databaseUrl, { max: 10 });
  }
  return sql;
}

export function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getSql(), { schema });
  }
  return dbInstance;
}

export type Database = ReturnType<typeof getDb>;
export { schema };
