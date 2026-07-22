import { z } from 'zod';

/**
 * THE config file. Parses `process.env` through Zod, exposes a frozen typed object,
 * and throws at boot with a readable message if invalid.
 *
 * Every numeric-coded option keeps its legend beside its schema so the meaning of a
 * value like STORAGE_DRIVER=4 is discoverable without leaving this file.
 */

// ─────────────────────────────────────────────────────────────────────────────
// FILE STORAGE DRIVER — set STORAGE_DRIVER in .env
//   1 = Amazon S3            (also any S3-compatible: MinIO, Wasabi, Backblaze B2)
//   2 = Google Drive         (service account; good for archival, weak for streaming)
//   3 = Local filesystem     (self-hosted VPS with a persistent disk; NOT for Vercel)
//   4 = Cloudflare R2        (S3 API, zero egress fees — best value for image-heavy sites)
//   5 = Supabase Storage     (easiest if the DB is already Supabase)
//   6 = Bunny.net Storage    (cheap CDN-attached object storage)
// ─────────────────────────────────────────────────────────────────────────────
export const STORAGE_DRIVERS = {
  1: 's3',
  2: 'google-drive',
  3: 'local',
  4: 'r2',
  5: 'supabase',
  6: 'bunny-storage',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO DELIVERY DRIVER — set VIDEO_DRIVER in .env
//   0 = Same as STORAGE_DRIVER (serve the raw file)
//   1 = Bunny Stream         (HLS + CDN, ~$5/mo — RECOMMENDED for production)
//   2 = Cloudflare Stream
//   3 = Mux
//   4 = External embed only  (YouTube / Vimeo URLs pasted in the admin panel)
// ─────────────────────────────────────────────────────────────────────────────
export const VIDEO_DRIVERS = {
  0: 'same-as-storage',
  1: 'bunny-stream',
  2: 'cloudflare-stream',
  3: 'mux',
  4: 'external-embed',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DEPLOYMENT MODE — set DEPLOYMENT_MODE in .env
//   1 = Single-tenant (self-hosted licence build — one studio, no tenant filtering)
//   2 = Multi-tenant SaaS (host/subdomain resolves the tenant)
// ─────────────────────────────────────────────────────────────────────────────
export const DEPLOYMENT_MODES = {
  1: 'single-tenant',
  2: 'multi-tenant',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// LICENCE MODE — set LICENCE_MODE in .env
//   1 = None (our own instance)
//   2 = One-time perpetual key (Ed25519-signed, verified offline)
//   3 = Subscription (periodic phone-home, 14-day offline grace before read-only)
// ─────────────────────────────────────────────────────────────────────────────
export const LICENCE_MODES = {
  1: 'none',
  2: 'perpetual',
  3: 'subscription',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CACHE DRIVER — set CACHE_DRIVER in .env
//   1 = In-memory LRU (default; fine for single-instance self-host)
//   2 = Redis / Upstash (required if running more than one instance)
// ─────────────────────────────────────────────────────────────────────────────
export const CACHE_DRIVERS = {
  1: 'memory',
  2: 'redis',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// MAIL DRIVER — set MAIL_DRIVER in .env
//   0 = Disabled (no contact-form email, no invites — invite links shown in admin UI)
//   1 = SMTP
//   2 = Resend
// ─────────────────────────────────────────────────────────────────────────────
export const MAIL_DRIVERS = {
  0: 'disabled',
  1: 'smtp',
  2: 'resend',
} as const;

export type StorageDriver = (typeof STORAGE_DRIVERS)[keyof typeof STORAGE_DRIVERS];
export type VideoDriver = (typeof VIDEO_DRIVERS)[keyof typeof VIDEO_DRIVERS];
export type DeploymentMode = (typeof DEPLOYMENT_MODES)[keyof typeof DEPLOYMENT_MODES];
export type LicenceMode = (typeof LICENCE_MODES)[keyof typeof LICENCE_MODES];
export type CacheDriver = (typeof CACHE_DRIVERS)[keyof typeof CACHE_DRIVERS];
export type MailDriver = (typeof MAIL_DRIVERS)[keyof typeof MAIL_DRIVERS];

/**
 * Build a Zod schema for a numeric-coded option that reports a readable message
 * naming the env var and the codes it accepts.
 */
function numericCode<const M extends Record<number, string>>(varName: string, mapping: M) {
  const codes = Object.keys(mapping).map(Number);
  return z
    .string({ required_error: `${varName} is required` })
    .trim()
    .refine((raw) => codes.includes(Number(raw)), {
      message: `${varName} must be one of [${codes.join(', ')}]`,
    })
    .transform((raw) => mapping[Number(raw) as keyof M] as M[keyof M]);
}

const DEFAULT_ADMIN_PASSWORD = 'change-this-on-first-login';

const rawSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z
    .string({ required_error: 'DATABASE_URL is required' })
    .min(1, 'DATABASE_URL is required')
    .refine((v) => v.startsWith('postgres://') || v.startsWith('postgresql://'), {
      message: 'DATABASE_URL must be a postgres:// connection string',
    }),
  APP_URL: z.string().url('APP_URL must be a valid URL').default('http://localhost:3000'),
  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET must be at least 16 characters'),

  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email address'),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD must be at least 8 characters'),
  ADMIN_NAME: z.string().min(1, 'ADMIN_NAME is required').default('Studio Owner'),

  STORAGE_DRIVER: numericCode('STORAGE_DRIVER', STORAGE_DRIVERS),
  VIDEO_DRIVER: numericCode('VIDEO_DRIVER', VIDEO_DRIVERS).default('0'),
  DEPLOYMENT_MODE: numericCode('DEPLOYMENT_MODE', DEPLOYMENT_MODES).default('1'),
  LICENCE_MODE: numericCode('LICENCE_MODE', LICENCE_MODES).default('1'),
  CACHE_DRIVER: numericCode('CACHE_DRIVER', CACHE_DRIVERS).default('1'),
  MAIL_DRIVER: numericCode('MAIL_DRIVER', MAIL_DRIVERS).default('0'),

  // Driver-specific credentials — validated conditionally in superRefine below.
  LOCAL_STORAGE_DIR: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().optional(),
  GOOGLE_DRIVE_FOLDER_ID: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: z.string().optional(),
  BUNNY_STORAGE_ZONE: z.string().optional(),
  BUNNY_STORAGE_API_KEY: z.string().optional(),
  BUNNY_STORAGE_HOSTNAME: z.string().optional(),

  REDIS_URL: z.string().optional(),
  LICENCE_PUBLIC_KEY: z.string().optional(),
  LICENCE_KEY: z.string().optional(),
});

/** Assert that the credentials required by the selected driver are present. */
function requireKeys(
  ctx: z.RefinementCtx,
  driverVar: string,
  driverName: string,
  data: z.infer<typeof rawSchema>,
  keys: (keyof z.infer<typeof rawSchema>)[],
) {
  for (const key of keys) {
    if (!data[key]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [key],
        message: `${String(key)} is required when ${driverVar} selects "${driverName}"`,
      });
    }
  }
}

const schema = rawSchema.superRefine((data, ctx) => {
  switch (data.STORAGE_DRIVER) {
    case 'local':
      requireKeys(ctx, 'STORAGE_DRIVER', 'local', data, ['LOCAL_STORAGE_DIR']);
      break;
    case 's3':
      requireKeys(ctx, 'STORAGE_DRIVER', 's3', data, [
        'S3_BUCKET',
        'S3_REGION',
        'S3_ACCESS_KEY_ID',
        'S3_SECRET_ACCESS_KEY',
      ]);
      break;
    case 'r2':
      requireKeys(ctx, 'STORAGE_DRIVER', 'r2', data, [
        'R2_BUCKET',
        'R2_ACCOUNT_ID',
        'R2_ACCESS_KEY_ID',
        'R2_SECRET_ACCESS_KEY',
      ]);
      break;
    case 'supabase':
      requireKeys(ctx, 'STORAGE_DRIVER', 'supabase', data, [
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'SUPABASE_STORAGE_BUCKET',
      ]);
      break;
    case 'google-drive':
      requireKeys(ctx, 'STORAGE_DRIVER', 'google-drive', data, [
        'GOOGLE_DRIVE_FOLDER_ID',
        'GOOGLE_SERVICE_ACCOUNT_JSON_BASE64',
      ]);
      break;
    case 'bunny-storage':
      requireKeys(ctx, 'STORAGE_DRIVER', 'bunny-storage', data, [
        'BUNNY_STORAGE_ZONE',
        'BUNNY_STORAGE_API_KEY',
        'BUNNY_STORAGE_HOSTNAME',
      ]);
      break;
  }

  if (data.CACHE_DRIVER === 'redis') {
    requireKeys(ctx, 'CACHE_DRIVER', 'redis', data, ['REDIS_URL']);
  }

  if (data.LICENCE_MODE === 'perpetual' || data.LICENCE_MODE === 'subscription') {
    requireKeys(ctx, 'LICENCE_MODE', data.LICENCE_MODE, data, ['LICENCE_PUBLIC_KEY']);
  }
});

type ParsedEnv = z.infer<typeof schema>;

export interface AppConfig {
  readonly env: ParsedEnv['NODE_ENV'];
  readonly isProduction: boolean;
  readonly databaseUrl: string;
  readonly appUrl: string;
  readonly authSecret: string;
  readonly admin: {
    readonly email: string;
    readonly password: string;
    readonly name: string;
    /** True while ADMIN_PASSWORD is still the shipped sentinel; forces a change on first login. */
    readonly usingDefaultPassword: boolean;
  };
  readonly storage: { readonly driver: StorageDriver; readonly code: number };
  readonly video: { readonly driver: VideoDriver; readonly code: number };
  readonly deployment: { readonly mode: DeploymentMode; readonly code: number };
  readonly licence: { readonly mode: LicenceMode; readonly code: number };
  readonly cache: { readonly driver: CacheDriver; readonly code: number };
  readonly mail: { readonly driver: MailDriver; readonly code: number };
  readonly raw: ParsedEnv;
}

function codeOf<M extends Record<number, string>>(mapping: M, value: string): number {
  return Number(Object.keys(mapping).find((k) => mapping[Number(k) as keyof M] === value));
}

function formatIssues(error: z.ZodError): string {
  const lines = error.issues.map((issue) => {
    const path = issue.path.join('.') || '(root)';
    return `  • ${path}: ${issue.message}`;
  });
  return `Invalid application configuration:\n${lines.join('\n')}\n\nCheck your .env against .env.example.`;
}

/**
 * Pure parser — takes an env record and returns a typed, frozen config or throws a
 * readable error. Kept side-effect free so it is trivial to unit-test.
 */
export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const result = schema.safeParse(env);
  if (!result.success) {
    throw new Error(formatIssues(result.error));
  }
  const data = result.data;

  return Object.freeze({
    env: data.NODE_ENV,
    isProduction: data.NODE_ENV === 'production',
    databaseUrl: data.DATABASE_URL,
    appUrl: data.APP_URL,
    authSecret: data.AUTH_SECRET,
    admin: Object.freeze({
      email: data.ADMIN_EMAIL,
      password: data.ADMIN_PASSWORD,
      name: data.ADMIN_NAME,
      usingDefaultPassword: data.ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD,
    }),
    storage: Object.freeze({
      driver: data.STORAGE_DRIVER,
      code: codeOf(STORAGE_DRIVERS, data.STORAGE_DRIVER),
    }),
    video: Object.freeze({
      driver: data.VIDEO_DRIVER,
      code: codeOf(VIDEO_DRIVERS, data.VIDEO_DRIVER),
    }),
    deployment: Object.freeze({
      mode: data.DEPLOYMENT_MODE,
      code: codeOf(DEPLOYMENT_MODES, data.DEPLOYMENT_MODE),
    }),
    licence: Object.freeze({
      mode: data.LICENCE_MODE,
      code: codeOf(LICENCE_MODES, data.LICENCE_MODE),
    }),
    cache: Object.freeze({
      driver: data.CACHE_DRIVER,
      code: codeOf(CACHE_DRIVERS, data.CACHE_DRIVER),
    }),
    mail: Object.freeze({
      driver: data.MAIL_DRIVER,
      code: codeOf(MAIL_DRIVERS, data.MAIL_DRIVER),
    }),
    raw: data,
  });
}

let cached: AppConfig | null = null;

/**
 * Lazily loads and memoises the config from `process.env`. First call is the boot
 * gate: it throws if the environment is invalid. `SKIP_ENV_VALIDATION=1` is honoured
 * for `next build`, which must not require live secrets.
 */
export function getConfig(): AppConfig {
  if (cached) return cached;
  if (process.env.SKIP_ENV_VALIDATION === '1') {
    cached = loadConfig({
      DATABASE_URL: 'postgres://build:build@localhost:5432/build',
      AUTH_SECRET: 'build-time-placeholder-secret',
      ADMIN_EMAIL: 'build@example.com',
      ADMIN_PASSWORD: DEFAULT_ADMIN_PASSWORD,
      STORAGE_DRIVER: '3',
      LOCAL_STORAGE_DIR: './uploads',
      NODE_ENV: 'production',
    });
    return cached;
  }
  cached = loadConfig(process.env);
  return cached;
}

/** Test-only: reset the memoised config. */
export function resetConfigCache(): void {
  cached = null;
}
