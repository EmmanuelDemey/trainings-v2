---
layout: cover
---

# 7 - JavaScript and responsive design

---

# Responsive: CSS first, JS when needed

- **CSS media queries** remain the primary tool for responsive design
- JavaScript steps in when the **behavior** must change, not just the style:
  - swap a menu for a burger menu
  - load a different component on mobile
  - enable drag & drop only on desktop

```javascript
console.log(window.innerWidth);  // current viewport width in px
console.log(window.innerHeight); // current viewport height in px
```

---

# Adapting to the screen size

```javascript
const MOBILE_BREAKPOINT = 768;

function isMobile() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

if (isMobile()) {
  menu.classList.add('menu--burger');
} else {
  menu.classList.remove('menu--burger');
}
```

- Keep breakpoint values **consistent with your CSS media queries**

---

# Reacting to a resize

- The window emits a **`resize`** event on every size change

```javascript
function updateLayout() {
  const mobile = window.innerWidth < 768;

  menu.classList.toggle('menu--burger', mobile);
  sidebar.classList.toggle('hidden', mobile);
}

window.addEventListener('resize', updateLayout);
updateLayout(); // run once at startup too!
```

- `classList.toggle(name, condition)`: adds the class if the condition is `true`, removes it otherwise
- `resize` fires **a lot** — keep the handler cheap

---

# The modern alternative: `matchMedia`

- Reuse your **CSS media queries directly in JavaScript**

```javascript
const mobileQuery = window.matchMedia('(max-width: 767px)');

function apply(query) {
  menu.classList.toggle('menu--burger', query.matches);
}

apply(mobileQuery);                          // initial state
mobileQuery.addEventListener('change', apply); // fires ONLY when crossing the breakpoint
```

- Cleaner than `resize`: notified **only when the breakpoint is crossed**
- Same syntax as CSS ➜ one single source of truth

---

# Hands-on

## Workshop 7 - Responsive behavior

<div style="opacity:.7; font-size:.85em">📁 <code>chapters/javascript/tp/07_responsive/</code> — ⏱ ~45 min — open <code>index.html</code>, steps in its <code>README.md</code></div>

- Display the viewport width live in the page while resizing
- Toggle a `mobile` class on `<body>` under 768px (via `resize`)
- Rebuild the same feature with `matchMedia` and compare
- Burger menu: hidden list on mobile, toggled by a button

---
layout: cover
---

# End of Day 2

---

# What you can do now

- Read the browser: `window.innerWidth`, `location`, `navigator`
- Schedule code with `setTimeout` / `setInterval` — **and stop it**
- Select, read, modify, create and remove any element of the page
- React to a click, a keystroke, a form submission, a resize
- Toggle CSS classes instead of writing styles from JavaScript

<br />

## Tomorrow

No new syntax. One **method** — state ➜ render ➜ events — and four small
applications built with it, from an empty file.

> Tonight, if you want a head start: re-read your workshop 6 todo-list and ask
> yourself where the list of tasks actually lives. Tomorrow's answer: in an
> array, never in the page.
