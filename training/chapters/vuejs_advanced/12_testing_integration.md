---
layout: cover
---

# 12 - Testing in integration & end-to-end

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Mount** a component with the router and Pinia installed through
  `global.plugins`, with a fresh instance of each per test
- **Choose** between a real memory router and a `vi.mock`ed one, depending on what
  is under test
- **Drive** a component through its store with `createTestingPinia` — spied
  actions, `initialState`, and the real actions when you want them
- **Mock** HTTP at two levels: the module you own with `vi.mock`, the network
  itself with **MSW**
- **Write** a readable Cypress end-to-end test with `cy.intercept`, aliases and no
  fixed waits

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
- `getByTestId` is a one-line custom command over `cy.get('[data-testid="…"]')`,
  declared once in `cypress/support/commands.ts`

---

# Recap

- `global.plugins` installs the router and Pinia — a **fresh router and a fresh
  Pinia per test**, because both hold global state
- Real memory router when the navigation *is* the behaviour, `vi.mock` when it is
  a detail; `await router.isReady()` before mounting either way
- `createTestingPinia` spies on the actions by default: assert on the **call**, and
  pass `stubActions: false` when you want the real thing
- `vi.mock` is fast but tests **your own abstraction** — and it is hoisted, so never
  close over an outer variable in the factory
- **MSW** intercepts the network itself: the same handlers serve Vitest, Cypress
  and the dev server
- Cypress: `intercept` + aliases and assertions that retry, never a fixed
  `cy.wait(3000)`

> The workshop for this chapter is `tp/12_testing_integration/`.

---

# Quiz — Question 1 / 3

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

# Quiz — Question 2 / 3

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

# Quiz — Question 3 / 3

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

