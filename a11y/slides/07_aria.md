---
layout: cover
---

# 07 - ARIA

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Explain** what ARIA changes — the accessibility tree — and what it does
  **not**: behaviour, focus, keyboard
- **Apply** the five rules of ARIA, starting with *"no ARIA is better than bad
  ARIA"*
- **Use** roles, states and properties, and keep states **in sync** with
  JavaScript
- **Build** a custom widget the native way would have given you for free:
  role, name, state, focus, keyboard
- **Find** the right pattern in the ARIA Authoring Practices Guide

---

# WAI-ARIA in one slide

**WAI-ARIA** — *Accessible Rich Internet Applications* — attributes that tell
assistive tech what an element **is** and what **state** it is in.

| Kind | Answers | Examples | Changes at runtime? |
|---|---|---|---|
| **Role** | *What is it?* | `role="tab"`, `role="dialog"`, `role="switch"` | Almost never |
| **State** | *How is it now?* | `aria-checked`, `aria-expanded`, `aria-selected` | **Yes** — on every interaction |
| **Property** | *How does it relate?* | `aria-labelledby`, `aria-controls`, `aria-live` | Rarely |

<br />

> ARIA only changes the **accessibility tree**. It adds no style, no focus, no
> keyboard handling, no behaviour — all of that is still **your** job.

<style>
table { font-size: 0.85em; }
</style>

---

# What ARIA does — and does not

```html
<!-- ❌ Announced "checkbox, checked" … and that is all it does -->
<div role="checkbox" aria-checked="true">Take the accessibility training</div>
```

| | `<input type="checkbox">` | `<div role="checkbox">` |
|---|---|---|
| Role announced | ✅ | ✅ |
| Reached with Tab | ✅ | ❌ needs `tabindex="0"` |
| Toggles with Space | ✅ | ❌ needs a `keydown` handler |
| Toggles on click | ✅ | ❌ needs a `click` handler + `aria-checked` update |
| Name from a `<label>` | ✅ | ❌ needs `aria-labelledby` |
| Submitted with the form | ✅ | ❌ needs a hidden input |
| Works in Windows high-contrast mode | ✅ | ❌ needs `forced-colors` styles |

<style>
table { font-size: 0.8em; }
</style>

---

# The five rules of ARIA

From the W3C *Using ARIA* note:

1. **Native first** — if an HTML element or attribute does the job, use it.
   *No ARIA is better than bad ARIA*
2. **Don't change native semantics** — `<h2 role="tab">` breaks the heading:
   wrap it, `<div role="tab"><h2>…</h2></div>`
3. **Every interactive role is usable with the keyboard** — a `role="button"`
   answers Enter **and** Space
4. **Never hide a focusable element** — no `aria-hidden="true"` or
   `role="presentation"` on something that takes the focus
5. **Every interactive element has an accessible name** — from its content,
   a `<label>`, `aria-labelledby` or `aria-label`

<br />

> In the WebAIM Million, pages **with** ARIA have **more** detected errors
> than pages without: ARIA is a sharp tool.

---

# When ARIA is the right tool

<div style="display: flex; gap: 2em;">
<div>

### ✅ Use ARIA to

- Build a **widget HTML does not have**: tabs, tree, combobox, menu, switch
- Expose a **state** HTML cannot: `aria-expanded` on a toggle,
  `aria-current="page"`
- **Relate** elements: `aria-controls`, `aria-describedby`
- **Announce** dynamic changes: live regions (chapter 08)

</div>
<div>

### ❌ Don't use ARIA to

- Rebuild a `<button>`, a link, a checkbox, a `<select>` you could just use
- Fix a **visual** problem — it changes nothing on screen
- Repeat what HTML already says: `<nav role="navigation">`,
  `<button role="button">`
- Silence an automated tool's warning without understanding it

</div>
</div>

<br />

> The **ARIA Authoring Practices Guide** — https://www.w3.org/WAI/ARIA/apg/ —
> gives, for each pattern, the roles, states **and the keyboard contract**.
> Start there before building any widget.

---

# The roles you will meet

| Category | Roles | Native equivalent |
|---|---|---|
| **Widgets** | `button`, `checkbox`, `radio`, `switch`, `slider`, `tab`, `combobox`, `menuitem`, `treeitem` | many — `<button>`, `<input>`, `<select>` |
| **Composite** | `radiogroup`, `tablist`, `listbox`, `menu`, `tree`, `grid` | few — `<fieldset>`, `<select>` |
| **Landmarks** | `banner`, `navigation`, `main`, `complementary`, `contentinfo`, `search`, `region`, `form` | `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<search>` |
| **Live regions** | `alert`, `status`, `log`, `timer` | `<output>` (≈ `status`) |
| **Windows** | `dialog`, `alertdialog` | `<dialog>` |
| **Structure** | `heading`, `list`, `table`, `tooltip`, `toolbar`, `tabpanel` | `<h1>`–`<h6>`, `<ul>`, `<table>` |

<br />

- **Abstract** roles (`widget`, `landmark`…) exist in the spec only: never
  write them
- Landmark roles on their HTML5 element are **redundant** today — use the
  element alone

<style>
table { font-size: 0.75em; }
</style>

---

# States change — keep them in sync

| State | Values | Typical use |
|---|---|---|
| `aria-checked` | `true` / `false` / `mixed` | checkbox, radio, switch |
| `aria-selected` | `true` / `false` | tab, option |
| `aria-pressed` | `true` / `false` | toggle button (bold, mute) |
| `aria-expanded` | `true` / `false` | disclosure, menu button, accordion, tree item |
| `aria-current` | `page`, `step`, `date`, `true` | current link in a navigation |
| `aria-invalid` | `true` / `false` | field in error |
| `aria-disabled` | `true` / `false` | disabled but still focusable (and discoverable) |
| `aria-busy` | `true` / `false` | region being updated |
| `aria-hidden` | `true` | decorative content — never on something focusable |

<br />

> A state that is **not updated** is worse than no state: the screen reader
> says *"collapsed"* on a panel that is open.

<style>
table { font-size: 0.8em; }
</style>

---

# Properties relate elements

| Property | What it does |
|---|---|
| `aria-labelledby` | Names the element with **another** element's text (one or several ids) |
| `aria-label` | Names the element with a string — when no visible text exists |
| `aria-describedby` | Adds a **description**, read after the name |
| `aria-controls` | Points to the element this one shows, hides or changes |
| `aria-live` | Makes a region announce its changes: `polite` or `assertive` |
| `aria-haspopup` | Says it opens a `menu`, `listbox`, `dialog`… |
| `aria-required` | Required — for custom widgets that cannot use `required` |
| `aria-modal` | On a dialog: the rest of the page is out of reach |

<br />

- **Name** order the browser follows: `aria-labelledby` > `aria-label` >
  native label (`<label>`, `alt`, `<legend>`…) > text content > `title`
- Prefer a **visible** text: it is translated, and voice users can say it

<style>
table { font-size: 0.85em; }
</style>

---

# A toggle: one attribute, kept in sync

```html
<button type="button" aria-expanded="false" aria-controls="filters">
  Filters
</button>
<div id="filters" hidden>…</div>
```

```js
const toggle = document.querySelector('[aria-controls="filters"]');
const panel = document.getElementById('filters');

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));   // the state …
  panel.hidden = open;                                     // … and the UI, together
});
```

- A real `<button>`: focus, Enter, Space for free — ARIA adds only the
  **state**
- Announced *"Filters, button, collapsed"*, then *"expanded"*
- No JavaScript needed for a simple disclosure: `<details>` + `<summary>`

---

# A more specific role on a native element

```html
<!-- A button that is on / off: announced "Dark mode, switch, on" -->
<button type="button" role="switch" aria-checked="true">Dark mode</button>

<!-- A toggle button: announced "Bold, toggle button, pressed" -->
<button type="button" aria-pressed="true">Bold</button>
```

- Start from the **closest native** element: the `<button>` keeps its focus
  and keyboard, the role only refines what is announced
- `switch` vs `aria-pressed`: a switch is **on / off** (a setting), a pressed
  button is **active / not** (a tool)
- Allowed because it does not *break* the button's semantics — rule 2 is
  about `<h2 role="tab">`, not this

---

# A custom radio group — the markup

```html
<p id="sex-label">Sex</p>
<div role="radiogroup" aria-labelledby="sex-label">
  <div role="radio" aria-checked="true"  tabindex="0">Female</div>
  <div role="radio" aria-checked="false" tabindex="-1">Male</div>
  <div role="radio" aria-checked="false" tabindex="-1">Other</div>
</div>
```

- `role="radiogroup"` + `aria-labelledby`: announced *"Sex, radio group"* on
  entry — the `<fieldset>` + `<legend>` of chapter 06
- `role="radio"` + `aria-checked` on each option: the role and its **state**
- **Roving tabindex**: only the checked option (or the first, if none) has
  `tabindex="0"` — **one Tab stop** for the whole group, like native radios

> ⚠️ This is workshop 06 because it is a **lesson**: in a real project,
> style a native `<input type="radio">` instead.

---

# A custom radio group — the keyboard

```js
group.addEventListener('keydown', (event) => {
  const radios = [...group.querySelectorAll('[role="radio"]')];
  const index = radios.indexOf(document.activeElement);
  let next;
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % radios.length;
  else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + radios.length) % radios.length;
  else if (event.key === ' ') next = index;
  else return;                         // let Tab and every other key through
  event.preventDefault();              // no page scroll on arrows and Space
  check(radios, radios[next]);
});

function check(radios, selected) {
  for (const radio of radios) {
    const isSelected = radio === selected;
    radio.setAttribute('aria-checked', String(isSelected));
    radio.tabIndex = isSelected ? 0 : -1;    // the roving tabindex follows
  }
  selected.focus();
}
```

- The **APG contract**: arrows move **and** check, wrapping around; Space
  checks; Tab leaves the group
- `event.key`, never the deprecated `keyCode`

---

# ARIA in components and in CSS

<div style="display: flex; gap: 2em;">
<div style="flex: 1; min-width: 0;">

### Built into the component

```js
class ToggleSwitch extends HTMLElement {
  connectedCallback() {
    // ARIA reflection: properties, not strings
    this.role = 'switch';
    this.ariaChecked = 'false';
    this.tabIndex = 0;
  }
}
customElements.define('toggle-switch', ToggleSwitch);
```

- Put the ARIA **in the component** once: nobody can forget it on a page
- Same in a framework: Angular CDK, React Aria, Radix (chapter 10)

</div>
<div style="flex: 1; min-width: 0;">

### Styled from the state

```css
input[aria-invalid='true'] {
  border-color: #b00020;
}
button[aria-pressed='true'] {
  background: #0050b3;
}
[aria-expanded='true'] .chevron {
  transform: rotate(180deg);
}
```

- One source of truth: the **state** drives the style — they can't drift
  apart

</div>
</div>

---

# Recap — before you write `role=`

| Ask yourself | If yes |
|---|---|
| Does an HTML element do this? | Use it. Stop here |
| Does the APG have this pattern? | Follow its roles, states **and** keyboard table |
| Does every interactive part take the focus? | `tabindex="0"` / roving tabindex |
| Does every state update on **every** interaction? | Click, keyboard, and programmatic changes |
| Does everything have a name? | Content, `aria-labelledby`, `aria-label` |
| Did you **test it with a screen reader**? | Not done until you have |

<style>
table { font-size: 0.85em; }
</style>

---
layout: cover
---

# Workshop 06

## A custom ARIA radio group

`workshops/06_aria_radio`
