---
layout: cover
---

# 7 - Advanced

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Share** setup between tests with **fixtures** (`test.extend`)
- **Split** a suite into **projects**: unit, integration, browser
- **Run** tests in a real browser with **browser mode**
- **Measure** and compare performance with **benchmarks**
- **Test the types** of an API with `expectTypeOf`

---

# Fixtures — `test.extend`

```ts
// tests/test.ts
import { test as base } from 'vitest';
import { Cart } from '../src/cart';
import { cleanCode } from './books';

export const test = base
  .extend('cart', () => new Cart())
  .extend('filledCart', ({ cart }) => {
    cart.add(cleanCode, 2);
    return cart;
  });
```

```ts
import { expect } from 'vitest';
import { test } from './test';

test('applies a coupon to a filled cart', ({ filledCart }) => {
  filledCart.applyCoupon('SAVE10');
  expect(filledCart.totalInCents()).toBe(6300);
});
```

- A fixture is built **only if a test asks for it** — destructure it
- Fixtures can depend on each other; the types are **inferred** from what they return

---

# Fixtures — cleanup, `auto`, `scope`

```ts
export const test = base
  .extend('api', { scope: 'file' }, async ({}, { onCleanup }) => {
    const server = await startFakeApi();       // once per file
    onCleanup(() => server.close());
    return server;
  })
  .extend('silentConsole', { auto: true }, ({}, { onCleanup }) => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    onCleanup(() => spy.mockRestore());        // for every test, asked or not
  });
```

- `onCleanup`: the teardown, next to the setup
- `auto: true`: runs for every test — a typed `beforeEach`
- `scope: 'file'` / `'worker'`: built once, shared — for what is costly and read-only
- The object syntax `base.extend({ cart: async ({}, use) => { await use(new Cart()); } })`
  still works — the builder infers the types

---

# Fixtures vs hooks

| | `beforeEach` + `let` | `test.extend` |
|---|---|---|
| Built for | every test of the block | only the tests that ask |
| Typing | `let cart: Cart` declared by hand | inferred |
| Reuse | copied from file to file | imported: `import { test } from './test'` |
| Teardown | a separate `afterEach` | `onCleanup`, next to the setup |

<br />

> Hooks for one file; **fixtures** for what several files share.

---

# Projects

One `vitest` run, several configurations:

```ts
export default defineConfig({
  plugins: [vue()],
  test: {
    coverage: { provider: 'v8', include: ['src'] },   // root only
    projects: [
      {
        test: { name: 'unit', include: ['src/**/*.spec.ts'], environment: 'node' },
      },
      {
        test: {
          name: 'components',
          include: ['src/**/*.spec.vue.ts'],
          environment: 'jsdom',
          setupFiles: ['./tests/setup.ts'],
        },
      },
    ],
  },
});
```

- Each project: its own `include`, `environment`, `setupFiles`, timeouts
- Inline projects **inherit** the root config (plugins, aliases) in Vitest 5 —
  `extends: false` to start blank

---

# Projects — running them

```bash
npx vitest                                    # every project, in parallel
npx vitest --project unit                     # one project
npx vitest --project unit --project components
```

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run --project unit"
  }
}
```

- **Root only**: `coverage`, `reporters`, `globalSetup` of the run — one report
  for all projects
- Use cases: fast unit tests vs slower integration tests; Node vs DOM; jsdom vs
  a real browser; front and back in a monorepo

---

# Browser mode

```bash
npm install -D @vitest/browser-playwright
npx playwright install chromium
```

```ts
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],      // also 'firefox', 'webkit'
    },
  },
});
```

- The tests run **in the browser**, not in jsdom: real layout, real CSS, real events
- Same `describe` / `it` / `expect` — and Vite serves the code

---

# Browser mode — a test

```ts
import { render } from 'vitest-browser-vue';
import { page } from 'vitest/browser';
import { expect, test } from 'vitest';
import CartSummary from './CartSummary.vue';

test('applies a coupon', async () => {
  const screen = await render(CartSummary, { props: { totalInCents: 5000 } });

  await screen.getByRole('textbox', { name: 'Coupon code' }).fill('SAVE10');
  await screen.getByRole('button', { name: 'Apply' }).click();

  await expect.element(screen.getByText('Total: €45.00')).toBeVisible();
  await page.viewport(375, 667);              // and on a phone
});
```

- **Locators** (`getByRole`, `getByText`…) and `expect.element` **retry** on their own
- Interactions go through the real browser (Playwright's CDP)
- Worth it for layout, CSS, `IntersectionObserver`, drag and drop, canvas — jsdom
  stays faster for the rest

---

# Benchmarks

```ts
// src/sort.bench.ts — only *.bench.ts / *.benchmark.ts files
import { expect, test } from 'vitest';

test('sorting the catalogue by price', async ({ bench }) => {
  const result = await bench.compare(
    bench('Array#sort', () => { [...catalogue].sort(byPrice); }),
    bench('toSorted', () => { catalogue.toSorted(byPrice); }),
  );

  expect(result.get('toSorted')).toBeFasterThan(result.get('Array#sort'));
});
```

```bash
npx vitest bench
```

- Vitest 5: `bench` is a **fixture** of `test`, available in `*.bench.ts` files
- `vitest bench` runs only the benchmarks; `vitest` alone skips them
- One run proves little: compare **on the same machine**, several times

---

# Type testing

```ts
// src/cart.test-d.ts
import { expectTypeOf, test } from 'vitest';
import { createCart, type Cart } from './cart';

test('createCart', () => {
  expectTypeOf(createCart).returns.toEqualTypeOf<Cart>();
  expectTypeOf(createCart).parameter(0).toExtend<{ currency?: 'EUR' | 'USD' }>();
  expectTypeOf<Cart['lines']>().items.toMatchObjectType<{ isbn: string; quantity: number }>();

  // @ts-expect-error a quantity is a number
  createCart().add(cleanCode, '2');
});
```

```bash
npx vitest --typecheck          # or test.typecheck.enabled: true
```

- `*.test-d.ts` files are **type checked**, never executed
- `toEqualTypeOf` (exact), `toExtend` (assignable), `toMatchObjectType` (an
  object subset); `@ts-expect-error` for what must **not** compile
- For libraries and shared types: the API is part of the contract

---

# Recap of the day

- **Setup**: `vitest.config.ts`, watch vs `vitest run`, filters, UI
- **Syntax**: `describe` / `it`, `test.each`, hooks, the right assertion, coverage gates
- **Custom matchers**: `expect.extend`, asymmetric, typed through `Matchers`
- **Snapshots**: small, stable, reviewed — never updated blind
- **Mocks**: the edges only; `using` to restore; fake timers for time
- **Vue Testing Library**: by role, `user-event`, `findBy` for what comes later
- **Advanced**: fixtures, projects, browser mode, benchmarks, type tests

---

# Resources

- **Vitest** — https://vitest.dev (guide, API, config, migration to v5)
- **Testing Library** — https://testing-library.com/docs/vue-testing-library/intro/
- **Which query should I use?** — https://testing-library.com/docs/queries/about#priority
- **user-event** — https://testing-library.com/docs/user-event/intro
- **jest-dom** — https://github.com/testing-library/jest-dom
- **Vue testing guide** — https://vuejs.org/guide/scaling-up/testing.html
- **Common mistakes with Testing Library** —
  https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **Testing Playground** — https://testing-playground.com

---

# Quiz — Question 1 / 3

**A fixture `filledCart` is defined with `test.extend`. A test only destructures
`{ cart }`. Is `filledCart` built?**

- **A.** Yes, every fixture is built before every test
- **B.** No: a fixture is built only when a test (or another fixture) uses it
- **C.** Only once per file
- **D.** Only if `auto: true` is not set… so yes

<v-click>

> ✅ **B** — Fixtures are **lazy**: Vitest reads the destructured names. Only
> `auto: true` fixtures run for every test.

</v-click>

---

# Quiz — Question 2 / 3

**Where must `coverage` be configured in a config with `projects`?**

- **A.** In each project
- **B.** At the root of `test`, once for all projects
- **C.** In the first project only
- **D.** Coverage does not work with projects

<v-click>

> ✅ **B** — Coverage, like the reporters, belongs to the **run**, not to a
> project: one report merges them all. In a project it is ignored.

</v-click>

---

# Quiz — Question 3 / 3

**`src/cart.test-d.ts` holds `expectTypeOf(total).returns.toEqualTypeOf<string>()`,
but `total` returns a `number`. `npx vitest run` is green. Why?**

- **A.** `toEqualTypeOf` only warns
- **B.** `*.test-d.ts` files are only checked with `--typecheck`
- **C.** Type tests need browser mode
- **D.** `expectTypeOf` is erased at run time, so it always passes

<v-click>

> ✅ **B** — Type tests are checked by the **compiler**, which only runs with
> `--typecheck` (or `typecheck.enabled`). **D** is the reason they never fail at
> run time — hence the flag.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 7 - Advanced

---
src: ./shared/retro.md
---
