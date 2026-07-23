import { generateKeyPairSync, sign as edSign } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { LicenceVerifier, type LicencePayload } from '@/infrastructure/licence/LicenceVerifier';

// Deterministic Ed25519 keypair for the suite.
const { publicKey, privateKey } = generateKeyPairSync('ed25519');
const publicKeyBase64 = publicKey.export({ format: 'der', type: 'spki' }).toString('base64');

function issue(payload: LicencePayload): string {
  const raw = Buffer.from(JSON.stringify(payload), 'utf8');
  const sig = edSign(null, raw, privateKey);
  return `${raw.toString('base64')}.${sig.toString('base64')}`;
}

const at = (iso: string) => () => new Date(iso);

describe('LicenceVerifier — none mode', () => {
  it('is always valid and read-write when licensing is disabled', () => {
    const v = new LicenceVerifier('none', null);
    expect(v.verify(null)).toMatchObject({ valid: true, readOnly: false });
  });
});

describe('LicenceVerifier — perpetual', () => {
  it('accepts a valid, unexpired, correctly signed key', () => {
    const key = issue({
      plan: 'pro',
      issuedAt: '2024-01-01',
      expiresAt: '2999-01-01',
      subject: 'client.com',
    });
    const v = new LicenceVerifier('perpetual', publicKeyBase64, at('2025-06-01'));
    expect(v.verify(key)).toMatchObject({ valid: true, readOnly: false, plan: 'pro' });
  });

  it('goes read-only (not a crash, public site still serves) when the key has expired', () => {
    const key = issue({
      plan: 'pro',
      issuedAt: '2020-01-01',
      expiresAt: '2021-01-01',
      subject: 'client.com',
    });
    const v = new LicenceVerifier('perpetual', publicKeyBase64, at('2025-06-01'));
    const status = v.verify(key);
    expect(status.valid).toBe(false);
    expect(status.readOnly).toBe(true);
    expect(status.reason).toMatch(/expired/i);
  });

  it('rejects a tampered payload (signature no longer matches)', () => {
    const key = issue({
      plan: 'pro',
      issuedAt: '2024-01-01',
      expiresAt: '2999-01-01',
      subject: 'client.com',
    });
    const [payloadB64, sig] = key.split('.');
    const tampered = JSON.parse(Buffer.from(payloadB64!, 'base64').toString());
    tampered.plan = 'enterprise';
    const forged = `${Buffer.from(JSON.stringify(tampered)).toString('base64')}.${sig}`;
    const v = new LicenceVerifier('perpetual', publicKeyBase64, at('2025-06-01'));
    expect(v.verify(forged)).toMatchObject({ valid: false, readOnly: true });
  });

  it('rejects a malformed key', () => {
    const v = new LicenceVerifier('perpetual', publicKeyBase64);
    expect(v.verify('garbage')).toMatchObject({ valid: false, readOnly: true });
  });
});

describe('LicenceVerifier — subscription offline grace', () => {
  const key = () =>
    issue({ plan: 'sub', issuedAt: '2025-01-01', expiresAt: null, subject: 'client.com' });

  it('is valid within the 14-day offline grace', () => {
    const v = new LicenceVerifier('subscription', publicKeyBase64, at('2025-01-10'));
    expect(v.verify(key(), new Date('2025-01-01')).valid).toBe(true);
  });

  it('drops to read-only once the grace has elapsed', () => {
    const v = new LicenceVerifier('subscription', publicKeyBase64, at('2025-02-01'));
    const status = v.verify(key(), new Date('2025-01-01'));
    expect(status).toMatchObject({ valid: false, readOnly: true });
  });
});
