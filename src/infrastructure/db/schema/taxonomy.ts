import { index, integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { idColumn, tenantIdColumn, timestamps } from '@/infrastructure/db/schema/_common';

export const categories = pgTable(
  'categories',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('uniq_categories_tenant_slug').on(t.tenantId, t.slug),
    index('idx_categories_tenant_sort').on(t.tenantId, t.sortOrder),
  ],
);
