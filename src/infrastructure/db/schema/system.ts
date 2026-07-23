import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { idColumn, tenantIdColumn, timestamps } from '@/infrastructure/db/schema/_common';

export const inquiries = pgTable(
  'inquiries',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    message: text('message').notNull(),
    source: text('source'),
    isRead: boolean('is_read').notNull().default(false),
    ...timestamps,
  },
  (t) => [index('idx_inquiries_tenant_read_created').on(t.tenantId, t.isRead, t.createdAt.desc())],
);

export const auditLog = pgTable(
  'audit_log',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    actorId: uuid('actor_id'),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: uuid('entity_id'),
    diff: jsonb('diff').$type<unknown>(),
    ...timestamps,
  },
  (t) => [
    index('idx_audit_tenant_created').on(t.tenantId, t.createdAt.desc()),
    index('idx_audit_entity').on(t.entity, t.entityId),
  ],
);

export const licences = pgTable(
  'licences',
  {
    id: idColumn(),
    keyFingerprint: text('key_fingerprint').notNull(),
    plan: text('plan').notNull(),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex('uniq_licences_fingerprint').on(t.keyFingerprint)],
);

/** Pending revisions for the verification workflow (§6/§11). */
export const revisions = pgTable(
  'revisions',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    entity: text('entity').notNull(),
    entityId: uuid('entity_id').notNull(),
    payload: jsonb('payload').$type<unknown>().notNull(),
    status: text('status').notNull().default('pending'),
    submittedBy: uuid('submitted_by').notNull(),
    reviewedBy: uuid('reviewed_by'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    note: text('note'),
    ...timestamps,
  },
  (t) => [
    index('idx_revisions_tenant_status_created').on(t.tenantId, t.status, t.createdAt.desc()),
  ],
);
