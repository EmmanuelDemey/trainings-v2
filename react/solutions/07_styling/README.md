# TP 7 — Styling React components

> This TP is **autonomous**: it does not depend on any other TP. A gallery of
> Star Wars character cards is provided, unstyled where it matters; your job is to
> style it with CSS Modules, a Sass module, inline styles and a theme made of
> CSS custom properties.

## Goal

Chapter 7 — Pick the right styling tool for each job:

- **CSS Modules** — scoped class names, variants mapped from props
- **Conditional classes** with a tiny `cx()` helper
- **Sass** — variables, mixins, nesting, in a `.module.scss`
- **Inline `style`** — only for values computed from data
- **Data attributes** to expose state to CSS and to tests
- **A theme with CSS custom properties**, switched by a single attribute, and
  typed in `CSSProperties`

## Prerequisites

- **Node.js >= 22.22.2** (24.15+ recommended) — run `nvm use` to pick up the version from `.nvmrc`

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run test:watch   # vitest, in watch mode
```

The specs are written and red on the starter:

- **`src/utils/cx.spec.ts`** — the class-name helper
- **`src/components/Button.spec.tsx`** — variants, size, `className`, native props
- **`src/components/PersonCard.spec.tsx`** — the Sass module's classes, `data-gender`
- **`src/components/HeightBar.spec.tsx`** — the inline width and the ARIA values
- **`src/components/ThemeRoot.spec.tsx`** — `data-theme`, the dark values, `--accent`
- **`src/App.spec.tsx`** — the theme switch, end to end

The specs import the CSS Modules themselves (`import styles from './Button.module.css'`)
and assert `toHaveClass(styles.primary)`: they never hard-code a generated name.
A class missing from the stylesheet fails with *"the module should define a
.primary class"*.

**Already done for you:**

- `sass` is installed (`npm install -D sass`) — Vite compiles any `.scss` file
  as soon as it finds it, no configuration
- `vitest.config.ts` — `css: { include: /\.module\./ }`. Read its comment:
  without it, Vitest replaces CSS Modules by a proxy that answers **any** key,
  and every class spec would pass on an empty stylesheet
- `src/App.tsx` — the page, already wired to every component, with the theme
  `useState` (chapter 8) and the "Switch to dark theme" button
- `src/components/HeightBar.module.css`, `src/App.module.css` — finished
  modules to read as examples
- `src/tests/classOf.ts` — the spec helper behind that readable failure message

## The workshop at a glance

| # | What you do | Where | Done when |
|---|---|---|---|
| 1 | A `cx()` helper for conditional classes | `src/utils/cx.ts` | `cx('a', false && 'b')` is `'a'` |
| 2 | Button variants with a CSS Module | `src/components/Button.module.css` + `Button.tsx` | Three variants, two sizes, `type="button"` by default |
| 3 | A Sass module for the card | `src/components/PersonCard.module.scss` + `PersonCard.tsx` | Droids have a blue border and a 🤖 |
| 4 | A data-driven inline width | `src/components/HeightBar.tsx` | Vader's bar is full, R2-D2's is half |
| 5 | A dark theme with custom properties | `src/components/ThemeRoot.module.css` + `ThemeRoot.tsx` | The switch repaints the page, nothing else changes |

## Steps

### 1. `cx()` — `src/utils/cx.ts`

Return the truthy arguments joined with a space. It is one line —
`filter(Boolean)` then `join(' ')`. This is what lets you write
`cx(styles.card, isDroid && styles.droid)`.

→ **Done when** `cx.spec.ts` is green.

### 2. A CSS Module for `Button` — `src/components/Button.module.css` + `Button.tsx`

1. In the module, add `.primary`, `.secondary`, `.danger` and `.small` (the
   values are in the TODO). `.primary` uses `var(--accent, #ffe81f)`: keep that
   fallback, step 5 relies on it.
2. In `Button.tsx`, `import styles from './Button.module.css'`. `styles` is an
   object: `styles.button` is something like `_button_4f0108`. Open the devtools
   once it works and look at the generated names.
3. Build the `className` with `cx`: `styles.button`, `styles[variant]` (the prop
   values match the class names on purpose), `styles.small` when
   `size === 'small'`, and the caller's `className` **last**.
4. Default `type` to `'button'`. Without it, a `<Button>` inside a `<form>`
   submits the form — a classic.

→ **Done when** `Button.spec.tsx` is green and the theme button in the header
is outlined (`variant="secondary"`, `size="small"`).

### 3. A Sass module for `PersonCard` — `src/components/PersonCard.module.scss` + `PersonCard.tsx`

1. Rewrite the stylesheet in Sass: `$radius` and `$droid-color` variables, an
   `@mixin elevated($depth)` for the shadow
   (`box-shadow: 0 #{$depth}px #{$depth * 3}px rgb(0 0 0 / 0.15)`), and nest the
   `h2`/`dl`/`dt`/`dd` rules and the `&:hover` inside `.card`.
2. Add a `.droid` class: a 2 px `$droid-color` border, and `h2::after` with
   `content: ' 🤖'`.
3. In `PersonCard.tsx`, import the module and set
   `className={cx(styles.card, person.gender === 'n/a' && styles.droid)}`.
4. Add `data-gender={person.gender}` on the `<article>`. A data attribute says
   *what the element is*; a class says *how it looks*. Try
   `.card[data-gender='female'] h2 { … }` in the module.

→ **Done when** `PersonCard.spec.tsx` is green and C-3PO, R2-D2 and R5-D4 stand
out in blue with a robot after their name.

### 4. Inline style for data — `src/components/HeightBar.tsx`

1. Add `aria-valuemin={0}`, `aria-valuemax={max}` and `aria-valuenow={height}`
   on the `role="meter"` element.
2. Compute `Math.min(100, Math.round((height / max) * 100))` and set it as
   `style={{ width: `${percent}%` }}`. Note that `style` takes an **object**
   with camelCased keys, not a string.
3. Ask yourself why this width is inline while the bar's colour is in the
   module — and which of the two a designer would want to change.

→ **Done when** `HeightBar.spec.tsx` is green; Darth Vader's bar is full and
R2-D2's about half.

### 5. A theme with custom properties — `src/components/ThemeRoot.module.css` + `ThemeRoot.tsx`

1. In `ThemeRoot.tsx`, add `data-theme={theme}` on the root `<div>`.
2. In the module, add a `.root[data-theme='dark']` rule redefining the six
   custom properties (values in the TODO). Every component reads
   `var(--surface)`, `var(--text)`…: none of them changes.
3. Set the accent: `style={{ '--accent': accent }}`. TypeScript refuses —
   `CSSProperties` does not know custom properties. Create
   `src/react-css.d.ts`:

   ```ts
   import 'react';

   declare module 'react' {
     interface CSSProperties {
       [customProperty: `--${string}`]: string | number | undefined;
     }
   }
   ```

   Pass `accent="#ff6b00"` from `App` for a moment: every primary button and
   every height bar turns orange.

→ **Done when** the whole suite is green and "Switch to dark theme" repaints
the page — cards, borders, text — without a single component re-rendering
different classes.

## Definition of Done

Tick every box before moving on. The "Going further" section is **not** part
of this list.

**It builds and runs**

- [ ] `npm run typecheck` exits 0
- [ ] `npm test` exits 0
- [ ] `npm run build` succeeds — and `dist/assets/*.css` contains the compiled
      Sass (no `$radius`, no `@mixin` left)
- [ ] `grep -rn TODO src` returns nothing

**The behaviour is there**

- [ ] Buttons come in three variants and two sizes, and default to `type="button"`
- [ ] Droid cards have a blue border and a 🤖 after the name
- [ ] Each card's bar is proportional to the character's height
- [ ] The theme switch toggles light and dark; an `accent` prop recolours the
      buttons and the bars

**You can explain**

- [ ] What a CSS Module compiles `.primary` to, and why two components can both
      have a `.title` class
- [ ] Why a global `import './card.css'` is **not** scoped, even when only one
      component imports it
- [ ] When inline `style` is the right tool, and when it is not
- [ ] Why a theme made of custom properties needs no React context and no
      re-render of the components

## Going further

- **Tailwind CSS v4**: `npm install -D tailwindcss @tailwindcss/vite`, add the
  plugin to `vite.config.ts`, `@import "tailwindcss";` in `index.css`, and
  rewrite `Button` with utility classes (`rounded-md px-4 py-2 font-semibold`).
  How do you express the variants now? Look at how `cva` solves it.
- Follow the user's system preference: `@media (prefers-color-scheme: dark)` as
  the default, the button as an override. What does the button need to store?
- **CSS-in-JS**: rewrite `PersonCard` with `@emotion/styled` and compare the
  bundle and the runtime cost with the Sass module (chapter 18 uses MUI, built
  on Emotion).
- Replace `cx` by `clsx`. What does it accept that yours does not?
