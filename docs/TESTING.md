# Testing & CI

Testing is layered to match the architecture, and **every phase ships with its tests green** before it is
committed.

## Test types

| Type            | Tool       | Location             | What it covers                                                                                                                    |
| --------------- | ---------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Unit**        | Vitest     | `tests/unit/`        | Pure domain logic — value objects, policies, the config parser, mappers. No I/O.                                                  |
| **Integration** | Vitest     | `tests/integration/` | Repositories against a real throwaway Postgres, storage adapter contract suites, use cases wired to real infra.                   |
| **E2E**         | Playwright | `tests/e2e/`         | Full flows through the running app: login, RBAC, publish → appears on the public site. Runs on Desktop Chrome + mobile (Pixel 5). |

## Running locally

```bash
pnpm test              # unit tests (Vitest, no DB needed)
pnpm test:integration  # integration tests against a real Postgres (reads DATABASE_URL)
pnpm test:coverage     # unit tests with V8 coverage report (html + lcov)
pnpm test:e2e          # Playwright (needs the app running or uses its webServer)
```

Integration tests need Postgres: start one with `docker compose up -d db` (or any Postgres) and set
`DATABASE_URL`. The integration config loads `.env` automatically and applies migrations in a global setup
before the suite runs. They run serially against one shared database and each test isolates itself with its own
tenant rows, so the cross-tenant isolation checks are deterministic.

## CI (test before merge)

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs on every pull request into `main` and blocks
merge until green:

1. **verify** — `pnpm lint` (incl. the layer-boundary rule) → `pnpm typecheck` → `pnpm format:check` →
   `pnpm test` (unit).
2. **integration** — spins up a Postgres service, runs `pnpm db:migrate`, then `pnpm test:integration`
   (repositories, Unit of Work, cross-tenant isolation). Runs after `verify`.
3. **build** — `pnpm build` (runs only after `verify` passes).

Make CI a required status check on `main` in the repository's branch-protection settings so a red build can
never be merged.

## Coverage expectations

- Domain and application layers: aim for full branch coverage — these are pure and cheap to test.
- Every use case has at least one authorisation-failure test (e.g. an editor cannot call `PublishProject`).
- Every storage adapter passes the same contract suite (`tests/support/storageContract.ts`): the Local adapter
  runs in the unit suite on every push; the S3 adapter runs against MinIO in CI (`RUN_S3_CONTRACT=1`); the
  remote drivers (R2/Supabase/Bunny/Drive) share the same adapter shape and are exercised behind their own
  flags with real credentials.
- Cross-tenant isolation has a dedicated integration test proving a tenant cannot read another's rows.
