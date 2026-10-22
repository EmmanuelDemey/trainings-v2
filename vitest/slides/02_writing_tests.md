---
layout: cover
---

# 2 - Writing tests

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Structure** a test file with `describe`, `it` and the modifiers
- **Write** one test for many cases with `test.each` and `test.for`
- **Prepare** and **clean up** state with hooks
- **Pick** the right assertion: `toBe`, `toEqual`, `toStrictEqual`, `toThrow`,
  `resolves`, asymmetric matchers
- **Measure** coverage, and make it a gate with thresholds

---

# `describe`, `it`, `test`

```ts
import { describe, expect, it } from 'vitest';
import { applyCoupon } from './cart';

describe('applyCoupon', () => {
  it('takes 10% off with SAVE10', () => {
    expect(applyCoupon(5000, 'SAVE10')).toBe(4500);
  });

  it('leaves the total alone with an unknown code', () => {
    expect(applyCoupon(5000, 'NOPE')).toBe(5000);
  });
});
```

- `describe` groups tests — and can nest; the report joins the names with `>`
- `it` and `test` are the **same** function: pick the one that reads best
- One test = **one reason to fail**; the name says the expected behaviour

---

# Modifiers

```ts
it.only('the one I am debugging', () => { /* … */ });   // only this one (in this file)
it.skip('broken until #142 is fixed', () => { /* … */ });
it.todo('refuses an expired coupon');                     // no body: a reminder

it.skipIf(process.platform === 'win32')('uses POSIX paths', () => { /* … */ });
it.runIf(process.env.API_URL)('hits the staging API', async () => { /* … */ });

it.concurrent('fetches the catalogue', async ({ expect }) => { /* … */ });

it.fails('documents a known bug', () => {
  expect(applyCoupon(5000, 'save10')).toBe(4500);  // passes while this fails
});
```

- Every modifier also exists on `describe`: `describe.skip`, `describe.only`…
- `concurrent` tests share the file's time: use the **`expect` of the context**
  so snapshots and `expect.assertions` know which test they belong to

---

# `.only` and `CI=true`

```ts
it.only('the one I am debugging', () => { /* … */ });
```

```text
Error: Unexpected .only modifier. Remove it or pass --allowOnly argument to bypass this error
```

- With `CI` set, a forgotten `.only` **fails the run** — the other tests would
  otherwise be silently skipped
- `--allowOnly` turns it back into a filter (the default outside CI)
- Prefer `-t` or the IDE's ▶ to focus a test: nothing to forget in the code

---

# `test.each` — one test, many cases

```ts
it.each([
  { code: 'SAVE10', total: 5000, expected: 4500 },
  { code: 'HALF',   total: 5000, expected: 2500 },
  { code: 'NOPE',   total: 5000, expected: 5000 },
])('$code on $total gives $expected', ({ code, total, expected }) => {
  expect(applyCoupon(total, code)).toBe(expected);
});
```

```text
 ✓ SAVE10 on 5000 gives 4500
 ✓ HALF on 5000 gives 2500
 ✓ NOPE on 5000 gives 5000
```

- `$name` reads a key of an object case; `%s`, `%i`, `%j` the items of an array case
- **One test per case** in the report: you see which case broke

---

# `test.for` — the same, with the context

```ts
// each SPREADS an array case into arguments
it.each([[1, 1, 2], [2, 3, 5]])('%i + %i = %i', (a, b, sum) => {
  expect(a + b).toBe(sum);
});

// for does NOT spread — and passes the test context second
it.for([[1, 1, 2], [2, 3, 5]])('%i + %i = %i', ([a, b, sum], { expect }) => {
  expect(a + b).toBe(sum);
});
```

- Same output for object cases and template strings
- `test.for` is the one to use with `concurrent`: the context carries the right `expect`

---

# Test options

```ts
it('loads the whole catalogue', { timeout: 10_000, retry: 2 }, async () => {
  /* … */
});

describe('the payment API', { timeout: 10_000 }, () => {
  /* … */
});
```

- `timeout`: default **5 s** per test (`testTimeout` in the config)
- `retry`: re-run a failing test — a band-aid for flakiness, never a cure
- `repeats`: run it N times, to **find** a flaky test
- The options object goes **second**, before the function — the old third-argument
  form is gone since Vitest 4 (a bare number as last argument is still a timeout)

---

# Hooks

```ts
describe('Cart', () => {
  let cart: Cart;

  beforeEach(() => {
    cart = new Cart();               // a fresh cart for every test
    cart.add({ isbn: '9780132350884', priceInCents: 3500 }, 2);
  });

  it('counts the items', () => {
    expect(cart.count()).toBe(2);
  });

  it('empties itself', () => {
    cart.clear();
    expect(cart.count()).toBe(0);    // the other test is not affected
  });
});
```

- `beforeEach` / `afterEach`: around **every** test of the block (and its children)
- `beforeAll` / `afterAll`: **once** for the block — for what is costly and read-only
- Order: outer `beforeEach` first, inner first for `afterEach`

---

# Hooks — returned cleanup

```ts
beforeAll(async () => {
  const server = await startFakeApi();
  return async () => {           // runs as the afterAll of this hook
    await server.close();
  };
});

beforeEach(() => {
  vi.useFakeTimers();
  return () => vi.useRealTimers();
});

onTestFinished(() => db.rollback());   // inside a test: cleanup for this test only
```

- The setup and its teardown **side by side**: nothing to keep in a `let`
- `onTestFinished` / `onTestFailed` register cleanup from **inside** a test

---

# Assertions — equality

```ts
expect(applyCoupon(5000, 'SAVE10')).toBe(4500);      // Object.is: primitives, same reference

expect(cart.lines()).toEqual([                       // deep equality
  { isbn: '9780132350884', quantity: 2 },
]);

expect(receipt).toStrictEqual({ total: 4500 });      // + undefined keys, + class instances
expect(receipt).toMatchObject({ total: 4500 });      // a subset of the keys
```

| | `{ a: 1, b: undefined }` vs `{ a: 1 }` | `new Book(…)` vs a plain object |
|---|---|---|
| `toEqual` | equal | equal |
| `toStrictEqual` | **different** | **different** |

- `toBe({ … })` is always false: two objects are two references
- `toBeCloseTo(0.3)` for floats — or count **cents** in integers

---

# Assertions — the rest of the toolbox

```ts
expect(cart.isEmpty()).toBe(true);           // prefer it to toBeTruthy()
expect(book.subtitle).toBeUndefined();
expect(cart.lines()).toHaveLength(2);
expect(['fiction', 'sf']).toContain('sf');
expect(cart.lines()).toContainEqual({ isbn: '9780132350884', quantity: 2 });
expect(receipt).toHaveProperty('total', 4500);
expect('SAVE10').toMatch(/^[A-Z]+\d+$/);

expect(() => cart.add(book, -1)).toThrow('quantity must be positive');
expect(() => cart.add(book, -1)).toThrow(RangeError);

expect.soft(receipt.total).toBe(4500);       // reports, but lets the test go on
```

- Every matcher has its `.not`: `expect(cart.isEmpty()).not.toBe(true)`
- `toThrow` takes a **function** — `expect(cart.add(book, -1))` throws before `expect` runs

---

# Assertions — promises

```ts
it('loads a book', async () => {
  await expect(fetchBook('9780132350884')).resolves.toMatchObject({ title: 'Clean Code' });
});

it('refuses an unknown ISBN', async () => {
  await expect(fetchBook('nope')).rejects.toThrow('Book not found');
});

it('calls back twice', async () => {
  expect.assertions(2);                 // fails if fewer assertions ran
  await checkout(cart, (event) => expect(event.type).toMatch(/paid|shipped/));
});
```

- **`await`** the `expect(…).resolves` / `.rejects` — or the test ends before it runs
- `expect.assertions(n)` / `expect.hasAssertions()`: proof that the callbacks ran

---

# Asymmetric matchers

```ts
expect(order).toEqual({
  id: expect.any(String),
  createdAt: expect.any(Date),
  lines: expect.arrayContaining([
    expect.objectContaining({ isbn: '9780132350884' }),
  ]),
  note: expect.stringMatching(/gift/i),
  total: expect.closeTo(45, 2),
});
```

- They stand **inside** an expected value, for the parts you cannot (or should not) fix
- `expect.anything()`: any value but `null` / `undefined`
- Your own matchers become asymmetric too — chapter 3

---

# Coverage

```bash
npm install -D @vitest/coverage-v8
npx vitest run --coverage
```

```ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src'],                  // also count the files no test imports
      reporter: ['text', 'html'],
      thresholds: { lines: 90, branches: 90, functions: 90, statements: 90 },
    },
  },
});
```

- Without `include`, only the files **loaded** by a test are reported
- Below a threshold, `vitest run --coverage` **exits 1**: coverage becomes a CI gate
- 100% coverage says every line **ran** — not that its result was **checked**

---

# In-source testing

```ts
// src/isbn.ts
export function isbn13CheckDigit(first12: string): number { /* … */ }

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('computes the check digit of Clean Code', () => {
    expect(isbn13CheckDigit('978013235088')).toBe(4);
  });
}
```

```ts
// vitest.config.ts — and `define: { 'import.meta.vitest': 'undefined' }` in the build
test: { includeSource: ['src/**/*.ts'] }
```

- The test next to a **private** helper, without exporting it
- Add `"types": ["vitest/importMeta"]` to `tsconfig.json`
- Good for small pure functions; the rest stays in `*.spec.ts`

---

# Recap

- `describe` / `it`, one reason to fail per test, a name that states the behaviour
- `.only` fails on CI; `.todo` is a reminder; `.fails` documents a known bug
- `test.each` / `test.for`: one line per case, one test per case in the report
- `beforeEach` for a **fresh** state; return the cleanup from the hook
- `toBe` for primitives, `toEqual` / `toStrictEqual` for structures, `await` the
  `resolves` / `rejects`
- Coverage thresholds turn the report into a gate — and still prove nothing about assertions

---

# Quiz — Question 1 / 3

**`expect({ total: 4500 }).toBe({ total: 4500 })` — what happens?**

- **A.** It passes
- **B.** It fails: two different objects
- **C.** It fails with a type error
- **D.** It passes only with `toStrictEqual`… so it fails here

<v-click>

> ✅ **B** — `toBe` compares with `Object.is`: two object literals are two
> references. Use `toEqual` (or `toStrictEqual`) for a deep comparison.

</v-click>

---

# Quiz — Question 2 / 3

**What is wrong with this test?**

```ts
it('loads a book', () => {
  expect(fetchBook('42')).resolves.toMatchObject({ title: 'Dune' });
});
```

- **A.** `resolves` ignores rejections
- **B.** The `expect` is not awaited: the test ends before the promise settles
- **C.** `toMatchObject` is too lenient
- **D.** Nothing: Vitest awaits every `expect` for you

<v-click>

> ✅ **B** — Without `await` (or `return`), the test function returns
> synchronously, before the promise settles. Vitest detects the un-awaited
> assertion and fails the test at its end — the fix is the same: `await` it.

</v-click>

---

# Quiz — Question 3 / 3

**Coverage says 100% of `coupon.ts`. What do you know for sure?**

- **A.** Every coupon rule is correct
- **B.** Every line of `coupon.ts` ran during the tests
- **C.** Every branch was asserted on
- **D.** No test can be removed

<v-click>

> ✅ **B** — Coverage records what **ran**, not what was **checked**. A test with
> no `expect` covers just as much. Break the code on purpose: the test that should
> catch it must go red.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 2 - Writing tests
