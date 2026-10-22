---
layout: cover
---

# 5 - Mocks

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Create** a fake function with `vi.fn`, and **spy** on a real one with `vi.spyOn`
- **Program** a mock: return values, resolved values, implementations, one call at a time
- **Replace** a whole module with `vi.mock` — and know why it is hoisted
- **Control** time with fake timers, and globals with `vi.stubGlobal` / `vi.stubEnv`
- **Decide** what to mock — and what not to

---

# `vi.fn` — a fake function

```ts
import { expect, it, vi } from 'vitest';

it('notifies the listener when a book is added', () => {
  const onChange = vi.fn();
  const cart = new Cart({ onChange });

  cart.add(cleanCode, 2);

  expect(onChange).toHaveBeenCalledOnce();
  expect(onChange).toHaveBeenCalledWith({ type: 'added', isbn: cleanCode.isbn, quantity: 2 });
});
```

- Records **every call**: arguments, return values, `this`, order
- `toHaveBeenCalled`, `…Times(n)`, `…With(…)`, `…LastCalledWith(…)`,
  `…NthCalledWith(n, …)`, `toHaveReturnedWith(…)`
- `onChange.mock.calls` / `.mock.results`: the raw history

---

# Programming a mock

```ts
const fetchBook = vi.fn<(isbn: string) => Promise<Book>>();

fetchBook.mockResolvedValue(cleanCode);                 // every call
fetchBook.mockResolvedValueOnce(refactoring);           // the next call only
fetchBook.mockRejectedValueOnce(new Error('404'));      // then this one

const priceOf = vi.fn().mockReturnValue(3500);
const discount = vi.fn((total: number) => total * 0.9); // an implementation
discount.mockImplementationOnce(() => 0);
```

- `…Once` values are consumed **in order**, then the default applies
- Type it: `vi.fn<typeof realFunction>()` — the mock accepts and returns what the
  real one does

---

# `vi.spyOn` — watch a real method

```ts
it('logs a warning for an unknown coupon', () => {
  using warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

  applyCoupon(5000, 'NOPE');

  expect(warn).toHaveBeenCalledWith('Unknown coupon: NOPE');
});
// console.warn is restored here
```

- Wraps the existing method: without `mockImplementation`, the **real** one still runs
- **`using`**: `mockRestore()` is called when the block ends — no `afterEach`,
  nothing to forget
- Works on getters and setters too: `vi.spyOn(obj, 'prop', 'get')`

---

# `vi.mock` — replace a module

```ts
import { expect, it, vi } from 'vitest';
import { checkout } from './checkout';
import { chargeCard } from './payment';

vi.mock('./payment', () => ({
  chargeCard: vi.fn().mockResolvedValue({ status: 'paid' }),
}));

it('charges the total of the cart', async () => {
  await checkout(cart);
  expect(chargeCard).toHaveBeenCalledWith(11200);
});
```

- **Hoisted**: moved above the imports — `checkout` sees the mock, not the real module
- Every importer of `./payment`, in this test file, gets the mock
- No factory: **automock** — every export becomes a `vi.fn()` returning `undefined`

---

# Hoisting and `vi.hoisted`

```ts
const charge = vi.fn();
vi.mock('./payment', () => ({ chargeCard: charge }));
// ❌ ReferenceError: Cannot access 'charge' before initialization
```

```ts
const { charge } = vi.hoisted(() => ({ charge: vi.fn() }));

vi.mock('./payment', () => ({ chargeCard: charge }));
// ✅ vi.hoisted runs before the hoisted vi.mock
```

- The factory runs **before** any line of the file: it cannot read a `const` declared below
- `vi.hoisted` moves a value up **with** it
- Or skip the variable: import the mocked function, and use `vi.mocked(chargeCard)`

---

# `vi.mocked` — the types follow

```ts
import { chargeCard } from './payment';

vi.mock('./payment');

it('reports a refused card', async () => {
  vi.mocked(chargeCard).mockRejectedValueOnce(new Error('card refused'));

  await expect(checkout(cart)).rejects.toThrow('card refused');
});
```

- `chargeCard` is typed as the **real** function: no `mockResolvedValue` on it
- `vi.mocked(fn)` says "this is a mock", and keeps its signature
- Nothing happens at run time: it is a type cast

---

# Partial mocks

```ts
vi.mock('./catalogue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./catalogue')>();
  return {
    ...actual,                                     // the real formatTitle, sortByPrice…
    fetchBook: vi.fn().mockResolvedValue(cleanCode),
  };
});
```

```ts
vi.mock('./catalogue', { spy: true });   // everything real, everything spied
```

- `importOriginal` (or `vi.importActual`) gives the real module, inside the factory
- `{ spy: true }`: keep **all** implementations, assert on the calls

---

# `vi.doMock` — not hoisted

```ts
it('uses the EU tax rules', async () => {
  vi.doMock('./config', () => ({ region: 'EU' }));
  const { taxOf } = await import('./tax');
  expect(taxOf(1000)).toBe(200);
});

it('uses the US tax rules', async () => {
  vi.resetModules();                                // forget the cached ./tax
  vi.doMock('./config', () => ({ region: 'US' }));
  const { taxOf } = await import('./tax');
  expect(taxOf(1000)).toBe(0);
});
```

- Applies to the **next** `import()` — static imports are already done
- A different mock **per test** — at the price of a dynamic import

---

# `__mocks__`

```
src/
  payment.ts
  __mocks__/
    payment.ts      ← used by vi.mock('./payment') with no factory
```

```ts
// src/__mocks__/payment.ts
import { vi } from 'vitest';
export const chargeCard = vi.fn().mockResolvedValue({ status: 'paid' });
```

- A **shared** fake, written once, for every test file that mocks the module
- For a package (`axios`, `node:fs`): a `__mocks__` folder at the **root** of the project
- Still opt-in: nothing is mocked until a test calls `vi.mock`

---

# Fake timers

```ts
beforeEach(() => {
  vi.useFakeTimers();
  return () => vi.useRealTimers();
});

it('expires the cart after 30 minutes', () => {
  const cart = new Cart();
  vi.advanceTimersByTime(30 * 60_000);
  expect(cart.isExpired()).toBe(true);
});

it('dates the receipt', () => {
  vi.setSystemTime(new Date('2026-12-24T10:00:00Z'));
  expect(printReceipt(order)).toContain('24/12/2026');
});
```

- `setTimeout`, `setInterval`, `Date` under your control — no real waiting
- `advanceTimersByTime(ms)`, `runAllTimers()`, `runOnlyPendingTimers()`,
  `advanceTimersToNextTimer()`; the `…Async` variants also flush promises

---

# Globals and environment

```ts
it('calls the API', async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json(cleanCode));
  vi.stubGlobal('fetch', fetchMock);

  await fetchBook('9780132350884');

  expect(fetchMock).toHaveBeenCalledWith('/api/books/9780132350884');
});

it('uses the configured API', () => {
  vi.stubEnv('VITE_API_URL', 'https://staging.example.com');
  expect(apiUrl()).toBe('https://staging.example.com');
});
```

- `vi.unstubAllGlobals()` / `vi.unstubAllEnvs()` — or `unstubGlobals: true` /
  `unstubEnvs: true` in the config
- For HTTP in depth, prefer a fake **server** (MSW) to a fake `fetch`

---

# Cleaning up between tests

| | History | Implementation | Original method |
|---|---|---|---|
| `mockClear()` / `clearMocks: true` | emptied | kept | — |
| `mockReset()` / `mockReset: true` | emptied | back to the one given to `vi.fn` | — |
| `mockRestore()` / `restoreMocks: true` | emptied | reset | **restored** (`vi.spyOn`) |

```ts
// vitest.config.ts
test: { clearMocks: true, restoreMocks: true }
```

- A mock that keeps the calls of the previous test makes **order-dependent** tests
- `using` on each spy, or `restoreMocks` once in the config

---

# What to mock — and what not to

✅ **Mock** what you **do not own**, or what is slow, random or external:
the network, the payment provider, the clock, `Math.random`, the file system

❌ **Do not mock** what you own and can run fast: your pure functions, your
modules, your components' children

- Each mock is a **guess** about how the real thing behaves — when it changes,
  the test stays green
- A test that asserts "A called B with X" breaks on every refactor; a test that
  asserts the **result** survives it
- Mock at the **edge**, as far from the code under test as you can

---

# Recap

- `vi.fn` to fake, `vi.spyOn` to watch — with `using` to restore
- `mockReturnValue`, `mockResolvedValue`, `mockImplementation`, and their `…Once`
- `vi.mock` is **hoisted**: `vi.hoisted` for shared values, `vi.mocked` for types
- `importOriginal` / `{ spy: true }` for partial mocks; `vi.doMock` + `import()` per test
- Fake timers and `setSystemTime` for time; `stubGlobal` / `stubEnv` for globals
- Mock the edges, not what you own

---

# Quiz — Question 1 / 3

**`const charge = vi.fn();` then `vi.mock('./payment', () => ({ chargeCard: charge }))`
fails with "Cannot access 'charge' before initialization". Why?**

- **A.** `vi.fn()` must be called inside the factory
- **B.** `vi.mock` is hoisted above the `const`: the factory runs first
- **C.** A factory cannot return a `vi.fn()`
- **D.** `./payment` must be imported first

<v-click>

> ✅ **B** — `vi.mock` is moved to the top of the file, before the imports and
> before `const charge`. Declare it with `vi.hoisted(() => vi.fn())`, or import
> the mocked function and use `vi.mocked`.

</v-click>

---

# Quiz — Question 2 / 3

**`using warn = vi.spyOn(console, 'warn').mockImplementation(() => {})` inside
a test. When is `console.warn` restored?**

- **A.** Never: call `mockRestore()` yourself
- **B.** At the end of the block that declared it — the test
- **C.** At the end of the file
- **D.** Only with `restoreMocks: true`

<v-click>

> ✅ **B** — `using` calls `[Symbol.dispose]()` when its block exits, and a spy's
> dispose is `mockRestore()`. Do not put it in a `beforeEach`: it would be
> restored at the end of the hook.

</v-click>

---

# Quiz — Question 3 / 3

**Which one should you NOT mock in a test of `Cart.total()`?**

- **A.** `fetch`, called by `Cart.refreshPrices()`
- **B.** `applyCoupon`, a pure function of your own `coupon.ts`
- **C.** The clock, for the expiry date of a coupon
- **D.** The payment provider's SDK

<v-click>

> ✅ **B** — It is yours, fast and deterministic: let it run. Mocking it would
> test `total()` against your guess of `applyCoupon`, and miss every bug in it.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 5 - Mocks
