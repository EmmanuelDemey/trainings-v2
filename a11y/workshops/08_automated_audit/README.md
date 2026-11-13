# TP 8 — An automated audit

> Audit Genea11y with Lighthouse and axe DevTools, fix every violation they report, and know what they cannot see.

## Goal

Chapter 9 — Automated tools are fast and never tired, and they catch a good
share of the problems: missing alternatives, contrast, missing names, invalid
ARIA. They also miss most of what you fixed in workshops 3 to 7. In this
workshop you will:

- run **Lighthouse** and **axe DevTools** on every page, **in every state**
  (the form in error, the dialog open);
- **fix** each violation they report, and understand why it is one;
- reach **zero violation**, then think about what that score does not prove.

The app looks like the end of workshop 7, with a new logo in the header. But
since workshop 7, **a few accessibility defects have slipped in**. Finding them
is the workshop: there are no `TODO` comments this time.

**Files:** whatever the tools point you to.

## Setup

```bash
cd workshops/08_automated_audit
npx serve .
```

Use Chrome (or Edge) for Lighthouse, and install the
[axe DevTools](https://www.deque.com/axe/devtools/) extension for Chrome or
Firefox.

## Steps

### 1. Lighthouse — nothing to install

1. Open `index.html` in Chrome, open the devtools (F12), go to the
   **Lighthouse** tab.
2. Tick the **Accessibility** category only, *Navigation* mode, and run the
   audit.
3. Write down the score, and read each failed audit: what element, which rule,
   and the *Learn more* link.
4. Do the same on `create.html`.

### 2. axe DevTools — the same engine, more detail

1. Open the devtools, go to the **axe DevTools** tab, and run a full scan of each
   page.
2. Compare with Lighthouse. Lighthouse runs a subset of axe-core's rules:
   do you find the same issues? More?
3. For each issue, axe shows the **element**, the **WCAG criterion**, its
   **impact**, and how to fix it. Note them in a small table: rule, element,
   criterion, fix.

### 3. Every state of the app

A tool only audits what is **in the page when it runs**. Scan again:

- `create.html` **after submitting the empty form**: the error summary and the
  messages are only there now;
- `index.html` **with the dialog open**: its content only shows now.

In Lighthouse, the *Snapshot* mode audits the page as it is, without
reloading it.

### 4. Fix, and run again

Fix each violation, in the HTML or the CSS, then run the tools again until there
is none, on both pages and in every state. Aim for a Lighthouse score of 100.

For a contrast issue, the devtools colour picker shows the ratio and the
threshold, and suggests a colour that passes. Change the colour **variable**
when it is one: the same colour is often used elsewhere.

### 5. What the tools did not see

Go back to the starter of workshop 3 (`workshops/03_focus/`) and run axe on it.
Most of what you fixed in workshops 3 to 7 is **not reported**: no skip link, no
visible focus, a table made of `<div>`s, a focus that is not trapped. A score of
100 means *"no detected failure"*, not *"accessible"*: the keyboard and screen
reader tests stay mandatory.

## Checking your work

**By hand.** Lighthouse and axe DevTools report no violation on `index.html`
and `create.html`, with the form in error, and with the dialog open. And the
keyboard and screen reader tests of the previous workshops still pass.

**From the terminal**, in the training folder:

```bash
pnpm run verify --dir workshops --tp 08
```

It **embeds axe-core**, the engine behind Lighthouse and axe DevTools, and runs
it on:

- `index.html`;
- `create.html`;
- `create.html` after submitting the empty form;
- `index.html` with the details dialog open.

Each `KO` line lists the axe rules violated, with the number of elements each,
such as `-> color-contrast (1), …`. Look the rule up in axe DevTools, or on
[dequeuniversity.com/rules/axe](https://dequeuniversity.com/rules/axe/).

It also replays the checks of workshop 3 (skip link, focus) and workshop 7 (the
dialog): one of the defects is something axe does **not** report, and only a
check written for this app catches.

## Going further

**Automate the audit in your own project**, with Playwright and
[`@axe-core/playwright`](https://www.npmjs.com/package/@axe-core/playwright).
In an empty folder next to the app (the app served on port 3000):

```bash
npm init playwright@latest
npm install -D @axe-core/playwright
```

Create `tests/accessibility.spec.js`:

```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('the home page has no axe violation', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test('the creation page has no axe violation', async ({ page }) => {
    await page.goto('http://localhost:3000/create.html');

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
});
```

Run it:

```bash
npx playwright test
```

Then:

- add a test for **the form in error** (click *Add the person* first) and one
  for **the dialog open** (click a *View details* button first);
- restrict the rules to the WCAG levels you target:
  `.withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])`;
- scan a part of the page only with `.include('#modal')`;
- run it in your CI, so that an accessibility regression fails the build.

Other ideas:

- Read `scripts/verify.mjs`: it finds every element by its **role and accessible
  name** (`getByRole`, `getByLabel`), as a screen reader would. A test written
  that way fails when the accessibility breaks.
- Try another engine on the same pages: [WAVE](https://wave.webaim.org/) or
  the Firefox *Accessibility* tab's *Check for issues*. Do they agree?

## Useful links

- [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [axe-core rules](https://dequeuniversity.com/rules/axe/)
- [Playwright — Accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/)
