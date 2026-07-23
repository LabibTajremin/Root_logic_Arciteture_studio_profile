import { describe, expect, it } from 'vitest';
import { Authorization } from '@/application/authorization/Authorization';
import type { ActorContext } from '@/domain/entities/User';

const admin: ActorContext = { userId: 'a', tenantId: 't1', role: 'admin' };
const editor: ActorContext = { userId: 'e', tenantId: 't1', role: 'editor' };

describe('Authorization guards', () => {
  it('lets only admins manage users', () => {
    expect(Authorization.ensureCanManageUsers(admin).ok).toBe(true);
    expect(Authorization.ensureCanManageUsers(editor).ok).toBe(false);
  });

  it('lets only admins approve submissions', () => {
    expect(Authorization.ensureCanApprove(admin).ok).toBe(true);
    expect(Authorization.ensureCanApprove(editor).ok).toBe(false);
  });

  describe('ensureCanPublishDirectly', () => {
    it('always allows admins', () => {
      expect(Authorization.ensureCanPublishDirectly(admin, true).ok).toBe(true);
      expect(Authorization.ensureCanPublishDirectly(admin, false).ok).toBe(true);
    });

    it('blocks editors when verification is required', () => {
      const result = Authorization.ensureCanPublishDirectly(editor, true);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe('FORBIDDEN');
    });

    it('allows editors when verification is off', () => {
      expect(Authorization.ensureCanPublishDirectly(editor, false).ok).toBe(true);
    });
  });

  it('blocks cross-tenant access', () => {
    expect(Authorization.ensureSameTenant(admin, 't1').ok).toBe(true);
    expect(Authorization.ensureSameTenant(admin, 't2').ok).toBe(false);
  });
});
