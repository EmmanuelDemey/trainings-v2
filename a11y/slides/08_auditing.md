---
layout: cover
---

# 08 - Auditing

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Tell** what an automated tool catches — and the larger part it cannot see
- **Pick** the right tool for each moment: the editor, the unit tests, the
  end-to-end tests, the browser
- **Run** axe-core from Playwright, and lock the accessibility tree with
  `toMatchAriaSnapshot`
- **Write** tests that find elements by **role and accessible name**
- **Gate** every pull request in the CI: Playwright + axe, Pa11y CI,
  Lighthouse CI
- **Run** a manual audit: keyboard, screen reader, accessibility tree

<!--
Five verbs. The key message is the first one: a tool gives a floor, never a verdict. Workshop 08 ends on exactly that question.
-->

---

# Two kinds of evaluation

<div style="display: flex; gap: 2em;">
<div>

### Automated — fast, never tired

- Can fully test only **about a third** of the WCAG criteria
  (Deque: ~57% of the issues *by volume*, because they are the frequent ones)
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

<!--
The figures differ by method: by criterion, a third at best; by volume of issues (Deque's 2021 study), a bit more than half. Either way, the other half needs a human. The RGAA audit is manual by design: its tests are run by a person.
-->

---

# The tools — which one, when

| Tool | When | Catches |
|---|---|---|
| `eslint-plugin-jsx-a11y`, Svelte / Vue / Angular linters | **In the editor**, as you type | `alt` missing, unknown ARIA attribute, `onClick` on a `<div>` |
| **Testing Library** (`getByRole`) | **Unit tests** | An element with no role or no name: the query fails |
| **jest-axe** / **vitest-axe** | Unit tests, one component | The axe rules on a rendered component |
| **Playwright** + `@axe-core/playwright` | **End-to-end**, in the CI | The axe rules on a real page, in every state |
| `toMatchAriaSnapshot` | End-to-end | A **change** in the accessibility tree |
| **Pa11y CI** | **In the CI**, a list of URLs | axe and HTML_CodeSniffer rules, no test code |
| **Lighthouse CI** | In the CI, next to performance | An accessibility **score**, a subset of axe |
| **Lighthouse**, **axe DevTools**, WAVE | **In the browser**, by hand | The axe rules, with a visual report |
| Chrome DevTools — *Rendering* | In the browser | Colour vision deficiencies, `prefers-*`, `forced-colors` |

<br />

> Lighthouse, axe DevTools, jest-axe and `@axe-core/playwright` share the same
> engine: **axe-core** (Deque, open source) — Lighthouse runs a subset of its rules.

<style>
table { font-size: 0.8em; }
</style>

<!--
Read the table top to bottom: the earlier, the cheaper. Stress that four rows are the same engine — running Lighthouse after axe DevTools finds nothing new.
-->

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

<!--
jsx-a11y for React; eslint-plugin-vuejs-accessibility, eslint-plugin-svelte (a11y rules built into the compiler), angular-eslint template rules. Chapter 10 comes back to them per framework.
-->

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

<!--
Testing Library's priority list puts getByRole first for that reason. getByTestId is the last resort: it finds a div a screen reader cannot use.
-->

---

# End-to-end — axe-core in Playwright

```bash
npm init playwright@latest
npm install -D @axe-core/playwright
```

```ts {all|7-11|14-17}
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
const dialog = await new AxeBuilder({ page }).include('[role="dialog"]').analyze();
expect(dialog.violations).toEqual([]);
```

- Audit **every state**: the form in error, the dialog open, the menu expanded —
  axe only sees what is in the DOM **now**

<!--
The tags select the rule sets: WCAG 2.0, 2.1, 2.2, levels A and AA. Without withTags, axe also runs its best-practice rules — useful, but not a compliance claim. Asserting on an empty array prints the whole violation list when it fails.
-->

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

<!--
Demo: start from an empty toMatchAriaSnapshot(``), run with --update-snapshots, Playwright fills the template. Then turn a link into a span and watch it fail. Docs: playwright.dev/docs/aria-snapshots.
-->

---

# In the CI — a red check blocks the merge

```yaml
# .github/workflows/accessibility.yml
name: Accessibility
on: [pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test          # the axe and ARIA snapshot tests
      - uses: actions/upload-artifact@v7
        if: failure()
        with: { name: playwright-report, path: playwright-report/ }
```

- The tests of the two previous slides, on **every pull request**
- `webServer` in `playwright.config.ts` builds and starts the app before the tests
- A **required check** (branch protection): a regression cannot be merged
- On failure, the HTML report is attached: each violation, its node, its fix

<!--
The point is not the YAML, it is the required check: without branch protection, a red job is a suggestion. Start with the pages that matter most, and with zero violations on them — a baseline of 200 known violations that nobody reads is worse than five pages that are clean and stay clean.
-->

---

# Pa11y CI — a list of URLs, no test code

```json
// .pa11yci.json
{
  "defaults": {
    "standard": "WCAG2AA",
    "runners": ["axe", "htmlcs"]
  },
  "urls": [
    "http://localhost:4173/",
    "http://localhost:4173/people/new",
    {
      "url": "http://localhost:4173/people",
      "actions": ["click element #details-1", "wait for element [role=dialog] to be visible"]
    }
  ]
}
```

```bash
npx pa11y-ci                                     # the URLs of .pa11yci.json
npx pa11y-ci --sitemap https://example.com/sitemap.xml   # every page of a site
```

- **Configuration only**: good for a content site with many pages
- Two engines side by side: **axe** and **HTML_CodeSniffer**
- Only the state **on load** — unless you script `actions`; past a few clicks,
  write Playwright tests instead

<!--
Pa11y CI exits with a non-zero code as soon as a URL has an error: that is all a CI needs. `--threshold` tolerates a number of errors while a legacy site is being fixed; lower it release after release. The sitemap mode is the cheapest way to cover a whole documentation or marketing site.
-->

---

# Lighthouse CI — a score as a gate

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run preview",
      "url": ["http://localhost:4173/", "http://localhost:4173/people/new"]
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", { "minScore": 1 }]
      }
    }
  }
}
```

```bash
npx @lhci/cli autorun
```

- Worth it when Lighthouse **already runs** for performance: one more assertion
- A **subset** of the axe rules, on the state on load only
- ❌ A score of 100 is not a verdict: `<img alt="image">` scores 100

<!--
minScore 1 means 100/100: on a new project, start there and never go below. On an existing one, start at the current score and raise it. The score is a weighted average of the audits: one failing heavy audit costs more than several light ones, which makes it a poor progress indicator — the list of failing audits is what to read.
-->

---

# Which one in the CI?

| | Playwright + axe | Pa11y CI | Lighthouse CI |
|---|---|---|---|
| **What you write** | Tests, in code | A list of URLs | A list of URLs and a score |
| **States** | Every state you drive | On load, or scripted `actions` | On load |
| **Finds elements by role** | Yes — and `toMatchAriaSnapshot` | No | No |
| **Best for** | An application | A site with many pages | A project already on Lighthouse |

<br />

> Pick **one** engine run in the CI, not three: they share most rules. Then
> spend the time saved on the **manual** checks no tool runs.

<style>
table { font-size: 0.85em; }
</style>

<!--
For an application, Playwright + axe covers what the other two do, and the states they miss. Pa11y CI shines on a documentation or marketing site with a sitemap. Transition: this training's own repository runs the first option — next slide.
-->

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
- The CI of this repository runs `pnpm run verify` on every push: the solutions
  must pass, the starters must **fail**

<!--
Show the real file, scripts/verify.mjs: the learners have been graded by an end-to-end accessibility test since workshop 03. Each workshop replays the checks of the previous ones, so nothing fixed earlier comes back.
-->

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

<!--
Demo: Rendering, achromatopsia on the Genea11y form — does anything rely on colour alone? Then axe DevTools, "Scan all of my page", and open one issue to show the "how to fix" link.
-->

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
| **Zoom** at 200% (1.4.4) and 400% (1.4.10) | No content lost, no horizontal scroll at 320 px width |

<br />

> The last step: an audit **with users** of assistive technologies. They find
> what neither the tools nor you will.

<style>
table { font-size: 0.8em; }
</style>

<!--
This is the checklist of workshop 02, now that the learners know every topic behind it. A full compliance audit follows the RGAA method: 106 criteria, on a sample of pages, each with its tests.
-->

---

# Going further

- [jest-axe](https://github.com/nickcolley/jest-axe) / [vitest-axe](https://github.com/chaance/vitest-axe) — axe in unit tests
- [`@axe-core/cli`](https://www.npmjs.com/package/@axe-core/cli) — `npx @axe-core/cli https://example.com`
- [a11y.css](https://ffoodd.github.io/a11y.css) — a stylesheet that highlights problems in the page
- [`@guidepup/guidepup`](https://www.guidepup.dev/) — drive VoiceOver and NVDA from a test
- Puppeteer `page.emulateVisionDeficiency('deuteranopia')` — screenshots per deficiency
- [Pa11y CI](https://github.com/pa11y/pa11y-ci) ·
  [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Playwright — accessibility testing](https://playwright.dev/docs/accessibility-testing) ·
  [ARIA snapshots](https://playwright.dev/docs/aria-snapshots)
- [The RGAA audit method](https://accessibilite.numerique.gouv.fr/methode/) ·
  [Deque — automated coverage report](https://www.deque.com/automated-accessibility-coverage-report/)

<!--
Guidepup is still young: good for a smoke test of a widget, not for a whole suite.
-->

---

# Quiz — Auditing

**Zero axe violations: is the page accessible?**

- A) Yes
- B) Yes, if Lighthouse also scores 100
- C) No: tools fully test about a third of the criteria
- D) Only at level A

<v-click>

**Answer: C** — No. Tools fully test about a third of the criteria: `alt="image"` passes.

</v-click>

---

# Quiz — Auditing

**Why `getByRole` rather than `getByTestId`?**

- A) It is faster
- B) `getByTestId` is deprecated
- C) It works without a DOM
- D) It finds elements the way a screen reader does

<v-click>

**Answer: D** — It finds elements the way a screen reader does: no role or no name, the test fails.

</v-click>

---

# Quiz — Auditing

**What makes an accessibility CI job actually block a regression?**

- A) A red badge in the README
- B) A **required check** on the branch
- C) A Slack notification
- D) Running it every night

<v-click>

**Answer: B** — A **required check** on the branch: a red job alone is only a suggestion.

</v-click>

---
layout: cover
---

# Workshop 08

## An automated audit

<!--
Transition: workshop 08 — Lighthouse and axe DevTools on every page and every state, fix the defects slipped in since workshop 07, reach zero violation, then list what the tools did not see. `pnpm run verify --tp 08` runs axe-core like the CI. Next chapter: microdata — one level above semantic HTML, meaning for machines rather than for screen readers, then workshop 09.
-->
