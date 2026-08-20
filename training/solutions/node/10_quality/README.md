# TP 10 — Quality control

> This practical exercise is **autonomous**: it does not depend on any other TP.
> You can clone, run and complete it on its own.

## Goal

Set up the **quality toolchain** of a production-grade Node.js 24 service (native
TypeScript, no build step) and use it to ship clean, observable code. Throughout
chapter 10 you will:

- wire up **ESLint** (flat config + `typescript-eslint`), **Prettier**, **Husky**
  and **lint-staged** so style and lint rules run automatically on every commit;
- design a small **HTTP error hierarchy** that maps domain errors to status codes
  through a single central error handler;
- add **structured logging** with `pino`, propagating a per-request id into every
  log line via `AsyncLocalStorage`.

The repository is a **starter skeleton**: the wiring is in place but the
implementations are left as `// TODO`. Your job is to fill them in.

## Prerequisites

- **Node.js >= 24** (run `nvm use` to pick the version from `.nvmrc`).
- No TypeScript build required: Node executes `.ts` files natively.

## Setup

```bash
npm install
npm start              # node src/server.ts
npm run typecheck      # tsc --noEmit
npm run lint           # eslint .
npm run format         # prettier --write .
```

Then initialise the Git hooks so quality checks run before each commit:

```bash
# 1. Generate the .husky/ directory and enable the hooks
npx husky init

# 2. Make the pre-commit hook run lint-staged
echo "npx lint-staged" > .husky/pre-commit
```

`npx husky init` already creates a `pre-commit` hook (running `npm test` by
default); the `echo` above replaces it so that only the staged `*.ts` files are
linted and formatted (see the `lint-staged` field in `package.json`).

## Steps

1. **Quality toolchain** — finish the provided `eslint.config.js` and
   `.prettierrc.json` to match your team's conventions, then run `npx husky init`
   and point the `pre-commit` hook at `lint-staged`. Verify that committing a file
   with a style issue is auto-fixed (or blocked) by the hook.
2. **HTTP error hierarchy** — in `src/errors.ts`, complete the `HttpError` base
   class (carrying a `statusCode`) and its subclasses `NotFoundError`,
   `BadRequestError` and `UnauthorizedError`. Throw them from your routes instead
   of crafting responses by hand, and translate them in the central error handler
   of `src/server.ts`.
3. **Request logging** — in `src/logging.ts`, build a middleware that combines
   `pino` with an `AsyncLocalStorage` store so that a unique **request id** is
   attached to every log line emitted while handling that request. Wire it in
   `src/server.ts` before the routes.

## Going further

- Add `eslint-config-prettier` to disable formatting rules that conflict with
  Prettier, and enable stricter `typescript-eslint` type-checked rule sets.
- Run lint and typecheck in CI (GitHub Actions) and fail the build on warnings.
- Enrich the log store with more context (user id, route, trace id) and emit a
  single structured summary line per request.
- Add a global `process.on('uncaughtException')` / `unhandledRejection` handler
  that logs through the same `pino` instance before exiting.
- Replace the random request id with the standard `traceparent` header to plug
  into a distributed-tracing backend.
