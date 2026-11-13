# TP 5 — Accessible forms

> Build the "Add a person" form with labels, groups and errors that a screen reader announces.

## Goal

Chapter 6 — A form everyone can fill in, and recover from:

- every field has a **label** tied to it (WCAG 3.3.2 Labels or Instructions, A);
- related fields are **grouped** with `<fieldset>` and `<legend>` (1.3.1, A);
- the browser knows what each identity field is for, with **`autocomplete`**
  (1.3.5 Identify Input Purpose, AA);
- errors are **identified, described and announced**, and the user is taken
  where to act (3.3.1 Error Identification, A; 3.3.3 Error Suggestion, AA);
- a success is announced too (4.1.3 Status Messages, AA).

**Files:** `create.html`, `style.css`, `script.js`. The `TODO workshop 5`
comments mark the places. The app starts where workshop 4 ended.

## Setup

```bash
cd workshops/05_forms
npx serve .
```

Open http://localhost:3000/create.html: the form is a placeholder paragraph.

## Steps

### 1. The structure of the form

In `create.html`, replace the placeholder with the form. Here is the pattern of
each part; write the whole thing:

```html
<!-- Announced politely once a person is added -->
<p class="status-message" role="status" id="form-status"></p>

<form id="create-form" novalidate>
  <p>Fields marked with <span aria-hidden="true">*</span> are required.</p>

  <fieldset>
    <legend>Identity</legend>

    <label for="last-name">Last name <span aria-hidden="true">*</span></label>
    <input type="text" id="last-name" name="lastName" required autocomplete="family-name" />

    <!-- First name: the same, id="first-name", name="firstName", autocomplete="given-name" -->

    <label for="birth-date">Birth date</label>
    <input type="date" id="birth-date" name="birthDate" autocomplete="bday" />

    <label for="death-date">Death date <span class="sr-only">(optional)</span></label>
    <input type="date" id="death-date" name="deathDate" />
  </fieldset>

  <fieldset>
    <legend>Sex</legend>
    <div>
      <input type="radio" id="sex-m" name="sex" value="M" />
      <label for="sex-m">Male</label>
    </div>
    <!-- Female: id="sex-f", value="F" -->
  </fieldset>

  <fieldset>
    <legend>Parents</legend>
    <label for="parent1-last-name">Parent 1 last name</label>
    <input type="text" id="parent1-last-name" name="parent1LastName" />
    <!-- Parent 1 first name, Parent 2 last name, Parent 2 first name -->
  </fieldset>

  <button type="submit">Add the person</button>
</form>
```

Notice:

- **`<label for>`** pointing at the `id` of its field: clicking the label focuses
  the field, and the label is the field's accessible name. A `placeholder` is not
  a label.
- **`required`** is announced as *"required"*. The red `*` is for the eyes only:
  `aria-hidden="true"` keeps it from being read as *"star"*, and the sentence at
  the top explains it.
- **`(optional)`** in an `.sr-only` span: read out, not shown.
- **`<fieldset>`/`<legend>`**: the legend is announced when entering the group,
  which gives *"Male"* and *"Female"* their meaning (*Sex*), and tells *Parent 1*
  from *Parent 2*.
- **`autocomplete`** with the standard tokens: the browser can fill the fields,
  and assistive tools can show an icon for each purpose.
- **`novalidate`**: we turn the browser's error bubbles off, because they are
  not consistently announced, cannot be styled, and vanish. We handle the errors
  ourselves.
- The **`role="status"`** paragraph is a polite live region: it must be in the
  page **before** anything is written into it, empty.

### 2. Validation and errors

In `script.js`, write the function wired in `DOMContentLoaded` (the TODO). It
does nothing when `#create-form` is not on the page (on `index.html`). On submit:

1. `preventDefault()`, then check that **last name** and **first name** are not
   empty (after `trim()`).
2. For each field in error:
   - set `aria-invalid="true"` on the input;
   - insert a message right after it, with an `id`:

     ```html
     <p class="error-message" id="last-name-error">The last name is required</p>
     ```

   - tie it to the input with `aria-describedby="last-name-error"`: the message
     is read with the field, every time it gets the focus.
3. For each field **no longer** in error: remove the message, `aria-invalid` and
   `aria-describedby`.
4. At the top of the form, show an **error summary**, replaced on each submit:

   ```html
   <div class="error-summary" role="alert">
     <h3>The form has 2 errors</h3>
     <ul>
       <li><a href="#last-name">The last name is required</a></li>
       <li><a href="#first-name">The first name is required</a></li>
     </ul>
   </div>
   ```

   `role="alert"` makes the screen reader read it at once, when it is inserted.
   Each link takes the user to the field to fix.
5. Put the **focus on the first field in error**: the user lands where to act.
6. When there is no error: remove the summary, write
   `Ada Lovelace was added to the family tree.` (first name, last name) into the
   `role="status"` paragraph, and reset the form. Empty that paragraph again
   when a later submit has errors.

Build the messages with `createElement` and `textContent`.

### 3. The style of the errors

In `style.css`, at the `TODO workshop 5`:

```css
input[aria-invalid="true"] {
  border-color: var(--color-error);
  border-width: 2px;
}
```

The thicker border is not decoration: an error must **not be shown by colour
alone** (WCAG 1.4.1 Use of Color, A). The message text does the rest.

## Checking your work

**By hand.** Submit the empty form with the keyboard, screen reader on: the
summary is read, the focus is on *Last name*, and the field is announced as
*invalid*, with its message. Fill in the last name, submit again: one error
left. Fill in both: the success message is announced.

**From the terminal**, in the training folder:

```bash
pnpm run verify --dir workshops --tp 05
```

It replays the checks of workshops 3 and 4, then, on `create.html`, checks
that:

- *Last name* and *First name* are labelled fields (found by their label);
- they are `required`;
- they declare `autocomplete="family-name"` and `"given-name"`;
- there is a labelled *Birth date* field, `type="date"`;
- the identity fields are in a fieldset named *Identity*, the parents fields in
  one named *Parents*;
- *Sex* is a fieldset of 2 labelled radios;
- the submit button is a real button named *Add the person*.

Then it submits the empty form and checks that:

- the page does not leave `create.html`;
- both fields are `aria-invalid="true"`;
- the error message of *Last name* is tied to it with `aria-describedby` (and
  says *required*);
- there is a `role="alert"` summary, with links to `#last-name` and
  `#first-name`;
- the focus is on the first field in error;
- a field in error has a border of 2px or more.

It fills in *Lovelace* and submits again: the field loses `aria-invalid`, and
the summary lists one link only. It fills in *Ada* and submits: the summary is
gone, and a `role="status"` region says *Ada Lovelace*. Finally: no JavaScript
error in the page.

## Going further

- Validate on **blur** as well, but only once the user has left a field, never
  while typing: test how noisy it gets with a screen reader.
- Add a check that the death date is after the birth date, with a message that
  says how to fix it (3.3.3 Error Suggestion).
- Put the count in the page `<title>` on error (`(2 errors) Add a person -
  Genea11y`), as GOV.UK does: it is the first thing read after a reload.
- Remove `novalidate` and compare the browser's own error bubbles with yours,
  with the screen reader on, in two browsers.

## Useful links

- [MDN — Web forms](https://developer.mozilla.org/en-US/docs/Learn/Forms)
- [WebAIM — Creating Accessible Forms](https://webaim.org/techniques/forms/)
- [WAI Tutorials — Forms](https://www.w3.org/WAI/tutorials/forms/)
- [Understanding WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
- [HTML — autofill tokens](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)
- [GOV.UK Design System — Error summary](https://design-system.service.gov.uk/components/error-summary/)
