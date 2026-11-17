# Quiz — Question 1 / 3

**Under `exactOptionalPropertyTypes`, `ReportOptions` has `currency?: string`.
Which value is refused?**

- **A.** `{}`
- **B.** `{ currency: 'EUR' }`
- **C.** `{ currency: undefined }`
- **D.** None of them

<v-click>

> ✅ **C** — An optional property may be **absent**, not **present and
> `undefined`**. The difference shows in a spread: `{ currency: 'EUR', ...options }`
> keeps `'EUR'` for `{}`, and loses it for `{ currency: undefined }`.

</v-click>

---

# Quiz — Question 2 / 3

**A project references another with `tsc -b`. What is the cli checked against?**

- **A.** The `.ts` sources of the core
- **B.** The `.d.ts` emitted by the core's build
- **C.** The `.js` emitted by the core's build
- **D.** Nothing: references switch the check off

<v-click>

> ✅ **B** — The referenced project is built first, and its **declarations** are
> what the referencing project sees. That is why `composite` requires them, and
> why a second `tsc -b` with nothing changed does nothing.

</v-click>

---

# Quiz — Question 3 / 3

**`npm test` runs with Vitest, `npm start` with `node src/main.ts`. A type
error slips into a file. Which command fails?**

- **A.** Both
- **B.** `npm test` only
- **C.** `npm start` only
- **D.** Neither — only `tsc` checks types

<v-click>

> ✅ **D** — Vitest and Node.js **strip** the types and run what is left. Only
> `tsc` (or `vitest --typecheck` for its `*.test-d.ts` files) checks them: keep
> `tsc --noEmit` as a step of its own in CI.

</v-click>
