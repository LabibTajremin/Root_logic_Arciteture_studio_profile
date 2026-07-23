import type { Role } from '@/domain/entities/enums';

/**
 * Central authorisation rules by role. Use cases consult this before acting — the
 * UI must never be the only gate. Pure and exhaustively testable.
 */
export const RolePolicy = {
  canViewAdmin(role: Role): boolean {
    return role === 'admin' || role === 'editor';
  },

  canManageUsers(role: Role): boolean {
    return role === 'admin';
  },

  canApproveSubmissions(role: Role): boolean {
    return role === 'admin';
  },

  canToggleVerification(role: Role): boolean {
    return role === 'admin';
  },

  canManageSettings(role: Role): boolean {
    return role === 'admin';
  },

  canCreateContent(role: Role): boolean {
    return role === 'admin' || role === 'editor';
  },

  canArchiveContent(role: Role): boolean {
    return role === 'admin';
  },

  /**
   * Whether the actor may publish content directly (bypassing review). Admins always
   * can; editors only when verification is switched off.
   */
  canPublishDirectly(role: Role, verificationRequired: boolean): boolean {
    if (role === 'admin') return true;
    return role === 'editor' && !verificationRequired;
  },
} as const;
