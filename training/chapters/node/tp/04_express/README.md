# TP 4 — Express framework

> This practical exercise is **autonomous**: it does not depend on any other TP.
> You can clone, run and complete it on its own.

## Goal

Build a small HTTP API with **Express 5** running directly on Node.js 24 (native
TypeScript, no build step). Throughout chapter 4 you will:

- expose a `/api/users` REST API with **modular routing** (`express.Router`);
- protect routes with a **JWT guard** and an **admin role guard**;
- harden the app with the usual production middlewares: **helmet**, **cors** and
  **rate limiting**.

The repository is a **starter skeleton**: the wiring is in place but the
implementations are left as `// TODO`. Your job is to fill them in.

## Prerequisites

- **Node.js >= 24** (run `nvm use` to pick the version from `.nvmrc`).
- No TypeScript build required: Node executes `.ts` files natively.

## Setup

```bash
npm install
npm start        # or: npm run dev   (watch mode)
npm run typecheck
```

Once the implementations are done, you can test the API with `curl`.

```bash
# 1. Obtain a demo JWT (the /login route is provided to bootstrap testing)
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H 'content-type: application/json' \
  -d '{"sub":"alice","role":"admin"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')

# 2. List users (protected by the JWT guard)
curl -s http://localhost:3000/api/users \
  -H "authorization: Bearer $TOKEN"

# 3. Read a single user
curl -s http://localhost:3000/api/users/1 \
  -H "authorization: Bearer $TOKEN"

# 4. Create a user (admin role required)
curl -s -X POST http://localhost:3000/api/users \
  -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"name":"Bob","email":"bob@example.com"}'
```

## Steps

1. **Modular REST API** — in `src/routes/users.ts`, implement the in-memory
   `/api/users` resource: `GET /` (list), `GET /:id` (read one, `404` if absent)
   and `POST /` (create, validate the body, return `201` with the new user). Mount
   the router under `/api/users` in `src/server.ts`.
2. **Authentication & authorization** — in `src/middleware/auth.ts`, implement
   `jwtGuard` (verify the `Authorization: Bearer <token>` header, attach the
   decoded payload to the request) and `roleGuard(role)` (reject with `403` when
   the JWT does not carry the expected `role` claim). Apply `jwtGuard` to the
   whole users router and `roleGuard('admin')` to the `POST` route.
3. **Hardening middlewares** — in `src/server.ts`, configure `helmet()`,
   `cors()` and `express-rate-limit` with sensible defaults, mounted before the
   routes.

## Going further

- Replace the in-memory array with a real persistence layer (SQLite via
  `node:sqlite`, or a small repository module).
- Add input validation with a schema library and return structured `400` errors.
- Add a centralized error-handling middleware (`(err, req, res, next)`).
- Issue short-lived access tokens plus refresh tokens, and read the signing
  secret from `process.env` (use `process.loadEnvFile()` with a `.env` file).
- Write integration tests with `node:test` and `supertest`.
