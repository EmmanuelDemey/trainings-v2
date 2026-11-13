---
layout: cover
---

# Focus

---

# Focus

* Keyboard users will use
    * the **Tab** key to move to the next focusable element
    * **Shift + Tab** to move to the previous element
    * Note: in Safari / macOS, **Option + Tab** (Tab skips links by default)
    * the **up/down arrow** keys to navigate inside a control

---

# Focusable elements

* By default, the following HTML elements are **focusable**:
    * buttons
    * links
    * form controls (`input`, `select`, `textarea`)
    * the `summary` element
    * editable elements (`contenteditable`)
* These elements must receive focus in the same order as they are displayed.

---

# Why does focus matter?

* **Keyboard navigation**: the only way to interact for some users
* **Screen readers**: focus determines what is announced
* **Motor disabilities**: unable to use a mouse
* **Efficiency**: keyboard shortcuts for power users
* **WCAG 2.4.7** (AA): focus must be visible

---

# Use cases

* Only interactive elements should be focusable
* Otherwise keyboard navigation becomes tedious
* **Golden rule**: if you can click it, you must be able to reach it with the keyboard

---

# Use cases - SPA

* Possible exceptions for **SPAs** (Single Page Applications)
    * Move focus to the title of the loaded page (navigation handling)
    * Move focus to new content so the user is notified of it (notifications, error messages)
    * Handle focus trapping (modals, dropdown menus)

---

# Tab Order

* The order of focusable elements must be logical and follow the visual order
* Don't do this

```html
<section>
  <a href="#">1</a>
  <a href="#">2</a>
  <a href="#">3</a>
  <a href="#">4</a>
</section>
```

--- 

# Tab Order

```css
section {
  display: flex;
  flex-direction: row-reverse;
}
```

---

# Tab Order

* How to handle hidden focusable elements?
    * remove them from the **tab order**
    * `display: none` or `visibility: hidden`
    * with the `hidden` attribute

---

# Tab Order - JavaScript

* How do we know which element has focus?

```javascript
// Get the currently focused element
const focusedElement = document.activeElement;
console.log(focusedElement);

// Set focus programmatically
const element = document.querySelector('#main');
element.focus();

// Listen to focus changes
element.addEventListener('focus', () => {
    console.log('Element has focus');
});

element.addEventListener('blur', () => {
    console.log('Element lost focus');
});
```

---

# Tabindex

* The `tabindex` attribute lets you:
    * make an element focusable (value `0`)
    * make an element focusable programmatically only (value `-1`)
    * change the tab order (positive value - **antipattern**)
    * remove an element from the tab order (with a negative value)

```html
<!-- Focusable with Tab -->
<div tabindex="0">Focusable DIV</div>

<!-- Focusable via JavaScript only -->
<div tabindex="-1">Programmatically focusable DIV</div>

<!-- Natively focusable element -->
<button>Submit</button>
```

---

# Tabindex

* We can also set `tabindex` to a value greater than 0
* Elements with the lowest `tabindex` (> 0) come first in the keyboard sequence
* Then elements with `tabindex="0"` or that are natively focusable

```html
<div tabindex="0">Focusable DIV (order 3)</div>
<div tabindex="5">Focusable DIV (order 2)</div>
<div tabindex="1">Focusable DIV (order 1)</div>
<button>Submit (order 4)</button>
```

* **⚠️ Warning: antipattern** - Never use positive values!
* It creates an unpredictable and confusing navigation order

---

# Skip Link

* This feature lets users quickly skip repeated sections (menu, header)
* Especially useful for keyboard and screen reader users
* A **Skip Link** consists of:
    * a link hidden by default, placed at the very beginning of the page
    * the link becomes visible when it receives focus (via Tab)
    * when activated, focus moves straight to the main content
* Avoids going through every menu link on each page

---

# Skip Link

* A few examples
    * [Axesslab](https://axesslab.com/)
    * [Github](https://github.com/)
    * [H&M](https://www2.hm.com/en_gb/index.html)

---
layout: statement
---

How would you implement a **skip link** in plain HTML/CSS/JavaScript?

---

# Skip Link

```html
<a class="skip-link" href="#main">Skip to main content</a>

<main id="main" tabindex="-1">
    ...
</main>
```
```css
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
}

.skip-link:focus {
    top: 0;
}
```

---

# CSS - Visible focus

* Focus **must** be visible on every interactive element
* Use `:focus-visible` rather than `:focus` (avoids showing focus on mouse click)
* **Never** use `outline: none` without a visual alternative

```css
button:focus-visible {
    outline: 3px solid #32a1ce;
    outline-offset: 2px;
}
```

---

# CSS - Custom focus

* We can define a different design if needed
* Make sure the contrast is sufficient (3:1 ratio minimum)

```css
.button:focus-visible {
    outline: 0; /* Only if an alternative is provided */
    box-shadow: 0 0 0 3px #fff, 0 0 0 6px #32a1ce;
}

/* Or with a pseudo-element */
.button:focus-visible::before {
    content: '';
    position: absolute;
    inset: -4px;
    border: 2px solid #32a1ce;
    border-radius: 4px;
}
```

---

# Focus Trap

* Some components need to **trap focus**:
    * Modals / Dialogs
    * Dropdown menus
    * Side panels (sidebars)
* Focus must stay inside the component until it is closed
* Prevents the user from navigating to hidden content

---

# Focus Trap - Example

```javascript
const modal = document.querySelector('.modal');
const focusableElements = modal.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
);
const firstElement = focusableElements[0];
const lastElement = focusableElements[focusableElements.length - 1];

modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
});
```

---

# Best practices

* ✅ **Do**:
    * Always make focus visible
    * Follow the natural DOM order
    * Use native HTML elements whenever possible
    * Test keyboard navigation regularly

* ❌ **Avoid**:
    * `outline: none` without an alternative
    * `tabindex` with positive values
    * Illogical focus order
    * Clickable elements that are not focusable

---

# Testing tools

* **Browser**: use the Tab key only
* **Chrome extension**: Accessibility Insights
* **Chrome/Firefox extension**: axe DevTools
* **Manual test**: unplug the mouse!
* **Chrome shortcut**: `chrome://accessibility` to view the accessibility tree

---
layout: cover
---

# Workshop 3

Focus & skip link
