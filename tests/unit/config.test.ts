import { describe, expect, it } from 'vitest';
import { loadConfig } from '@config/app.config';

function baseEnv(
  overrides: Record<string, string | undefined> = {},
): Record<string, string | undefined> {
  return {
    DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
    AUTH_SECRET: 'a-sufficiently-long-secret-value',
    ADMIN_EMAIL: 'owner@example.com',
    ADMIN_PASSWORD: 'super-secret-pw',
    ADMIN_NAME: 'Studio Owner',
    STORAGE_DRIVER: '3',
    LOCAL_STORAGE_DIR: './uploads',
    ...overrides,
  };
}

describe('loadConfig — valid input', () => {
  it('parses a minimal valid environment and applies defaults', () => {
    const cfg = loadConfig(baseEnv());
    expect(cfg.env).toBe('development');
    expect(cfg.databaseUrl).toBe('postgres://user:pass@localhost:5432/db');
    expect(cfg.appUrl).toBe('http://localhost:3000');
    expect(cfg.storage).toEqual({ driver: 'local', code: 3 });
    expect(cfg.video).toEqual({ driver: 'same-as-storage', code: 0 });
    expect(cfg.deployment).toEqual({ mode: 'single-tenant', code: 1 });
    expect(cfg.licence).toEqual({ mode: 'none', code: 1 });
    expect(cfg.cache).toEqual({ driver: 'memory', code: 1 });
    expect(cfg.mail).toEqual({ driver: 'disabled', code: 0 });
  });

  it('maps every numeric storage code to its driver name', () => {
    const expected: Record<string, string> = {
      '1': 's3',
      '2': 'google-drive',
      '3': 'local',
      '4': 'r2',
      '5': 'supabase',
      '6': 'bunny-storage',
    };
    for (const [code, driver] of Object.entries(expected)) {
      const cfg = loadConfig(validEnvForStorage(code));
      expect(cfg.storage.driver).toBe(driver);
      expect(cfg.storage.code).toBe(Number(code));
    }
  });

  it('flags the default admin password so first-login change can be enforced', () => {
    const cfg = loadConfig(baseEnv({ ADMIN_PASSWORD: 'change-this-on-first-login' }));
    expect(cfg.admin.usingDefaultPassword).toBe(true);
  });

  it('does not flag a changed admin password', () => {
    const cfg = loadConfig(baseEnv({ ADMIN_PASSWORD: 'my-own-strong-pw' }));
    expect(cfg.admin.usingDefaultPassword).toBe(false);
  });

  it('returns a frozen config object', () => {
    const cfg = loadConfig(baseEnv());
    expect(Object.isFrozen(cfg)).toBe(true);
    expect(Object.isFrozen(cfg.storage)).toBe(true);
  });
});

describe('loadConfig — invalid input throws readable messages', () => {
  it('rejects a non-postgres DATABASE_URL', () => {
    expect(() => loadConfig(baseEnv({ DATABASE_URL: 'mysql://x' }))).toThrow(
      /DATABASE_URL must be a postgres:\/\/ connection string/,
    );
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => loadConfig(baseEnv({ DATABASE_URL: undefined }))).toThrow(/DATABASE_URL/);
  });

  it('rejects a short AUTH_SECRET', () => {
    expect(() => loadConfig(baseEnv({ AUTH_SECRET: 'short' }))).toThrow(
      /AUTH_SECRET must be at least 16 characters/,
    );
  });

  it('rejects an invalid admin email', () => {
    expect(() => loadConfig(baseEnv({ ADMIN_EMAIL: 'not-an-email' }))).toThrow(
      /ADMIN_EMAIL must be a valid email address/,
    );
  });

  it('rejects an out-of-range storage driver code', () => {
    expect(() => loadConfig(baseEnv({ STORAGE_DRIVER: '9' }))).toThrow(
      /STORAGE_DRIVER must be one of \[1, 2, 3, 4, 5, 6\]/,
    );
  });

  it('requires LOCAL_STORAGE_DIR when the local driver is selected', () => {
    expect(() =>
      loadConfig(baseEnv({ STORAGE_DRIVER: '3', LOCAL_STORAGE_DIR: undefined })),
    ).toThrow(/LOCAL_STORAGE_DIR is required when STORAGE_DRIVER selects "local"/);
  });

  it('requires S3 credentials when the S3 driver is selected', () => {
    expect(() => loadConfig(baseEnv({ STORAGE_DRIVER: '1' }))).toThrow(
      /S3_BUCKET is required when STORAGE_DRIVER selects "s3"/,
    );
  });

  it('requires REDIS_URL when the redis cache driver is selected', () => {
    expect(() => loadConfig(baseEnv({ CACHE_DRIVER: '2' }))).toThrow(
      /REDIS_URL is required when CACHE_DRIVER selects "redis"/,
    );
  });

  it('requires a licence public key in perpetual licence mode', () => {
    expect(() => loadConfig(baseEnv({ LICENCE_MODE: '2' }))).toThrow(
      /LICENCE_PUBLIC_KEY is required when LICENCE_MODE selects "perpetual"/,
    );
  });

  it('aggregates multiple errors into one message', () => {
    let message = '';
    try {
      loadConfig(baseEnv({ DATABASE_URL: 'mysql://x', ADMIN_EMAIL: 'bad' }));
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toContain('DATABASE_URL');
    expect(message).toContain('ADMIN_EMAIL');
    expect(message).toContain('Check your .env against .env.example');
  });
});

function validEnvForStorage(code: string): Record<string, string | undefined> {
  const creds: Record<string, Record<string, string>> = {
    '1': {
      S3_BUCKET: 'b',
      S3_REGION: 'us-east-1',
      S3_ACCESS_KEY_ID: 'k',
      S3_SECRET_ACCESS_KEY: 's',
    },
    '2': { GOOGLE_DRIVE_FOLDER_ID: 'f', GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: 'e30=' },
    '3': { LOCAL_STORAGE_DIR: './uploads' },
    '4': {
      R2_BUCKET: 'b',
      R2_ACCOUNT_ID: 'a',
      R2_ACCESS_KEY_ID: 'k',
      R2_SECRET_ACCESS_KEY: 's',
    },
    '5': {
      SUPABASE_URL: 'https://x.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'k',
      SUPABASE_STORAGE_BUCKET: 'media',
    },
    '6': { BUNNY_STORAGE_ZONE: 'z', BUNNY_STORAGE_API_KEY: 'k', BUNNY_STORAGE_HOSTNAME: 'h' },
  };
  return {
    DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
    AUTH_SECRET: 'a-sufficiently-long-secret-value',
    ADMIN_EMAIL: 'owner@example.com',
    ADMIN_PASSWORD: 'super-secret-pw',
    STORAGE_DRIVER: code,
    ...creds[code],
  };
}
