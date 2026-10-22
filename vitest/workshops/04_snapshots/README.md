# TP 4 — Snapshots

> This TP is **autonomous**: it does not depend on any other TP. The till
> prints a ticket and records an order: two outputs too long to assert line by
> line. Snapshot them — and keep those snapshots worth reading.

## Goal

Chapter 4 — Capture an output, then review it:

- **`toMatchInlineSnapshot`**: Vitest writes the value into the spec itself
- **`toMatchFileSnapshot`**: a whole ticket, in a file of its own
- **`toMatchSnapshot`** with **property matchers** for what changes on every run
- **Update** a snapshot on purpose (`-u`, `u` in watch mode), and **review** the diff

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm test             # vitest run --coverage
npm run test:watch   # vitest, in watch mode — keep it open
npm run typecheck    # tsc --noEmit
```

Red on the starter: the todos run nothing, and coverage asks for 100 % of
`src/`. **Already done for you:** `src/order.ts`, `src/receipt.ts`,
`tests/fixtures.ts`.

## The workshop at a glance

| # | What you write | Where | Done when |
|---|---|---|---|
| 1 | Inline snapshots of the ticket | `tests/receipt.spec.ts` | Vitest wrote them, you read them |
| 2 | The coupon ticket, in a file | `tests/receipt.spec.ts` | `__snapshots__/receipt-with-coupon.txt` exists |
| 3 | The order, with property matchers | `tests/order.spec.ts` | Two runs in a row stay green |
| 4 | A deliberate change | `src/receipt.ts` | You updated the snapshots and reviewed the diff |

## Steps

### 1. The ticket, inline

`expect(formatReceipt(order)).toMatchInlineSnapshot()` — no argument. Save:
Vitest fills it in. **Read it**: a snapshot is only right if you checked it.

→ **Done when** two tests hold their ticket, and you checked the totals by hand.

### 2. The coupon ticket, in a file

`await expect(…).toMatchFileSnapshot('./__snapshots__/receipt-with-coupon.txt')`
— async, and the file opens as plain text.

→ **Done when** the file exists and shows the `Coupon SAVE10` row.

### 3. The order — `tests/order.spec.ts`

`toMatchSnapshot` fails on the second run: the id and the date change. Pass
`{ id: expect.any(String), createdAt: expect.any(Date) }` as first argument.

→ **Done when** `npm test` twice in a row is green, and `npm test` exits 0.

### 4. A deliberate change

Rename the shop in `src/receipt.ts`. The snapshots go red: read the diff, then
press `u` in watch mode (or `npx vitest run -u`). Put the name back afterwards.

→ **Done when** you can say what `CI=true` does to a missing snapshot.

## Definition of Done

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 twice in a row

**The behaviour is there**

- [ ] Every snapshot was read, not only written
- [ ] Nothing that changes on every run sits in a snapshot

**You can explain**

- [ ] When an inline, a file, or a `.snap` snapshot is the right one
- [ ] Why CI never writes a snapshot

## Going further

- Freeze time and ids instead of matching them: `vi.useFakeTimers`, and a
  stubbed `crypto.randomUUID`. Which version is easier to review?
- Add a custom serializer (`expect.addSnapshotSerializer`) that prints prices
  as euros in the `.snap` file.
