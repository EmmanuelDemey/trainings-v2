---
layout: cover
---

# 6 - Testing with Node.js

---

# Testing pyramid

```
        /\
       /e2e\         ← Cypress / Playwright
      /------\
     /  intg  \      ← supertest, testcontainers
    /----------\
   /   unit     \    ← Mocha, Jest, node:test
  /--------------\
```

- **Unit**: fast, numerous, isolated
- **Integration**: validate the collaboration of several modules
- **End-to-end**: validate user journeys via a browser

---

# The native `node:test` runner

- Introduced in Node.js 18; fully stable and mature through Node.js 24
- No external dependency required

```ts
import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';

test('addition', () => {
  assert.equal(1 + 1, 2);
});

test('group', async (t: TestContext) => {
  // subtests are awaited automatically in Node 24
  t.test('case 1', () => assert.ok(true));
  t.test('case 2', () => assert.ok(true));
});
```

```bash
node --test
node --test --watch
node --test --test-timeout=5000   # per-test timeout
```

- Global setup/teardown via top-level `before`/`after` hooks

---

# Mocha

- The historic, very flexible runner
- BDD-style (`describe` / `it`) or TDD-style

```ts
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { Calculator } from './calculator.ts';

describe('Calculator', () => {
  let calc: Calculator;
  beforeEach(() => { calc = new Calculator(); });

  it('adds two numbers', () => {
    expect(calc.add(1, 2)).to.equal(3);
  });
});
```

- Requires an assertion library (`chai`, `node:assert`) and a mocking library (`sinon`)

---

# Jest

- All-in-one: runner + assertions + mocks + coverage
- Heavily used on the frontend, very productive

```ts
import { Calculator } from './calculator.ts';

describe('Calculator', () => {
  it('adds two numbers', () => {
    expect(new Calculator().add(1, 2)).toBe(3);
  });
});
```

```bash
jest --coverage --watch
```

- Drawback: built-in transpiler (Babel) can be heavy, slower than Vitest

---

# Async tests

- All libraries support Promises; just return or `await` the promise

```ts
it('fetch user', async () => {
  const user: User = await api.getUser(1);
  expect(user.id).toBe(1);
});
```

- Testing a timeout

```ts
it('rejects after 1s', async () => {
  await expect(slowOp()).rejects.toThrow('Timeout');
});
```

- With `node:test`, the timeout is per-test via `t.test(name, { timeout: 5000 }, ...)` or globally with `--test-timeout`

---

# Mocks and stubs

- **Stub**: replaces a function with a controlled version
- **Mock**: a stub with assertions on calls (parameters, count, order)
- **Spy**: observes without modifying

```ts
// Jest
jest.spyOn(repo, 'save').mockResolvedValue({ id: 1 });

const order: Order = await service.create(payload);

expect(repo.save).toHaveBeenCalledWith(payload);
```

```ts
// node:test
import { mock } from 'node:test';

const fn = mock.fn((): number => 42);
fn();
console.log(fn.mock.calls.length); // 1
```

---

# Module mocking

```ts
// Jest
jest.mock('./repo.ts', () => ({ save: jest.fn() }));

// node:test (since Node 22)
mock.module('./repo.ts', { namedExports: { save: (): { id: number } => ({ id: 1 }) } });
```

- To mock `fetch`, use `nock`, `msw` or `undici.MockAgent`

---

# Test isolation

- Each test must be runnable **alone**, in **any order**
- No shared global state: clean up in `afterEach`
- Database:
  - Rollback transactions
  - Ephemeral containers (`testcontainers`)
  - One schema per worker

```ts
beforeEach(async (): Promise<void> => {
  await db.migrate.latest();
});

afterEach(async (): Promise<void> => {
  await db.migrate.rollback();
});
```

---

# HTTP integration tests

- **`supertest`**: sends requests to an in-memory Express server

```ts
import request from 'supertest';
import app from '../app.ts';

it('GET /health', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});
```

---

# Functional tests with headless browsers

- **Playwright**: multi-browser (Chromium, Firefox, WebKit), modern API, auto-wait
- **Puppeteer**: Chromium-focused, older
- **Cypress**: well-known DX, but limited to a single browser per session

```ts
import { test, expect } from '@playwright/test';

test('login', async ({ page }) => {
  await page.goto('https://app.sparks.fr/login');
  await page.fill('#email', 'manu@sparks.fr');
  await page.fill('#password', 'secret');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL(/dashboard/);
});
```

---

# Code coverage

- `c8` (V8 native) or `nyc` (Istanbul)

```bash
c8 --reporter=lcov --reporter=text node --test
```

- Metrics: lines, statements, branches, functions
- Don't aim for **100%** but for **useful** coverage on business logic

---

# Best practices

- **Arrange / Act / Assert** in every test
- One test = **one** logical assertion
- Name tests as a **behavior** (`should reject when ...`)
- Run the suite on **CI** for every PR
- Measure test duration and **parallelize** when possible

---
layout: cover
---

# Hands-on

## Workshop 6 - Testing
- Write unit tests of a service with repository mocks
- Test an Express route with `supertest`
- Write a Playwright e2e test on a `/login` page
