# Zod — Workshops (TP)

Hands-on exercises for the **Zod** training, based on **Zod 4.6**,
**TypeScript 7** and **Vitest 5**.

**One workshop per chapter**, and each one is a **standalone project**: its own
`package.json`, `tsconfig.json`, `.nvmrc` and `README.md`, its own `npm install`,
and not a single import from another workshop. There is no UI and no server:
each workshop is a few schemas and the specs that drive them.

```bash
cd 02_composition
npm install
npm run test:watch   # the specs, re-run on every save
npm run typecheck    # tsc --noEmit
```

## Before the session — check your machine

Run this **about a week before the training**, from this folder:

```bash
node check-env.mjs
```

It has no dependency to install: if it does not even start, Node.js is missing or too
old — and that is already the first thing to fix. It checks Node.js and npm versions,
Git, free disk space, and whether your network lets you reach the npm registry.

```bash
node check-env.mjs --install    # also run `npm install` in every workshop
node check-env.mjs --offline    # skip the network checks
node check-env.mjs --help
```

The `--install` run is the one that matters: doing it at home beats doing it on the
room Wi-Fi. It exits with code `1` if anything is blocking — in that case, **copy
the whole output and send it to your trainer** before the session.

## Toolchain versions

Dependencies were last refreshed on **2026-10-08**, to the latest release of every
package: `zod` 4.6, `typescript` 7.0 (the native port — `tsc` is the same
command, only faster), `vitest` 5.0, and `tsx` 4 for `npm start` in workshop 4.

Everything is **Zod 4**. If you come from Zod 3, three changes show up in the
very first workshop: the string formats are **top-level** (`z.email()`, not
`z.string().email()`), error messages go through one **`error`** param (not
`message`, `invalid_type_error`, `required_error`), and `z.record` with an enum
key is **exhaustive**.

The worked answer to every workshop lives in `solutions/`, one
runnable folder per workshop. Do not hand it out before the exercise.

## Workshops

| Chapter | Folder | Topic | Specs |
|---|--------|-------|-------|
| 1 | `01_schemas/` | `z.object`, string formats, `.default()`, `parse` vs `safeParse`, input vs output | 18 |
| 2 | `02_composition/` | `.omit` / `.pick` / `.partial` / `.extend`, discriminated unions, enum records, recursion | 27 |
| 3 | `03_transforms/` | `z.coerce`, `.transform` / `.pipe`, `.catch`, `.refine` / `.superRefine`, async, codecs | 28 |
| 4 | `04_boundaries/` | Environment, `z.prettifyError`, field errors from `path`, API responses | 21 |

> Each folder is a starter skeleton: implement the `// TODO` markers following the
> steps in its own `README.md`. The given specs are **red** on the starter, and
> `npm test` turning green is how you know you are done.

Every workshop README opens with **The workshop at a glance** — one row per step,
naming what you do, the file you open and how you know it worked — and ends with a
**Definition of Done**, a checklist of criteria you can verify yourself (a command
that exits 0, a behaviour a spec checks, a question you can answer). In between,
each step closes on a `→ **Done when**` line: the exit condition for that step
alone, so you never have to read ahead to know whether you can move on. Steps
marked *(Bonus)* and the "Going further" section are deliberately **outside** the
DoD: it is the floor, not the ceiling.

All four workshops share one domain — a **concert ticketing** app — but none of
them imports another: TP 2 gives you, done, the concert schema you write in TP 1.

## Node version

Every workshop targets **Node.js >= 22.22.2** (24.15+ recommended, and what
`.nvmrc` pins). Run `nvm use` in the workshop folder to
pick up the version from its `.nvmrc`.
