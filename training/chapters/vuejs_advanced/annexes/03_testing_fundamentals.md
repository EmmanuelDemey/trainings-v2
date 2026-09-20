---
layout: cover
---

# Annexe — Testing fundamentals

<div style="opacity: 0.75; font-size: 0.9em;">Deep dives — outside the three-day run</div>

---

# Why testing, here

You have just written your first composables — units with a contract, which is
exactly what a test suite is good at pinning down. Components come later
(chapter 7), and the same reasoning will apply to them.

- This chapter: **Vitest + `@vue/test-utils`** on components and composables in
  isolation. The application under test is **provided and working**, so the effort
  goes into the tests, not into the app
- Chapter 12, once router and Pinia are in play: testing a component **wired to the
  application** — router, stores, HTTP — and end-to-end with Cypress

> Everything you write from chapter 4 onwards is meant to be tested with what you
> learn here.

---

# Vitest is installed, and nobody writes tests

The most common state of a Vue codebase in production: the dependency is in
`package.json`, `npm run test` exists, and the suite is one `App.spec.ts` from the
scaffold.

The reasons are always the same, and none of them are about Vitest:

- *"Where do I even start?"* — 200 components, no obvious first one
- *"The component I need to test needs the store, the router and three API calls"*
- *"We'll do it in the next sprint"* — for eleven sprints

<br />

> Learning the tool is the easy half. The rest of this chapter is the order in
> which you introduce it into code that already exists.

---

# Start where the cost is lowest

The order that gets a suite off the ground, cheapest and most valuable first:

| # | What | Why first |
|---|---|---|
| 1 | **Pure functions** — formatting, computation, mappers | no mounting, no mocks, green in an afternoon |
| 2 | **Composables and stores** | they hold the rules that actually break; testable with no DOM |
| 3 | **Components with a bug history** | `git log --format= --name-only \| sort \| uniq -c \| sort -rn` — the top of that list is where bugs live |
| 4 | **One end-to-end journey** (chapter 12) | login → the main task → logout. Catches the integration breaks the unit tests never will |

<br />

- What **not** to start with: the biggest component, the newest feature, or a
  coverage target
- Untestable component? That is a **design** answer, not a testing one: pull the
  logic into a composable (chapter 14, step 2), then test the composable

---

# Pinning behaviour you no longer understand

A characterization test does not assert what the code *should* do — it records what
it **does**, so a refactor cannot change it silently.

```ts
it('formats the invoice label as it does today', () => {
  // 1. assert something deliberately wrong
  expect(formatInvoiceLabel(invoice)).toBe('?');
  // 2. run it, read the diff:
  //    Expected "?"  Received "FA-2024-018 — 1 240,00 € — overdue"
  // 3. paste the received value back in
});
```

- Write them **before** touching legacy code, not after
- Ugly output is fine — the test's job is to notice a change, not to approve of it
- Delete them once real tests cover the same behaviour

---

# The ratchet, not the target

Never set `lines: 80` on a codebase at 4 %. Set the threshold to **today's number**,
and let it only go up:

```ts
// vitest.config.ts
test: {
  coverage: {
    provider: 'v8',
    thresholds: { autoUpdate: true, lines: 4, functions: 6, branches: 3 },
  },
}
```

- `autoUpdate: true` rewrites the numbers upwards after each green run — the file
  is committed, so the ratchet is reviewed like any other change
- A PR that lowers coverage now fails on its own, with no team-wide policy meeting
- Watch **coverage on changed lines**, not global coverage: a 6 % codebase where
  every new line is tested is healthy; an 80 % one where nothing new is, is not

---

# Rules of engagement

Four sentences, agreed once, worth more than any tooling:

1. **Test on touch** — every bug fix ships with the test that reproduces it; every
   changed file leaves with a bit more coverage than it arrived with
2. **No big-bang** — there is no "testing sprint". The suite grows with the work
3. **A failing test blocks the merge** — a suite that can be ignored is deleted
   within a month, whatever the coverage says
4. **Flaky is worse than missing** — quarantine or delete a flaky test the day it
   flakes. One unreliable test discredits the whole suite

<br />

> Realistic first month, on a real project: the pure functions, the two most
> important stores, the three components you keep breaking. That is enough to make
> the next refactor safe — which is the point.

---

# Quiz — Question 1 / 2

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

# Quiz — Question 2 / 2

**Your project is at 4 % coverage. What do you put in `vitest.config.ts`?**

- **A.** `thresholds: { lines: 80 }` — the target the team agreed on
- **B.** `thresholds: { autoUpdate: true, lines: 4 }` — today's number, ratcheted up
- **C.** No threshold — coverage is a vanity metric
- **D.** `thresholds: { lines: 80 }`, with the failing check marked non-blocking

<v-click>

> ✅ **B** — A threshold you cannot meet is disabled within a week (**A**), and a
> check that cannot fail is decoration (**D**). The ratchet turns coverage into
> something that can only improve, one PR at a time — and what you really watch is
> coverage on the **lines you changed**.

</v-click>

