import { describe, expect, it } from 'vitest';
import { RolePolicy } from '@/domain/services/RolePolicy';

describe('RolePolicy', () => {
  it('lets both roles view the admin area', () => {
    expect(RolePolicy.canViewAdmin('admin')).toBe(true);
    expect(RolePolicy.canViewAdmin('editor')).toBe(true);
  });

  it('restricts user management to admins', () => {
    expect(RolePolicy.canManageUsers('admin')).toBe(true);
    expect(RolePolicy.canManageUsers('editor')).toBe(false);
  });

  it('restricts approvals to admins', () => {
    expect(RolePolicy.canApproveSubmissions('admin')).toBe(true);
    expect(RolePolicy.canApproveSubmissions('editor')).toBe(false);
  });

  it('restricts the verification toggle to admins', () => {
    expect(RolePolicy.canToggleVerification('admin')).toBe(true);
    expect(RolePolicy.canToggleVerification('editor')).toBe(false);
  });

  it('restricts settings management to admins', () => {
    expect(RolePolicy.canManageSettings('admin')).toBe(true);
    expect(RolePolicy.canManageSettings('editor')).toBe(false);
  });

  it('restricts archiving to admins', () => {
    expect(RolePolicy.canArchiveContent('admin')).toBe(true);
    expect(RolePolicy.canArchiveContent('editor')).toBe(false);
  });

  it('lets both roles create content', () => {
    expect(RolePolicy.canCreateContent('admin')).toBe(true);
    expect(RolePolicy.canCreateContent('editor')).toBe(true);
  });

  describe('canPublishDirectly', () => {
    it('always lets admins publish, regardless of verification', () => {
      expect(RolePolicy.canPublishDirectly('admin', true)).toBe(true);
      expect(RolePolicy.canPublishDirectly('admin', false)).toBe(true);
    });

    it('lets editors publish only when verification is off', () => {
      expect(RolePolicy.canPublishDirectly('editor', false)).toBe(true);
      expect(RolePolicy.canPublishDirectly('editor', true)).toBe(false);
    });
  });
});
