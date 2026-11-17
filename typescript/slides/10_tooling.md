---
layout: cover
---

# 10 - Tooling

---
src: ../../typescript-common/slides/10_tooling/learning-objectives.md
---

---
src: ../../typescript-common/slides/10_tooling/how-tsc-works.md
---

---

# `tsconfig.json` — the essentials

```jsonc
{
  "compilerOptions": {
    "target": "es2025",              // the syntax emitted — the default
    "lib": ["es2025", "dom"],        // the APIs that exist at run time
    "module": "nodenext",            // or "preserve" for a bundler — default: esnext
    "types": ["node"],               // the global @types loaded — default: none
    "strict": true,                  // the default, written for the reader
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
- typescript-eslint uses the compiler API, absent from TypeScript 7.0: alias
  6.0 next to it — `"typescript": "npm:@typescript/typescript6@^6.0.2"`,
  `"@typescript/native": "npm:typescript@^7.0.2"`

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
src: ../../typescript-common/slides/10_tooling/running-typescript.md
---

---
src: ../../typescript-common/slides/10_tooling/quiz.md
---

---
layout: cover
---

# Hands-on

## Workshop 10 - Tooling

---
src: ../../typescript-common/slides/retro.md
---
