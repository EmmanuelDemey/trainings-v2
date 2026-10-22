---
layout: cover
---

# 4 - Snapshots

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Capture** an output with `toMatchSnapshot`, `toMatchInlineSnapshot` and
  `toMatchFileSnapshot`
- **Update** a snapshot on purpose — and **review** the diff before you do
- **Pin** the volatile fields (ids, dates) with property matchers
- **Tell** a useful snapshot from one that nobody reads

---

# What is a snapshot?

```ts
it('prints the receipt', () => {
  expect(printReceipt(order)).toMatchSnapshot();
});
```

- **First run**: the value is **serialised** and written down — the test passes
- **Next runs**: the new value is compared with the stored one — a difference fails
- It does not say the output is **right**: only that it **did not change**
- The first run is your **review**: read what got written

---

# File snapshot — `toMatchSnapshot`

```ts
// src/receipt.spec.ts
it('prints the receipt', () => {
  expect(printReceipt(order)).toMatchSnapshot();
});
```

```js
// src/__snapshots__/receipt.spec.ts.snap — generated, committed
exports[`prints the receipt 1`] = `
"Clean Code              2 × €35.00   €70.00
Refactoring             1 × €42.00   €42.00
SAVE10                               -€11.20
TOTAL                                €100.80"
`;
```

- One `.snap` file per test file, one entry per `toMatchSnapshot` call
- The key is the **test name** + a counter: renaming a test makes an obsolete
  entry and a new one
- **Commit** the `.snap` files: they are part of the test

---

# Inline snapshot — `toMatchInlineSnapshot`

```ts
it('summarises the cart', () => {
  expect(summarise(cart)).toMatchInlineSnapshot();
});
```

After the first run, Vitest **writes the value into the test file**:

```ts
it('summarises the cart', () => {
  expect(summarise(cart)).toMatchInlineSnapshot(`
    {
      "items": 3,
      "totalInCents": 11200,
    }
  `);
});
```

- The expected value is **where you read the test** — no other file to open
- Best for **small** values; a 50-line snapshot inline drowns the test

---

# File snapshot — `toMatchFileSnapshot`

```ts
it('renders the receipt as HTML', async () => {
  await expect(receiptHtml(order)).toMatchFileSnapshot('./__snapshots__/receipt.html');
});
```

- The snapshot is a **real file**, with its own extension: `.html`, `.json`, `.csv`
- Your editor highlights it; a reviewer reads it like any other file
- Asynchronous: **`await`** it
- For big, structured outputs: a generated document, an export, an e-mail

---

# Updating snapshots

```bash
npx vitest -u              # rewrite every failing snapshot
npx vitest run -u receipt  # only the files matching "receipt"
```

In watch mode, press **`u`** after a failure — or update one by one with **`i`**.

```text
- Expected
+ Received

-TOTAL                                €100.80
+TOTAL                                €100.08
```

⚠️ **Read the diff before pressing `u`**. A snapshot updated without a look is a
test that no longer tests anything.

---

# Snapshots on CI

- With `CI` set, Vitest **never writes** a snapshot
- A **missing** snapshot fails: someone forgot to commit the `.snap`
- An **obsolete** snapshot fails too: a test was renamed or removed —
  `vitest -u` locally cleans it
- A **mismatch** fails, as everywhere

<br />

> The snapshots of CI are the ones in the repository. Nothing is recorded there
> for the first time.

---

# Volatile values — property matchers

```ts
it('creates the order', () => {
  expect(createOrder(cart)).toMatchSnapshot({
    id: expect.any(String),
    createdAt: expect.any(Date),
  });
});
```

```js
exports[`creates the order 1`] = `
{
  "createdAt": Any<Date>,
  "id": Any<String>,
  "lines": [ … ],
  "totalInCents": 11200,
}
`;
```

- The listed fields are checked with the matcher, **not** stored
- Better still: make them **deterministic** — `vi.setSystemTime`, an injected id
  generator (chapter 5)

---

# Snapshot of an error

```ts
it('refuses an expired coupon', () => {
  expect(() => applyCoupon(cart, expired)).toThrowErrorMatchingInlineSnapshot(
    `[CouponError: Coupon SUMMER24 expired on 2024-09-01]`,
  );
});
```

- `toThrowErrorMatchingSnapshot` / `…InlineSnapshot`: the **message** of the error
- Useful when the message is part of the contract — it reaches a user or a log

---

# Custom serializers

```ts
// tests/setup.ts
expect.addSnapshotSerializer({
  test: (value) => value instanceof Money,
  serialize: (value: Money) => `Money<${value.format()}>`,
});
```

```js
{ "total": Money<€100.80> }     // instead of the internals of the class
```

- Decides **how** a value of a given kind is written in every snapshot
- Also as `snapshotSerializers: ['./tests/money-serializer.ts']` in the config
- Use it to hide noise — never to hide a difference that matters

---

# A good snapshot vs a bad one

| ✅ Good | ❌ Bad |
|---|---|
| **Small**: you read it whole in the review | 300 lines of HTML of a full page |
| **Stable**: same input, same output | Contains dates, ids, random order |
| **Meaningful**: a printed receipt, an error message, a serialised payload | The internal state of a component |
| **Reviewed** at creation and at every update | Updated with `-u` "to make CI green" |

<br />

- A snapshot is an **assertion you did not write** — the value is the spec
- If you cannot say what it should contain, an explicit `expect` is better

---

# Recap

- `toMatchSnapshot` → `.snap` file; `toMatchInlineSnapshot` → in the test;
  `toMatchFileSnapshot` → a real file, awaited
- First run **writes**, next runs **compare** — review the first write
- `-u` or `u` in watch mode to update — **after** reading the diff
- CI never writes: missing and obsolete snapshots fail
- Property matchers or determinism for ids and dates
- Small, stable, meaningful, reviewed

---

# Quiz — Question 1 / 3

**You add a test with `toMatchSnapshot()` and push without running it locally.
What happens on CI?**

- **A.** The snapshot is written and the test passes
- **B.** The test fails: the snapshot is missing, and CI does not write it
- **C.** The test is skipped
- **D.** The test passes, with a warning

<v-click>

> ✅ **B** — With `CI` set, Vitest never writes a snapshot: a missing one fails
> the run. Run the test locally, review the `.snap`, commit it.

</v-click>

---

# Quiz — Question 2 / 3

**A snapshot holds `"createdAt": 2026-10-22T09:14:03.120Z`. It fails on every
run. The best fix?**

- **A.** Run `vitest -u` before each commit
- **B.** Delete the `createdAt` field from the code
- **C.** A property matcher `createdAt: expect.any(Date)` — or freeze the clock
  with `vi.setSystemTime`
- **D.** `it.skip` the test

<v-click>

> ✅ **C** — A volatile value must be either **excluded** from the comparison
> (property matcher) or made **deterministic** (fake time). Updating it each
> time (**A**) makes a test that never fails.

</v-click>

---

# Quiz — Question 3 / 3

**A colleague's pull request updates 40 snapshots in one commit, message "fix
tests". What do you do?**

- **A.** Approve: snapshots are generated files
- **B.** Read the `.snap` diffs like code: each change must be wanted
- **C.** Ask to delete the snapshots
- **D.** Re-run CI until it passes

<v-click>

> ✅ **B** — An updated snapshot is a changed **expectation**. Forty of them at
> once deserve a review — or a question about why they are so big.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 4 - Snapshots
