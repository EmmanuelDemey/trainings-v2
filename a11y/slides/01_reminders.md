---
layout: cover
---

# 01 - Reminders

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Select** elements with CSS selectors, in CSS and in JavaScript
- **Read and write** attributes — the way every ARIA state is toggled
- **Listen** to events, and stop their propagation or default behaviour
- **Hide** content visually while keeping it for screen readers: `.sr-only`

> The workshops are **plain HTML, CSS and JavaScript**. These are the only
> DOM APIs they need.

---

# Selecting elements

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1; min-width: 0;">

```css
/* The same selectors, in CSS… */
#id { }
.className { }
button { }
[aria-hidden='true'] { }
img[aria-hidden='true'] { }
```

```js
// …and in JavaScript
const input = document.querySelector('#nameInput');
const submit = document.querySelector('button[aria-label="Submit"]');

// Legacy, still works
const same = document.getElementById('nameInput');
```

</div>
<div style="flex: 1; min-width: 0;">

```js
// Several elements: a NodeList
const errors = document.querySelectorAll('[aria-invalid="true"]');

// To an Array, for map / filter / forEach
const buttons = [...document.querySelectorAll('button')];
// or Array.from(document.querySelectorAll('button'))

if (!buttons.length) console.log('No button found');

// Legacy, still works
document.getElementsByTagName('p');
document.getElementsByClassName('error');
```

</div>
</div>

- An **attribute selector** like `[aria-invalid="true"]` styles and finds
  elements by their **state** — chapter 07 builds on it

---

# Attributes and events

```js
const field = document.querySelector('#email');

field.hasAttribute('aria-invalid');
field.setAttribute('aria-invalid', 'true');   // ARIA states are plain attributes
field.removeAttribute('aria-invalid');
```

```js
document.addEventListener('DOMContentLoaded', () => {   // the HTML is parsed
  const button = document.querySelector('button');

  button.addEventListener('click', (e) => {
    e.stopPropagation();   // stop the bubbling to the parents
    e.preventDefault();    // cancel the default action (submit, navigate…)
    console.log('Button clicked:', button.textContent);
  });
});
```

- By default an event **bubbles**: it is dispatched on the target, then on each
  of its ancestors
- `keydown` + `e.key` is what custom widgets listen to (chapters 07 and 08)

---

# `.sr-only` — visible to screen readers only

<div style="display: flex; gap: 1.5em;">
<div style="flex: 1; min-width: 0;">

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

| Technique | Seen | Read out |
|---|---|---|
| `display: none` | ❌ | ❌ |
| `visibility: hidden` | ❌ | ❌ |
| `opacity: 0` | ❌ | ✅ — but still clickable: confusing |
| **`.sr-only`** | ❌ | ✅ |

</div>
<div style="flex: 1; min-width: 0;">

```html
<!-- Skip link (shown on focus, chapter 04) -->
<a href="#main-content" class="sr-only">Skip to main content</a>

<!-- Icon button -->
<button>
  <span class="sr-only">Close</span>
  <svg aria-hidden="true"><!-- X --></svg>
</button>

<!-- Extra context -->
<a href="https://example.com" target="_blank">
  Documentation
  <span class="sr-only">(opens in a new tab)</span>
</a>
```

- For what is **visually obvious** but not spoken: skip links, icon labels,
  instructions for a complex widget, "opens in a new tab"

</div>
</div>

<style>
table { font-size: 0.8em; }
</style>

---

# And in a framework?

- Selecting, listening, toggling attributes: the **same concepts** in React,
  Vue, Angular, Svelte — through refs, bindings and directives
- They add their own APIs for **focus** and **ARIA attributes**: chapter 10
- What you learn here on plain HTML applies there unchanged — the browser and
  the screen reader only ever see the **DOM**
