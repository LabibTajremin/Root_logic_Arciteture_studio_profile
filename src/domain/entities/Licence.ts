export interface Licence {
  readonly id: string;
  readonly keyFingerprint: string;
  readonly plan: string;
  readonly issuedAt: Date;
  readonly expiresAt: Date | null;
  readonly lastCheckedAt: Date | null;
}
