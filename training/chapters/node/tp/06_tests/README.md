# TP 6 — Testing with Node.js

> This TP is **autonomous**: it does not depend on any other TP. Everything you
> need lives in this directory. The source under test is provided and working;
> your job is to fill in the test files.

## Goal

Chapter 6 — Learn how to test a Node.js application at three levels:

- **Unit test** a service in isolation, mocking its repository dependency.
- **Integration test** an Express route end-to-end with `supertest`.
- **End-to-end test** a real page in a browser with Playwright (optional).

The default test runner is the built-in `node:test` module (no extra runner to
install).

## Prerequisites

- **Node.js >= 24** (TypeScript runs natively, no build step). Run `nvm use` to
  pick up the version from `.nvmrc`.
- **Playwright** is **optional** and only needed for the bonus e2e step.

## Setup

```bash
npm install
npm test
```

`npm test` runs every `*.test.ts` file under `src/` via `node --test`. Use
`npm run test:watch` to re-run on change, and `npm run typecheck` to type-check.

The tests ship as **skeletons** with `// TODO` comments — they pass trivially
until you replace the TODOs with real assertions.

## Steps

1. **Unit-test the service with repository mocks** — open
   `src/user-service.test.ts`. The repository is mocked with `node:test`'s
   `mock.fn`. Complete the assertions: returned data, call counts, call
   arguments, and the rejection path of `getUser`.
2. **Integration-test the Express route with supertest** — open
   `src/server.test.ts`. It drives the exported `app` (no real port needed).
   Complete the assertions on `GET /api/users`: status, content type, and body.
3. **(Bonus) Write a Playwright e2e test on `/login`** — open
   `e2e/login.spec.ts` and complete the login flow. See _Going further_ below.

> Note: the unit and integration tests above are written here with `node:test`,
> but the exact same scenarios can be written with **Mocha** or **Jest** (as
> shown in the slide) — only the `describe`/`it`/assertion imports change, the
> structure stays identical.

## Going further

The Playwright e2e test (`e2e/login.spec.ts`) is **optional** and Playwright is
intentionally not in `package.json` (so `npm test` stays fast and dependency-free).
To try it:

```bash
npm install -D @playwright/test
npx playwright install
npx playwright test
```
