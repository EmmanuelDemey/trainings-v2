---
layout: cover
---

# 3 - Custom matchers

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Register** code that runs before every test file with `setupFiles`
- **Write** a matcher with `expect.extend`: `pass`, `message`, `.not`
- **Use** the helpers of the matcher context: `this.isNot`, `this.utils`, `this.equals`
- **Reuse** a matcher as an **asymmetric** matcher, inside `toEqual`
- **Type** it, so `expect(x).toBeValidIsbn()` autocompletes and type checks

---

# Why a custom matcher?

```ts
// Without: the intent is buried in the mechanics
expect(isbn).toMatch(/^\d{13}$/);
expect(isbn13CheckDigit(isbn.slice(0, 12))).toBe(Number(isbn[12]));

// With: one line, in the words of the domain
expect(isbn).toBeValidIsbn();
```

```text
Error: expected "9780132350885" to be a valid ISBN-13 — its check digit should be 4, not 5
```

- The **test** reads like the spec
- The **failure** explains itself — no need to open the test to understand it
- Written **once**, used in every test file

---

# `setupFiles`

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
  },
});
```

```ts
// tests/setup.ts — runs before EACH test file, in the same worker
import { expect } from 'vitest';
import { toBeValidIsbn } from './matchers/isbn';
import { toCostInCents } from './matchers/price';

expect.extend({ toBeValidIsbn, toCostInCents });
```

- The place for what **every** test file needs: matchers, `@testing-library/jest-dom`,
  a global `afterEach`, polyfills
- `globalSetup` is something else: it runs **once**, in the main process, for
  servers and databases

---

# `expect.extend`

```ts
import { expect } from 'vitest';

expect.extend({
  toBeEven(received: number) {
    const pass = received % 2 === 0;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be even`
          : `expected ${received} to be even`,
    };
  },
});

expect(4).toBeEven();
expect(3).not.toBeEven();
```

- `received` is what was passed to `expect(…)`; the next parameters, the
  arguments of the matcher
- Return `{ pass, message }`: `pass` says whether the **positive** form holds
- `.not` inverts it for you — the `message` must say what was expected in **both** cases

---

# The matcher context — `this`

```ts
expect.extend({
  toCostInCents(received: { priceInCents: number }, expected: number) {
    const { isNot, utils } = this;
    const actual = received.priceInCents;
    return {
      pass: actual === expected,
      message: () =>
        `expected ${utils.printReceived(received)}${isNot ? ' not' : ''} to cost ` +
        `${utils.printExpected(expected)} cents, it costs ${actual}`,
      actual,
      expected,
    };
  },
});
```

- `this.isNot`: called through `.not`?
- `this.utils`: `printReceived`, `printExpected`, `diff`, `matcherHint` — the
  same formatting as the built-in matchers
- `this.equals(a, b)`: the deep equality of `toEqual`
- Return `actual` and `expected`: the report shows a **diff**

---

# A domain matcher

```ts
// tests/matchers/isbn.ts
import type { MatcherResult, MatcherState } from 'vitest';
import { isbn13CheckDigit } from '../../src/isbn';

export function toBeValidIsbn(this: MatcherState, received: unknown): MatcherResult {
  if (typeof received !== 'string' || !/^\d{13}$/.test(received)) {
    return {
      pass: false,
      message: () => `expected ${this.utils.printReceived(received)} to be 13 digits`,
    };
  }
  const expected = isbn13CheckDigit(received.slice(0, 12));
  const actual = Number(received[12]);
  return {
    pass: actual === expected,
    message: () =>
      this.isNot
        ? `expected ${received} not to be a valid ISBN-13`
        : `expected ${received} to be a valid ISBN-13 — its check digit should be ${expected}, not ${actual}`,
  };
}
```

- One matcher per file, the logic **reused** from the source when it exists
- Check the **type** of `received` first: a matcher gets anything
- `MatcherState` types `this`, `MatcherResult` the return — both from `'vitest'`

---

# Asymmetric use

Every matcher registered with `expect.extend` also exists on `expect` itself:

```ts
expect(order).toEqual({
  id: expect.any(String),
  lines: [
    { book: { isbn: expect.toBeValidIsbn(), title: 'Clean Code' }, quantity: 2 },
  ],
});

expect(catalogue).toContainEqual(
  expect.objectContaining({ isbn: expect.toBeValidIsbn() }),
);

expect(fetchBook).toHaveBeenCalledWith(expect.toBeValidIsbn());
```

- The same rule, **inside** a structure: a field, an argument of a mock call
- Combine it with `objectContaining`, `arrayContaining`, `any`

---

# Async matchers

```ts
expect.extend({
  async toBeInStock(received: string) {
    const stock = await fetchStock(received);
    return {
      pass: stock > 0,
      message: () => `expected ${received} to be in stock, ${stock} left`,
    };
  },
});

await expect('9780132350884').toBeInStock();
```

- Return a **Promise** of `{ pass, message }`
- The call must be **awaited**, like `resolves` / `rejects`

---

# TypeScript

```ts
// tests/vitest.d.ts
import 'vitest';

declare module 'vitest' {
  interface Matchers<R, T> {
    toBeValidIsbn: () => R;
    toCostInCents: (expected: number) => R;
  }
}
```

- `R` is what the assertion returns — `void`, or a `Promise` under `.resolves`;
  `T` is the type of the received value
- Extending **`Matchers`** types `expect(…).toBeValidIsbn()`, the asymmetric
  `expect.toBeValidIsbn()`, **and** the implementation passed to `expect.extend`
- `import 'vitest'` makes the file a module: without it, the declaration
  **replaces** the module instead of augmenting it
- The `.d.ts` must be in the `include` of `tsconfig.json`

---

# Libraries of matchers

```ts
// tests/setup.ts
import '@testing-library/jest-dom/vitest';   // toBeInTheDocument, toHaveTextContent…
```

| Package | Matchers |
|---|---|
| `@testing-library/jest-dom` | the DOM: `toBeVisible`, `toHaveValue`, `toBeDisabled`… — chapter 6 |
| `jest-extended` | collections, strings, dates: `toBeArrayOfSize`, `toStartWith`, `toBeAfter`… |

- Most Jest matcher libraries work as is: `expect.extend(matchers)`
- Write your own for **your domain**; reuse a library for the generic ones

---

# When to write one

✅ **Yes** when:

- The same two or three assertions come back in **many** tests
- The default failure message tells **nothing** about the domain
- The check is a **rule** (a valid ISBN, a price in cents, a well-formed order)
  you also want inside `toEqual`

❌ **No** when:

- A built-in matcher already says it — `toMatchObject`, `toContainEqual`
- It is used once: a plain `expect` is clearer
- It hides **logic** that deserves its own test — a matcher is test code, and
  nobody tests it

---

# Recap

- `setupFiles` runs before **each** test file: register the matchers there
- A matcher returns `{ pass, message }` — `pass` for the positive form, a
  message for both forms
- `this.isNot`, `this.utils.printReceived` / `printExpected`, `this.equals`
- Every custom matcher is also **asymmetric**: `expect.toBeValidIsbn()`
- Type it by augmenting `Matchers` in a `.d.ts` that starts with `import 'vitest'`

---

# Quiz — Question 1 / 3

**Your matcher returns `{ pass: true, message }`. The test calls
`expect(x).not.toBeValidIsbn()`. What happens?**

- **A.** The test passes: `pass` is true
- **B.** The test fails, with `message()` as its error
- **C.** Vitest throws: the matcher must handle `.not` itself
- **D.** The test passes, but logs the message

<v-click>

> ✅ **B** — `pass` describes the **positive** form; Vitest inverts it under
> `.not`. That is why the message must read well both ways — `this.isNot` tells
> you which one is being printed.

</v-click>

---

# Quiz — Question 2 / 3

**You wrote `tests/vitest.d.ts` with `declare module 'vitest' { … }`, but no
`import 'vitest'` at the top. What happens?**

- **A.** Nothing: the import is only a convention
- **B.** The declaration replaces the `vitest` module: `expect`, `it`… are no
  longer found
- **C.** Only the asymmetric form is typed
- **D.** It works in the editor, fails in CI

<v-click>

> ✅ **B** — Without an `import` or `export`, the file is a **script**: its
> `declare module` declares the whole module instead of **augmenting** it.

</v-click>

---

# Quiz — Question 3 / 3

**Where do you register `expect.extend({ toBeValidIsbn })` so every test file
can use it?**

- **A.** In `globalSetup`
- **B.** In a file listed in `setupFiles`
- **C.** At the top of `vitest.config.ts`
- **D.** In `beforeAll` of one test file

<v-click>

> ✅ **B** — `setupFiles` runs in the worker, **before each test file**: the
> `expect` it extends is the one the tests use. `globalSetup` runs once, in
> another process — its `expect` is not theirs.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 3 - Custom matchers
