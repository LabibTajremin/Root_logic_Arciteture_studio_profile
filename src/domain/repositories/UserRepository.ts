import type { User } from '@/domain/entities/User';
import type { Role } from '@/domain/entities/enums';

export type NewUser = Omit<User, 'createdAt' | 'updatedAt' | 'lastLoginAt'>;

export interface UserRepository {
  findById(tenantId: string, id: string): Promise<User | null>;
  findByEmail(tenantId: string, email: string): Promise<User | null>;
  listByRole(tenantId: string, role: Role): Promise<readonly User[]>;
  countAdmins(tenantId: string): Promise<number>;
  create(user: NewUser): Promise<User>;
  update(
    tenantId: string,
    id: string,
    patch: Partial<
      Pick<
        User,
        'name' | 'role' | 'isActive' | 'passwordHash' | 'mustChangePassword' | 'lastLoginAt'
      >
    >,
  ): Promise<User>;
}
