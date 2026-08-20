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
- **Run** the very component you had to stub in a real browser with **Vitest
  browser mode**, and tell when jsdom stops being enough
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

This chapter plugs them back in, adds the **network**, and climbs the last two
rungs: the same component in a **real browser**, then the whole app end-to-end.

| Dependency | In isolation (ch. 4) | In integration (here) |
|---|---|---|
| Child components | `stubs` | rendered for real |
| Router | — | memory router, or `vi.mock` |
| Store | — | `createTestingPinia` |
| HTTP | — | module mock, or **MSW** |
| Browser | jsdom | **Vitest browser mode**, then **Cypress** |

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

# Vitest browser mode — the missing rung

Chapter 4 stubbed `InvoiceChart` for exactly one reason:

```ts
onMounted(() => {
  width.value = document.body.getBoundingClientRect().width;   // 0 in jsdom
});
```

| | **jsdom** | **browser mode** | **e2e** |
|---|---|---|---|
| What runs | a DOM emulated in Node | your **component**, in a real browser | your **app**, in a real browser |
| CSS | parsed, never applied | applied | applied |
| Layout, `getBoundingClientRect` | zeros | real | real |
| `vi.mock`, `vi.useFakeTimers` | yes | yes | no |
| Startup | milliseconds | ~1 s + a driver | build + server |

> Same `vitest` binary, same `expect`, same specs. **Only the environment changes** —
> which is what makes it cheap enough to use for a handful of components.

<style>
table { font-size: 0.72em; }
th, td { padding: 0.25em 0.6em; }
blockquote { font-size: 0.85em; }
</style>

---

# Browser mode — setup

```bash
npm i -D @vitest/browser @vitest/browser-webdriverio webdriverio   # or -playwright
```

```ts
// vitest.browser.config.ts
import { webdriverio } from '@vitest/browser-webdriverio';

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ['tests/**/*.browser.spec.ts'],
    setupFiles: ['./tests/setup.browser.ts'],      // imports the real stylesheet
    browser: {
      enabled: true,
      provider: webdriverio({                      // WebDriver, as Selenium speaks it
        capabilities: { 'goog:chromeOptions': { args: ['--no-sandbox'] } },
      }),
      headless: true,                // `false` to watch the tests run
      viewport: { width: 1280, height: 720 },
      instances: [{ browser: 'chrome' }],          // add firefox: both run
    },
  },
});
```

- `instances` replaces the old `browser.name`: **one entry per browser**, all parallel
- Since **Vitest 4** the provider is a **factory imported from its own package**, not the
  string `'webdriverio'` — and the WebDriver `capabilities` are passed to that factory
- WebdriverIO **downloads the matching driver** on the first run; on Ubuntu ≥ 24.04 and
  in CI containers Chrome also needs `args: ['--no-sandbox']`, hence the flag above

<style>
.slidev-layout {
  --slidev-code-font-size: 11px;
  --slidev-code-line-height: 1.4;
}
ul { font-size: 0.82em; }
</style>

---

# Browser mode — as a second project

```ts
// vitest.config.ts — one config, two environments
import { webdriverio } from '@vitest/browser-webdriverio';

export default defineConfig({
  test: {
    projects: [
      { extends: true,
        test: { name: 'unit', environment: 'jsdom',
                exclude: [...configDefaults.exclude, '**/*.browser.spec.ts'] } },
      { extends: true,
        test: { name: 'browser',
                include: ['**/*.browser.spec.ts'],
                browser: { enabled: true, provider: webdriverio(),
                           instances: [{ browser: 'chrome' }] } } },
    ],
  },
});
```

- `vitest` runs both; `vitest --project unit` keeps the fast loop fast, and lets CI run
  the browser job on its own
- `extends: true` inherits the root `plugins` and `resolve.alias` — no duplication
- The `exclude` is **not** optional: otherwise the jsdom project collects the browser
  specs and they die on `import { page } from '@vitest/browser/context'`

<style>
.slidev-layout {
  --slidev-code-font-size: 10.5px;
  --slidev-code-line-height: 1.4;
}
ul { font-size: 0.82em; }
</style>

---

# Browser mode — the same component, unstubbed

```ts
import { render } from 'vitest-browser-vue';
import { page } from '@vitest/browser/context';

it('sizes every bar in proportion to its invoice', async () => {
  render(InvoiceChart, { props: { invoices, currency: 'EUR' } });

  await expect.element(page.getByTestId('invoice-chart')).toBeVisible();

  const [first] = [...document.querySelectorAll('.bar')];
  expect(first.getBoundingClientRect().height)              // 0 in jsdom
    .toBeCloseTo((invoices[0].total / total) * 80, 0);
  expect(getComputedStyle(first).backgroundColor)           // '' in jsdom
    .toBe('rgb(66, 184, 131)');
});
```

- `render()` from **`vitest-browser-vue`** mounts into the real document and unmounts
  after each test — `mount()` from test-utils also works, with `attachTo: document.body`
- No `flushPromises()` and no `nextTick()`: `expect.element(...)` **retries** the whole
  assertion until the timeout, the way `.should()` does in Cypress
- This is the demo in TP 4/8 — `npm run test:browser`

<style>
.slidev-layout {
  --slidev-code-font-size: 11px;
  --slidev-code-line-height: 1.4;
}
ul { font-size: 0.8em; }
</style>

---

# Browser mode — locators and real events

```ts
await page.getByLabelText('Email').fill('ada@example.com');
await page.getByRole('button', { name: 'Sign in' }).click();

await expect.element(page.getByRole('alert')).toHaveTextContent('Invalid');

// Lower level, when a locator method is not enough
import { userEvent } from '@vitest/browser/context';
await userEvent.tripleClick(page.getByLabelText('Email'));
await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
```

- The locator API is **Playwright's**: `getByRole`, `getByLabelText`, `getByTestId`,
  `getByText` — with the jest-dom matchers you already know
- Events go through the **driver**, not through `dispatchEvent`: a click on a disabled
  button, or on an element hidden behind an overlay, genuinely does nothing.
  In jsdom, `trigger('click')` happily fires either way
- `page.screenshot()` on demand — and a failing test drops one in `__screenshots__/`

<style>
.slidev-layout {
  --slidev-code-font-size: 11px;
  --slidev-code-line-height: 1.4;
}
ul { font-size: 0.82em; }
</style>

---

# Browser mode — what it costs

- **MSW changes side**: `msw/node` patches Node's http layer, so it is gone. You need
  `setupWorker` from `msw/browser` plus `npx msw init public/` to install its worker
- Everything **Node-only** goes with it: `fs`, `path`, and mocking a node builtin
- Your **setup files** split in two — a browser setup imports the real stylesheet,
  which is exactly what a jsdom setup has no reason to do
- **Coverage**: `istanbul` works everywhere, the `v8` provider only with Playwright
  and Chromium
- **CI** must be able to install a driver, and each instance costs ~1 s of startup

<br />

> Keep **jsdom as the default**. Promote to browser mode the handful of components where
> the *rendering* is the risk — a chart, a virtual list, a popover that measures itself.
> A browser-mode suite that mirrors your whole jsdom suite is a slow tautology.

<style>
ul { font-size: 0.9em; }
blockquote { font-size: 0.85em; }
</style>

---

# Browser mode, Cypress CT or Playwright?

| | **Vitest browser mode** | **Cypress component** | **Playwright e2e** |
|---|---|---|---|
| Unit under test | one component | one component | the whole app |
| Runner | Vitest — same specs, same `vi.mock` | Cypress | Playwright |
| Porting a jsdom spec | mostly copy-paste | rewrite | rewrite |
| Assertions | `expect` + jest-dom, retried | `.should()`, retried | `expect(locator)`, retried |
| Network | MSW `setupWorker` | `cy.intercept` | `page.route` |
| Debugging | devtools + Vitest UI | time-travel UI | trace viewer |
| Startup | ~1 s | ~5 s | build + server |

> Three rungs, one ladder: **jsdom** for logic, **browser mode** for rendering,
> **Cypress or Playwright** for the flow. Every rung you add has to earn its
> maintenance — do not test the same behaviour twice.

<style>
table { font-size: 0.7em; }
th, td { padding: 0.25em 0.6em; }
blockquote { font-size: 0.85em; }
</style>

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
| Rendering | `InvoiceChart` (layout, CSS, measurements) | Vitest **browser mode** |
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
- **Vitest browser mode** for the components jsdom cannot render — same runner, same
  specs, a real layout and a real stylesheet; jsdom stays the default
- Cypress: `intercept` + aliases, never fixed waits, `cy.session` for auth
- Playwright writes the **same** test in plain `async` / `await` — choose on
  parallelism, multi-origin and component testing, not on syntax
- Run everything in **CI** on every pull request

---

# Quiz — Question 1 / 5

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

# Quiz — Question 2 / 5

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

# Quiz — Question 3 / 5

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

# Quiz — Question 4 / 5

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

# Quiz — Question 5 / 5

**Which of these tests genuinely needs Vitest browser mode rather than jsdom?**

- **A.** A component that formats a currency and renders it
- **B.** A component that reads `getBoundingClientRect()` to size itself
- **C.** A component that calls a Pinia action on click
- **D.** A composable using `vi.useFakeTimers()`

<v-click>

> ✅ **B** — jsdom answers zeros for anything layout-related and never applies your
> CSS. A, C and D are all cheaper and just as truthful in jsdom; fake timers and
> `vi.mock` keep working in browser mode, so that is never the reason to switch.

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
- **Demo** — `npm run test:browser`: `InvoiceChart`, the component part 1 made you
  stub, rendered and measured for real in Vitest browser mode
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
