import { and, count, eq, sql } from 'drizzle-orm';
import { users } from '@/infrastructure/db/schema';
import { toUser } from '@/infrastructure/db/mappers/userMapper';
import type { Db } from '@/infrastructure/db/repositories/types';
import type { User } from '@/domain/entities/User';
import type { Role } from '@/domain/entities/enums';
import type { NewUser, UserRepository } from '@/domain/repositories/UserRepository';

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Db) {}

  async findById(tenantId: string, id: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.id, id)))
      .limit(1);
    return row ? toUser(row) : null;
  }

  async findByEmail(tenantId: string, email: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.tenantId, tenantId), sql`lower(${users.email}) = lower(${email})`))
      .limit(1);
    return row ? toUser(row) : null;
  }

  async listByRole(tenantId: string, role: Role): Promise<readonly User[]> {
    const rows = await this.db
      .select()
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.role, role)));
    return rows.map(toUser);
  }

  async countAdmins(tenantId: string): Promise<number> {
    const [row] = await this.db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.role, 'admin')));
    return row?.value ?? 0;
  }

  async create(user: NewUser): Promise<User> {
    const [row] = await this.db.insert(users).values(user).returning();
    return toUser(row!);
  }

  async update(
    tenantId: string,
    id: string,
    patch: Partial<
      Pick<
        User,
        'name' | 'role' | 'isActive' | 'passwordHash' | 'mustChangePassword' | 'lastLoginAt'
      >
    >,
  ): Promise<User> {
    const [row] = await this.db
      .update(users)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(users.tenantId, tenantId), eq(users.id, id)))
      .returning();
    if (!row) throw new Error(`User ${id} not found for tenant ${tenantId}`);
    return toUser(row);
  }
}
