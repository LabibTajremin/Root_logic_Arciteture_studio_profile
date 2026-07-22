# Architecture

Maapkathi Studio follows **clean, layered architecture** with a strict dependency rule enforced by ESLint.

## The dependency rule

> Nothing in `domain/` or `application/` may import from `infrastructure/`, `app/`, `presentation/`, or any
> npm framework package.

Dependencies point **inward only**:

```
app / presentation  →  application  →  domain
infrastructure      →  application  →  domain
        (infrastructure implements interfaces defined in domain/application)
```

This is enforced mechanically by `import/no-restricted-paths` in
[`eslint.config.mjs`](../eslint.config.mjs). A violating import fails `pnpm lint` (and therefore CI) — try it
by importing anything from `src/infrastructure` inside `src/domain` and running `pnpm lint`.

## Layers

```
src/
  domain/            Pure TypeScript. No framework, no DB, no fetch, no fs.
    entities/          Project, MediaAsset, Member, User, ThemeSettings, SiteSettings, Tenant, Licence
    value-objects/     Slug, ImageVariantSet, HexColor, PatternId, Opacity
    errors/            DomainError hierarchy — never leaks DB/HTTP concepts
    repositories/      Repository INTERFACES only
    services/          ContentVisibilityPolicy, RolePolicy — pure business rules

  application/       Use cases. Orchestration only — no SQL, no fetch, no fs.
    use-cases/         projects/, media/, members/, users/, settings/
    ports/             StoragePort, ImageProcessorPort, MailerPort, ClockPort, IdGeneratorPort, CachePort
    dto/               Zod schemas for use-case input/output

  infrastructure/    The only layer that knows the outside world.
    db/                Drizzle schema, migrations, repositories, mappers
    storage/           StorageFactory + adapters (S3, R2, Supabase, Google Drive, Bunny, Local)
    image/             SharpImageProcessor
    auth/              Auth.js config, argon2id hashing, session helpers
    licence/           LicenceVerifier (Ed25519, offline grace)
    cache/             In-memory LRU by default; Redis adapter behind the same port
    logging/           pino

  app/               Next.js App Router — thin. Reads request, calls a use case, renders.
  presentation/      UI components, theme registries, hooks
  config/            app.config.ts (the config file), theme.constants.ts
```

## Composition root

`src/infrastructure/container.ts` — a small **manual DI container** (no framework). Use cases receive their
dependencies via the constructor. We do **not** use a service locator, and use cases never import repositories
directly.

## Patterns we actually use

| Pattern               | Where                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Repository**        | All persistence. Interfaces in `domain/repositories`, Drizzle implementations in `infrastructure/db/repositories`. |
| **Adapter + Factory** | Storage drivers, image processing, mailer. `StorageFactory` switches on a numeric config code.                     |
| **Strategy**          | `ContentVisibilityPolicy`: `VerificationRequiredStrategy` vs `AutoPublishStrategy`, selected from settings.        |
| **Unit of Work**      | One Drizzle transaction per use case that writes more than one aggregate.                                          |
| **Result type**       | `Result<T, DomainError>` for expected failures; exceptions only for programmer errors.                             |
| **Specification**     | Composable filters for project queries (status, category, featured, year).                                         |

Deliberately **not** used: event sourcing, CQRS read models, microservices, a message bus. Overkill here.

## Storage

`StorageFactory.create(config)` returns an adapter based on `STORAGE_DRIVER`. Adding a driver is a three-line
change: one adapter file implementing `StoragePort`, one `case`, one comment block in the config legend.
Every uploaded asset records its `storage_driver` in `media_assets` so a studio can migrate drivers without
losing existing files.

## Data access rules

- No raw DB access outside repositories.
- No `SELECT *`; list endpoints are keyset-paginated (`created_at, id` cursor), never `OFFSET` on large tables.
- Every foreign key is indexed.
- Every tenant-scoped query is filtered by `tenant_id` in the repository layer (integration-tested for
  cross-tenant isolation).
