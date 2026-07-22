import { pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { idColumn, timestamps } from '@/infrastructure/db/schema/_common';

export const tenants = pgTable(
  'tenants',
  {
    id: idColumn(),
    slug: text('slug').notNull(),
    customDomain: text('custom_domain'),
    plan: text('plan').notNull().default('free'),
    status: text('status').notNull().default('active'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('uniq_tenants_slug').on(t.slug),
    uniqueIndex('uniq_tenants_custom_domain').on(t.customDomain),
  ],
);
