---
layout: cover
---

# 10 - Frameworks and libraries

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** why a framework is not accessible by default — and what a SPA
  breaks that the browser used to do for you
- **Announce** a route change and **move** the focus after it
- **Recognise** what each framework gives you: linters, focus helpers, live
  announcers
- **Choose** a headless component library instead of rewriting a dialog, a
  combobox or tabs
- **Test** components by role, and with axe, in Storybook and in the CI

---

# A framework renders HTML — good or bad

```tsx
// ❌ What a component makes easy
<div className="btn" onClick={save}>Save</div>
<span className="link" onClick={() => navigate('/people')}>People</span>

// ✅ What the browser already knows how to handle
<button type="button" onClick={save}>Save</button>
<Link to="/people">People</Link>        {/* renders <a href="/people"> */}
```

- Everything of chapters 04 to 08 still applies: the framework **outputs HTML**,
  and the browser builds the accessibility tree from it
- A component written once is **reused everywhere**: one `<div onClick>` in a
  design system is a thousand broken buttons
- **No framework is accessible by default** — some only make the right thing
  easier

---

# What a SPA breaks

| The browser, on a real navigation | A SPA, on a client-side route change |
|---|---|
| Loads a new `<title>` | Keeps the old one — unless you set it |
| The screen reader announces the new page | **Silence**: nothing tells the user the page changed |
| Focus goes back to the top of the document | Focus stays on the clicked link — or on `<body>`, if the link was removed |
| Back / Forward restore the page and the scroll | Only if the router manages history and scroll |
| Content is in the HTML on arrival | Rendered by JavaScript: **empty** until it runs |

<br />

> WCAG 2.4.2 Page Titled (A), 2.4.3 Focus Order (A), 4.1.3 Status Messages (AA):
> a SPA has to do by hand what a page load did for free.

<style>
table { font-size: 0.85em; }
</style>

---

# Route change — update the title, announce it

```tsx
// RouteAnnouncer.tsx — rendered once, in the layout
export function RouteAnnouncer({ title }: Readonly<{ title: string }>) {
  const location = useLocation();
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = `${title} - Genea11y`;   // WCAG 2.4.2
    setMessage(`${title}, page loaded`);        // read by the live region below
  }, [location.pathname, title]);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}
```

- The live region must **exist before** its text changes: render it once, in
  the layout, never conditionally
- `polite`, not `assertive`: the user hears the current sentence end first
- **Next.js** (`next/link`), **Nuxt**, **SvelteKit** and **Angular** (with
  `TitleStrategy`) ship a route announcer: check it is on before writing one

---

# Route change — move the focus

```tsx
function Layout() {
  const location = useLocation();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();   // the user starts reading the new page here
  }, [location.pathname]);

  return (
    <main id="main">
      <h1 ref={headingRef} tabIndex={-1}>{title}</h1>
      <Outlet />
    </main>
  );
}
```

- Focus the page's **`<h1>`** (or `<main>`): the screen reader reads it, and the
  next Tab goes into the content
- `tabIndex={-1}`: focusable **by script**, not added to the Tab order
- ❌ Don't leave the focus on a link that was **removed** from the DOM: it falls
  back to `<body>`, and the user starts again from the top

---

# What each framework gives you

| | React | Vue | Angular | Svelte |
|---|---|---|---|---|
| **Linter** | `eslint-plugin-jsx-a11y` | `eslint-plugin-vuejs-accessibility` | `@angular-eslint/template` (a11y rules) | **Built into the compiler**: `a11y_*` warnings |
| **Focus trap** | `react-aria` `FocusScope`, `focus-trap-react` | `focus-trap-vue` | CDK `cdkTrapFocus` | `focus-trap` |
| **Live announcer** | `react-aria` `announce()` | your own `aria-live` region | CDK `LiveAnnouncer` | your own `aria-live` region |
| **Headless components** | **React Aria**, **Radix UI**, Headless UI, Ariakit | **Reka UI** (ex-Radix Vue), Headless UI | **Angular CDK**, Angular Aria | **Bits UI**, Melt UI |
| **Styled kits** | shadcn/ui (Radix), MUI, Chakra | PrimeVue, Vuetify | Angular Material, PrimeNG | shadcn-svelte |
| **Docs** | react.dev/learn/accessibility | vuejs.org — Accessibility | angular.dev/best-practices/a11y | svelte.dev — Accessibility warnings |

<br />

> **Headless** = behaviour, keyboard and ARIA done for you, **no styling**: you
> keep your design system, they keep the WAI-ARIA patterns.

<style>
table { font-size: 0.7em; }
</style>

---

# A headless dialog — what you no longer write

```tsx
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Root>
  <Dialog.Trigger>Details</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="overlay" />
    <Dialog.Content className="dialog">
      <Dialog.Title>Jean Dupont</Dialog.Title>
      <Dialog.Description>Born in 1932, in Lille.</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

- `role="dialog"`, `aria-modal`, `aria-labelledby` / `aria-describedby` — set
- Focus **moved in**, **trapped**, **given back** to the trigger, Escape closes —
  everything of workshop 07, done
- The same contract in React Aria (`<Modal>`), Reka UI, Bits UI, the Angular CDK
  (`Dialog`) — and the native **`<dialog>`** + `showModal()` for the simple cases

---

# Framework-specific helpers

<div style="display: flex; gap: 2em;">
<div>

### Angular CDK

```ts
// Where did the focus come from?
this.focusMonitor.monitor(this.el, true)
  .subscribe((origin) => console.log(origin));
  // 'mouse' | 'keyboard' | 'touch' | 'program' | null

// Announce without a visible change
this.liveAnnouncer.announce('Person saved', 'polite');
```

```html
<div cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
  <button cdkFocusInitial>First</button>
</div>
```

</div>
<div>

### Svelte — the compiler warns

```svelte
<!-- ⚠ a11y_missing_attribute -->
<img src="photo.jpg" />

<!-- ⚠ a11y_click_events_have_key_events,
     a11y_no_static_element_interactions -->
<div onclick={open}>Details</div>

<!-- ✅ -->
<img src="photo.jpg" alt="Jean Dupont in 1960" />
<button onclick={open}>Details</button>
```

</div>
</div>

---

# Web Components — the shadow DOM

```js
class MyToggle extends HTMLElement {
  connectedCallback() {
    // ✅ a real <button> inside: role, focus and keyboard for free
    this.attachShadow({ mode: 'open' }).innerHTML = `<button aria-pressed="false"><slot></slot></button>`;
    const button = this.shadowRoot.querySelector('button');
    button.addEventListener('click', () => {
      button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
    });
  }
}
customElements.define('my-toggle', MyToggle);
```

- Put a **native element** inside, rather than `role="button"` on the host
- ❌ `aria-labelledby` / `for` **cannot cross** the shadow boundary: a `<label>`
  outside cannot name an `<input>` inside
- `ElementInternals` (`this.attachInternals()`) sets a role and states on the
  host itself; **Lit** makes all this shorter

---

# Testing components

```ts
// Vitest + Testing Library + vitest-axe (same API as jest-axe)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

test('the toggle is a pressed button after a click', async () => {
  const { container } = render(<Toggle>Dark theme</Toggle>);
  const button = screen.getByRole('button', { name: 'Dark theme' });

  await userEvent.click(button);

  expect(button).toHaveAttribute('aria-pressed', 'true');
  expect(await axe(container)).toHaveNoViolations();
});
```

- `getByRole` + axe in every component test — chapter 09
- **Storybook** `@storybook/addon-a11y`: axe on every story, in the panel and in
  the test runner
- **Cypress**: `cypress-axe` (`cy.injectAxe()`, `cy.checkA11y()`); **Playwright**:
  `@axe-core/playwright`

---

# Choosing a library — the checklist

- ✅ It has an **accessibility page** — which patterns, which keyboard
  interactions, which screen readers were tested
- ✅ It follows the **ARIA Authoring Practices Guide** (APG) patterns
- ✅ **Unplug the mouse** on its docs site: dialog, menu, combobox, tabs
- ✅ **Turn on a screen reader** on the same demos
- ✅ Read its **GitHub issues** labelled `a11y` / `accessibility`: how many,
  how old, how answered
- ✅ It renders **native elements** when they exist (`<button>`, `<a>`,
  `<input>`, `<dialog>`)

<br />

> A library that never mentions accessibility probably never tested it.

---

# Accessible design systems — to learn from

| Design system | Why look at it |
|---|---|
| [GOV.UK Design System](https://design-system.service.gov.uk/) | Every component tested with users of assistive technologies |
| [U.S. Web Design System](https://designsystem.digital.gov/) | Section 508 conformance, documented per component |
| [Carbon (IBM)](https://carbondesignsystem.com/guidelines/accessibility/overview) | Accessibility guidelines for design **and** development |
| [Atlassian Design System](https://atlassian.design/foundations/accessibility) | Foundations: colour, focus, motion |
| [Material Design 3](https://m3.material.io/foundations/accessible-design) | Accessible design principles, touch targets |

<br />

- More: [React Aria](https://react-spectrum.adobe.com/react-aria/) ·
  [Radix UI](https://www.radix-ui.com/) · [Headless UI](https://headlessui.com/) ·
  [Angular CDK](https://material.angular.io/cdk/a11y/overview) ·
  [Inclusive Components](https://inclusive-components.design/) ·
  [A11y Style Guide](https://a11y-style-guide.com/)

<style>
table { font-size: 0.85em; }
</style>
