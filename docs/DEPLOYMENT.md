# Deployment

Two supported targets. Both need a **Node runtime** — shared cPanel/PHP hosting cannot run this app (DEC-1).

## Vercel (recommended for SaaS and client-owned single-tenant)

1. Import the repo into Vercel.
2. Add environment variables from `.env.example` (Project → Settings → Environment Variables).
3. Provision Postgres (Neon free tier works well; Neon branches per PR give client preview links).
4. Run migrations once against the production DB: `DATABASE_URL=... pnpm db:migrate` (and `db:seed` for a fresh
   instance).
5. Point the client domain at the Vercel project (Settings → Domains) and set `DEPLOYMENT_MODE` accordingly.

> `STORAGE_DRIVER=3` (local filesystem) does **not** work on Vercel — use S3/R2/Supabase/Bunny instead.

## Docker / VPS (recommended for self-hosted licences)

```bash
cp .env.example .env      # fill in values; set DATABASE_URL to the compose Postgres
docker compose up -d      # starts Postgres + the app (multi-stage standalone build)
docker compose exec app node -e "require('child_process')"  # container is up
```

The provided [`Dockerfile`](../Dockerfile) is a multi-stage build emitting Next.js `standalone` output;
[`docker-compose.yml`](../docker-compose.yml) wires the app to a Postgres 16 container with a health check.

A ~$5/mo VPS (Hetzner / DigitalOcean) is enough for a single studio. Put the client's domain in front via a
reverse proxy (Caddy/Traefik/Nginx) terminating TLS, or expose the container behind their existing proxy.

## Pointing a client domain

- **Vercel:** add the domain in project settings and follow the DNS instructions (A/CNAME).
- **VPS:** point an A record at the server IP; terminate TLS at your reverse proxy and forward to the app on
  port 3000.

## Backup & restore

- **Database:** `pg_dump` on a schedule; restore with `psql`/`pg_restore`. On Neon, use branch/point-in-time
  restore.
- **Uploaded media:** whatever the storage driver holds. For `STORAGE_DRIVER=3` (local) back up the `uploads/`
  volume; for object stores, rely on the provider's versioning/lifecycle rules.

## Licensing (self-hosted builds)

For `LICENCE_MODE=2` (perpetual) or `3` (subscription), issue a key with:

```bash
pnpm tsx scripts/generate-licence.ts client-domain.com pro 2027-01-01
```

It prints `LICENCE_PUBLIC_KEY` (ship it in the deployment env) and `LICENCE_KEY` (the client's key), plus a
private key to keep secret for signing future keys. Verification is offline-tolerant: perpetual keys never
phone home; subscription keys get a 14-day offline grace. When a key is expired or invalid the **admin panel
becomes read-only** (a red banner explains why) while the **public site keeps serving** — content is never
taken down by a lapsed licence.

## Changing admin credentials

Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` before first seed, or change the password from the admin panel after
login. See [`docs/CLIENT_HANDOVER.md`](./CLIENT_HANDOVER.md).

> _Expanded with concrete commands and screenshots during Phase 12–13._
