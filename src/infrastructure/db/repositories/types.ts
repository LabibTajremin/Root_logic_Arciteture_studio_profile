import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '@/infrastructure/db/schema';

/** The Drizzle client or an open transaction — repositories accept either. */
export type Db = PostgresJsDatabase<typeof schema>;
