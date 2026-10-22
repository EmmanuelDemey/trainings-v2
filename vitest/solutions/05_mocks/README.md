# TP 5 — Mocks

> This TP is **autonomous**: it does not depend on any other TP. The checkout
> of the bookshop talks to a catalog service, a payment provider and a mailer,
> and holds books with a 15-minute timer. None of that may run for real in a
> test. Every spec file ships as a list of `test.todo`.

## Goal

Chapter 5 — Replace what you do not own, and nothing more:

- Stub a global (**`vi.stubGlobal('fetch', …)`**) and an env variable (**`vi.stubEnv`**)
- Mock a module with **`vi.mock`**: a factory with **`importOriginal`**, and a **`__mocks__`** folder
- Pass a **`vi.fn`** where the code takes a dependency as a parameter
- Spy on `console.error` with **`using`** and **`vi.spyOn`**
- Drive time with **fake timers**

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run --coverage
npm run test:watch   # vitest, in watch mode — keep it open
npm run typecheck    # tsc --noEmit
```

Red on the starter: coverage asks for 100 % of `src/` (the catalog service
excepted: it is always mocked). `vitest.config.ts` restores every mock, global
and env variable after each test.

## The workshop at a glance

| # | What you write | Where | Done when |
|---|---|---|---|
| 1 | `chargeCard` and `refund`, with `fetch` stubbed | `tests/payment.spec.ts` | No request leaves the machine |
| 2 | The URL from the environment | `tests/payment.spec.ts` | The stubbed URL is the one fetched |
| 3 | The catalog in `__mocks__` | `src/__mocks__/catalog-api.ts` | Two books, a 404 for the others |
| 4 | The payment module, partly mocked | `tests/checkout.spec.ts` | `chargeReference` is the real one |
| 5 | `checkout` | `tests/checkout.spec.ts` | Its six todos are green |
| 6 | `holdBooks`, with fake timers | `tests/checkout.spec.ts` | `npm test` exits 0 |

## Steps

### 1. `fetch` — `tests/payment.spec.ts`

`vi.stubGlobal('fetch', vi.fn(async () => Response.json({ … })))`. Assert the
URL and the body with `toHaveBeenCalledExactlyOnceWith` and
`expect.objectContaining`.

→ **Done when** the `chargeCard` and `refund` todos are green.

### 2. `PAYMENT_API_URL`

`src/config.ts` reads the variable **when it loads** — and the import at the top
of the spec already loaded it. `vi.stubEnv`, then `vi.resetModules()`, then
`await import('../src/payment')`.

→ **Done when** you can say why the order of those three lines matters.

### 3. The catalog — `src/__mocks__/catalog-api.ts`

Same exports as `src/catalog-api.ts`: a `fetchBook = vi.fn(…)` that knows Clean
Code (€39.90) and L'Étranger (€7.90), and throws `No book with ISBN …` for the
others. In the spec, `vi.mock('../src/catalog-api')` — no factory.

### 4. The payment module

`vi.mock('../src/payment', async (importOriginal) => ({ ...(await importOriginal()), chargeCard: vi.fn(…), refund: vi.fn(…) }))`.
`vi.mocked(chargeCard)` gives you the mock, typed.

### 5. `checkout`

The mailer is a parameter: `{ send: vi.fn(async () => {}) }`. For "keeps the
order when the mail fails": `mockRejectedValueOnce`, and
`using error = vi.spyOn(console, 'error').mockImplementation(() => {})`.

→ **Done when** the six `checkout` todos are green, and the output prints no error.

### 6. `holdBooks`

`vi.useFakeTimers()`, then `await vi.advanceTimersByTimeAsync(HOLD_DURATION_MS - 1)`:
nothing yet. One more millisecond: the refund. Restore real timers after each test.

→ **Done when** `npm test` exits 0, in well under a second.

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — 100 % coverage

**The behaviour is there**

- [ ] Unplug the network: `npm test` is still green
- [ ] `src/checkout.ts` itself is never mocked

**You can explain**

- [ ] Why `vi.mock` works although it is written below the imports
- [ ] `vi.fn` vs `vi.spyOn` vs `vi.mock`
- [ ] Why the mailer needs no `vi.mock` at all

## Going further

- Replace the `fetch` stub with **MSW** (`msw/node`): the code under test then
  makes real requests, to a fake server.
- Use `vi.mock('../src/payment', { spy: true })`: what still runs for real?
