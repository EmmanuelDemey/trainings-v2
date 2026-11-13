---
layout: cover
---

# 06 - Accessible forms

---

# Learning objectives

At the end of this chapter, you will be able to:

- **Name** every field: pick between `<label>`, `aria-labelledby`,
  `aria-label` and `.sr-only` — and know why `placeholder` is not a label
- **Group** related fields with `<fieldset>` and `<legend>`
- **Help** the user fill in: input types, `autocomplete`, hints with
  `aria-describedby`
- **Mark** required fields and **announce** errors a screen reader can hear
  (`aria-invalid`, `aria-describedby`, focus on the first error)

---

# Why forms matter

- A form is where the user **acts**: sign up, pay, search, contact. A blocked
  form is a blocked user — no workaround
- And the most common source of failures: in the WebAIM Million, **missing
  form labels** are in the top 5 every year
- What a screen reader announces on a field, in that order:

```text
"Email, edit text, required, invalid entry, You must enter a valid email"
   │        │          │            │                 │
  name     role      state        state           description
 <label>  <input>   required   aria-invalid   aria-describedby
```

- Every piece of that sentence comes from the **markup** — none from the CSS

---

# Every field has a `<label>`

<div style="display: flex; gap: 2em;">
<div style="flex: 1; min-width: 0;">

### Explicit — `for` + `id`

```html
<label for="first-name">First name</label>
<input id="first-name" name="firstName" />
```

### Implicit — the input inside

```html
<label>
  First name
  <input name="firstName" />
</label>
```

</div>
<div style="flex: 1; min-width: 0;">

- Both give the input its **accessible name**
- Clicking the label **focuses** the field — a bigger target for everyone
  (and the checkbox toggles)
- Prefer the explicit form: some older assistive tech and some CSS layouts
  handle it better
- WCAG **1.3.1** Info and Relationships (A), **3.3.2** Labels or
  Instructions (A), **4.1.2** Name, Role, Value (A)

</div>
</div>

---

# Which label, when?

| Technique | Visible | Translated | Use it when |
|---|---|---|---|
| `<label for>` | ✅ | ✅ | **Always, by default** |
| `<label>` + `.sr-only` | ❌ | ✅ | The design has no visible label (a search box with an icon) |
| `aria-labelledby="id"` | ✅ | ✅ | The visible text is elsewhere on the page (a heading, a table header) |
| `aria-label="…"` | ❌ | ⚠️ often not | No text exists anywhere — last resort |
| `placeholder` alone | until you type | ✅ | **Never as the label**: it disappears, and its contrast is low |
| `<label hidden>` / `display: none` | ❌ | — | **Never**: removed from the accessibility tree too |

<br />

> `aria-labelledby` and `aria-label` **override** the `<label>`: when both
> exist, the screen reader only reads the ARIA one.

<style>
table { font-size: 0.8em; }
</style>

---

# The ARIA ways to name a field

```html
<!-- The name is a visible text, somewhere else -->
<h2 id="billing">Billing address</h2>
<input aria-labelledby="billing" name="billingAddress" />

<!-- No visible text at all: an icon-only search -->
<input type="search" aria-label="Search the site" />

<!-- Visually hidden, but a real label: translated, clickable -->
<label for="q" class="sr-only">Search the site</label>
<input type="search" id="q" />
```

- `aria-labelledby` can take **several** ids: `aria-labelledby="billing street"`
  reads *"Billing address Street"*
- Automatic translation tools (and some screen readers) skip attribute values:
  prefer a real text node when you have the choice
- WCAG **2.5.3** Label in Name (A): the accessible name must **contain** the
  visible text — voice users say what they see

---

# Help the user fill in

<div style="display: flex; gap: 2em;">
<div style="flex: 1; min-width: 0;">

### The right input type

| `type` | What it gives |
|---|---|
| `email` | `@` on mobile keyboards, native check |
| `tel` | numeric keypad |
| `url` | `/` and `.com` keys |
| `number` | spinner, numeric keypad |
| `date`, `time` | native, accessible pickers |

</div>
<div style="flex: 1; min-width: 0;">

### `autocomplete` — WCAG 1.3.5 (AA)

```html
<input type="text" autocomplete="name" />
<input type="email" autocomplete="email" />
<input type="tel" autocomplete="tel" />
<input type="password"
       autocomplete="current-password" />
<input type="password"
       autocomplete="new-password" />
```

- The browser fills in what the user typed before: less typing, less memory
  — a big help for motor and cognitive impairments
- `new-password` lets the browser **suggest** a strong one

</div>
</div>

---

# Hints are tied with `aria-describedby`

```html
<label for="email">Email</label>
<input type="email" id="email" aria-describedby="email-hint" />
<p id="email-hint" class="hint">We only use it to send your receipt.</p>
```

<div style="display: flex; gap: 2em;">
<div>

### `aria-labelledby` — **names**

- *What* the field is
- Read **first**, replaces the label
- Short: *"Email"*

</div>
<div>

### `aria-describedby` — **describes**

- *How* to fill it, extra context
- Read **after** the name, role and state
- Longer: a format, a rule, an error

</div>
</div>

<br />

- The hint is **visible** to everyone — the attribute only ties it to the field
- Native alternative for a short suggestion list: `<input list="…">` +
  `<datalist>` — no JavaScript widget to rebuild

---

# `<fieldset>` + `<legend>` name a group

```html
<fieldset>
  <legend>Shipping method</legend>
  <input type="radio" id="standard" name="shipping" value="standard" />
  <label for="standard">Standard — 3 days</label>
  <input type="radio" id="express" name="shipping" value="express" />
  <label for="express">Express — next day</label>
</fieldset>
```

- The `<legend>` is read when the focus **enters** the group:
  *"Shipping method, grouping — Standard, radio button, 1 of 2"*
- Without it, *"Express, radio button"* — express **what**?
- **Mandatory** for radio groups and checkbox groups; useful for any set of
  related fields: an address, bank details
- WCAG **1.3.1** Info and Relationships (A)

---

# Required: say it, then enforce it

| Attribute | Announced | Blocks the submit | Use it |
|---|---|---|---|
| `required` | ✅ *"required"* | ✅ native validation | **By default** |
| `aria-required="true"` | ✅ *"required"* | ❌ | Custom widgets (`role="radiogroup"`…), or when you validate in JS with `novalidate` |

```html
<p>Fields marked with <span aria-hidden="true">*</span> are required.</p>

<label for="last-name">Last name <span aria-hidden="true">*</span></label>
<input id="last-name" name="lastName" required />
```

- The asterisk is **explained once**, then hidden from screen readers: they
  already hear *"required"*, not *"star"*
- WCAG **3.3.2** Labels or Instructions (A): say what is expected **before**
  the user submits

<style>
table { font-size: 0.8em; }
</style>

---

# Errors a screen reader can hear

```html
<label for="email">Email</label>
<input type="email" id="email"
       aria-invalid="true" aria-describedby="email-error" />
<p id="email-error" class="error">Enter an email like name@example.com</p>
```

<div style="display: flex; gap: 2em;">
<div>

### On submit

1. Set `aria-invalid="true"` on each invalid field
2. Show the message **next to** the field, tied with `aria-describedby`
3. Move the focus to the **first** invalid field
4. On a long form: an error **summary** at the top, with links to the fields

</div>
<div>

### The rules

- The message says **how to fix**, not just *"invalid"* — WCAG **3.3.3**
  Error Suggestion (AA)
- Identify the error **in text**, not by a red border alone — WCAG **3.3.1**
  (A) and **1.4.1** Use of Color (A)
- Field fixed? Remove `aria-invalid`, the message **and** the
  `aria-describedby`
- `aria-errormessage`: support is still uneven — prefer `aria-describedby`

</div>
</div>

---

# Recap — check a form in five minutes

| Check | How |
|---|---|
| Every field has a **name** | Accessibility pane of the devtools, or the screen reader |
| Clicking the label focuses the field | The mouse |
| Groups have a `<legend>` | Tab into the group with the screen reader on |
| Input types and `autocomplete` are set | Mobile keyboard, browser autofill |
| Required fields are announced and explained | *"required"* is read |
| Errors are in text, tied, and get the focus | Submit empty, listen |
| The whole form works with **Tab, Space, Enter** | Unplug the mouse |

<style>
table { font-size: 0.85em; }
</style>

---
layout: cover
---

# Workshop 05

## Accessible forms

`workshops/05_forms`
