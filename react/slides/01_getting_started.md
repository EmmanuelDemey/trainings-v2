---
layout: cover
---

# 1 - Getting started

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** what React is — and what it deliberately leaves to other libraries
- **Create** a React + TypeScript project with Vite and **find your way** in it
- **Format** the code with oxfmt and **lint** it with oxlint, the rules of hooks
  included — and **place** them next to Prettier and ESLint
- **Block** a bad commit with a husky pre-commit hook
- **Detect** dead files, exports and dependencies with knip
- **Inspect** a running application with the React Developer Tools

---

# What is React?

- A JavaScript **library** for building user interfaces, created by **Meta** in
  2013, open source (MIT)
- You describe **what** the UI looks like for a given state; React works out
  **how** to update the DOM
- An application is a **tree of components** — plain functions returning JSX

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}
```

- **Renderers** turn that tree into something real: `react-dom` (the browser),
  React Native (mobile), server rendering (`react-dom/server`)
- Used by Meta, Netflix, Airbnb, Shopify… and by most frontend job offers

---

# A library, not a framework

React only renders components. A complete application adds other libraries:

| Need | Usual candidates |
|---|---|
| Routing | **React Router**, TanStack Router |
| Server state | **TanStack Query**, SWR, RTK Query |
| Global state | **Zustand**, Redux Toolkit, Jotai, XState |
| Forms | **React Hook Form**, TanStack Form |
| Validation | **Zod**, Valibot |
| i18n | **react-i18next**, FormatJS |
| UI components | Material UI, shadcn/ui, Mantine, React Aria |

<br />

> Meta-frameworks (**Next.js**, React Router in framework mode) bundle these choices
> together with server rendering — chapter 24.

---

# Creating a project with Vite

```bash
npm create vite@latest star-wars -- --template react-ts
cd star-wars
npm install
npm run dev      # http://localhost:5173
```

- **Vite** serves native ES modules in development — instant start, hot module
  replacement that keeps the component state
- In production, it bundles and minifies with **Rolldown**
- `create-react-app` is **deprecated** since 2025: do not start a project with it

```
star-wars/
├── index.html          ← the real entry point, loads /src/main.tsx
├── src/
│   ├── main.tsx        ← createRoot(...).render(<App />)
│   └── App.tsx
├── vite.config.ts
└── tsconfig.json
```

---

# The entry point

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- `createRoot` attaches React to the `<div id="root">` of `index.html`
- **`StrictMode`** is development only: it renders components twice and runs effects
  twice, to surface impure code and missing cleanups early

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({ plugins: [react()] });
```

---

# The scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "oxlint --deny-warnings",
    "format": "oxfmt",
    "format:check": "oxfmt --check"
  }
}
```

- `vite build` does **not** type-check: it strips the types and bundles — hence
  `tsc --noEmit` in front of it
- `vite preview` serves the `dist/` folder locally, to test the production build
- `format:check` and `lint` are what the CI runs; `format` is for your machine

---

# Oxc — one Rust toolchain for linting and formatting

- [Oxc](https://oxc.rs): a parser shared by **oxlint** (linter) and **oxfmt** (formatter)
- **Compatible** with the tools they replace: ESLint's rule names, Prettier's output
- **Many times faster**, and **no plugin packages**: TypeScript, React, Vitest,
  jsx-a11y, import… rules are built in

```bash
npm install -D oxlint oxfmt
npx oxlint --init     # writes .oxlintrc.json
npx oxfmt --init      # writes .oxfmtrc.json
```

<br />

| Job | Oxc | The reference it replaces |
|---|---|---|
| Lint | `oxlint` | ESLint + `typescript-eslint` + plugins |
| Format | `oxfmt` | Prettier |

---

# oxfmt — formatting, settled once

- An **opinionated** formatter: JS, TS, JSX, CSS, JSON, Markdown, YAML…
- The team stops discussing semicolons in code reviews
- Same options as Prettier: `npx oxfmt --migrate prettier` converts a `.prettierrc`

```jsonc
// .oxfmtrc.json
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "singleQuote": true,
  "printWidth": 100,
  "ignorePatterns": ["dist", "package-lock.json"]
}
```

```bash
npx oxfmt             # format in place
npx oxfmt --check     # fail if a file is not formatted — what the CI runs
```

- Also sorts the keys of `package.json`; reads `.gitignore` and `.prettierignore`
- Editor: **format on save** with the **Oxc** extension (VS Code `oxc.oxc-vscode`, Zed, JetBrains)

---

# oxlint — the configuration

```jsonc
// .oxlintrc.json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  // typescript, unicorn and oxc are on by default — react is not
  "plugins": ["typescript", "unicorn", "oxc", "react"],
  "env": { "browser": true },
  "ignorePatterns": ["dist", "node_modules"],
  "categories": { "correctness": "error" },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "error",
    "typescript/no-explicit-any": "error",
    "prefer-const": "error"
  }
}
```

- **Categories** switch whole families on: `correctness` (outright bugs, the
  default), `suspicious`, `pedantic`, `perf`, `style`…

---

# oxlint — what it catches

```text
× typescript(no-explicit-any): Unexpected `any`. Specify a different type.
× eslint(prefer-const): `likes` is never reassigned.
× react-hooks(exhaustive-deps): React Hook useEffect has missing dependencies:
  'likes', and 'props.label'
```

- **`react` plugin** — the most important React rules:
  - `rules-of-hooks`: a hook called in a condition or a loop
  - `exhaustive-deps`: a missing dependency in `useEffect` / `useMemo`
- Other built-in plugins: `jsx-a11y` (accessibility), `vitest`, `import`, `react-perf`…
- `--type-aware` adds the rules that need the type checker (`no-floating-promises`)

```bash
npx oxlint            # report
npx oxlint --fix      # fix what can be fixed automatically
```

> **oxfmt formats, oxlint finds bugs.** Never let the linter handle formatting.

---

# And ESLint, Prettier?

- Still the **references**: most existing projects, and most docs, use them
- The same split: **Prettier** formats, **ESLint** (flat config `eslint.config.js`,
  `typescript-eslint`, `eslint-plugin-react-hooks`) finds bugs
- What ESLint still has that oxlint lacks:
  - the **React Compiler** rules of `eslint-plugin-react-hooks` v7 (`purity`, `refs`,
    `set-state-in-render`…)
  - plugins with no Oxc port yet — oxlint can load some ESLint plugins as
    **JS plugins**
- Migrating: `npx @oxlint/migrate` (ESLint config) and `npx oxfmt --migrate prettier`
- Both can coexist: oxlint first for speed, ESLint for the rules it lacks

---

# Husky — Git hooks

- Runs scripts on Git events: refuse a commit that does not pass the checks

```bash
npm install -D husky
npx husky init        # adds "prepare": "husky" and .husky/pre-commit
```

```bash
# .husky/pre-commit
npm run format:check
npm run lint
npm run typecheck
npm test
```

- Pair it with **lint-staged** to run the checks on the **staged files only** —
  a pre-commit hook must stay fast
- A hook can be skipped (`git commit --no-verify`): the **CI** stays the real gate

---

# Knip — finding dead code

- Reports **unused files**, **unused exports**, **unused dependencies** and
  dependencies used but **missing** from `package.json`
- Walks the import graph from the entry points; 100+ plugins (Vite, Vitest,
  Storybook, Cypress…) find those entry points for you

```bash
npm install -D knip
npx knip              # report
npx knip --fix        # remove unused exports and dependencies
```

```json
// knip.json — often unnecessary, the plugins guess
{
  "$schema": "https://unpkg.com/knip@6/schema.json",
  "entry": ["src/main.tsx"],
  "project": ["src/**/*.{ts,tsx}"]
}
```

---

# React Developer Tools

- Browser extension (Chrome, Firefox, Edge) — two new tabs in the devtools:
  - **Components**: the component tree, the props, state and hooks of the selected
    component — editable live
  - **Profiler**: records a session, shows which components rendered, **why**, and
    how long it took
- "**Highlight updates when components render**" makes useless re-renders visible

<br />

Recommended editor extensions (VS Code):

- `oxc.oxc-vscode` — oxlint and oxfmt
- `yoavbls.pretty-ts-errors` — readable TypeScript errors

---

# Recap

- React is a **UI library**: components in, DOM out — routing, data fetching and
  forms come from other libraries
- `npm create vite@latest -- --template react-ts`: Vite for dev and build,
  `create-react-app` is deprecated
- `main.tsx` mounts `<App />` with `createRoot`, wrapped in `StrictMode`
- `vite build` does not type-check: `tsc --noEmit` does
- **oxfmt** formats, **oxlint** (with its `react` plugin) finds bugs — the Rust
  successors of Prettier and ESLint, compatible with them
- **husky** guards commits, **knip** hunts dead code, the **React DevTools** show
  the tree and the renders

---

# Quiz — Question 1 / 3

**`npm run build` succeeds, but the project has TypeScript errors. Why?**

- **A.** Vite ignores `.tsx` files in production
- **B.** `vite build` only strips the types — nothing checks them unless `tsc` runs
- **C.** The errors only exist in development mode
- **D.** `StrictMode` hides them

<v-click>

> ✅ **B** — Vite transpiles each file in isolation for speed and never type-checks.
> That is why the template's build script is `tsc --noEmit && vite build`, and why
> the CI runs `npm run typecheck`.

</v-click>

---

# Quiz — Question 2 / 3

**Which tool should report a missing dependency in a `useEffect` array?**

- **A.** oxfmt
- **B.** TypeScript
- **C.** oxlint, with its `react` plugin
- **D.** knip

<v-click>

> ✅ **C** — The `exhaustive-deps` rule of oxlint's `react` plugin (in ESLint, of
> `eslint-plugin-react-hooks`). TypeScript knows nothing about React's dependency
> arrays, oxfmt only formats, and knip
> looks for unused code across files.

</v-click>

---

# Quiz — Question 3 / 3

**Why does every component's `console.log` appear twice in development?**

- **A.** A bug in Vite's hot module replacement
- **B.** The component is mounted twice in `index.html`
- **C.** `StrictMode` renders components twice on purpose, in development only
- **D.** React always renders twice, also in production

<v-click>

> ✅ **C** — `StrictMode` double-invokes renders and effects in development to reveal
> impure components and missing cleanups. Production renders once.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 1 - Getting started with React and Vite
