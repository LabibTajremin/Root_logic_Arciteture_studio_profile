import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { idColumn, tenantIdColumn, timestamps } from '@/infrastructure/db/schema/_common';

export const posts = pgTable(
  'posts',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    excerpt: text('excerpt'),
    body: text('body'),
    coverMediaId: uuid('cover_media_id'),
    authorId: uuid('author_id'),
    tags: text('tags').array().notNull().default([]),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    status: text('status').notNull().default('draft'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('uniq_posts_tenant_slug').on(t.tenantId, t.slug),
    index('idx_posts_tenant_status_published').on(t.tenantId, t.status, t.publishedAt.desc()),
    index('idx_posts_tags').using('gin', t.tags),
  ],
);
