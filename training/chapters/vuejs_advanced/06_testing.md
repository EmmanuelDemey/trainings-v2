---
layout: cover
---

# 6 - Advanced testing

---

# The testing strategy

```
        /\
       /e2e\          ← Cypress / Playwright — real browser, few, slow
      /------\
     /  comp  \       ← @vue/test-utils + jsdom — the bulk of the suite
    /----------\
   /    unit    \     ← composables, stores, pure functions — fast, numerous
  /--------------\
```

<br />

| Level | What it proves | Cost |
|---|---|---|
| Unit | A composable / store behaves | ms |
| Component | A component renders and reacts correctly | tens of ms |
| E2E | A user journey works end to end | seconds |

> Test **behaviour**, not implementation. If a refactor breaks your test but not
> the app, the test was wrong.

---

# Vitest setup for Vue

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
  },
});
```

```bash
npm install -D vitest @vue/test-utils jsdom @vitest/coverage-v8
```

- Vitest reuses your **Vite config** — same aliases, same plugins, no second build
- `--browser` mode runs the same tests in a real browser instead of jsdom

---

# `mount` vs `shallowMount`

```ts
import { mount, shallowMount } from '@vue/test-utils';

const wrapper = mount(InvoiceList, { props: { invoices } });
// renders the full tree — closest to reality

const wrapper = shallowMount(InvoiceList, { props: { invoices } });
// every child component is replaced by a stub <invoice-row-stub />
```

- **Default to `mount`**: you test what the user sees
- `shallowMount` when a child is heavy (charts, maps) or has hard dependencies
- Beware: `shallowMount` makes tests pass that the real app would fail

---

# Finding and asserting

```ts
// ❌ coupled to markup
wrapper.find('.btn-primary.submit > span');

// ✅ coupled to intent
wrapper.get('[data-testid="submit"]');
wrapper.getComponent(InvoiceRow);
wrapper.findAllComponents(InvoiceRow);
```

```ts
expect(wrapper.text()).toContain('3 invoices');
expect(wrapper.get('[data-testid="total"]').text()).toBe('120,00 €');
expect(wrapper.find('[data-testid="empty"]').exists()).toBe(false);
expect(wrapper.getComponent(Badge).props('variant')).toBe('danger');
```

- `get` **throws** when nothing matches — a better error than `find` + `exists()`
- Consider **`@testing-library/vue`** if you want to query the way a user would

---

# Interacting and waiting

```ts
await wrapper.get('[data-testid="qty"]').setValue('3');
await wrapper.get('[data-testid="submit"]').trigger('click');
await wrapper.get('form').trigger('submit.prevent');

// The two ways to flush
await nextTick();          // one render tick
await flushPromises();     // pending microtasks + renders
```

- Every `trigger` / `setValue` returns `nextTick()` — **always `await` them**
- A missing `await` is the number one cause of flaky Vue component tests

```ts
expect(wrapper.emitted('submit')).toHaveLength(1);
expect(wrapper.emitted('submit')![0]).toEqual([{ qty: 3 }]);
```

---

# Stubbing child components

```ts
mount(Dashboard, {
  global: {
    stubs: {
      // Replace by a bare stub
      HeavyChart: true,

      // Keep the slot content visible
      RouterLink: { template: '<a><slot /></a>' },

      // Custom stub asserting on the props it receives
      MapView: { props: ['center'], template: '<div data-testid="map" />' },
    },
  },
});
```

```ts
// Teleport and Transition often need help in jsdom
stubs: { teleport: true, transition: false }
```

- `transition: false` renders the real `<Transition>` — useful to assert on classes
- Stubbing is a **trade-off**: every stub is a piece of reality you stop testing

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
- The alternative (mocking `useRoute` / `useRouter`) is faster but tests less

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

# Spies and the `using` keyword

```ts
it('warns on an invalid prop', () => {
  using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

  mount(Badge, { props: { variant: 'nope' as never } });

  expect(warn).toHaveBeenCalled();
});   // ← mockRestore() called automatically here
```

- `using` (Explicit Resource Management) disposes the spy at the end of the scope
- Removes the `let spy` + `afterEach(() => spy.mockRestore())` boilerplate
- Requires TypeScript >= 5.2 and Vitest >= 3

---

# Fake timers

```ts
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it('debounces the search', async () => {
  const wrapper = mount(SearchBar);

  await wrapper.get('input').setValue('vu');
  await wrapper.get('input').setValue('vue');
  expect(api.search).not.toHaveBeenCalled();

  await vi.advanceTimersByTimeAsync(300);
  expect(api.search).toHaveBeenCalledExactlyOnceWith('vue');
});
```

- `advanceTimersByTimeAsync` also flushes the promises resolved by the timers
- Do **not** combine fake timers with real network calls

---

# Testing composables

```ts
import { withSetup } from './helpers';

it('useCounter increments', () => {
  const [{ count, increment }, app] = withSetup(() => useCounter(5));

  increment();
  expect(count.value).toBe(6);
  app.unmount();
});
```

```ts
// tests/helpers.ts — run a composable inside a real component context
export function withSetup<T>(composable: () => T): [T, App] {
  let result!: T;
  const app = createApp({ setup() { result = composable(); return () => {}; } });
  app.mount(document.createElement('div'));
  return [result, app];
}
```

- Only needed when the composable uses **lifecycle hooks** or `inject`
- A pure composable can be called directly in the test

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

- `mount` over `shallowMount`; `data-testid` over CSS selectors
- **Always `await`** interactions, and `flushPromises()` before asserting on async
- `global.plugins` for router and Pinia; factor a `mountWithApp` helper
- **MSW** to mock the network once, for both Vitest and Cypress
- `using` for spies, fake timers for debounce/polling
- Cypress: `intercept` + aliases, never fixed waits, `cy.session` for auth
- Run everything in **CI** on every pull request

---
layout: cover
---

# Hands-on

## Workshop 6 - Advanced testing
- Test `InvoiceList` in its four states (loading, empty, error, data) with **MSW**
- Test a component that uses **`useRoute` / `useRouter`**, twice: with a real
  memory router, then with `vi.mock`
- Test a Pinia-connected component with **`createTestingPinia`**, asserting on a
  spied action
- Stub a heavy chart child and assert on the **props** it receives
- Write a Cypress e2e: login with `cy.session`, add an item, check out — with
  `cy.intercept` stubs and a custom `getByTestId` command

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
