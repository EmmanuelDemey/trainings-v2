# TP 10 — Trainer notes

Not part of the exercise booklet. Facilitation, the defects planted in the
skeleton, and reference solutions.

## Shape of the session

Optional half-day, usually run at the end of day 3 or as a follow-up session two
weeks later. The follow-up version works better: people come back with questions
from their own codebase, and the review round has somewhere to land.

**Pairing.** Mix levels inside each pair, mix companies across the review ring.
Odd number of pairs: you take a review slot yourself — do not let a pair review
its own neighbour twice.

**The ring.** Write it on the board before the freeze: `A → B → C → A`. Reviews
run in both directions at once, so nobody waits and nobody reviews the pair that
is reviewing them (that turns into a negotiation).

**Timekeeping is the whole job.** The three moments that slip:

| Moment | What happens if you let it slide |
|---|---|
| Freeze at 2:00 | Pairs keep coding, reviewers review a moving target, the round dies |
| "Run before read" at 2:10 | Reviewers open the editor first, spend 45 minutes on naming |
| Restitution at 2:55 | Authors start defending, the second pair never gets its 5 minutes |

Announce each one out loud. For the restitution, hold the authors to
"agreed / disagreed and why / already knew" — it is artificial, and it is the
only thing that keeps five minutes to five minutes.

**Shorter version (2h).** Core steps 1, 2 and 3 only, 1h of build, 30 min of
review, 20 min of restitution, 10 min of debrief. Drop steps 4 to 7 from the
Definition of Done and say so at the start — a pair that discovers mid-way that
half the brief was decoration stops trusting the brief.

## What the skeleton already gets wrong, on purpose

Say this once at the kickoff: *"the provided code is ordinary code, and some of
it has ordinary defects."* Do not say which. These are the ones planted, in
descending order of how often they are found:

| # | Where | The defect | How it shows up |
|---|-------|-----------|-----------------|
| 1 | `src/views/InvoicesView.vue` | The visible list is maintained by a `watch` on `[statusFilter, loading]` instead of a `computed` | A status change or a creation does not appear until the filter is touched. Usually found by running, not by reading. |
| 2 | `src/components/InvoiceTable.vue` | `v-for … :key="index"` | Filter, then change a status: the wrong row updates. Chapter 1 material, and the one people *say* they know. |
| 3 | `src/components/InvoiceTable.vue` | The status `<select>` has no accessible name | Only found by the pairs that actually tab through the table. |
| 4 | `.env` + `src/views/HomeView.vue` | `VITE_BILLING_API_KEY` is a `sk_live_…` value, masked in the UI and complete in the bundle | `grep -r sk_live dist/`. The masking makes it worse, not better — that is the point. |
| 5 | `src/api/fakeApi.ts` | `createInvoice` trusts the client on everything except the reference | Only the pairs that think about server-side validation raise it. |

If nobody finds #1 or #2 during the round, do not hand them over — ask the
question that leads there in the debrief ("who changed a status while a filter
was on?"). A finding someone reaches themselves at 3:20 is worth three you
announced at 2:55.

## Reference solutions

Not the only correct answers. Use them to unblock a pair, not to grade one.

### 1. `useAsyncData`

```ts
let current: AbortController | null = null;

async function refresh(): Promise<void> {
  current?.abort();
  const controller = new AbortController();
  current = controller;

  loading.value = true;
  error.value = null;

  try {
    const result = await fetcher(controller.signal);
    if (controller !== current) return;      // a stale answer never wins
    data.value = result;
  } catch (e) {
    if (controller !== current) return;
    if ((e as Error).name === 'AbortError') return;
    error.value = e as Error;
  } finally {
    if (controller === current) loading.value = false;
  }
}

onScopeDispose(() => current?.abort());
```

The two lines people miss: the guard inside `catch` (an aborted request that
rejects late clears the error of the live one) and the guard inside `finally`
(the classic "spinner disappears while the request is still running").

### 2. The store

```ts
const byId = ref<Record<number, Invoice>>({});
const ids = ref<number[]>([]);

const all = computed(() => ids.value.map((id) => byId.value[id]));
const countByStatus = computed(() =>
  all.value.reduce(
    (acc, invoice) => ({ ...acc, [invoice.status]: acc[invoice.status] + 1 }),
    { draft: 0, sent: 0, paid: 0, late: 0 } as Record<InvoiceStatus, number>,
  ),
);
const outstandingTotal = computed(() =>
  all.value.filter((i) => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0),
);

function find(id: number): Invoice | undefined {
  return byId.value[id];
}

function upsert(invoice: Invoice): void {
  if (!(invoice.id in byId.value)) ids.value.push(invoice.id);
  byId.value[invoice.id] = invoice;
}

async function load(signal?: AbortSignal): Promise<void> {
  const invoices = await apiFetchAll(signal);
  byId.value = Object.fromEntries(invoices.map((i) => [i.id, i]));
  ids.value = invoices.map((i) => i.id);
}

async function setStatus(id: number, status: InvoiceStatus): Promise<void> {
  const invoice = find(id);
  if (!invoice) throw new Error(`Invoice ${id} not found`);

  const previous = invoice.status;
  upsert({ ...invoice, status });               // optimistic
  try {
    upsert(await apiUpdateStatus(id, status));  // the server is the truth
  } catch (e) {
    upsert({ ...invoice, status: previous });   // rollback
    throw e;                                    // …and say so
  }
}
```

### 3. The guard

```ts
router.beforeEach(async (to) => {
  const auth = useAuthStore();          // inside the guard: Pinia exists by now
  await auth.restoreSession();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.roles && !to.meta.roles.some((role) => auth.hasRole(role))) {
    return { name: 'forbidden' };
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'invoices' };
  }
  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — Billing` : 'Billing';
});
```

And the redirect, in `LoginView.vue`:

```ts
const raw = route.query.redirect;
// A single leading slash: '/invoices' yes, '//evil.com' and 'https://evil.com' no.
const target = typeof raw === 'string' && /^\/(?!\/)/.test(raw) ? raw : null;
await router.replace(target ?? { name: 'invoices' });
```

### 4. The schema

```ts
export const invoiceSchema = z.object({
  number: z.string().regex(/^INV-\d{4}$/, 'Use the INV-1234 format'),
  customer: z.string().trim().min(2, 'At least 2 characters').max(60, 'At most 60 characters'),
  amount: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() !== '' ? Number(value.replace(',', '.')) : value),
    z.number({ invalid_type_error: 'Enter an amount' })
      .positive('Must be positive')
      .max(1_000_000, 'Too large')
      .multipleOf(0.01, 'Two decimals at most'),
  ),
  dueDate: z
    .string()
    .date('Use YYYY-MM-DD')
    .refine((value) => value >= new Date().toISOString().slice(0, 10), 'Cannot be in the past'),
});

export function toFieldErrors(error: z.ZodError): Partial<Record<keyof InvoiceInput, string>> {
  const result: Partial<Record<keyof InvoiceInput, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof InvoiceInput;
    if (key && !result[key]) result[key] = issue.message;   // first message wins
  }
  return result;
}
```

`z.coerce.number()` is the tempting one-liner, and it turns `''` into `0` —
a form that silently accepts an empty amount as zero. That is worth two minutes
at the debrief: coercion is a decision about *what the empty string means*.

## Common findings, and what to do with each

| Finding a pair receives | Where to take it |
|---|---|
| "Your `loading` flickers" | The `finally` guard. Chapter 3, and the reason the spec has that test. |
| "Your rollback is silent" | Rethrow vs swallow. Who owns the message — the store or the view? |
| "Your guard is `async` but does not `await restoreSession`" | Hard refresh on a protected route. Demonstrate it live. |
| "You catch every error in the boundary" | What a boundary does *not* catch: event handlers, `setTimeout`. Chapter 8bis. |
| "Your two tests test the framework" | Behaviour vs implementation. Ask what breaks in production if the test goes red. |
| "You should use `KeepAlive` / a data loader / Nuxt" | Out of scope, and a good example of the review smell "I would have built it differently". Name it as such — kindly. |

## Debrief

Fifteen minutes, and the four questions in the README. The one that pays:
**"what did you change in your own code while reviewing someone else's?"** —
almost every pair has an answer, and it is the argument for code review that no
slide makes as well.

Close on the transposition: which two axes of the grid belong in their team's
pull-request template on Monday. Two, not six.
