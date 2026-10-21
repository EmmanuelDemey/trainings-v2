---
layout: cover
---

# 10 - Tooling

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Configure** `tsconfig.json` beyond `strict`, and share options with `extends`
- **Split** a code base into project references, and build it with `tsc -b`
- **Diagnose** a slow or surprising compilation: `--showConfig`, `--listFiles`,
  `--extendedDiagnostics`, `--generateTrace`
- **Add** type-aware linting with typescript-eslint
- **Test** types as well as values, with Vitest's `expectTypeOf`
- **Choose** how to run TypeScript: `tsc`, Node.js type stripping, tsx, a bundler

---

# How `tsc` works

- **Scanner** — the source text into a stream of tokens
- **Parser** — the tokens into an Abstract Syntax Tree (AST)
- **Binder** — connects declarations and their uses: symbols and scopes
- **Checker** — the types: by far the biggest and slowest part
- **Emitter** — the JavaScript, the `.d.ts`, the source maps

<br />

- **TypeScript 7** is a **native port** of that compiler, written in Go:
  same command, same options, same errors — about **10× faster**, in parallel
- The editor's language service runs on the same native code

---

# `tsconfig.json` — the essentials

```jsonc
{
  "compilerOptions": {
    "target": "es2023",              // the syntax emitted
    "lib": ["es2023", "dom"],        // the APIs that exist at run time
    "module": "nodenext",            // or "preserve" for a bundler
    "types": ["node"],               // the global @types loaded
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- `target` changes the **syntax** emitted — never the APIs: that is `lib`
- `npx tsc --init` writes a commented one, with today's recommended defaults

---

# Beyond `strict`

`strict` turns on `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`,
`strictBindCallApply`, `strictPropertyInitialization`, `useUnknownInCatchVariables`,
`alwaysStrict`… but **not**:

```ts
// noUncheckedIndexedAccess
const sales: Sale[] = [];
sales[0].sku;        // ❌ 'sales[0]' is possibly 'undefined'

// exactOptionalPropertyTypes
interface ReportOptions { currency?: string }
const options: ReportOptions = { currency: undefined };   // ❌
```

- `{ currency: undefined }` and `{}` are **not** the same: the first one
  **overrides** a default in `{ currency: 'EUR', ...options }`
- Also worth a look: `noImplicitOverride`, `noFallthroughCasesInSwitch`,
  `noPropertyAccessFromIndexSignature`

---

# Inspecting the compiler

```bash
npx tsc --showConfig        # the effective options — extends resolved
npx tsc --listFiles         # every file in the program, lib.*.d.ts included
npx tsc --explainFiles      # … and why each one is there
```

```bash
npx tsc --extendedDiagnostics
```

```
Files:                         90
Lines of TypeScript:           83
Lines of Definitions:       41210
Parse time:                 0.12s
Bind time:                  0.05s
Check time:                 0.64s
Emit time:                  0.00s
Total time:                 0.83s
```

- A big **Files** count, for a small project? Look at `types` and `include`

---

# Finding a slow type

```bash
npx tsc --generateTrace trace
npx @typescript/analyze-trace trace
```

- `--generateTrace` writes a trace of the checker — open it in
  `chrome://tracing` or [Perfetto](https://ui.perfetto.dev)
- `@typescript/analyze-trace` lists the **hot spots**: the files and the types
  that cost the most
- Usual suspects: huge unions, deep recursive conditional types, inference over
  big object literals, a barrel file re-exporting everything

---

# Project references

```
tsconfig.json              { "files": [], "references": [core, cli] }
tsconfig.base.json         the shared options
packages/core/tsconfig.json   { "extends": …, "composite": true }
packages/cli/tsconfig.json    { "extends": …, "composite": true,
                                "references": [{ "path": "../core" }] }
```

```bash
npx tsc -b            # builds core, then cli — only what changed
npx tsc -b --verbose  # … and says why
npx tsc -b --clean
```

- **`composite`**: `rootDir`, declarations, and a `.tsbuildinfo` to know what changed
- The cli is checked against `core`'s **`.d.ts`** — not its sources: faster, and
  a real boundary between packages
- `incremental: true` gives a single project the same `.tsbuildinfo` cache

---

# Linting — typescript-eslint

```js
// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  { languageOptions: { parserOptions: { projectService: true } } },
);
```

- **Type-aware** rules use the checker — what `tsc` accepts, they still catch:

```ts
save(user);                         // no-floating-promises: a forgotten await
if (user.name) { … }                // no-unnecessary-condition: `name` is never empty
const total = items.reduce(…) as any;   // no-unsafe-assignment
```

- Biome and oxlint lint faster, with fewer type-aware rules

---

# Testing — values and types

```ts
import { describe, expect, expectTypeOf, test } from 'vitest';

test('topSeller finds the biggest sale', () => {
  expect(topSeller(sales)).toBe('lamp');
});

test('topSeller may find nothing', () => {
  expectTypeOf(topSeller).returns.toEqualTypeOf<string | undefined>();
});

test('average needs amounts', () => {
  // @ts-expect-error — `amount` is missing
  average([{ sku: 'pen' }]);
});
```

- Vitest runs TypeScript as is — Jest needs `ts-jest` or a Babel / swc transform
- `vitest --typecheck` runs `*.test-d.ts` files **through the checker**: a type
  assertion that does not hold fails the test
- A library's types are part of its API: test them

---

# Documentation — TSDoc & TypeDoc

```ts
export class Statistics {
  /**
   * Returns the average of two numbers.
   *
   * @remarks
   * Part of the {@link Statistics} subsystem.
   *
   * @param x - The first input number
   * @param y - The second input number
   * @returns The arithmetic mean of `x` and `y`
   * @beta
   */
  static average(x: number, y: number): number {
    return (x + y) / 2;
  }
}
```

- **TSDoc** standardises the tags: read by the editor's tooltips, and by tools
- **TypeDoc** turns them into a site: `npx typedoc src/index.ts`

---

# Running TypeScript

| | Checks types | Runs | Notes |
|---|---|---|---|
| `tsc` | ✅ | — | emits `.js` and `.d.ts` |
| `node file.ts` | ❌ | ✅ | type stripping: **erasable syntax only** |
| `tsx file.ts` | ❌ | ✅ | esbuild: `enum`, decorators… |
| Vite, esbuild, swc | ❌ | bundles | one file at a time |
| Deno, Bun | ❌ | ✅ | TypeScript built in |

- Only `tsc` **checks**: everything else **strips** and runs
- So the type check is a **step of its own**: `tsc --noEmit` in CI and in a
  pre-commit hook, next to the tests

---

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

---
layout: cover
---

# Hands-on

## Workshop 10 - Tooling

---
src: ./shared/retro.md
---
