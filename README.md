# NestJS + Effect Boilerplate

A small, production-minded NestJS boilerplate that demonstrates using **Effect at the service/application layer** without replacing Nest's dependency injection or HTTP conventions.

The example domain is intentionally generic: a basic `items` CRUD module backed by an in-memory repository. Replace the repository with your database adapter and keep the same service boundary.

## Goals

- Keep NestJS responsible for modules, controllers, DI, validation, and HTTP.
- Keep Effect responsible for typed failures and service workflow composition.
- Avoid running two dependency-injection systems side by side.
- Make the Effect-to-Nest boundary explicit and reusable.
- Stay small enough to use as a starting point instead of a framework inside a framework.

## Stack

- NestJS 12
- Effect 3
- TypeScript with strict mode
- class-validator / class-transformer
- Jest + Supertest
- pnpm
- GitHub Actions

## Architecture

```text
HTTP request
    |
    v
Nest controller
    |
    | EffectRunner.run(...)
    v
Effect-based service
    |
    +-- typed domain/application errors
    +-- workflow composition
    +-- async failure conversion
    |
    v
Repository abstraction
    |
    v
Infrastructure implementation
```

Nest constructs dependencies. Services return `Effect.Effect<Success, Error>`. The `EffectRunner` is the boundary that executes an Effect and maps expected typed failures to Nest HTTP exceptions.

## Project structure

```text
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── effect/
│   │   ├── effect.module.ts
│   │   ├── effect-runner.service.ts
│   │   └── from-repository.ts
│   ├── errors/
│   │   └── application-errors.ts
│   └── health/
│       └── health.controller.ts
└── modules/
    └── items/
        ├── domain/
        ├── dto/
        ├── repositories/
        ├── items.controller.ts
        ├── items.module.ts
        ├── items.service.spec.ts
        └── items.service.ts
```

## Getting started

Requires Node.js 22.22.3+ and pnpm.

```bash
corepack enable
pnpm install
pnpm start:dev
```

The API starts at `http://localhost:3000/api`.

### Endpoints

```text
GET    /api/health
POST   /api/items
GET    /api/items?page=1&limit=20
GET    /api/items/:id
PATCH  /api/items/:id
DELETE /api/items/:id
```

Example:

```bash
curl -X POST http://localhost:3000/api/items \
  -H "content-type: application/json" \
  -d '{"name":"Example","description":"A sample item"}'
```

## The service-level Effect pattern

A service method returns an Effect instead of executing it immediately:

```ts
create(input: CreateItemDto) {
  return Effect.gen(function* () {
    const existing = yield* fromRepository(
      'items.findByName',
      () => repository.findByName(input.name),
    )

    if (existing) {
      return yield* Effect.fail(
        new ResourceConflictError({
          resource: 'Item',
          reason: 'An item with this name already exists',
        }),
      )
    }

    return yield* fromRepository(
      'items.create',
      () => repository.create(input),
    )
  })
}
```

The controller stays familiar:

```ts
@Post()
create(@Body() input: CreateItemDto) {
  return this.effectRunner.run(
    this.itemsService.create(input),
  )
}
```

This keeps execution at the application boundary and preserves typed failures through the service layer.

## Why not Effect Context / Layer here?

Effect's Context and Layer are useful, but Nest already has a capable IoC container. This boilerplate deliberately lets Nest own dependency construction:

```ts
@Injectable()
export class ItemsService {
  constructor(
    private readonly repository: ItemRepository,
  ) {}
}
```

That makes Effect adoptable incrementally in an existing Nest application. If a subsystem later becomes Effect-native, Context/Layer can be introduced there without forcing the entire application to migrate.

## Replacing the in-memory repository

Implement `ItemRepository` with your preferred persistence library:

```ts
@Injectable()
export class DatabaseItemRepository extends ItemRepository {
  // implement create/find/update/remove
}
```

Then change only the provider binding in `ItemsModule`:

```ts
{
  provide: ItemRepository,
  useExisting: DatabaseItemRepository,
}
```

The controller and service do not need to know which persistence technology is being used.

## Useful commands

```bash
pnpm start:dev
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm format
```

## What is intentionally not included

This repository avoids auth, database-specific code, queues, caches, external APIs, and domain-specific integrations. Those are application choices rather than boilerplate requirements.

## License

MIT
