---
layout: cover
---

# 01 - Capturing errors

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Tell** an event from an issue, and read what an event carries
- **Start** the SDK before anything else, with `node --import`, and explain why
- **Wire** `SentryModule` and the exception filter into a Nest app — with or
  without a catch-all filter of your own
- **Decide** what is a bug for Sentry: a 500, not a 404

---
src: ../../sentry-common/slides/01_errors/events-issues.md
---

---
src: ../../sentry-common/slides/01_errors/sdk-anatomy.md
---

---

# Three files

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1; min-width: 0;">

```ts
// src/sentry.ts — the options, testable
import * as Sentry from '@sentry/nestjs';
import type { NodeOptions } from '@sentry/nestjs';

export function initSentry(overrides: Partial<NodeOptions> = {}) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? 'development',
    ...overrides,
  });
}
```

```ts
// src/instrument.ts — the side effect
import { initSentry } from './sentry.js';
initSentry();
```

</div>
<div style="flex: 1; min-width: 0;">

```ts
// src/app.module.ts
import { SentryModule } from '@sentry/nestjs/setup';

@Module({
  imports: [
    SentryModule.forRoot(),   // first
    IssuesModule,
  ],
})
export class AppModule {}
```

```json
// package.json
"start:prod": "node --import ./dist/instrument.js dist/main.js"
```

</div>
</div>

<style>
.slidev-code { --slidev-code-font-size: 11px; --slidev-code-line-height: 16px; }
</style>

---

# Why first — and why `--import`

- The SDK is built on **OpenTelemetry**: it instruments `http`, Express, `pg`,
  `mysql2`, `mongodb`, `ioredis`… by **patching the modules as they load**
- A module loaded **before** `Sentry.init` is never patched: no request
  isolation, no spans, no route names
- In **ESM**, `import` statements are hoisted and evaluated before your code:
  "call `init` at the top of `main.ts`" is **too late**

```bash
node --import ./dist/instrument.js dist/main.js     # ESM — NestJS 12 is ESM
node --require ./dist/instrument.js dist/main.js    # CommonJS (Nest ≤ 11 projects)
```

```json
"start:dev": "nest start --watch --exec \"node --env-file-if-exists=.env --enable-source-maps --import ./dist/instrument.js\""
```

- `nest start --exec` replaces the `node` the CLI runs — the flags come with it
- Docker: `CMD ["node", "--import", "./dist/instrument.js", "dist/main.js"]`, or
  `NODE_OPTIONS="--import ./dist/instrument.js"`

---
src: ../../sentry-common/slides/01_errors/capturing.md
---

---

# `SentryModule.forRoot()`

```ts
import { SentryModule } from '@sentry/nestjs/setup';

@Module({ imports: [SentryModule.forRoot()] })
export class AppModule {}
```

- Registers a global **interceptor** that names each request's events after
  its **route template**: `GET /issues/:id`, not `GET /issues/13`
- `nestIntegration()` (on by default) instruments Nest itself: guards,
  interceptors, pipes, handlers become spans — chapter 04
- What it does **not** do: capture errors. Nest's exception layer turns every
  error into a response — someone has to tell Sentry first

---

# Capturing errors: two ways, pick one

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1; min-width: 0;">

### No catch-all filter of your own

```ts
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';

@Module({
  providers: [
    // BEFORE your other filters
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
  ],
})
```

- Reports, then delegates to Nest's `BaseExceptionFilter`: the default JSON
  error responses, GraphQL and RPC included

</div>
<div style="flex: 1; min-width: 0;">

### You have a `@Catch()` filter

```ts
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost) {
    // your response, unchanged
  }
}
```

- A catch-all filter **wins**: `SentryGlobalFilter` would never be called
- The decorator reports, then runs your `catch`

</div>
</div>

<style>
.slidev-code { --slidev-code-font-size: 11px; --slidev-code-line-height: 16px; }
</style>

---

# A 404 is not a bug

```ts
throw new NotFoundException(`Issue ${id} not found`);     // not reported
throw new BadRequestException('title is required');       // not reported
throw new DatabaseError('Database connection lost', 'ECONNRESET');  // reported
```

- Both ways skip **every `HttpException`** — and `WsException`, `RpcException`:
  what the caller did wrong is a **response**, not an issue
- An `HttpException` for a server-side failure? `throw new
  InternalServerErrorException()` is **not** reported either — capture the cause
  yourself, or let the real error through
- Errors **outside** a request — a cron, a queue consumer, an
  `onModuleInit` — never reach a filter: the SDK's global handlers catch
  what crashes; what you `catch`, you `captureException`

---
src: ../../sentry-common/slides/01_errors/scopes.md
---

---

# The isolation scope, per request

```ts
@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const userId = context.switchToHttp().getRequest<Request>().header('x-user-id');
    if (userId) Sentry.setUser({ id: userId });    // THIS request only
    return true;
  }
}
```

- The `http` instrumentation **forks** an isolation scope for every incoming
  request — `AsyncLocalStorage` under the hood
- `Sentry.setUser`, `setTag`, `setContext` in a guard, an interceptor, a
  controller or a service: on **this request's** events only
- `Sentry.getGlobalScope().setTag(…)` — every request: the region, the pod

---
layout: cover
---

# Workshop 01

## First errors
