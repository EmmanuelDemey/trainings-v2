# TypeScript — Workshops (TP)

Hands-on exercises for the **TypeScript** training, based on **TypeScript 7**,
**Node.js 24** and **Vitest 5**.

**One workshop per chapter**, and each one is a **standalone project**: its own
`package.json`, `tsconfig.json`, `.nvmrc` and `README.md`, its own `npm install`,
and not a single import from another workshop. There is no UI: each workshop is
a little code and the specs that drive it.

```bash
cd 02_everyday_types
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

Dependencies were last refreshed on **2026-10-21**, to the latest release of every
package: `typescript` 7.0 (the native port — `tsc` is the same command, only
faster), `vitest` 5.0, `@types/node` 24, plus `tsx` 4 and `esbuild` 0.28 in
workshop 8, whose decorators Node.js cannot run as is.

## Two kinds of specs

- **`tests/*.spec.ts`** — runtime specs: they call your code and check what it returns
- **`tests/*.test-d.ts`** — **type specs**: they never run, Vitest type checks them.
  `expectTypeOf<Draft>().toEqualTypeOf<…>()` fails when your type is not the
  expected one

`npm test` runs both (`vitest run --typecheck`). The type specs are left out of
`tsconfig.json` on purpose — they are checked through `tsconfig.test.json` —
so `npm run typecheck` stays about **your** code.

## Workshops

| Chapter | Folder | Topic | Specs |
|---|--------|-------|-------|
| 1 | `01_getting_started/` | Running vs checking, `tsconfig.json`, `strict`, annotations | 10 |
| 2 | `02_everyday_types/` | Interfaces, `as const`, `satisfies`, tuples, overloads, `unknown`, `using` | 27 |
| 3 | `03_classes/` | `implements`, abstract classes, `#private`, accessors, `static`, custom errors | 34 |
| 4 | `04_unions_narrowing/` | Discriminated unions, narrowing, `never`, type guards, assertion functions | 31 |
| 5 | `05_generics/` | Generic functions and classes, constraints, `keyof`, `NoInfer` | 27 |
| 6 | `06_utility_types/` | `typeof`, `Partial` / `Pick` / `Omit` / `Record`, `ReturnType`, `Awaited` | 21 |
| 7 | `07_type_level/` | Mapped, conditional, template literal, recursive and branded types | 22 |
| 8 | `08_decorators/` | Standard decorators, factories, `context`, metadata | 13 |
| 9 | `09_modules/` | Declaration files, module augmentation, `declare global`, building a package | 16 |
| 10 | `10_tooling/` | Beyond `strict`, `extends`, project references, `tsc -b` | 18 |

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

The worked answer to every workshop lives in `solutions/`, one
runnable folder per workshop. Do not hand it out before the exercise.

## Node version

Every workshop targets **Node.js >= 22.22.2** (24.15+ recommended, and what
`.nvmrc` pins). Run `nvm use` in the workshop folder to
pick up the version from its `.nvmrc`.
