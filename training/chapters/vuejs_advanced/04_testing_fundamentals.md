---
layout: cover
---

# 4 - Testing fundamentals

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Set up** Vitest and `@vue/test-utils` on a Vue project, jsdom included
- **Position** a test in the pyramid: unit, component, integration, end-to-end
- **Mount** a component and **query** it through `data-testid` rather than CSS
  selectors
- **Await** interactions and flush promises before asserting on async behaviour
- **Decide** what to stub — and explain what each stub costs
- **Test** a composable outside of a component, and **control** time with fake
  timers and spies declared with `using`

---

# Why testing, here

You now have the two reuse mechanisms of Vue 3: **components** (chapter 2) and
**composables** (chapter 3). Both are units with a contract — which makes them
exactly what a test suite is good at pinning down.

- This chapter: **Vitest + `@vue/test-utils`** on components and composables in
  isolation
- Chapter 7, once router and Pinia are in play: testing a component **wired to the
  application** — router, stores, HTTP — and end-to-end with Cypress

> Everything you write from chapter 5 onwards is meant to be tested with what you
> learn here.

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
- This is the batching from chapter 1, seen from the test side

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

# Testing an async component

```ts
it('shows the fallback, then the resolved component', async () => {
  const wrapper = mount(ChartPanel);          // <Suspense> + defineAsyncComponent

  expect(wrapper.get('[data-testid="skeleton"]').exists()).toBe(true);

  await flushPromises();                      // let the dynamic import resolve

  expect(wrapper.findComponent(SalesChart).exists()).toBe(true);
});
```

- The loader returns a promise: **one `flushPromises()` per level of `await`**
- To test the error branch, make the loader reject:
  `defineAsyncComponent(() => Promise.reject(new Error('boom')))`
- `v-memo` and `v-once` are invisible to tests — assert on **render counts**, not
  on the directive

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
- `app.unmount()` is what proves your **teardown** actually runs

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

# Recap

- `mount` over `shallowMount`; `data-testid` over CSS selectors
- **Always `await`** interactions, and `flushPromises()` before asserting on async
- Stub only what is heavy or hostile to jsdom — every stub is untested reality
- `withSetup` for composables that need a component context; `app.unmount()` to
  check teardown
- `using` for spies, fake timers for debounce and polling

> Next steps in chapter 7: the same components, but plugged into the router,
> Pinia and the network.

---

# Quiz — Question 1 / 4

**What is the number one cause of flaky Vue component tests?**

- **A.** Using jsdom instead of a real browser
- **B.** A missing `await` on `trigger()` / `setValue()`
- **C.** Querying with `data-testid` instead of CSS selectors
- **D.** Using `mount` instead of `shallowMount`

<v-click>

> ✅ **B** — Both return `nextTick()`. Without the `await`, you assert on the DOM
> **before** Vue has re-rendered — and it passes or fails depending on timing.

</v-click>

---

# Quiz — Question 2 / 4

**What is the real risk of `shallowMount`?**

- **A.** It is slower than `mount`
- **B.** It cannot render slots at all
- **C.** Every child is stubbed, so a test can stay green while the real app breaks
- **D.** It disables the reactivity system

<v-click>

> ✅ **C** — Every stub is a piece of reality you stop testing. Default to `mount`,
> and stub only what is heavy (charts, maps) or hostile to jsdom.

</v-click>

---

# Quiz — Question 3 / 4

**When do you actually need a `withSetup` helper to test a composable?**

- **A.** Always — a composable cannot run outside a component
- **B.** Only when it registers lifecycle hooks or calls `inject`
- **C.** Only when it returns `computed` values
- **D.** Only when the app is server-rendered

<v-click>

> ✅ **B** — A pure composable is a plain function: call it directly. The wrapper
> exists to provide a component instance — and `app.unmount()` is what proves your
> teardown runs.

</v-click>

---

# Quiz — Question 4 / 4

```ts
using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
```

**What does `using` change here?**

- **A.** Nothing, it is an alias for `const`
- **B.** It makes the spy visible to the whole test file
- **C.** It calls `mockRestore()` at the end of the scope — no `afterEach` needed
- **D.** It replaces `vi.restoreAllMocks()` when written inside `beforeEach`

<v-click>

> ✅ **C** — Explicit Resource Management disposes the spy on scope exit. Note that
> `using` inside a `beforeEach` would dispose at the end of the **hook**, not of the
> test — so **D** is exactly what not to do.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 4 - Testing fundamentals (part 1 of the testing workshop)
- Set up Vitest + `@vue/test-utils` on the workshop project and make
  `npm run test` green
- Test `InvoiceList` in its **loading** and **data** states, using `data-testid`
  queries only
- Stub the heavy `InvoiceChart` child and assert on the **props** it receives
- Test `useDebouncedSearch` with **fake timers**
- Assert a `console.warn` with `using vi.spyOn(...)`

<style>
/* The `cover` layout sets color: white; inline code would inherit it and
   become unreadable on the theme's light-grey chip background. */
:not(pre) > code {
  color: #000;
}
</style>
