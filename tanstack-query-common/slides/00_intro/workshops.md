# The workshops — one app, all day

An **issue tracker**: a list of issues with filters, a detail panel, a
paginated table, an activity feed, a creation form, close / reopen buttons.

<div style="display: flex; gap: 2em;">
<div>

### The data

- **42 issues**, ids 1 → 42, every third one **closed**: 28 open, 14 closed
- Issue #1: *"Checkout button does nothing on Safari"*
- A new issue gets id **43**
- **34 activity events**, newest first, served 10 at a time with a **cursor**

</div>
<div>

### The API (`src/api/fakeApi.ts`)

```ts
fetchIssues(filter)        // GET /issues?status=open
fetchIssuePage(page)       // GET /issues?page=2
fetchIssue(id)             // GET /issues/3
fetchActivity(cursor)      // GET /activity?cursor=10
createIssue({ title })     // POST /issues
updateIssue(id, patch)     // PATCH /issues/3
deleteIssue(id)            // DELETE /issues/3
```

</div>
</div>

- An **in-memory fake server**, framework-free: every call waits **400 ms**,
  returns a **copy**, and rejects with an `ApiError` (`status`, `message`)
- The same file in the React, Angular and Vue workshops — synced, **never edit it**

---

# The Network panel

At the bottom of every workshop page — the fake server's own devtools:

| What you see / touch | What it is for |
|---|---|
| **Every request**, grouped by label, with a `3×` counter | Count what the app really sends |
| A **duplicate `GET` in red** | Two components asking separately: the bug of workshop 01 |
| `· 1 in flight`, `· 1 failed` | A request still waiting, or one that failed |
| **Latency**: 0 / 400 / 1500 / 3000 ms | Slow the server down to *see* loading vs fetching, races, placeholders |
| **The server refuses every write** | Every `POST` / `PATCH` / `DELETE` fails with a 500 — test your error paths and rollbacks |
| **Fail the next request** | The next call, whatever it is, fails with a 503 — retries, error states |
| **Another user closes an issue** | Changes the data **behind the app's back** — only a refetch shows it |
| **Clear the log** | Start counting again |

<br />

> The panel only shows what reaches the **server**. A screen that updates with
> **no new line** in the panel was served by the **cache**.

<style>
table { font-size: 0.85em; }
</style>

---

# How a workshop works

```bash
cd workshops/01_first_queries
npm install
npm run dev          # the app, with the Network panel
npm run test:watch   # the given specs, red on the starter — keep them open
npm run typecheck
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

- Written with **Testing Library** and **Vitest**, the **same for the three
  frameworks**: they read the page (`data-testid`) and the requests the fake
  server received — never the code
- **Keep the test ids** exactly as given
- Red → green, step by step: each `describe` is one step of the `README`

</div>
</div>

---

# Definition of done

A workshop is done when:

1. `npm test` is **green** — every given spec passes
2. `npm run typecheck` passes — no `any` to silence the compiler
3. The **Network panel** shows what the step promised: no duplicate in red,
   no request where the cache should answer
4. You can **explain** each change to your neighbour — *why* this option, not
   just *that* it makes the test pass

<br />

- **Bonus** steps are for the fast ones — they are in the `README`, and the
  solution has them
- Stuck for more than 5 minutes? **Ask.** Then peek at the solution — one
  file, not the whole folder
- Workshop **06** has no given spec: you **write** the tests
