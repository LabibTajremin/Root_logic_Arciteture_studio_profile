import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { idColumn, tenantIdColumn, timestamps } from '@/infrastructure/db/schema/_common';

export const projects = pgTable(
  'projects',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    summary: text('summary'),
    body: text('body'),
    categoryId: uuid('category_id'),
    status: text('status').notNull().default('draft'),
    isFeatured: boolean('is_featured').notNull().default(false),
    // Fractional so a drag-reorder never rewrites the whole table.
    sortOrder: doublePrecision('sort_order').notNull().default(0),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    location: text('location'),
    clientName: text('client_name'),
    areaSqft: integer('area_sqft'),
    coverMediaId: uuid('cover_media_id'),
    createdBy: uuid('created_by').notNull(),
    reviewedBy: uuid('reviewed_by'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('uniq_projects_tenant_slug').on(t.tenantId, t.slug),
    index('idx_projects_tenant_status_sort').on(t.tenantId, t.status, t.sortOrder),
    index('idx_projects_tenant_featured')
      .on(t.tenantId, t.isFeatured)
      .where(sql`${t.status} = 'published'`),
    index('idx_projects_tenant_category').on(t.tenantId, t.categoryId),
    index('idx_projects_search').using(
      'gin',
      sql`to_tsvector('english', ${t.title} || ' ' || coalesce(${t.summary}, ''))`,
    ),
    index('idx_projects_keyset').on(t.createdAt, t.id),
  ],
);
