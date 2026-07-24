# Maapkathi

**Live demo:** [maapkathi.vercel.app](https://maapkathi.vercel.app)

A **white-label portfolio & showcase platform for interior / architectural design studios.**

One codebase, two distribution modes:

| Mode                               | Description                                                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **SaaS**                           | We host it. Multiple studios, each on a subdomain or custom domain, billed monthly/yearly.                                   |
| **Self-hosted (one-time licence)** | A single-tenant copy deployed onto the client's own hosting/domain, edited by them. Licence key verified offline-tolerantly. |

The public site showcases **projects** (photos + video + copy) and **team members**. Everything on the
public site is editable from an **admin panel** — content, branding, theme, motion, SEO, contact details,
navigation.

> **Status:** Built phase by phase against [`BUILD_INSTRUCTIONS.md`](./BUILD_INSTRUCTIONS.md). Each phase has a
> verification gate and is committed separately. See [`docs/`](./docs) for architecture, deployment, theming,
> testing, and the non-technical client handover guide.

## What's implemented

| Area                                                                                                       | Status        |
| ---------------------------------------------------------------------------------------------------------- | ------------- |
| Clean-architecture foundation (domain / application / infrastructure / presentation) + enforced layer rule | ✅            |
| Typed config with numeric driver codes + boot validation                                                   | ✅            |
| Postgres schema (23 tables, indexed), migrations, idempotent demo seed                                     | ✅            |
| Repositories + Unit of Work + cross-tenant isolation                                                       | ✅            |
| 6 pluggable storage adapters (S3 · R2 · Supabase · Google Drive · Bunny · Local) + contract suite          | ✅            |
| Auth.js v5, RBAC, argon2id, rate limiting                                                                  | ✅            |
| Theme + motion engine (24 accents AA-tuned, 22 patterns, per-area fonts/colours, reduced-motion guardrail) | ✅            |
| Public site (homepage sections, `/work`, project detail, SEO/JSON-LD, sitemap, contact form)               | ✅ core       |
| Admin panel (projects CRUD, media upload, set cover, publish, Appearance, Settings)                        | ✅ core       |
| Verification workflow (approvals queue + audit log)                                                        | ✅            |
| Licensing (Ed25519, offline grace, read-only mode) + multi-tenant host resolution                          | ✅            |
| Remaining public sections, drag-reorder, nav/section builders, live-preview iframe, Lighthouse CI, billing | ◻ follow-ups |

**Tests:** 88 unit + 18 integration + 8 Playwright e2e, all green in CI (see [`docs/TESTING.md`](./docs/TESTING.md)).

## Screenshots

Homepage (desktop + mobile) rendering the demo seed on the cream + crimson default theme:

_Captured during the build; regenerate with the app running via Playwright. Breakpoints reviewed at 390 / 768 / 1280 / 1920._

## Stack

| Layer           | Choice                                              | Why                                                                                          |
| --------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Framework       | Next.js 15 (App Router) + TypeScript (strict)       | One deployable for public site + admin + API; RSC keeps the public site fast and SEO-strong. |
| Styling         | Tailwind CSS v4 + shadcn/ui (Radix)                 | Tokens map to runtime CSS variables — required for admin-controlled theming.                 |
| Motion          | Framer Motion (LazyMotion)                          | Premium feel without jank; respects `prefers-reduced-motion`.                                |
| DB              | PostgreSQL — Neon (SaaS) / any Postgres (self-host) | Free tier, branch-per-PR, standard SQL, no lock-in.                                          |
| ORM             | Drizzle ORM + drizzle-kit                           | SQL-first, explicit indexes, tiny runtime, auditable migrations.                             |
| Auth            | Auth.js v5 (credentials, JWT)                       | No identity-vendor cost; self-host friendly.                                                 |
| Validation      | Zod                                                 | One schema shared by API boundary, forms, and config parsing.                                |
| Images          | sharp → derivatives + blurhash/LQIP                 | Fast mobile LCP, no per-image CDN bill.                                                      |
| Tests           | Vitest (unit/integration) + Playwright (e2e)        | Fast, boring, well-supported.                                                                |
| Package manager | pnpm                                                | Deterministic, disk-cheap.                                                                   |

## Quick start

```bash
pnpm install
cp .env.example .env         # fill in DATABASE_URL, ADMIN_* and driver codes
pnpm db:migrate              # apply SQL migrations
pnpm db:seed                 # demo tenant, admin user, demo projects
pnpm dev                     # http://localhost:3000
```

Need a local Postgres? `docker compose up -d db` starts one on `postgres://mapkathi:mapkathi@localhost:5432/mapkathi`.

## Scripts

| Script                                                  | Purpose                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| `pnpm dev` / `pnpm build` / `pnpm start`                | Next.js dev / production build / serve                       |
| `pnpm lint`                                             | ESLint, including the clean-architecture layer-boundary rule |
| `pnpm typecheck`                                        | `tsc --noEmit` (strict)                                      |
| `pnpm format` / `pnpm format:check`                     | Prettier                                                     |
| `pnpm test` / `pnpm test:coverage`                      | Vitest unit + integration                                    |
| `pnpm test:e2e`                                         | Playwright e2e smoke                                         |
| `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:seed` | Drizzle migrations & seed                                    |

## Configuration

All configuration is parsed from `process.env` through Zod in [`config/app.config.ts`](./config/app.config.ts)
and **fails at boot with a readable message** if invalid. Numeric driver codes select pluggable adapters:

| Env var           | Meaning                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| `STORAGE_DRIVER`  | `1` S3 · `2` Google Drive · `3` Local FS · `4` Cloudflare R2 · `5` Supabase Storage · `6` Bunny.net Storage |
| `VIDEO_DRIVER`    | `0` same as storage · `1` Bunny Stream · `2` Cloudflare Stream · `3` Mux · `4` External embed               |
| `DEPLOYMENT_MODE` | `1` single-tenant (self-host) · `2` multi-tenant SaaS                                                       |
| `LICENCE_MODE`    | `1` none · `2` one-time perpetual (Ed25519) · `3` subscription (phone-home)                                 |
| `CACHE_DRIVER`    | `1` in-memory LRU · `2` Redis / Upstash                                                                     |
| `MAIL_DRIVER`     | `0` disabled · `1` SMTP · `2` Resend                                                                        |

The full env table with every key lives in [`.env.example`](./.env.example) and
[`docs/CONFIGURATION.md`](./docs/CONFIGURATION.md).

### Switching storage drivers / adding an adapter

Set `STORAGE_DRIVER` to the numeric code above. To add a driver: create one adapter file implementing
`StoragePort`, add one `case` to `StorageFactory`, and one comment block to the config legend — nothing else
in the app changes. See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md#storage).

## Deployment

- **Vercel** — connect the repo, set env vars, point the client domain. Guide: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).
- **Docker / VPS** — `docker compose up -d` (app + Postgres). Suitable for self-hosted single-tenant licences.

> **Self-host note (DEC-1):** Next.js needs a Node runtime — shared cPanel/PHP hosting is **out of scope**.
> Self-host targets are a small VPS (Docker) or a client-owned Vercel project.

> **Video note (DEC-2):** Google Drive is supported as _storage_ but is a weak _streaming_ origin. For
> production video use Bunny Stream / Cloudflare Stream (`VIDEO_DRIVER=1|2`).

## Documentation

| Doc                                                    | For whom                                         |
| ------------------------------------------------------ | ------------------------------------------------ |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)       | Engineers — layers, patterns, dependency rule    |
| [`docs/CONFIGURATION.md`](./docs/CONFIGURATION.md)     | Operators — every env var and driver code        |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)           | DevOps — Vercel & Docker/VPS, domains, backups   |
| [`docs/THEMING.md`](./docs/THEMING.md)                 | Designers — accents, patterns, motion, presets   |
| [`docs/CLIENT_HANDOVER.md`](./docs/CLIENT_HANDOVER.md) | Studio owners — non-technical how-to             |
| [`docs/TESTING.md`](./docs/TESTING.md)                 | Contributors — unit/integration/e2e and CI gates |

## Licence

Proprietary. © Maapkathi Studio. All rights reserved.
