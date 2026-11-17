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
// tsconfig.app.json — a Vite + React app
{
  "compilerOptions": {
    "target": "es2025",                     // the syntax emitted — the default
    "lib": ["es2025", "dom", "dom.iterable"],   // the APIs that exist in the browser
    "module": "preserve",                   // a bundler resolves the imports
    "jsx": "react-jsx",                     // <App /> → jsx(App, {}), no `import React`
    "types": ["vite/client"],               // import.meta.env, `import logo from './logo.svg'`
    "strict": true,                         // the default, written for the reader
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- `target` changes the **syntax** emitted — never the APIs: that is `lib`
- `npm create vite@latest -- --template react-ts` writes one, with today's recommended defaults

---

# Beyond `strict`

`strict` turns on `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`,
`strictBindCallApply`, `strictPropertyInitialization`, `useUnknownInCatchVariables`,
`alwaysStrict`… but **not**:

```tsx
// noUncheckedIndexedAccess
function TopSale({ sales }: { sales: Sale[] }) {
  return <p>{sales[0].sku}</p>;   // ❌ Object is possibly 'undefined'
}

// exactOptionalPropertyTypes
interface ReportProps { currency?: string }
<Report currency={undefined} />;   // ❌
```

- `currency={undefined}` and no `currency` are **not** the same: the first one
  **overrides** a default in `{ currency: 'EUR', ...props }`
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
npx tsc -p tsconfig.app.json --extendedDiagnostics
```

```
Files:                        103
Lines of TypeScript:           87
Lines of Definitions:       88691
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
  big object literals, a barrel file re-exporting everything — or a
  `styled-components` theme, a router's typed routes, an icon library

---

# Project references

```
tsconfig.json        { "files": [], "references": [app, node] }
tsconfig.app.json    src/ — the browser:   lib dom, types ["vite/client"], jsx
tsconfig.node.json   vite.config.ts — Node.js: no dom, types ["node"]
packages/ui/tsconfig.json   { "composite": true } — a component library,
                            referenced by the app: { "path": "./packages/ui" }
```

```bash
npx tsc -b            # checks each project with its own options — only what changed
npx tsc -b --verbose  # … and says why
npx tsc -b --clean
```

- **`composite`**: `rootDir`, declarations, and a `.tsbuildinfo` to know what changed
- The app is checked against `ui`'s **`.d.ts`** — not its sources: faster, and
  a real boundary between packages
- `incremental: true` gives a single project the same `.tsbuildinfo` cache

---

# Linting — typescript-eslint

```js
// eslint.config.js
import eslint from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  reactHooks.configs.flat.recommended,       // rules-of-hooks, exhaustive-deps…
  { languageOptions: { parserOptions: { projectService: true } } },
);
```

- **Type-aware** rules use the checker — what `tsc` accepts, they still catch:

```tsx
useEffect(() => { save(user); }, [user]);  // no-floating-promises: a forgotten await
if (user.name) { … }                        // no-unnecessary-condition: `name` is never empty
if (user) { const [x, setX] = useState() }  // rules-of-hooks: a hook in a condition
```

- Biome and oxlint lint faster, with fewer type-aware rules
- typescript-eslint uses the compiler API, absent from TypeScript 7.0: alias
  6.0 next to it — `"typescript": "npm:@typescript/typescript6@^6.0.2"`,
  `"@typescript/native": "npm:typescript@^7.0.2"`

---

# Testing — values and types

```tsx
import { expect, expectTypeOf, test } from 'vitest';
import { render, screen } from '@testing-library/react';

test('SalesReport shows the top seller', () => {
  render(<SalesReport sales={sales} />);
  expect(screen.getByText('Top seller: lamp')).toBeDefined();
});

test('useTopSeller may find nothing', () => {
  expectTypeOf(useTopSeller).returns.toEqualTypeOf<string | undefined>();
});

test('SalesReport needs amounts', () => {
  // @ts-expect-error — `amount` is missing
  <SalesReport sales={[{ sku: 'pen' }]} />;
});
```

- Vitest runs TSX as is — Jest needs `ts-jest` or a Babel / swc transform
- `vitest --typecheck` runs `*.test-d.tsx` files **through the checker**: a type
  assertion that does not hold fails the test — a JSX line included
- A component library's props are part of its API: test them

---

# Documentation — TSDoc & TypeDoc

```tsx
type ButtonProps = ComponentProps<'button'> & {
  /** The look of the button. Default: `'primary'`. */
  variant?: 'primary' | 'ghost';
};

/**
 * A button of the design system.
 *
 * @remarks
 * Part of the {@link Toolbar} subsystem.
 *
 * @param props - The props of a `<button>`, plus its `variant`
 * @returns A `<button>`, styled by its variant
 * @beta
 */
export function Button({ variant = 'primary', ...props }: ButtonProps) {
  return <button className={`btn btn-${variant}`} {...props} />;
}
```

- **TSDoc** standardises the tags: read by the editor's tooltips — on the props
  of `<Button variant=… />` too — and by tools
- **TypeDoc** turns them into a site: `npx typedoc src/index.ts`; Storybook's
  autodocs read the same comments

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
