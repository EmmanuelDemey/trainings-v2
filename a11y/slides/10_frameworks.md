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

<!--
Five verbs. The thread of the chapter: everything from chapters 04 to 09 still applies — a framework only changes where the mistakes are made, and how many times they are copied.
-->

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

<!--
Open the dev tools on any SPA and look at the accessibility tree: it is built from the rendered HTML, not from the components. A Link component that renders an a with an href keeps middle-click, "open in a new tab", and the "link" role. A span with onClick keeps none of that.
-->

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

<!--
Do the demo: on a classic site, follow a link with the screen reader on — it reads the new title. On a SPA, the same click says nothing. 4.1.3 is the criterion usually cited for the announcement; the focus part is 2.4.3. The last row is chapter 05: an empty HTML shell has no headings and no landmarks until the JavaScript runs.
-->

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
- **Next.js**, **SvelteKit** and **Nuxt** (`<NuxtRouteAnnouncer>`) ship a
  route announcer: check it is on before writing one
- **Angular** sets the title (route `title`, `TitleStrategy`) but announces
  nothing: use the CDK `LiveAnnouncer`

<!--
Next.js and SvelteKit announce the new title (or the h1) on every client-side navigation, out of the box. Nuxt has a NuxtRouteAnnouncer component, added to app.vue by the starter templates: check it is there. Angular only manages document.title — the announcement is up to you. Re-announcing the same text twice may be ignored by a screen reader: that is why the message is reset on each route.
-->

---

# Route change — move the focus

```tsx
function Layout({ title }: Readonly<{ title: string }>) {
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

<!--
WCAG 2.4.3 Focus Order. Pick one strategy and test it with a screen reader: focusing the h1 already reads the new title, so a live announcement on top of it is read twice. Give the focused heading a visible focus style, or hide the outline only when it was focused by script (:focus-visible does that in most browsers). Do not move the focus on the first page load, nor when only a query parameter changes (a filter, a sort): the user did not leave the page.
-->

---

# What each framework gives you

| | React | Vue | Angular | Svelte |
|---|---|---|---|---|
| **Linter** | `eslint-plugin-jsx-a11y` | `eslint-plugin-vuejs-accessibility` | `@angular-eslint/template` (a11y rules) | **Built into the compiler**: `a11y_*` warnings |
| **Focus trap** | `react-aria` `FocusScope`, `focus-trap-react` | `focus-trap-vue` | CDK `cdkTrapFocus` | `focus-trap` |
| **Live announcer** | `react-aria` `announce()` | your own `aria-live` region | CDK `LiveAnnouncer` | your own `aria-live` region |
| **Headless components** | **React Aria**, **Radix UI**, Headless UI, Ariakit | **Reka UI** (ex-Radix Vue), Headless UI | **Angular CDK**, Angular Aria | **Bits UI**, Melt UI |
| **Styled kits** | shadcn/ui (Radix), MUI, Chakra | PrimeVue, Vuetify | Angular Material, PrimeNG | shadcn-svelte |
| **Docs** | legacy.reactjs.org — Accessibility | vuejs.org — Accessibility | angular.dev/best-practices/a11y | svelte.dev — Accessibility warnings |

<br />

> **Headless** = behaviour, keyboard and ARIA done for you, **no styling**: you
> keep your design system, they keep the WAI-ARIA patterns.

<style>
table { font-size: 0.7em; }
</style>

<!--
Not to be learnt by heart: it is a map, to be read with your own stack. The linter row is chapter 09: the earlier the cheaper. Angular Aria is recent (developer preview): check its status before choosing it. React docs: the accessibility page is still on legacy.reactjs.org — react.dev has no dedicated page yet.
-->

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
- The same contract in React Aria (`<Modal>` + `<Dialog>`), Reka UI, Bits UI,
  the Angular CDK (`Dialog`) — and the native **`<dialog>`** + `showModal()` for
  the simple cases

<!--
Put it next to the solution of workshop 07: some forty lines of focus management disappear. Radix warns in the console when Title or Description is missing — that is the library teaching accessibility. Still test it: the library guarantees the pattern, not your labels, your contrast or your focus style.
-->

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

<!--
FocusMonitor is what lets you show a focus ring for the keyboard only, when :focus-visible is not enough; call stopMonitoring in ngOnDestroy. In Svelte the warnings come from the compiler itself: no ESLint plugin to install, and they show up in the terminal at every build. Do not silence them with svelte-ignore without a reason written next to it.
-->

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

<!--
The text in the slot names the inner button: slotted content stays in the light DOM, but is rendered inside, so the accessible name works. What does not work is an ID reference across the boundary — the Reference Target proposal aims to fix it, not usable yet. Form controls inside a shadow root also need ElementInternals (formAssociated) to take part in a form.
-->

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
  the tests (`@storybook/addon-vitest`)
- **Cypress**: `cypress-axe` (`cy.injectAxe()`, `cy.checkA11y()`); **Playwright**:
  `@axe-core/playwright`
- In the **CI**: the same tests, failing the build — like `pnpm run verify` in the
  workshops

<!--
Setup not shown: vitest-axe needs its matchers registered (expect.extend with vitest-axe/matchers) and toHaveAttribute comes from @testing-library/jest-dom. jsdom has no layout: axe cannot check colour contrast there — that is for Storybook or Playwright, in a real browser. In recent Storybook versions, the a11y addon can be set to fail the tests ("error") instead of only warning.
-->

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

<!--
Ten minutes per library, before adopting it: keyboard, then screen reader, on its own docs. If the docs site itself fails, the components will. Switching a design system later costs far more than this check.
-->

---

# Accessible design systems — to learn from

| Design system | Why look at it |
|---|---|
| [GOV.UK Design System](https://design-system.service.gov.uk/) | Every component tested with users of assistive technologies |
| [U.S. Web Design System](https://designsystem.digital.gov/) | Section 508 conformance, documented per component |
| [Carbon (IBM)](https://carbondesignsystem.com/building-blocks/foundations/accessibility/overview) | Accessibility guidelines for design **and** development |
| [Atlassian Design System](https://atlassian.design/foundations/accessibility) | Foundations: colour, focus, motion |
| [Material Design 3](https://m3.material.io/foundations/accessible-design) | Accessible design principles, touch targets |

<br />

- More: [React Aria](https://react-aria.adobe.com/) ·
  [Radix UI](https://www.radix-ui.com/) · [Headless UI](https://headlessui.com/) ·
  [Angular CDK](https://material.angular.dev/cdk/a11y/overview) ·
  [Inclusive Components](https://inclusive-components.design/) ·
  [The A11Y Project](https://www.a11yproject.com/)

<style>
table { font-size: 0.85em; }
</style>

<!--
Transition: no workshop for this chapter — the workshops are framework-free on purpose, everything learnt there carries over to any stack. Next chapter: microdata — one level above semantic HTML, meaning for machines rather than for screen readers, then workshop 09.
-->

---

# Quiz — Frameworks and libraries

**What does a SPA route change miss that a page load did for free?**

- A) A new title, an announcement, the focus back at the top
- B) Nothing: the browser handles it
- C) The CSS
- D) The JavaScript state

<v-click>

**Answer: A** — A new title, an announcement, the focus back at the top.

</v-click>

---

# Quiz — Frameworks and libraries

**After a route change, where do you move the focus?**

- A) Leave it where it was
- B) On the first link of the navigation
- C) On `<body>`
- D) On the page's `<h1>` (or `<main>`), with `tabIndex={-1}`

<v-click>

**Answer: D** — To the page's `<h1>` (or `<main>`), with `tabIndex={-1}`.

</v-click>

---

# Quiz — Frameworks and libraries

**What is a *headless* component library?**

- A) A library rendered on the server only
- B) A library for tests in a headless browser
- C) Behaviour, keyboard and ARIA done for you, **no styling**
- D) A library without JavaScript

<v-click>

**Answer: C** — Behaviour, keyboard and ARIA done for you, no styling: React Aria, Radix, Reka UI…

</v-click>
