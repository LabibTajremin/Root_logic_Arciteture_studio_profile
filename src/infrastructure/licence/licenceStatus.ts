import { getConfig } from '@config/app.config';
import { LicenceVerifier, type LicenceMode } from '@/infrastructure/licence/LicenceVerifier';

/**
 * Resolves the current licence status from config. Cached per process — the licence
 * doesn't change at runtime. When read-only, admin mutations are refused but the public
 * site keeps serving.
 */
let cached: ReturnType<LicenceVerifier['verify']> | null = null;

export function getLicenceStatus() {
  if (cached) return cached;
  const config = getConfig();
  const verifier = new LicenceVerifier(
    config.licence.mode as LicenceMode,
    config.raw.LICENCE_PUBLIC_KEY ?? null,
  );
  cached = verifier.verify(config.raw.LICENCE_KEY ?? null);
  return cached;
}

/** True when admin writes should be blocked. */
export function isReadOnly(): boolean {
  return getLicenceStatus().readOnly;
}
