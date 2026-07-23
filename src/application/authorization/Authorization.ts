import { type Result, err, ok } from '@/domain/shared/Result';
import { ForbiddenError } from '@/domain/errors/DomainError';
import { RolePolicy } from '@/domain/services/RolePolicy';
import type { ActorContext } from '@/domain/entities/User';

/**
 * Authorisation guards used by use cases. Authorisation lives in the application layer,
 * never only in the UI — every guard returns a Result so callers must handle denial.
 */
export const Authorization = {
  ensureCanManageUsers(actor: ActorContext): Result<void, ForbiddenError> {
    return RolePolicy.canManageUsers(actor.role)
      ? ok(undefined)
      : err(new ForbiddenError('Only admins can manage users'));
  },

  ensureCanApprove(actor: ActorContext): Result<void, ForbiddenError> {
    return RolePolicy.canApproveSubmissions(actor.role)
      ? ok(undefined)
      : err(new ForbiddenError('Only admins can approve submissions'));
  },

  ensureCanManageSettings(actor: ActorContext): Result<void, ForbiddenError> {
    return RolePolicy.canManageSettings(actor.role)
      ? ok(undefined)
      : err(new ForbiddenError('Only admins can change settings'));
  },

  ensureCanPublishDirectly(
    actor: ActorContext,
    verificationRequired: boolean,
  ): Result<void, ForbiddenError> {
    return RolePolicy.canPublishDirectly(actor.role, verificationRequired)
      ? ok(undefined)
      : err(new ForbiddenError('Editors cannot publish directly while verification is required'));
  },

  ensureSameTenant(actor: ActorContext, tenantId: string): Result<void, ForbiddenError> {
    return actor.tenantId === tenantId
      ? ok(undefined)
      : err(new ForbiddenError('Cross-tenant access is not permitted'));
  },
} as const;
