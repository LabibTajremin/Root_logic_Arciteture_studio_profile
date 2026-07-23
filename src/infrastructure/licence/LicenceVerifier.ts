import { createHash, createPublicKey, verify as edVerify } from 'node:crypto';

/**
 * Offline-tolerant licence verification (§12). A licence is a base64 JSON payload plus
 * an Ed25519 signature, issued by us and verified against a public key baked into the
 * deployment. Verification never phones home for perpetual keys; subscription keys get
 * a 14-day offline grace before the app drops to read-only.
 */

export interface LicencePayload {
  plan: string;
  /** ISO date. */
  issuedAt: string;
  /** ISO date or null for perpetual. */
  expiresAt: string | null;
  /** Deployment identifier (domain/customer) this key is bound to. */
  subject: string;
}

export type LicenceMode = 'none' | 'perpetual' | 'subscription';

export interface LicenceStatus {
  valid: boolean;
  /** When true, the admin panel is read-only; the public site still serves. */
  readOnly: boolean;
  plan: string | null;
  reason: string;
}

const GRACE_MS = 14 * 24 * 60 * 60 * 1000;

/** Decode "base64(payloadJson).base64(signature)" into its parts. */
function decodeKey(
  key: string,
): { payload: LicencePayload; raw: Buffer; signature: Buffer } | null {
  const [payloadB64, sigB64] = key.trim().split('.');
  if (!payloadB64 || !sigB64) return null;
  try {
    const raw = Buffer.from(payloadB64, 'base64');
    const payload = JSON.parse(raw.toString('utf8')) as LicencePayload;
    const signature = Buffer.from(sigB64, 'base64');
    return { payload, raw, signature };
  } catch {
    return null;
  }
}

export function fingerprint(key: string): string {
  return createHash('sha256').update(key).digest('hex').slice(0, 32);
}

export class LicenceVerifier {
  constructor(
    private readonly mode: LicenceMode,
    private readonly publicKeyBase64: string | null,
    private readonly now: () => Date = () => new Date(),
  ) {}

  /**
   * @param lastCheckedAt last successful phone-home (subscription mode only).
   */
  verify(licenceKey: string | null | undefined, lastCheckedAt?: Date | null): LicenceStatus {
    if (this.mode === 'none') {
      return { valid: true, readOnly: false, plan: 'owner', reason: 'Licensing disabled' };
    }
    if (!licenceKey) {
      return { valid: false, readOnly: true, plan: null, reason: 'No licence key configured' };
    }
    if (!this.publicKeyBase64) {
      return {
        valid: false,
        readOnly: true,
        plan: null,
        reason: 'No licence public key configured',
      };
    }

    const decoded = decodeKey(licenceKey);
    if (!decoded) {
      return { valid: false, readOnly: true, plan: null, reason: 'Malformed licence key' };
    }

    let signatureOk = false;
    try {
      const publicKey = createPublicKey({
        key: Buffer.from(this.publicKeyBase64, 'base64'),
        format: 'der',
        type: 'spki',
      });
      signatureOk = edVerify(null, decoded.raw, publicKey, decoded.signature);
    } catch {
      signatureOk = false;
    }
    if (!signatureOk) {
      return { valid: false, readOnly: true, plan: null, reason: 'Invalid licence signature' };
    }

    const { payload } = decoded;
    const now = this.now().getTime();

    if (this.mode === 'perpetual') {
      if (payload.expiresAt && new Date(payload.expiresAt).getTime() < now) {
        // Expired perpetual key: admin goes read-only, public site still serves.
        return { valid: false, readOnly: true, plan: payload.plan, reason: 'Licence expired' };
      }
      return {
        valid: true,
        readOnly: false,
        plan: payload.plan,
        reason: 'Valid perpetual licence',
      };
    }

    // Subscription: honour a 14-day offline grace since the last successful check.
    const checked = lastCheckedAt?.getTime() ?? new Date(payload.issuedAt).getTime();
    if (now - checked > GRACE_MS) {
      return {
        valid: false,
        readOnly: true,
        plan: payload.plan,
        reason: 'Subscription offline grace expired',
      };
    }
    return { valid: true, readOnly: false, plan: payload.plan, reason: 'Valid subscription' };
  }
}
