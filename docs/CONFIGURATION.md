# Configuration

All configuration comes from environment variables, parsed and validated by Zod in
[`config/app.config.ts`](../config/app.config.ts). Invalid config **throws at boot** with a readable message
listing exactly which keys are wrong. Copy [`.env.example`](../.env.example) to `.env` and fill it in.

> This document is the operator-facing reference. The full, authoritative key list with inline legends lives in
> `.env.example` — kept in sync with the parser. The table below is expanded as each driver is implemented.

## Numeric driver codes

### `STORAGE_DRIVER` — file storage

| Code | Driver            | Notes                                                      |
| ---- | ----------------- | ---------------------------------------------------------- |
| 1    | Amazon S3         | Also any S3-compatible: MinIO, Wasabi, Backblaze B2        |
| 2    | Google Drive      | Service account; good for archival, weak for streaming     |
| 3    | Local filesystem  | Self-hosted VPS with a persistent disk; **not** for Vercel |
| 4    | Cloudflare R2     | S3 API, zero egress — best value for image-heavy sites     |
| 5    | Supabase Storage  | Easiest if the DB is already Supabase                      |
| 6    | Bunny.net Storage | Cheap CDN-attached object storage                          |

### `VIDEO_DRIVER` — video delivery

| Code | Driver                                                            |
| ---- | ----------------------------------------------------------------- |
| 0    | Same as `STORAGE_DRIVER` (serve the raw file)                     |
| 1    | Bunny Stream (HLS + CDN, ~$5/mo — **recommended** for production) |
| 2    | Cloudflare Stream                                                 |
| 3    | Mux                                                               |
| 4    | External embed only (YouTube / Vimeo URLs pasted in admin)        |

### `DEPLOYMENT_MODE`

| Code | Meaning                                                |
| ---- | ------------------------------------------------------ |
| 1    | Single-tenant (self-hosted licence build)              |
| 2    | Multi-tenant SaaS (host/subdomain resolves the tenant) |

### `LICENCE_MODE`

| Code | Meaning                                                                   |
| ---- | ------------------------------------------------------------------------- |
| 1    | None (our own instance)                                                   |
| 2    | One-time perpetual key (Ed25519-signed, verified offline)                 |
| 3    | Subscription (periodic phone-home, 14-day offline grace before read-only) |

### `CACHE_DRIVER`

| Code | Meaning                                                      |
| ---- | ------------------------------------------------------------ |
| 1    | In-memory LRU (default; fine for single-instance self-host)  |
| 2    | Redis / Upstash (required if running more than one instance) |

### `MAIL_DRIVER`

| Code | Meaning                                                          |
| ---- | ---------------------------------------------------------------- |
| 0    | Disabled (invite links shown in admin UI, no contact-form email) |
| 1    | SMTP                                                             |
| 2    | Resend                                                           |

## Admin bootstrap

```
ADMIN_EMAIL=owner@example.com
ADMIN_PASSWORD=change-this-on-first-login   # hashed with argon2id at seed time, never stored plain
ADMIN_NAME=Studio Owner
```

On boot, if no admin user exists one is created from these. If `ADMIN_PASSWORD` is still the default sentinel,
the admin is forced to change it on first login and a persistent banner shows until they do.
