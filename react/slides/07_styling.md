---
layout: cover
---

# 7 - Styling

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Import** a stylesheet per component, and **explain** why plain CSS is global
- **Scope** styles with BEM naming or **CSS Modules**, and **combine** classes
  conditionally
- **Use** Sass where modern CSS is not enough
- **Theme** an application with CSS custom properties
- **Weigh** CSS-in-JS (runtime vs zero-runtime) against the other options
- **Style** components with Tailwind CSS v4 utilities

---

# One stylesheet per component

```tsx
// Nav.tsx
import './Nav.css';

export function Nav() {
  return <nav className="nav">…</nav>;
}
```

- Vite handles CSS imports: injected in development, extracted into `.css` files at
  build time
- One file per component: easier to maintain, and a component that is never imported
  never ships its CSS
- ⚠️ **Plain CSS is global**: `.title` in `Nav.css` also styles every other `.title`
  of the page

---

# Scoping by convention: BEM

```tsx
export function Nav({ items, active }: NavProps) {
  return (
    <nav className="navigation">
      <ul>
        {items.map((item) => (
          <li
            key={item.href}
            className={item.href === active ? 'navigation__item navigation__item--active' : 'navigation__item'}
          >
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

```css
.navigation { display: flex; }
.navigation__item { padding: 0.5rem; }
.navigation__item--active { font-weight: bold; }
```

- **B**lock, **E**lement, **M**odifier: a unique prefix per component
- It works — as long as everybody follows the convention

---

# CSS Modules

```css
/* Button.module.css */
.button { padding: 0.5rem 1rem; border-radius: 4px; }
.primary { background: #ffe81f; color: #000; }
.danger { background: #c62828; color: #fff; }
```

```tsx
import styles from './Button.module.css';

export function Button({ variant = 'primary', ...props }: ButtonProps) {
  return <button className={`${styles.button} ${styles[variant]}`} {...props} />;
}
// rendered: <button class="_button_x7f2a _primary_x7f2a">
```

- The file name **must** end with `.module.css` — supported by Vite out of the box
- Each class is renamed to a **unique** name at build time: real scoping, plain CSS
- `styles` is an object: class names are **typed** (`vite/client` declares them)
- `:global(.some-class)` escapes the scoping when you need it

---

# Combining classes

```tsx
import clsx from 'clsx';
import styles from './PersonRow.module.css';

export function PersonRow({ person, selected, liked }: PersonRowProps) {
  return (
    <tr
      className={clsx(styles.row, {
        [styles.selected]: selected,
        [styles.liked]: liked,
      })}
      data-selected={selected}
    >
      <td>{person.name}</td>
    </tr>
  );
}
```

- **`clsx`** (or `classnames`) joins the truthy classes — no more template-string
  gymnastics
- Alternative: a **`data-*` attribute** styled with `.row[data-selected='true']` —
  also handy to assert on in tests
- In Vitest, configure `css.modules` to get readable class names in the specs

---

# Sass

```bash
npm install -D sass        # Vite compiles .scss files once sass is installed
```

```scss
// Navigation.module.scss
@use '../styles/tokens' as tokens;

.navigation {
  display: flex;
  gap: tokens.$spacing;

  &__item {
    padding: tokens.$spacing;

    &--active {
      font-weight: bold;
      border-bottom: 2px solid tokens.$primary;
    }
  }
}
```

- Variables, mixins, functions, nesting — and works with CSS Modules (`.module.scss`)
- `@use` / `@forward` replace the deprecated `@import`
- Modern CSS already has **nesting**, **custom properties**, `color-mix()`,
  `@container`: Sass is less and less necessary

---

# Theming with CSS custom properties

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #ffe81f;
}

[data-theme='dark'] {
  --color-bg: #000000;
  --color-text: #f5f5f5;
}

body { background: var(--color-bg); color: var(--color-text); }
```

```tsx
export function ThemeRoot({ theme, children }: { theme: 'light' | 'dark'; children: ReactNode }) {
  return <div data-theme={theme}>{children}</div>;
}

<div style={{ '--progress': `${percent}%` } as CSSProperties} className={styles.bar} />
```

- Custom properties **cascade** and change at runtime — no rebuild, no JS re-render
  of every styled component
- The `style` prop can set them for one-off dynamic values

---

# The `style` prop

```tsx
<div
  style={{
    width: `${(person.height / maxHeight) * 100}%`,
    backgroundColor: person.liked ? 'gold' : 'lightgray',
    marginTop: 8,          // a number → pixels
  }}
/>
```

- An object of **camelCase** properties, typed by `CSSProperties`
- Perfect for truly **dynamic** values (a width computed from data)
- Not for the bulk of the styling: no media queries, no `:hover`, no pseudo-elements,
  and a new object on every render

---

# CSS-in-JS

```tsx
import styled from 'styled-components';

const Title = styled.h1<{ $highlight?: boolean }>`
  font-size: 1.5em;
  color: ${({ $highlight }) => ($highlight ? '#ffe81f' : 'inherit')};
`;

const Wrapper = styled.section`
  padding: 4em;
  background: papayawhip;
`;

export const App = () => (
  <Wrapper>
    <Title $highlight>Star Wars people</Title>
  </Wrapper>
);
```

- Styles live **in the component file**, scoped, driven by props
- **Runtime** libraries (styled-components, Emotion) generate CSS in the browser:
  a cost at render time, and friction with Server Components
- **Zero-runtime** ones (vanilla-extract, Panda CSS, StyleX, Linaria) extract
  static CSS at build time
- styled-components is in **maintenance mode** since 2025: think twice for a new project

---

# Tailwind CSS v4

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({ plugins: [react(), tailwindcss()] });
```

```css
/* src/index.css */
@import 'tailwindcss';

@theme {
  --color-saber: #ffe81f;      /* → bg-saber, text-saber, border-saber… */
}
```

- **Utility classes**: one small class per CSS declaration
- v4 has **no `tailwind.config.js`** by default: the configuration lives in CSS
  (`@theme`), and the source files are detected automatically
- Only the classes you actually use end up in the final CSS

---

# Tailwind CSS in components

```tsx
export function PersonCard({ person, selected }: PersonCardProps) {
  return (
    <article
      className={clsx(
        'rounded-lg border p-4 shadow-sm transition hover:shadow-md',
        'md:flex md:items-center md:gap-4 dark:bg-gray-900 dark:text-white',
        selected ? 'border-saber' : 'border-gray-200',
      )}
    >
      <h2 className="text-xl font-bold">{person.name}</h2>
      <p className="text-sm text-gray-500">{person.height} cm</p>
    </article>
  );
}
```

- Responsive (`md:`), states (`hover:`, `focus-visible:`), dark mode (`dark:`) as prefixes
- Never build class names dynamically (`` `bg-${color}` ``): the scanner cannot see
  them — map values to **full** class names
- Long lists are tamed by components, `clsx` and `prettier-plugin-tailwindcss`

---

# Choosing an approach

| | Scoping | Runtime cost | Dynamic values | Learning curve |
|---|---|---|---|---|
| Plain CSS + BEM | by convention | none | custom properties | low |
| **CSS Modules** | automatic | none | custom properties, `data-*` | low |
| Sass modules | automatic | none | custom properties | medium |
| Runtime CSS-in-JS | automatic | **yes** | props | medium |
| **Tailwind CSS** | utilities | none | class maps, `style` | medium |

<br />

- Good defaults today: **CSS Modules** or **Tailwind CSS**, plus custom properties
  for theming
- A UI library (chapter 18) brings its own styling solution

---

# Recap

- A CSS import is **global**: scope with BEM by convention, or with **CSS Modules**
  for real
- `*.module.css` → a `styles` object of unique class names; `clsx` to combine them
- Sass still helps, but modern CSS has nesting and custom properties
- **Custom properties** + a `data-theme` attribute = runtime theming
- `style` for truly dynamic values only
- Runtime CSS-in-JS costs at render time — prefer zero-runtime or other options
- Tailwind v4: `@tailwindcss/vite`, `@import 'tailwindcss'`, configuration in `@theme`

---

# Quiz — Question 1 / 3

**`Card.css` and `Modal.css` both define `.title`, with different colors. What happens?**

- **A.** Each component gets its own `.title`
- **B.** Vite throws a build error
- **C.** Both rules are global: the one loaded last wins, everywhere
- **D.** React renames the classes automatically

<v-click>

> ✅ **C** — Plain CSS imports are global, whichever component imports them. Rename
> to `Card.module.css` / `Modal.module.css` to get scoped, unique class names.

</v-click>

---

# Quiz — Question 2 / 3

**With Tailwind, ``className={`bg-${color}-500`}`` shows no background. Why?**

- **A.** Tailwind does not support colors in React
- **B.** The class is built at runtime: the build never saw `bg-red-500`, so no CSS
  was generated for it
- **C.** `className` must be a static string in JSX
- **D.** Template literals are not allowed in `className`

<v-click>

> ✅ **B** — Tailwind scans the source files for complete class names. Map the values
> to full names instead: `{ red: 'bg-red-500', green: 'bg-green-500' }[color]`.

</v-click>

---

# Quiz — Question 3 / 3

**Which approach gives scoped styles with no JavaScript cost at runtime?**

- **A.** styled-components
- **B.** Emotion's `css` prop
- **C.** CSS Modules
- **D.** Inline `style` objects

<v-click>

> ✅ **C** — CSS Modules are resolved at build time into static CSS with unique class
> names. Runtime CSS-in-JS libraries compute and inject styles while rendering.

</v-click>

---
layout: cover
---

# Hands-on

## Workshop 7 - Styling React components
