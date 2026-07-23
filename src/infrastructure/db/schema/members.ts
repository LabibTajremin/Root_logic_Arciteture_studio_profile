import { doublePrecision, index, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { idColumn, tenantIdColumn, timestamps } from '@/infrastructure/db/schema/_common';
import type { MemberSocial } from '@/domain/entities/Member';

export const members = pgTable(
  'members',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    name: text('name').notNull(),
    roleTitle: text('role_title'),
    bio: text('bio'),
    photoMediaId: uuid('photo_media_id'),
    socials: jsonb('socials').$type<MemberSocial[]>().notNull().default([]),
    sortOrder: doublePrecision('sort_order').notNull().default(0),
    status: text('status').notNull().default('published'),
    ...timestamps,
  },
  (t) => [index('idx_members_tenant_status_sort').on(t.tenantId, t.status, t.sortOrder)],
);
