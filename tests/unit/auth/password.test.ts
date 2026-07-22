import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '@/infrastructure/auth/password';

describe('password hashing (argon2id)', () => {
  it('verifies a correct password', async () => {
    const digest = await hashPassword('correct horse battery staple');
    expect(digest).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(digest, 'correct horse battery staple')).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const digest = await hashPassword('right');
    expect(await verifyPassword(digest, 'wrong')).toBe(false);
  });

  it('never authenticates against a malformed hash', async () => {
    expect(await verifyPassword('not-a-hash', 'anything')).toBe(false);
  });
});
