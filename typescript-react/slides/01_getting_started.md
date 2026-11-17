---
layout: cover
---

# 1 - From JavaScript to TypeScript

---
src: ../../typescript-common/slides/01_getting_started/learning-objectives.md
---

---

# What TypeScript is

- A language by **Microsoft**, designed by Anders Hejlsberg — the author of
  **Turbo Pascal**, **Delphi** and **C#** — open source since 2012
- A **superset** of JavaScript: every JavaScript program is a TypeScript program
- It adds one thing: **static types**, checked **before** the code runs

```tsx
function Total({ prices }: { prices: number[] }) {
  return <p>{prices.reduce((sum, price) => sum + price, 0)}</p>;
}

<Total prices={[10, 20]} />;
<Total prices={['10', '20']} />;
//              ~~~~ Type 'string' is not assignable to type 'number'.
```

- The types are **erased**: what runs is plain JavaScript. A type never exists
  at run time — keep that in mind for the whole training

---
src: ../../typescript-common/slides/01_getting_started/why-bother.md
---

---

# Setting up a project

```bash
mkdir todo && cd todo
npm init --yes
npm install react react-dom
npm install --save-dev typescript @types/react @types/react-dom vite @vitejs/plugin-react
npx tsc --init      # or all at once: npm create vite@latest -- --template react-ts
```

- `typescript` ships the compiler, **`tsc`**
- `@types/react` describes the React APIs (JSX, hooks, `ReactNode`…) to the checker
- `tsc --init` writes a commented **`tsconfig.json`**

<br />

> **TypeScript 7** is the **native** port of the compiler (written in Go):
> same `tsc` command, same options, **8 to 12× faster** on a full build
> (VS Code: 126 s → 11 s). On a whole CI, expect less — Prisma measured **~3×**
> on its monorepo. Since 7.0 it ships as the `typescript` package itself.

---

# `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "esnext",               // the JavaScript version emitted
    "module": "esnext",
    "moduleResolution": "bundler",    // how imports are resolved — here, like Vite
    "lib": ["esnext", "dom"],         // the built-in APIs the code may use — the browser's
    "types": ["vite/client"],         // the types loaded globally: import.meta.env…
    "jsx": "react-jsx",               // JSX compiled to react/jsx-runtime calls
    "strict": true,                   // the checks you want — always on
    "noEmit": true,                   // only check: Vite builds the code
    "skipLibCheck": true              // do not check the .d.ts of node_modules
  },
  "include": ["src"]
}
```

- `tsc` with no argument reads it: `npx tsc` checks — and emits, unless `noEmit`
- `npx tsc --showConfig` prints the **effective** config, defaults and `extends` resolved
- `npx tsc --listFiles` lists every file the compiler reads — your code, and all the `lib.*.d.ts`

---

# The defaults changed — TypeScript 6 and 7

What you get **without writing it**:

| Option | Before (5.x) | Now (6.0, 7.0) |
|---|---|---|
| `strict` | `false` | **`true`** |
| `module` | depends on `target` | `esnext` |
| `target` | `es5` | the latest: `es2025` |
| `types` | every `node_modules/@types` | **`[]`** — list them: `["vite/client"]` |
| `rootDir` | inferred from the sources | the folder of `tsconfig.json` |
| `noUncheckedSideEffectImports` | `false` | `true` |

```txt
error TS2339: Property 'env' does not exist on type 'ImportMeta'.   ← the classic one after upgrading:
                                                                      add "types": ["vite/client"]
```

- Gone in 7.0: `target: "es5"`, `moduleResolution: "node10"`, `baseUrl`, `outFile`,
  `module: "amd" | "umd" | "system"` — see chapter 9
- `tsc file.ts` next to a `tsconfig.json` is now an **error**: `--ignoreConfig` to bypass it
- `tsc --init` now writes a short, opinionated file: `module: nodenext`, `target: esnext`,
  `types: []`, `strict`, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `verbatimModuleSyntax`, `isolatedModules` — read it before keeping it

---

# `strict`: the setting that matters

`strict: true` turns on a **family** of checks — among them:

| Option | What it refuses |
|---|---|
| `noImplicitAny` | A parameter whose type cannot be inferred: no silent `any` |
| `strictNullChecks` | Using a value that may be `null` or `undefined` |
| `strictFunctionTypes` | Passing a callback that accepts less than promised |
| `strictPropertyInitialization` | A class field never assigned |
| `useUnknownInCatchVariables` | `catch (e)`: `e` is `unknown`, not `any` |

```tsx
function Greeting({ name }) {}          // ✘ Binding element 'name' implicitly has an 'any' type.

const inputRef = useRef<HTMLInputElement>(null);   // RefObject<HTMLInputElement | null>
inputRef.current.focus();               // ✘ 'inputRef.current' is possibly 'null'.
```

> Without `strict`, TypeScript is a linter with good completion. It is **on by
> default** since TypeScript 6: an old project that turns it off says so with
> `"strict": false` — migrate it flag by flag.

---
src: ../../typescript-common/slides/01_getting_started/running-typescript.md
---

---

# Type stripping, and its limit

Node.js replaces each type with **spaces** — line and column numbers stay right:

```tsx
const toggle = (todo: Todo): Todo => ({ ...todo, done: !todo.done });
// becomes
const toggle = (todo      )       => ({ ...todo, done: !todo.done });
```

- Only works for syntax that is **pure annotation**. `enum`, `namespace` and
  constructor **parameter properties** generate code: Node.js refuses them
- `"erasableSyntaxOnly": true` makes `tsc` refuse them too — before Node.js does
- Imports name the **real file**: `import { toggle } from './todo.ts'`
  (`"allowImportingTsExtensions": true` lets `tsc` accept it)
- `"verbatimModuleSyntax": true`: a type-only import must say so —
  `import type { Todo } from './todo.ts'` — so it can be erased safely
- `node --experimental-transform-types` also **transforms** `enum` and `namespace` —
  still experimental, and it breaks the "spaces only" promise: source maps are
  needed again. Prefer `erasableSyntaxOnly`

---

# What happens in `tsc`

```mermaid {scale: 0.8}
flowchart LR
  A[source text] -->|scanner| B[tokens]
  B -->|parser| C[AST]
  C -->|binder| D[symbols]
  D -->|checker| E[diagnostics]
  C -->|emitter| F[.js / .d.ts / .map]
```

- **Scanner**: text into tokens — `function`, `App`, `(`, `<`, `h1`…
- **Parser**: tokens into an **Abstract Syntax Tree**
- **Binder**: connects each name to its declaration, scope by scope
- **Checker**: the type system — by far the most expensive stage
- **Emitter**: writes JavaScript (JSX turned into `_jsx('h1', …)` calls), declaration files (`.d.ts`) and source maps

> The emitter does **not** wait for the checker: by default, `tsc` writes the
> `.js` even when there are type errors. `noEmitOnError` changes that.

---
src: ../../typescript-common/slides/01_getting_started/the-editor.md
---

---
src: ../../typescript-common/slides/01_getting_started/quiz.md
---

---
layout: cover
---

# Hands-on

## Workshop 1 - Getting started
