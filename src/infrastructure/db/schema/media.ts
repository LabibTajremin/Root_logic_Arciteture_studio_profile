import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  smallint,
  text,
  uuid,
} from 'drizzle-orm/pg-core';
import { idColumn, tenantIdColumn, timestamps } from '@/infrastructure/db/schema/_common';

export const mediaAssets = pgTable(
  'media_assets',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    projectId: uuid('project_id'),
    serviceId: uuid('service_id'),
    type: text('type').notNull().default('image'),
    // Numeric storage-driver code recorded per asset so driver migration keeps files.
    storageDriver: smallint('storage_driver').notNull(),
    storageKey: text('storage_key').notNull(),
    url: text('url').notNull(),
    width: integer('width'),
    height: integer('height'),
    durationS: integer('duration_s'),
    blurhash: text('blurhash'),
    altText: text('alt_text'),
    isDecorative: boolean('is_decorative').notNull().default(false),
    sortOrder: doublePrecision('sort_order').notNull().default(0),
    status: text('status').notNull().default('ready'),
    ...timestamps,
  },
  (t) => [
    index('idx_media_tenant_project_sort').on(t.tenantId, t.projectId, t.sortOrder),
    index('idx_media_tenant_service_sort').on(t.tenantId, t.serviceId, t.sortOrder),
    index('idx_media_tenant_type').on(t.tenantId, t.type),
    index('idx_media_status').on(t.status),
  ],
);
