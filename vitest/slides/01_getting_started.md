---
layout: cover
---

# 1 - Getting started

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** what each level of the test pyramid buys you, and what it costs
- **Place** Vitest among Jest, Playwright and Cypress
- **Install** Vitest, and configure it in `vitest.config.ts`
- **Write** and **run** a first test — in watch mode, once, filtered
- **Use** the IDE extension and the Vitest UI

---

# Why test?

- A test is a **program that checks another program** — it runs in seconds,
  every time, without getting bored
- It turns "I think it still works" into **a green run**
- It lets you **refactor**: change the inside, keep the behaviour
- It **documents** the behaviour — a spec that cannot go stale, since it runs
- It catches the bug **before** the user, the reviewer, or production

<br />

> A test that never fails is worth nothing. A test **earns its keep** the day it
> goes red for the right reason.

---

# The test pyramid

```
           /\
          /  \        End-to-end — few, slow, the whole app in a browser
         /----\
        /      \      Integration — several units together, a component and its children
       /--------\
      /          \    Unit — many, fast, one function or module in isolation
     /------------\
```

- **Unit**: milliseconds each, precise when they fail, blind to wiring bugs
- **Integration**: closer to what the user does, still fast in jsdom
- **End-to-end**: the real browser and the real backend — slow, flaky, but the only
  proof the whole thing works
- Vitest covers the first two levels — and, with **browser mode**, a real browser

---

# What a test framework must give you

- A **runner**: find the test files, run them, isolate them, report
- **Assertions**: `expect(actual).toBe(expected)`, readable failure messages
- A **watch mode**: re-run what changed, as you type
- **Mocks**, spies, fake timers
- **Snapshots**: capture an output, compare it next time
- **Coverage**: which lines did the tests run?
- **TypeScript** and **ES modules** out of the box — no Babel, no `ts-jest`

---

# The ecosystem

| Tool | Level | Notes |
|---|---|---|
| **Jest** | unit, integration | The historical standard. Its API is what Vitest copied |
| **Vitest** | unit, integration, browser | Runs on **Vite**: same config, same plugins, same transforms as the app. ESM and TS native |
| **Playwright** | end-to-end, component | Drives Chromium, Firefox, WebKit. Also the engine of Vitest's browser mode |
| **Cypress** | end-to-end, component | In-browser runner, great DX, Chromium-family first |

<br />

👉 **Vitest** for this training: Jest-compatible API, the speed of Vite, and the
configuration your Vite app already has.

---

# JavaScript reminders — npm scripts and npx

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage"
  }
}
```

```bash
npm test                    # the one script npm runs without `run`
npm run test:watch
npm test -- -t "coupon"     # everything after `--` goes to vitest
npx vitest --version        # the local binary, from node_modules/.bin
```

- A script finds the binaries of `node_modules/.bin` — no global install
- `npx` does the same from the terminal: the **project's** version, not yours

---

# JavaScript reminders — modules

```ts
// CommonJS — older Node code
const { total } = require('./cart');
module.exports = { total };

// ES modules — what Vitest runs natively
import { total } from './cart';
export const total = (lines: Line[]) => /* … */;
```

```ts
// A dynamic import is a Promise: the module is loaded when the line runs
const { checkout } = await import('./checkout');
```

- Static `import`s run **before** any line of the file — remember that for `vi.mock`
- A module is evaluated **once**, then cached — remember that for `vi.doMock`
- `"type": "module"` in `package.json` makes `.js` files ESM

---

# Install

```bash
# A new Vue project — Vitest is one of the options of the wizard
npm create vue@latest

# An existing project
npm install -D vitest
```

<br />

- Vitest 5 needs **Node.js >= 22.12** and **Vite 6, 7 or 8** — a peer
  dependency, installed with it if absent
- No Vite app? Vitest still works, for plain Node or library code: Vite is only
  its engine
- For the TypeScript checks of the test files, add `"types": ["vitest/globals"]`
  only if you enable `globals` — otherwise import from `'vitest'`

---

# `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts', 'tests/**/*.spec.ts'],
    environment: 'node',     // or 'jsdom' / 'happy-dom' for DOM code
    globals: false,          // true: describe / it / expect without import
  },
});
```

- No `vitest.config.ts`? Vitest reads the `test` key of **`vite.config.ts`**
- A `vitest.config.ts` **wins** over `vite.config.ts` — use `mergeConfig` to reuse
  the app's plugins and aliases
- Default `include`: `**/*.{test,spec}.?(c|m)[jt]s?(x)`

---

# A first test

```ts
// src/price.ts
export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}
```

```ts
// src/price.spec.ts
import { describe, expect, it } from 'vitest';
import { formatPrice } from './price';

describe('formatPrice', () => {
  it('formats cents as euros, with two decimals', () => {
    expect(formatPrice(1250)).toBe('€12.50');
  });
});
```

```text
 ✓ src/price.spec.ts (1 test) 2ms
   ✓ formatPrice > formats cents as euros, with two decimals

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

---

# The CLI

```bash
vitest                       # watch mode in a terminal…
vitest run                   # …one run, then exit: what CI does
vitest price                 # only the files whose path contains "price"
vitest -t "two decimals"     # only the tests whose name matches
vitest run --coverage        # with a coverage report
vitest --ui                  # the web UI
vitest related src/cart.ts   # the tests that import this file
```

- `vitest` alone is **watch** mode — unless `process.env.CI` is set, or stdin is
  not a TTY: then it runs once
- In watch mode: `a` re-runs all, `f` the failed ones, `p` filters by file, `t`
  by name, `u` updates the snapshots, `q` quits
- Watch mode re-runs **only the tests affected** by the file you saved — it
  follows the import graph

---

# IDE extension

**VS Code**: the official *Vitest* extension (`vitest.explorer`)

- Every test in the **Testing** sidebar, and a ▶ next to each `it`
- Run, debug, watch one test from the editor
- The failure message **inline**, on the line that threw
- Coverage gutters

**WebStorm / IntelliJ**: Vitest support is built in — the same ▶ gutters.

---

# Vitest UI

```bash
npm install -D @vitest/ui
npx vitest --ui
```

- A web page next to the watch mode: the tree of files and tests, their status
- Filter, search, re-run one test
- The **source**, the **error** and its diff, the **console** of each test
- The **module graph**: what each test file imports
- With `--coverage`, the HTML coverage report in a tab

---

# Recap

- Many **unit** tests, fewer **integration** tests, a handful of **end-to-end** ones
- Vitest: the **Jest API**, on **Vite** — ESM and TypeScript with no extra step
- `vitest.config.ts` (or `test` in `vite.config.ts`): `include`, `environment`, `globals`
- `vitest` watches, `vitest run` runs once — and CI is detected
- Filter by **file** (positional) or by **name** (`-t`)

---

# Quiz — Question 1 / 3

**Your project has a `vite.config.ts` with the Vue plugin and an `@` alias. You
add a `vitest.config.ts` with only a `test` key. What happens?**

- **A.** Vitest merges the two files
- **B.** Vitest uses `vitest.config.ts` only: no Vue plugin, no alias
- **C.** Vitest uses `vite.config.ts` and ignores the other one
- **D.** Vitest fails: two config files

<v-click>

> ✅ **B** — `vitest.config.ts` takes priority, and nothing is merged for you.
> Import the Vite config and use `mergeConfig(viteConfig, defineConfig({ test: … }))`,
> or keep a single file.

</v-click>

---

# Quiz — Question 2 / 3

**On the CI server, the `test` script is `vitest`. What does it do?**

- **A.** It starts the watch mode and the job never ends
- **B.** It runs the tests once and exits, because `CI` is set
- **C.** It fails: watch mode needs a TTY
- **D.** It runs nothing until a file changes

<v-click>

> ✅ **B** — Vitest falls back to a single run when `process.env.CI` is set or
> the terminal is not interactive. Writing `vitest run` in the script makes it
> explicit, and is what most projects do.

</v-click>

---

# Quiz — Question 3 / 3

**You want to run only the test named "applies the coupon", in any file. Which
command?**

- **A.** `vitest coupon`
- **B.** `vitest -t "applies the coupon"`
- **C.** `vitest --project coupon`
- **D.** `vitest related coupon`

<v-click>

> ✅ **B** — `-t` (`--testNamePattern`) filters on the **test name**. The
> positional argument (**A**) filters on the **file path**; `--project` picks a
> project; `related` takes source files.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 1 - Getting started
