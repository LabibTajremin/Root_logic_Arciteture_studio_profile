import { timestamp, uuid } from 'drizzle-orm/pg-core';

export const idColumn = () => uuid('id').primaryKey().defaultRandom();

/** Present on every tenant-scoped table. In single-tenant mode a fixed tenant row is used. */
export const tenantIdColumn = () => uuid('tenant_id').notNull();

export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};
