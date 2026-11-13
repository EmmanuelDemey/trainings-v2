---
layout: cover
---

# Frameworks and Libraries

---

# Accessibility in Frameworks

* Modern JavaScript frameworks can help... or hurt accessibility
* **Warning**: a framework is not accessible by default
* You must **always** apply good practices

---

# Common pitfalls with frameworks

* ❌ **SPA (Single Page Application)**: native navigation is lost
    * The "page" change is not announced
    * History can be broken
    * Focus is not managed

* ❌ **Custom components**: reinventing the wheel
    * Buttons as `<div>`
    * Links as `<span>`
    * Inaccessible custom forms

* ❌ **Client-side rendering**: content not immediately available
    * Problem for screen readers
    * SEO is impacted

---

# Good practices - SPA

**1. Announce page changes**

```javascript
// React example
useEffect(() => {
  // Update the title
  document.title = `${pageTitle} - My App`;

  // Announce the change via aria-live
  const announcement = document.getElementById('route-announcer');
  announcement.textContent = `Navigated to ${pageTitle}`;
}, [location]);
```

```html
<!-- Add this element to your HTML -->
<div
  id="route-announcer"
  aria-live="assertive"
  aria-atomic="true"
  className="sr-only"
></div>
```

---

# Good practices - SPA

**2. Manage focus on route change**

```javascript
// React Router v6
import { useLocation, useNavigate } from 'react-router-dom';

function App() {
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    // Move focus to the main content
    mainRef.current?.focus();

    // Scroll to the top
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <main ref={mainRef} tabIndex={-1}>...</main>;
}
```

---

# React and accessibility

## Official React resources

* [React Accessibility Guide](https://react.dev/learn/accessibility)
* **JSX**: supports all ARIA attributes

```jsx
<div
  role="button"
  tabIndex={0}
  aria-pressed={isPressed}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  {label}
</div>
```

* **Fragment**: avoids useless `<div>`s

```jsx
<>
  <label htmlFor="name">Name</label>
  <input id="name" type="text" />
</>
```

---

# React - Useful hooks

```javascript
// Hook to manage focus
function useFocusTrap(ref) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleTab(e) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }

    element.addEventListener('keydown', handleTab);
    return () => element.removeEventListener('keydown', handleTab);
  }, [ref]);
}
```

---

# React - Accessible libraries

## **React Aria (Adobe)**

* Hooks to build accessible components
* No styling: you keep full control
* Based on the WAI-ARIA Practices

```jsx
import { useButton } from '@react-aria/button';

function MyButton(props) {
  let ref = useRef();
  let { buttonProps } = useButton(props, ref);

  return <button {...buttonProps} ref={ref}>{props.children}</button>;
}
```

* **Website**: https://react-spectrum.adobe.com/react-aria/

---

# React - Accessible libraries

## **Radix UI**

* Accessible headless components
* Style them with your favorite method
* Excellent accessibility quality

```jsx
import * as Dialog from '@radix-ui/react-dialog';

function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Title</Dialog.Title>
          <Dialog.Description>Description</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

* **Website**: https://www.radix-ui.com/

---

# React - Accessible libraries

## **shadcn/ui**

* Collection of reusable components
* Based on Radix UI
* You copy the code into your project

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

* **Website**: https://ui.shadcn.com/

## **Headless UI**

* By the creators of Tailwind CSS
* Unstyled, accessible components

* **Website**: https://headlessui.com/

---

# React - Testing Library

* **@testing-library/react**: tests accessibility

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('the button is accessible', async () => {
  render(<MyButton>Click me</MyButton>);

  // Use accessible queries
  const button = screen.getByRole('button', { name: /click me/i });

  // Test the interaction
  await userEvent.click(button);

  expect(button).toHaveAttribute('aria-pressed', 'true');
});
```

* Encourages accessibility good practices
* **Website**: https://testing-library.com/

---

# Vue.js and accessibility

## Official Vue resources

* [Vue Accessibility Guide](https://vuejs.org/guide/best-practices/accessibility.html)
* **Template**: supports ARIA attributes

```vue
<template>
  <button
    :aria-pressed="isPressed"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    {{ label }}
  </button>
</template>
```

---

# Vue - Accessible libraries

## **Headless UI for Vue**

```vue
<template>
  <Dialog v-model:open="isOpen">
    <DialogPanel>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
      <button @click="isOpen = false">Close</button>
    </DialogPanel>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue';
import { Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/vue';

const isOpen = ref(false);
</script>
```

* **Website**: https://headlessui.com/vue/

---

# Vue - Accessible libraries

## **PrimeVue**

* Complete component library
* Good accessibility out of the box
* Customizable themes

```vue
<template>
  <Dialog v-model:visible="visible" header="Title" :modal="true">
    <p>Dialog content</p>
    <template #footer>
      <Button label="No" @click="visible = false" />
      <Button label="Yes" @click="visible = false" autofocus />
    </template>
  </Dialog>
</template>
```

* **Website**: https://primevue.org/
* **Accessibility**: https://primevue.org/accessibility/

---

# Angular and accessibility

## Angular CDK (Component Dev Kit)

* Tools to build accessible components
* Focus, keyboard, overlay management, etc.

```typescript
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  template: `
    <div cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
      <button cdkFocusInitial>First element</button>
      <button>Second element</button>
      <button>Last element</button>
    </div>
  `
})
export class MyComponent {}
```

* **Website**: https://material.angular.io/cdk/a11y/overview

---

# Angular - Accessible libraries

## **Angular Material**

* Official component library
* Built-in accessibility
* Based on Material Design

```typescript
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  template: `
    <button mat-button (click)="openDialog()">Open</button>
  `
})
export class MyComponent {
  constructor(public dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(MyDialogComponent);
  }
}
```

* **Website**: https://material.angular.io/
* **Accessibility**: WCAG 2.1 AA compliant

---

# Angular - Useful directives

```typescript
// Initial focus
<input cdkFocusInitial />

// Focus monitor
import { FocusMonitor } from '@angular/cdk/a11y';

constructor(private focusMonitor: FocusMonitor, private el: ElementRef) {
  this.focusMonitor.monitor(this.el, true).subscribe(origin => {
    console.log('Focus origin:', origin); // 'mouse' | 'keyboard' | 'touch' | 'program'
  });
}

// Live announcer
import { LiveAnnouncer } from '@angular/cdk/a11y';

constructor(private liveAnnouncer: LiveAnnouncer) {}

announce(message: string) {
  this.liveAnnouncer.announce(message, 'polite');
}
```

---

# Svelte and accessibility

* **a11y warnings**: Svelte warns about accessibility issues

```svelte
<!-- Svelte will warn you if alt is missing -->
<img src="photo.jpg" />

<!-- ✅ Correct -->
<img src="photo.jpg" alt="Description" />

<!-- ❌ Svelte will warn you -->
<div on:click={handleClick}>Clickable</div>

<!-- ✅ Correct -->
<button on:click={handleClick}>Clickable</button>
```

---

# Accessible Web Components

* **Lit**: modern framework for Web Components

```javascript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-button')
class MyButton extends LitElement {
  @property({ type: Boolean }) pressed = false;

  render() {
    return html`
      <button
        role="button"
        aria-pressed="${this.pressed}"
        @click="${this._handleClick}"
      >
        <slot></slot>
      </button>
    `;
  }

  _handleClick() {
    this.pressed = !this.pressed;
  }
}
```

* **Website**: https://lit.dev/

---

# Accessibility testing tools

## **Jest + jest-axe**

```javascript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

# Accessibility testing tools

## **Cypress + cypress-axe**

```javascript
describe('Accessibility', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  it('has no accessibility violations', () => {
    cy.checkA11y();
  });

  it('checks a specific element', () => {
    cy.checkA11y('.my-component');
  });
});
```

---

# Accessibility testing tools

## **Storybook + Accessibility Addon**

```javascript
// .storybook/main.js
module.exports = {
  addons: ['@storybook/addon-a11y'],
};
```

* Tests accessibility directly in Storybook
* Visual report of violations
* Automated tests with axe-core

* **Website**: https://storybook.js.org/addons/@storybook/addon-a11y

---

# Accessible Design Systems

## Examples of accessible design systems

* **GOV.UK Design System**: https://design-system.service.gov.uk/
* **U.S. Web Design System**: https://designsystem.digital.gov/
* **Material Design**: https://m3.material.io/foundations/accessible-design
* **Carbon Design System (IBM)**: https://carbondesignsystem.com/guidelines/accessibility/overview
* **Atlassian Design System**: https://atlassian.design/foundations/accessibility

---

# Checklist - Framework

Before choosing a framework or library:

* ✅ Check the accessibility documentation
* ✅ Test the components with a screen reader
* ✅ Check keyboard support
* ✅ Browse the GitHub issues about accessibility
* ✅ Check whether a11y audits have been carried out
* ✅ Look at the code examples for ARIA attributes

**Golden rule**: a framework that does not mention accessibility probably does not take it seriously.

---

# Resources - Frameworks

* **React Aria**: https://react-spectrum.adobe.com/react-aria/
* **Radix UI**: https://www.radix-ui.com/
* **Headless UI**: https://headlessui.com/
* **Angular CDK**: https://material.angular.io/cdk/
* **Inclusive Components**: https://inclusive-components.design/
* **A11y Style Guide**: https://a11y-style-guide.com/

---
layout: cover
---

# Questions?
