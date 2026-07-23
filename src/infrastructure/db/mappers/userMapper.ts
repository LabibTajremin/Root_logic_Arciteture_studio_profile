import type { InferSelectModel } from 'drizzle-orm';
import type { users } from '@/infrastructure/db/schema';
import type { User } from '@/domain/entities/User';
import type { Role } from '@/domain/entities/enums';

type UserRow = InferSelectModel<typeof users>;

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    tenantId: row.tenantId,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role as Role,
    name: row.name,
    isActive: row.isActive,
    mustChangePassword: row.mustChangePassword,
    lastLoginAt: row.lastLoginAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
