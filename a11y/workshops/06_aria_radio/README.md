# TP 6 — ARIA: a custom radio group

> Rebuild the "Sex" radios as a custom role="radiogroup", and make it work with the keyboard like a native one.

## Goal

Chapter 7 — See what it takes to rebuild, with `<div>`s and ARIA, what one
`<input type="radio">` gives for free: a **role**, a **state**, a **name**, and
the **keyboard behaviour** (WCAG 4.1.2 Name, Role, Value, A; 2.1.1 Keyboard,
A). You will implement the **roving tabindex**, the pattern behind every
composite widget: tabs, menus, toolbars, grids.

> **For teaching only.** In production, always use the native
> `<input type="radio">`. The first rule of ARIA is *do not use ARIA* when an
> HTML element does the job. This workshop shows why.

**Files:** `create.html`, `script.js`. The `TODO workshop 6` comments mark the
places. The styles of `[role="radio"]` are already in `style.css`. The app starts
where workshop 5 ended.

## Setup

```bash
cd workshops/06_aria_radio
npx serve .
```

Open `create.html` and play with the native *Sex* radios first, keyboard only:
Tab enters the group **once**, the arrows move **and** check, Tab leaves. That is
the behaviour to reproduce.

## Steps

### 1. The markup

In `create.html`, replace the content of the *Sex* fieldset:

```html
<fieldset>
  <legend id="sex-label">Sex</legend>
  <div role="radiogroup" aria-labelledby="sex-label" id="sex">
    <div role="radio" aria-checked="false" tabindex="0" data-value="M">Male</div>
    <div role="radio" aria-checked="false" tabindex="-1" data-value="F">Female</div>
  </div>
</fieldset>
```

Notice:

- `role="radiogroup"` on the container, **named** by the legend through
  `aria-labelledby`;
- `role="radio"` and `aria-checked` on each option: the role and the state a
  screen reader announces (*"Male, radio button, not checked, 1 of 2"*);
- `tabindex="0"` on **one** radio only, `-1` on the others: the whole group is
  **one** Tab stop. At start nothing is checked, so the first one holds it.

A `<div>` with a role is still a `<div>`: no focus, no click on Space, no arrow
keys. All of it is yours, in the next step.

### 2. The keyboard: roving tabindex

In `script.js`, write the function wired in `DOMContentLoaded` (the TODO), for
the `#sex` group. It does nothing when the group is not on the page. Listen on
the **group** (one listener, not one per radio):

1. **Tab** enters the group on the radio that has `tabindex="0"`: nothing to
   write, the browser does it.
2. **Space** checks the focused radio.
3. **ArrowDown / ArrowRight** move to the next radio, **ArrowUp / ArrowLeft** to
   the previous one, and **wrap around** at both ends. As with the native radios,
   moving **also checks**.
4. A **click** checks too.
5. Checking a radio, in one `select(radio)` function:
   - `aria-checked="true"` on it, `"false"` on the others;
   - `tabindex="0"` on it, `-1` on the others: the Tab stop **follows** the
     checked radio, so Shift+Tab then Tab comes back to it;
   - `focus()` on it.
6. Call `preventDefault()` on the keys you handle: Space scrolls the page and
   the arrows scroll it too.

### 3. The look

The styles of `[role="radio"]`, `[role="radio"][aria-checked="true"]` and its
`:focus-visible` are given in `style.css`. Check that *checked* and *focused*
are distinct, and distinguishable without colour. Would you add a visual marker
(a dot, a check) to the checked one?

## Checking your work

**By hand.** Keyboard only: Tab enters the group once, Space checks, the arrows
move and check, Tab leaves the group. With your screen reader: the group is
announced with its name *Sex*, each option as a *radio button* with its state,
and its position (*1 of 2*).

**From the terminal**, in the training folder:

```bash
pnpm run verify --dir workshops --tp 06
```

It replays the checks of workshops 3 to 5 (except the native radios, gone now),
then checks that, on `create.html`:

- there is one `role="radiogroup"`;
- it is named *Sex* through `aria-labelledby`;
- it holds 2 `role="radio"`, and there is no native `<input type="radio">` left;
- at start, nothing is checked, and only the first radio is in the Tab order
  (`aria-checked="false"`/`tabindex="0"`, then `"false"`/`"-1"`).

Then, from the field right after the group (*Parent 1 last name*):

- Shift+Tab lands on the group's one Tab stop;
- Space checks the focused radio;
- ArrowDown moves the check **and** the Tab stop to the next radio, and the
  focus follows;
- ArrowRight on the last one wraps to the first, ArrowUp on the first one wraps
  to the last, ArrowLeft goes back;
- Tab leaves the group;
- a click checks too;
- no JavaScript error in the page.

## Going further

- The custom radio is **not** submitted with the form: a `<div>` has no
  `name`/`value`. Add a hidden input updated by `select()`, and show the value in
  the success message. One more thing the native element did for free.
- Add **Home** and **End** (first and last radio).
- Make it a required group: `aria-required="true"` on the radiogroup, and an
  error in the summary when nothing is checked. Where does the focus go?
- Count the lines you wrote, then put the native radios back. Which version
  would you rather maintain, and test in five screen readers?

## Useful links

- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/)
- [APG — Radio Group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [APG — Keyboard interface, roving tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex)
- [Using ARIA — the five rules](https://www.w3.org/TR/using-aria/#rule1)
