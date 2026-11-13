---
layout: cover
---

# 09 - Auditing

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Tell** what an automated tool catches — and the larger part it cannot see
- **Pick** the right tool for each moment: the editor, the unit tests, the
  end-to-end tests, the browser
- **Run** axe-core from Playwright, and lock the accessibility tree with
  `toMatchAriaSnapshot`
- **Write** tests that find elements by **role and accessible name**
- **Run** a manual audit: keyboard, screen reader, accessibility tree

---

# Two kinds of evaluation

<div style="display: flex; gap: 2em;">
<div>

### Automated — fast, never tired

- Finds about **30 to 40%** of the WCAG issues
- Missing `alt`, contrast, a field with no name, invalid ARIA, a missing `lang`
- Runs on **every commit**: nothing that was fixed comes back

</div>
<div>

### Manual — slow, irreplaceable

- Everything that needs **judgement**: is this `alt` *meaningful*? Is the focus
  order *logical*? Is this error message *understandable*?
- Everything that needs **interaction**: a focus trap, a live region, a rotor
- The last step: an audit **with people with disabilities**

</div>
</div>

<br />

> **Zero violation is not "accessible".** `<img alt="image">` passes every
> tool. A modal that loses the focus passes most of them.

---

# The tools — which one, when

| Tool | When | Catches |
|---|---|---|
| `eslint-plugin-jsx-a11y`, Svelte / Vue / Angular linters | **In the editor**, as you type | `alt` missing, unknown ARIA attribute, `onClick` on a `<div>` |
| **Testing Library** (`getByRole`) | **Unit tests** | An element with no role or no name: the query fails |
| **jest-axe** / **vitest-axe** | Unit tests, one component | The axe rules on a rendered component |
| **Playwright** + `@axe-core/playwright` | **End-to-end**, in the CI | The axe rules on a real page, in every state |
| `toMatchAriaSnapshot` | End-to-end | A **change** in the accessibility tree |
| **Lighthouse**, **axe DevTools**, WAVE | **In the browser**, by hand | The axe rules, with a visual report |
| Chrome DevTools — *Rendering* | In the browser | Colour vision deficiencies, contrast, `prefers-*` |

<br />

> Lighthouse, axe DevTools, jest-axe and `@axe-core/playwright` share the same
> engine: **axe-core** (Deque, open source).

<style>
table { font-size: 0.8em; }
</style>

---

# In the editor — ESLint

```bash
npm install -D eslint-plugin-jsx-a11y
```

```ts
// eslint.config.js
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  jsxA11y.flatConfigs.recommended,
];
```

```tsx
<img src="logo.svg" />                        // ❌ alt-text
<div onClick={open}>Details</div>             // ❌ click-events-have-key-events, no-static-element-interactions
<input aria-labeledby="name" />               // ❌ aria-props — the attribute is aria-labelledby
<button onClick={open}>Details</button>       // ✅
```

- The **cheapest** feedback: before the commit, before the review
- Only sees the **source**: not the rendered page, not the CSS, not the state

---

# In the unit tests — query by role

```tsx
it('shows an error for each empty required field', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.click(screen.getByRole('button', { name: 'Log in' }));

  expect(screen.getByRole('textbox', { name: 'User name' })).toHaveAttribute('aria-invalid', 'true');
  expect(await screen.findByRole('alert')).toHaveTextContent('User name is required');
});
```

- `getByRole(role, { name })` finds the element **the way a screen reader does**:
  by its role and its accessible name
- A `<div onClick>` has no role `button`: the test **cannot find it**, and fails
- The test is an **accessibility check for free** — and resists CSS refactors

---

# End-to-end — axe-core in Playwright

```bash
npm init playwright@latest
npm install -D @axe-core/playwright
```

```ts {all|7-9|11-15}
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('the home page has no detectable violation', async ({ page }) => {
  await page.goto('/');

  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  expect(violations).toEqual([]);
});

// Audit a part of the page, in a given state
await page.getByRole('button', { name: 'Details' }).first().click();
await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
```

- Audit **every state**: the form in error, the dialog open, the menu expanded —
  axe only sees what is in the DOM **now**

---

# End-to-end — `toMatchAriaSnapshot`

```ts
test('the main navigation', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('navigation', { name: 'Main' })).toMatchAriaSnapshot(`
    - navigation "Main":
      - list:
        - listitem:
          - link "People"
        - listitem:
          - link "Add a person"
  `);
});
```

- A snapshot of the **accessibility tree**, not of the HTML: roles, names, states
- Fails when a link becomes a `<span>`, when a name changes, when a list
  disappears — the regressions **axe does not flag**
- `npx playwright test --update-snapshots` writes the first version

---

# The workshops are graded the same way

```bash
pnpm run verify --dir workshops --tp 05
```

```ts
// scripts/verify.mjs — extract
const table = page.getByRole('table', { name: /people/i });
ok('the cells are cells: "Dupont" is one', await visible(table.getByRole('cell', { name: 'Dupont' })));

ok('the identity fields are grouped: fieldset "Identity"',
   await visible(page.getByRole('group', { name: /identity/i })));

// workshop 08 on: axe-core, injected in the page
const { violations } = await page.evaluate(() => window.axe.run(document));
```

- **Playwright** drives a real Chromium: Tab, submit the form empty, open the dialog
- Every element is found by **role and accessible name** — never by a CSS class
- From workshop 08 on, **axe-core** runs on top: the engine of Lighthouse

---

# In the browser — simulate, then look

<div style="display: flex; gap: 2em;">
<div>

### Chrome DevTools

- **Rendering** panel → *Emulate vision deficiencies*: blurred vision,
  protanopia, deuteranopia, tritanopia, achromatopsia
- *Emulate CSS media feature*: `prefers-color-scheme`,
  `prefers-reduced-motion`, `forced-colors`
- **Elements** → colour picker: the **contrast ratio**, AA / AAA
- **Accessibility** pane: the tree, the computed name

</div>
<div>

### axe DevTools

![The axe DevTools extension](/images/a11y/axe-screenshot.png)

</div>
</div>

---

# The manual audit — the checklist

| Check | How |
|---|---|
| The **keyboard** reaches every interactive element, in a logical order | Unplug the mouse: Tab, Shift+Tab, Enter, Space, arrows |
| The **focus** is always visible, never on something hidden | Tab through the page, open and close every component |
| A **skip link** is the first stop | The first Tab after the address bar |
| The **accessibility tree** says what the page means | DevTools → Accessibility, full-page tree |
| Dynamic **ARIA states** follow the UI | `aria-expanded`, `aria-invalid`, `aria-current` in the Elements panel |
| The **screen reader** tells the story | Headings list, landmarks list, a form filled with eyes closed |
| **Zoom** at 200% and 400% | No content lost, no horizontal scroll at 320 px width |

<br />

> The last step: an audit **with users** of assistive technologies. They find
> what neither the tools nor you will.

<style>
table { font-size: 0.8em; }
</style>

---

# Going further

- [jest-axe](https://github.com/nickcolley/jest-axe) / [vitest-axe](https://github.com/chaance/vitest-axe) — axe in unit tests
- [`@axe-core/cli`](https://www.npmjs.com/package/@axe-core/cli) — `npx @axe-core/cli https://example.com`
- [a11y.css](https://ffoodd.github.io/a11y.css) — a stylesheet that highlights problems in the page
- [`@guidepup/guidepup`](https://www.guidepup.dev/) — drive VoiceOver and NVDA from a test
- Puppeteer `page.emulateVisionDeficiency('deuteranopia')` — screenshots per deficiency

---
layout: cover
---

# Workshop 08

## An automated audit

`workshops/08_automated_audit`
