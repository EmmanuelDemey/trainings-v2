# TP 1 — Getting started with React and Vite

> This TP is **autonomous**: it does not depend on any other TP. You start from
> a freshly generated Vite + React + TypeScript project; your job is to make it
> yours, extract a first component, and set up the linting and formatting tools
> the rest of the training relies on.

## Goal

Chapter 1 — Tour a React project and give it a professional toolchain:

- **Vite**: the dev server, hot module replacement, the production build
- **A first component**: what `App` renders, and a `Header` extracted from it
- **oxlint**, a Rust linter compatible with ESLint's rules, with its `react` plugin
  (the rules of hooks)
- **oxfmt**, a Rust formatter compatible with Prettier, and the `lint` / `format` /
  `format:check` scripts
- **Reading a lint report**: the difference between a style nit and a real bug

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`
- The **React Developer Tools** browser extension (Chrome, Edge or Firefox) for the bonus step

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

The specs that grade this workshop are already written, next to the code:

- **`src/App.spec.tsx`** — the title, the introduction, and the `Header` inside `App`
- **`src/components/Header.spec.tsx`** — the `Header` component on its own
- **`src/tooling.spec.ts`** — reads `package.json` and the config files at the root:
  the devDependencies, TypeScript 7, the three scripts, an oxlint config, an oxfmt config
- **`src/components/LikeButton.spec.tsx`** — the behaviour of the button you will
  lint at step 5; one of its two tests is red on purpose

They are red on the starter. Keep `npm run test:watch` open in a second terminal
and watch them turn green one step after the other.

**Already done for you:**

- The project as `npm create vite@latest -- --template react-ts` would generate it,
  trimmed down: `index.html`, `src/main.tsx` (`createRoot` + `<StrictMode>`),
  `vite.config.ts`, a strict `tsconfig.json`
- Vitest and Testing Library, configured in `vitest.config.ts` and
  `src/tests/setup.ts` — the subject of chapter 3
- `src/components/LikeButton.tsx` — a button that works… mostly. Leave it alone
  until step 5

## The workshop at a glance

| #   | What you do                                       | Where                                             | Done when                                                 |
| --- | ------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------- |
| 1   | Run the project, change it live, build it         | the terminal                                      | An edit shows up without a reload, and `dist/` exists     |
| 2   | Make the page about Star Wars people              | `src/App.tsx`                                     | The first three tests of `App.spec.tsx` are green         |
| 3   | Extract a `Header` component                      | `src/components/Header.tsx`                       | `Header.spec.tsx` and all of `App.spec.tsx` are green     |
| 4   | Add oxlint and oxfmt, with their scripts          | `package.json`, `.oxlintrc.json`, `.oxfmtrc.json` | `tooling.spec.ts` is green and `npm run lint` runs        |
| 5   | Fix every lint error                              | `src/components/LikeButton.tsx`                   | `npm run lint` exits 0 and `LikeButton.spec.tsx` is green |
| 6   | _(Bonus)_ Inspect the app with the React DevTools | the browser                                       | You can read a prop and change a state by hand            |

## Steps

### 1. Tour the project — the terminal

1. Run `npm run dev` and open http://localhost:5173.
2. Open `index.html`, then `src/main.tsx`: find where React takes over the
   `<div id="root">`. What does `<StrictMode>` add in development?
3. Change the text of the `<h1>` in `src/App.tsx` and save: the page updates
   **without a reload** — that is hot module replacement (HMR). Click the like
   button a few times first: does the count survive the edit?
4. Stop the server, run `npm run build`, then `npm run preview`. Look inside
   `dist/`: one HTML file, one hashed JavaScript bundle.

→ **Done when** an edit shows up without a reload, and `npm run build` produces
`dist/index.html` plus a hashed bundle in `dist/assets/`.

### 2. Make it yours — `src/App.tsx`

1. Make the level-1 title read **Star Wars people**.
2. Replace the Vite welcome paragraph with a short introduction starting with
   _Browse the characters of the Star Wars saga_.
3. Keep the `<LikeButton />`.

→ **Done when** the first three tests of `src/App.spec.tsx` are green, and the
Vite welcome text is gone from the page.

### 3. Extract a `Header` component — `src/components/Header.tsx`

1. Implement `Header`: a `<header>` holding the `title` prop in an `<h1>`, and
   the optional `subtitle` in a `<p>` — **only** when it is given. Destructure the
   props in the parameter list.
2. In `App`, replace the inline `<h1>` by
   `<Header title="Star Wars people" subtitle="A React 19 training" />`.
3. Try `<Header />` without a `title`, then `<Header title={42} />`: what does
   `npm run typecheck` say?

→ **Done when** `src/components/Header.spec.tsx` and the whole of
`src/App.spec.tsx` are green.

### 4. oxlint and oxfmt — `package.json`, `.oxlintrc.json`, `.oxfmtrc.json`

[oxlint](https://oxc.rs/docs/guide/usage/linter) and
[oxfmt](https://oxc.rs/docs/guide/usage/formatter) come from the Oxc project: one
Rust toolchain, many times faster than ESLint and Prettier, and compatible with
them — same rule names, same formatting output. Nothing to install on top: the
TypeScript and React rules are built in, no parser, no plugin package.

1. Install the tools as devDependencies:

   ```bash
   npm install -D oxlint oxfmt
   ```

2. Create `.oxlintrc.json` at the root (`npx oxlint --init` writes a starting point):
   - `"$schema": "./node_modules/oxlint/configuration_schema.json"` — completion in
     your editor;
   - `"plugins": ["typescript", "unicorn", "oxc", "react"]` — the first three are on
     by default, `react` is **not**, and it carries the rules of hooks;
   - `"env": { "browser": true }`;
   - `"ignorePatterns": ["dist", "node_modules"]`;
   - `"categories": { "correctness": "error" }`;
   - in `"rules"`, set `react/rules-of-hooks`, `react/exhaustive-deps`,
     `typescript/no-explicit-any` and `prefer-const` to `"error"`.
3. Create `.oxfmtrc.json` (`npx oxfmt --init`): `singleQuote`, a `printWidth` of
   100 — your call — and `"ignorePatterns": ["dist", "package-lock.json"]`.
4. Add the scripts:

   | Script         | Command                  |
   | -------------- | ------------------------ |
   | `lint`         | `oxlint --deny-warnings` |
   | `format`       | `oxfmt`                  |
   | `format:check` | `oxfmt --check`          |

5. Run `npm run format`, then `npm run format:check`: look at what oxfmt changed in
   `package.json` — it sorts its keys, as `prettier-plugin-packagejson` would. Run
   `npm run lint`: it fails — that is step 5.
6. In your editor, install the **Oxc** extension (VS Code, Zed, JetBrains) and turn on
   _format on save_.

→ **Done when** `src/tooling.spec.ts` is green, `npm run format:check` passes, and
`npm run lint` reports problems in `LikeButton.tsx` (and in `Header.tsx` if you
left an unused parameter there).

### 5. Fix the lint errors — `src/components/LikeButton.tsx`

`npm run lint` reports four problems from three rules. Read each message, and the
rule name in front of it, **before** you fix anything:

1. `typescript(no-explicit-any)` — give the props a real type.
2. `eslint(prefer-const)` — why is `const` right for a state variable that clearly changes?
3. `react-hooks(exhaustive-deps)` — this one is a **bug**, not a style nit: click the
   button and look at the tab title. `LikeButton.spec.tsx` already proves it.

Do **not** silence a rule with an `oxlint-disable` (or `eslint-disable`) comment:
fix the code.

→ **Done when** `npm run lint` exits 0, the tab title follows the likes, and
`src/components/LikeButton.spec.tsx` is green.

### 6. _(Bonus)_ The React DevTools — the browser

With `npm run dev` running, open the **Components** tab of the DevTools:

1. Select `Header` and read its props.
2. Select `LikeButton`, find its state hook, and change the value by hand.
3. In the settings, turn on _Highlight updates when components render_, click the
   button: which components re-render?

→ **Done when** you have changed a state from the DevTools and seen the page follow.

## Definition of Done

Tick every box before moving on. Steps marked _(Bonus)_ and the "Going further"
section are **not** part of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0 — the 4 spec files, 19 tests
- [ ] `npm run lint` exits 0, with `--deny-warnings`
- [ ] `npm run format:check` exits 0
- [ ] `npm run build` succeeds
- [ ] `grep -rn TODO src` returns nothing
- [ ] No `oxlint-disable` or `eslint-disable` comment anywhere in `src/`

**The behaviour is there**

- [ ] The page shows **Star Wars people** in a `<header>`, a short introduction, and the like button
- [ ] `Header` renders its subtitle only when it receives one
- [ ] Clicking the like button updates both the button and the tab title

**You can explain**

- [ ] What Vite does in `npm run dev` that it does not do in `npm run build`, and the other way round
- [ ] Why `const [likes, setLikes] = useState(0)` is a `const` although `likes` changes
- [ ] What the empty dependency array of the effect broke, and why `exhaustive-deps` is
      the one lint rule you never disable
- [ ] The difference between what oxlint checks and what oxfmt checks
- [ ] What oxlint and oxfmt share with ESLint and Prettier, and what they trade away

## Going further

- **Git hooks**: add `husky` and `lint-staged` so that `git commit` runs oxfmt and
  oxlint on the staged files only (`npx husky init`, then a `lint-staged` key in
  `package.json`).
- **Dead code**: run `npx knip` — remove a `LikeButton` import and run it again. What does
  it report that oxlint does not?
- **Path aliases**: add `"paths": { "@/*": ["./src/*"] }` to `tsconfig.json` and teach
  Vite to resolve it (`resolve.alias`, or `resolve.tsconfigPaths: true` in Vite 8), then
  import `@/components/Header`.
- **Type-aware rules**: `npx oxlint --type-aware` (with `oxlint-tsgolint`) adds the rules
  that need the type checker, such as `no-floating-promises`. Make an unawaited promise
  in `App.tsx` and compare the two runs.
- **Coming from ESLint and Prettier**: `npx @oxlint/migrate` turns an `eslint.config.js`
  into `.oxlintrc.json`, and `npx oxfmt --migrate prettier` does the same for a
  Prettier config. Which ESLint plugins have no oxlint equivalent yet?
