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
pnpm test            # unit + integration (Vitest)
pnpm test:coverage   # with V8 coverage report (html + lcov)
pnpm test:e2e        # Playwright (needs the app running or uses its webServer)
```

Integration tests that need Postgres read `DATABASE_URL`; start one with `docker compose up -d db`.

## CI (test before merge)

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs on every pull request into `main` and blocks
merge until green:

1. **verify** — `pnpm lint` (incl. the layer-boundary rule) → `pnpm typecheck` → `pnpm format:check` →
   `pnpm test`.
2. **build** — `pnpm build` (runs only after `verify` passes).

Make CI a required status check on `main` in the repository's branch-protection settings so a red build can
never be merged.

## Coverage expectations

- Domain and application layers: aim for full branch coverage — these are pure and cheap to test.
- Every use case has at least one authorisation-failure test (e.g. an editor cannot call `PublishProject`).
- Every storage adapter passes the same contract suite.
- Cross-tenant isolation has a dedicated integration test proving a tenant cannot read another's rows.
