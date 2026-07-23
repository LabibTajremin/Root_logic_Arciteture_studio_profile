import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { idColumn, tenantIdColumn, timestamps } from '@/infrastructure/db/schema/_common';

export const users = pgTable(
  'users',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').notNull().default('editor'),
    name: text('name').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    mustChangePassword: boolean('must_change_password').notNull().default(false),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('uniq_users_tenant_email').on(t.tenantId, sql`lower(${t.email})`),
    index('idx_users_tenant_role').on(t.tenantId, t.role),
  ],
);
