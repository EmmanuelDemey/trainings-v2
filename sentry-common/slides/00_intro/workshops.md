# The workshops — one product, all day

An **issue tracker** — the React track instruments its **web app**, the NestJS
track its **API**. Both have **bugs on purpose**:

<div style="display: flex; gap: 2em;">
<div>

### Issue #7

- Its `assignee` is `null` — the code assumes it never is
- React: the detail panel **crashes** while rendering

### Issues #13 and #14

- The server answers **500** — the database connection is lost
- NestJS: the repository throws a `DatabaseError` with code `ECONNRESET`

</div>
<div>

### Not bugs, noise

- A **404** on an unknown issue, a **400** on an invalid form — expected, the
  user's doing, *never* a Sentry issue
- `ResizeObserver loop…` in the browser — harmless, sent by thousands

### Not yours

- The avatars come from a **third-party CDN** — it must never see your trace
  headers

</div>
</div>

---

# How a workshop works

```bash
cd workshops/01_first_errors
npm install
npm run test:watch   # the given specs, red on the starter — keep them open
```

<div style="display: flex; gap: 2em;">
<div>

### Starter and solution

- Each workshop is a **standalone** project: its own `package.json`, its own
  `README.md` with the steps
- `workshops/NN_*` — the **starter**, where you work: it runs, it typechecks,
  and its **specs are red**
- `solutions/NN_*` — the reference: green specs, to compare **after** trying

</div>
<div>

### The given specs

- They start the SDK with **your** `initSentry()` — your options apply — but
  with a **fake transport** that records the envelopes in memory
- They assert on **what would reach Sentry**: events, tags, users, spans,
  check-ins, logs — never on your code
- `src/tests/shared/` is a **copy**, rewritten by the sync — never edit it

</div>
</div>

---

# Definition of done

A workshop is done when:

1. `npm test` is **green** — every given spec passes
2. `npm run typecheck` passes — no `any` to silence the compiler
3. **Spotlight** shows what the step promised: the error, its tags, its trace
4. You can **explain** each change to your neighbour — *why* this option, not
   just *that* it makes the test pass

<br />

- **Bonus** steps are for the fast ones — they are in the `README`, and the
  solution has them
- Stuck for more than 5 minutes? **Ask.** Then peek at the solution — one
  file, not the whole folder
