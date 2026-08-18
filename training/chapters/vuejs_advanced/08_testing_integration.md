---
layout: cover
---

# 8 - Testing in integration & end-to-end

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Mount** a component with the router and Pinia installed through
  `global.plugins`, with fresh instances per test
- **Choose** between a real memory router and a `vi.mock`ed one, depending on what
  is under test
- **Test** a navigation guard and a Pinia store, both connected and in isolation
- **Mock** HTTP at the network level with **MSW**, shared by Vitest and Cypress
- **Write** a readable Cypress end-to-end test with `cy.intercept`, aliases and
  `cy.session`
- **Compare** Cypress and Playwright on the same test, and pick one on real
  criteria
- **Run** the whole suite in **CI** on every pull request

---

# Where we left off

Chapter 4 tested components and composables **in isolation**. Since then you have
added the two things that make a component hard to isolate:

- a **router** (chapter 5) — `useRoute`, `useRouter`, guards, redirects
- a **store** (chapter 6) — shared state that survives the component

This chapter plugs them back in, adds the **network**, and finishes with a real
browser.

| Dependency | In isolation (ch. 4) | In integration (here) |
|---|---|---|
| Child components | `stubs` | rendered for real |
| Router | — | memory router, or `vi.mock` |
| Store | — | `createTestingPinia` |
| HTTP | — | module mock, or **MSW** |
| Browser | jsdom | **Cypress** |

---

# Global mocks, plugins and provides

```ts
mount(InvoiceView, {
  global: {
    plugins: [router, createTestingPinia({ createSpy: vi.fn })],
    mocks: { $t: (key: string) => key },        // i18n shortcut
    provide: { [themeKey as symbol]: { mode: ref('dark'), toggle: vi.fn() } },
    directives: { tooltip: vi.fn() },
    components: { FontAwesomeIcon: true },
  },
});
```

- `global.provide` is the test-side counterpart of the `provide` / `inject` pair
  from chapter 1 — same injection key, injected value under your control
- Factor this into a **`mountWithApp()`** helper in `tests/helpers.ts` — you will
  write it in every single test otherwise

---

# Testing with the real router

```ts
import { createRouter, createMemoryHistory } from 'vue-router';

function makeRouter() {
  return createRouter({ history: createMemoryHistory(), routes });
}

it('navigates to the invoice detail', async () => {
  const router = makeRouter();
  router.push('/invoices');
  await router.isReady();                       // ⚠️ mandatory

  const wrapper = mount(App, { global: { plugins: [router] } });
  await wrapper.get('[data-testid="invoice-1"]').trigger('click');
  await flushPromises();

  expect(router.currentRoute.value.name).toBe('invoice');
});
```

- `createMemoryHistory` — no jsdom URL juggling
- Build a **fresh router per test**: navigation state is global and leaks otherwise
- The alternative (mocking `useRoute` / `useRouter`) is faster but tests less

---

# Testing a navigation guard

```ts
it('redirects an anonymous visitor to /login', async () => {
  const router = makeRouter();
  const auth = useAuthStore();
  auth.user = null;

  await router.push('/admin');
  await router.isReady();

  expect(router.currentRoute.value.fullPath).toBe('/login?redirect=/admin');
});
```

- A guard is **async**: always `await router.push(...)`, never fire and forget
- `router.push()` **resolves** on a redirect — assert on `currentRoute`, not on the
  return value
- A rejected navigation resolves to a `NavigationFailure`, it does not throw

---

# Mocking a router without mounting it

```ts
import { useRouter } from 'vue-router';

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRouter: vi.fn(),
  useRoute: vi.fn(() => ({ params: { id: '42' }, query: {} })),
}));

it('redirects after submit', async () => {
  const push = vi.fn();
  vi.mocked(useRouter).mockReturnValue({ push } as never);

  const wrapper = mount(LoginForm);
  await wrapper.get('form').trigger('submit');

  expect(push).toHaveBeenCalledWith({ name: 'dashboard' });
});
```

---

# Testing with Pinia

```ts
import { createTestingPinia } from '@pinia/testing';

const wrapper = mount(CartSummary, {
  global: {
    plugins: [createTestingPinia({
      createSpy: vi.fn,
      initialState: { cart: { items: [{ id: 1, price: 10, qty: 2 }] } },
      stubActions: true,           // default: actions are spies, not executed
    })],
  },
});

const cart = useCartStore();
await wrapper.get('[data-testid="clear"]').trigger('click');
expect(cart.clear).toHaveBeenCalledOnce();
```

- `stubActions: false` runs the real actions — useful for integration-style tests
- Getters can be overridden in the test: `cart.total = 99` (typed as writable)

---

# Testing a store on its own

```ts
import { setActivePinia, createPinia } from 'pinia';

beforeEach(() => setActivePinia(createPinia()));   // a fresh store per test

it('totals the cart', () => {
  const cart = useCartStore();
  cart.add({ id: 1, price: 10 }, 2);

  expect(cart.total).toBe(20);
});
```

- No component, no `createTestingPinia` — a store is **plain unit-testable code**
- Without `setActivePinia`, state leaks from one test to the next
- Test the **getters and actions**, not the internal shape of the state

---

# Mocking HTTP — the module way

```ts
vi.mock('@/api/client', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

import { api } from '@/api/client';

it('renders the invoices', async () => {
  vi.mocked(api.get).mockResolvedValue([{ id: 1, total: 120 }]);

  const wrapper = mount(InvoiceList);
  await flushPromises();

  expect(wrapper.text()).toContain('120');
});
```

- Simple, fast — but couples the test to **your own abstraction**
- `vi.mock` is **hoisted**: never reference an outer variable in the factory
  (use `vi.hoisted()` if you must)

---

# Mocking HTTP — the network way (MSW)

```ts
// tests/msw.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
  http.get('/api/invoices', () => HttpResponse.json([{ id: 1, total: 120 }])),
);
```

```ts
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('shows an error banner on 500', async () => {
  server.use(http.get('/api/invoices', () => new HttpResponse(null, { status: 500 })));
  // ...
});
```

- Intercepts at the **network layer**: works with `fetch`, `axios`, anything
- The **same handlers** can drive your Cypress tests and your dev server

---

# Cypress — setup

```bash
npm install -D cypress
npx cypress open
```

```ts
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4173',       // vite preview
    viewportWidth: 1280,
    retries: { runMode: 2, openMode: 0 },
  },
  component: {
    devServer: { framework: 'vue', bundler: 'vite' },
  },
});
```

- `retries` in CI only — a test that needs retries locally is a broken test
- Component testing mounts a **real component in a real browser**

---

# Cypress — a readable e2e test

```ts
describe('Checkout', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/products', { fixture: 'products.json' }).as('products');
    cy.visit('/catalog');
    cy.wait('@products');
  });

  it('adds a product and checks out', () => {
    cy.getByTestId('product-1').findByTestId('add-to-cart').click();
    cy.getByTestId('cart-count').should('have.text', '1');

    cy.getByTestId('checkout').click();
    cy.location('pathname').should('eq', '/checkout');
  });
});
```

- **Never** `cy.wait(3000)` — wait on an alias or an assertion
- Cypress retries assertions automatically until the timeout

---

# Cypress — intercepting the network

```ts
// Stub a response
cy.intercept('POST', '/api/orders', { statusCode: 201, body: { id: 7 } }).as('create');

// Assert on the request that was actually sent
cy.wait('@create').its('request.body').should('deep.include', { items: [{ id: 1 }] });

// Simulate a failure
cy.intercept('GET', '/api/invoices', { forceNetworkError: true });

// Simulate a slow response
cy.intercept('GET', '/api/invoices', (req) => { req.on('response', (r) => r.setDelay(2000)); });

// Let it through, but observe
cy.intercept('GET', '/api/me').as('me');
```

- Stubbing makes tests **fast and deterministic**
- Keep a small suite hitting the **real** API as a smoke test

---

# Cypress — custom commands and sessions

```ts
// cypress/support/commands.ts
Cypress.Commands.add('getByTestId', (id: string) =>
  cy.get(`[data-testid="${id}"]`));

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.request('POST', '/api/login', { email, password })
      .then(({ body }) => window.localStorage.setItem('token', body.token));
  }, { cacheAcrossSpecs: true });
});
```

```ts
declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(id: string): Chainable<JQuery<HTMLElement>>;
      login(email: string, password: string): Chainable<void>;
    }
  }
}
```

- `cy.session` caches cookies/storage: **log in once**, not once per test

---

# Cypress — component testing

```ts
import { mount } from 'cypress/vue';
import InvoiceRow from '@/components/InvoiceRow.vue';

it('emits select on click', () => {
  const onSelect = cy.spy().as('select');

  cy.mount(InvoiceRow, {
    props: { invoice: { id: 1, total: 120 }, onSelect },
  });

  cy.getByTestId('row').click();
  cy.get('@select').should('have.been.calledWith', 1);
});
```

- Real browser, real CSS, real layout — catches what jsdom cannot
- Slower than Vitest: reserve it for components where **rendering** is the risk

---

# Cypress in CI

```yaml
- name: Build
  run: npm run build

- name: E2E
  uses: cypress-io/github-action@v6
  with:
    start: npm run preview
    wait-on: 'http://localhost:4173'
    browser: chrome
    record: false
```

- Test the **built** app (`vite preview`), not the dev server
- Save `cypress/screenshots` and `cypress/videos` as artifacts on failure
- Split specs across parallel jobs when the suite grows past a few minutes
- This job is the one you will wire into the pipeline of chapter 9

---

# Cypress or Playwright?

| | **Cypress** | **Playwright** |
|---|---|---|
| Execution | **inside** the browser, in the app's event loop | out-of-process, over CDP |
| Test code | chained commands, queued for later | plain `async` / `await` |
| Browsers | Chromium, Firefox, Electron — WebKit experimental | Chromium, Firefox, WebKit, all first-class |
| Parallelism | one spec at a time; Cypress Cloud (paid) to orchestrate | workers and `--shard`, built in |
| Tabs & origins | one tab, `cy.origin()` to cross a domain | contexts, tabs and origins are native |
| Network stubs | `cy.intercept` | `page.route` |
| Session reuse | `cy.session` | `storageState` |
| Component tests | mature, `cy.mount` | still experimental |
| Debugging | time-travel UI, DOM snapshots | trace viewer, `--ui`, `codegen` |

> Both auto-wait and both retry their assertions — "flaky vs. not flaky" is not the
> criterion. Decide on **parallelism, multi-origin and component testing**.

<style>
table { font-size: 0.74em; }
th, td { padding: 0.3em 0.7em; }
blockquote { font-size: 0.9em; }
</style>

---

# The same e2e test, twice

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1em;">
<div>

```ts
// cypress/e2e/checkout.cy.ts
describe('Checkout', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/products',
      { fixture: 'products.json' }).as('products');
    cy.visit('/catalog');
    cy.wait('@products');
  });

  it('adds a product and checks out', () => {
    cy.getByTestId('product-1')
      .findByTestId('add-to-cart').click();
    cy.getByTestId('cart-count')
      .should('have.text', '1');

    cy.getByTestId('checkout').click();
    cy.location('pathname')
      .should('eq', '/checkout');
  });
});
```

</div>
<div>

```ts
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products', (route) =>
      route.fulfill({ path: 'e2e/products.json' }));
    await page.goto('/catalog');
  });

  test('adds a product and checks out',
    async ({ page }) => {
    await page.getByTestId('product-1')
      .getByTestId('add-to-cart').click();
    await expect(page.getByTestId('cart-count'))
      .toHaveText('1');

    await page.getByTestId('checkout').click();
    await expect(page).toHaveURL('/checkout');
  });
});
```

</div>
</div>

- Same reflexes: **stub the network first**, then drive the UI through `data-testid`
- Cypress **queues** its commands; Playwright is ordinary async code — a forgotten
  `await` is a genuinely flaky test
- `expect(locator).toHaveText(…)` **retries** like `.should()` does —
  `expect(await locator.textContent())` does not

<style>
.slidev-layout {
  --slidev-code-font-size: 10px;
  --slidev-code-line-height: 1.45;
}
ul { font-size: 0.82em; }
</style>

---

# Playwright — the config side

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:4173',
    testIdAttribute: 'data-testid',        // getByTestId() reads this attribute
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
  ],
});
```

- `webServer` starts **and stops** the preview build itself — no `wait-on` step in CI
- `trace: 'on-first-retry'` turns a red CI job into a replayable session
  (`npx playwright show-trace trace.zip`)
- One `projects` entry per engine, all running in parallel

<style>
.slidev-layout {
  --slidev-code-font-size: 10px;
  --slidev-code-line-height: 1.45;
}
ul { font-size: 0.85em; }
</style>

---

# Case study — a full test suite

For a small invoicing app:

| Layer | Target | Tool |
|---|---|---|
| Unit | `useFetch`, `formatCurrency`, `useCartStore` | Vitest |
| Component | `InvoiceList` (loading / empty / error / data) | test-utils + MSW |
| Component | `LoginForm` (validation, submit, redirect) | test-utils + router mock |
| E2E | login ➜ list ➜ detail ➜ create ➜ logout | Cypress + `cy.session` |
| E2E | 401 handling, deep-link redirect | Cypress + `cy.intercept` |

<br />

> Target ~80% coverage on **business logic**, not on the whole codebase.
> Coverage is a smell detector, not a goal.

---

# Recap

- `global.plugins` for router and Pinia; factor a `mountWithApp` helper
- A **fresh router and a fresh Pinia per test** — both are global state
- Real memory router when the navigation *is* the behaviour, `vi.mock` when it is
  a detail
- **MSW** to mock the network once, for both Vitest and Cypress
- Cypress: `intercept` + aliases, never fixed waits, `cy.session` for auth
- Playwright writes the **same** test in plain `async` / `await` — choose on
  parallelism, multi-origin and component testing, not on syntax
- Run everything in **CI** on every pull request

---

# Quiz — Question 1 / 4

**Why build a fresh router and a fresh Pinia in every test?**

- **A.** To make the suite run faster
- **B.** Because both hold global state that leaks from one test to the next
- **C.** Because `mount` mutates the `plugins` array
- **D.** Because `createMemoryHistory` can only be used once per process

<v-click>

> ✅ **B** — Navigation state and store state survive the component. A test that
> passes alone and fails in the suite (or vice-versa) is almost always this.

</v-click>

---

# Quiz — Question 2 / 4

**A guard redirects the navigation you triggered with `await router.push('/admin')`.
What do you assert on?**

- **A.** The rejected promise
- **B.** The return value of `push`, which is the target location
- **C.** `router.currentRoute.value`, after awaiting the push
- **D.** A thrown `NavigationFailure`

<v-click>

> ✅ **C** — `push` **resolves** on a redirect (and resolves to a `NavigationFailure`
> when the navigation is aborted or duplicated — it never throws). The truth is in
> `currentRoute`.

</v-click>

---

# Quiz — Question 3 / 4

**With `createTestingPinia({ createSpy: vi.fn })`, what happens when the component
calls `cart.clear()`?**

- **A.** The real action runs, and is also recorded by a spy
- **B.** The action is replaced by a spy and does not execute
- **C.** The action throws until you provide an `initialState`
- **D.** The action runs, but the state is reset after each test

<v-click>

> ✅ **B** — `stubActions: true` is the default: you assert on the **call**, not on
> its effect. Pass `stubActions: false` when you want integration-style behaviour.

</v-click>

---

# Quiz — Question 4 / 4

**What does MSW give you that `vi.mock('@/api/client')` does not?**

- **A.** Faster tests
- **B.** Interception at the network layer — the same handlers serve Vitest,
  Cypress and the dev server
- **C.** No need to call `flushPromises()`
- **D.** Automatic typing of the responses

<v-click>

> ✅ **B** — A module mock tests your own abstraction; MSW tests the code path that
> really runs in production, `fetch` / `axios` included. Set
> `onUnhandledRequest: 'error'` so a forgotten handler fails loudly.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 8 - Testing in integration & e2e (part 2 of the testing workshop)
- Pick up the project from workshop 4 and add the integration layer
- Test `InvoiceList` in its **empty** and **error** states with **MSW**
- Test a component that uses **`useRoute` / `useRouter`**, twice: with a real
  memory router, then with `vi.mock`
- Test the auth guard: an anonymous visitor on `/admin` lands on `/login`
- Test a Pinia-connected component with **`createTestingPinia`**, asserting on a
  spied action — then test the store on its own with `setActivePinia`
- Write a Cypress e2e: login with `cy.session`, add an item, check out — with
  `cy.intercept` stubs and a custom `getByTestId` command
- **Bonus** — port that same spec to Playwright and compare what each one tells you
  when it fails

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
ul {
  font-size: 0.92em;
}
</style>
