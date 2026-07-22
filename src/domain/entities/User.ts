import type { Role } from '@/domain/entities/enums';

export interface User {
  readonly id: string;
  readonly tenantId: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: Role;
  readonly name: string;
  readonly isActive: boolean;
  readonly mustChangePassword: boolean;
  readonly lastLoginAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** The authenticated caller passed to every use case; authorisation is checked here. */
export interface ActorContext {
  readonly userId: string;
  readonly tenantId: string;
  readonly role: Role;
}
