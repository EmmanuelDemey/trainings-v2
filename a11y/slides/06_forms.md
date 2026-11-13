---
layout: cover
---

# Forms

---

# Forms

* Elements that let the user enter data
* Several elements are available: `form`, `input`, `checkbox`, `radio`, `textarea`, `select`, etc.
* Forms are essential for interaction but also a major source of accessibility issues

---

# Forms - Input types

* The HTML5 standard provides different input types
    * text
    * email
    * number
    * range
    * date
* ...

---

# Forms - Label

* We must associate a form input with a label

```html
<label for="firstName">FirstName</label>
<input id="firstName" />
```

---

# Forms - Label

```html
<label>
    FirstName
    <input />
</label>
```

---

# Forms - Hidden label

* ⚠️ Never use the `hidden` attribute, because the label won't be detected by screen readers
* The same problem occurs with the CSS properties `display: none` or `visibility: hidden`
* These methods also hide the content from assistive technologies

```html
<label for="m" hidden>Label m</label>
<input id="m">
```

---

# Forms - Visually hidden label

* If you want labels that are visually hidden but accessible to screen readers, use the `.sr-only` class (seen in the Reminders chapter)

---

# Forms - ARIA Labels

* You can also use `aria-label` or `aria-labelledby`
* ⚠️ **Important**: these two attributes **override** the label defined with the `<label>` element
* Only use them when really necessary

```html
<input aria-label="firstName">
```

---

# Forms - Label

```html
<p id="firstNameLabel">FirstName</p>
<input aria-labelledby="firstNameLabel">
```

---

# Forms - Label: which one to choose?

* **Decision tree** to pick the right approach:
    1. ✅ **Preferred**: use `<label>` (always the first choice)
    2. If the label is visible but elsewhere on the page → `aria-labelledby`
    3. If the label is hidden but must be translatable → `<label>` + `.sr-only` class
    4. If the label is programmatic only → `aria-label` (not translatable)

* **Priority order**: `<label>` > `aria-labelledby` > `aria-label` > `placeholder`

---

# Forms - Autocomplete

* We can enable an autocomplete mechanism
* Based on data your user entered previously (in the browser)
* Uses the `autocomplete` attribute
* **WCAG 1.3.5** (level AA): helps users fill in forms more easily
* Especially useful for people with cognitive impairments

---

# Forms - Autocomplete

```html
<label for="frmNameA">Name</label>
<input type="text" name="name" id="frmNameA"
  placeholder="Full name" required autocomplete="name">

<label for="frmEmailA">Email</label>
<input type="email" name="email" id="frmEmailA"
  placeholder="name@example.com" required autocomplete="email">

<label for="frmPhoneNumA">Phone</label>
<input type="tel" name="phone" id="frmPhoneNumA"
  placeholder="+1-555-555-1212" required autocomplete="tel">
```

---

# Forms - Autocomplete for passwords

* We can also ask the browser to generate a secure password
* Improves security and user experience

```html
<input type="password" autocomplete="new-password" id="new-password" />
```

* Common values:
    * `current-password`: for signing in
    * `new-password`: for account creation/password change

---

# Fieldset

* The `<fieldset>` element groups sets of related form fields
* **Mandatory**: define a caption with the `<legend>` element
* **WCAG 1.3.1** (level A): Info and Relationships
* Use cases:
    * radio button groups (mandatory)
    * checkbox groups
    * sets of related fields (address, bank details)

---

# Fieldset

```html
<fieldset>
    <legend>Select your pizza toppings:</legend>
    <input id="ham" type="checkbox" name="toppings" value="ham">
    <label for="ham">Ham</label><br>
    <input id="pepperoni" type="checkbox" name="toppings" value="pepperoni">
    <label for="pepperoni">Pepperoni</label><br>
</fieldset>
```

---

# Fieldset

```html
<fieldset>
    <legend>Choose a shipping method:</legend>
    <input id="overnight" type="radio" name="shipping" value="overnight">
    <label for="overnight">Overnight</label><br>
    <input id="twoday" type="radio" name="shipping" value="twoday">
    <label for="twoday">Two day</label><br>
</fieldset>
```

---

# Datalist

* Native HTML element for building an autocomplete system
* Accessible alternative to complex JavaScript plugins
* Well supported by modern browsers

```html
<label for="ice-cream-choice">Choose a flavor:</label>
<input list="ice-cream-flavors" id="ice-cream-choice" name="ice-cream-choice" />

<datalist id="ice-cream-flavors">
    <option value="Chocolate">
    <option value="Coconut">
    <option value="Mint">
    <option value="Strawberry">
    <option value="Vanilla">
</datalist>

```

---

# Additional information

* To add extra information (help, expected format), use the `aria-describedby` attribute
* Different from `aria-labelledby`: it describes instead of naming
* Screen readers read the referenced content after the label

```html
<label for="email">Your email</label>
<input type="email" id="email"
        aria-describedby="emailHint">
<p class="hint" id="emailHint">
    You must enter a valid email
</p>
```

---

# Forms - Required fields

* To mark a field as required, we have two options:
    * `required`: native HTML5 validation (recommended)
    * `aria-required="true"`: semantic indication only
* **Difference**: `required` triggers the browser's native validation with error messages
* **Best practice**: use `required` + a visual indicator (asterisk, "required" text)

---

# Forms - Error handling

* **WCAG 3.3.1** (level A): Error Identification
* **WCAG 3.3.3** (level AA): Error Suggestion
* **Best practices**:
    * Display errors as close as possible to the related field
    * Use `aria-describedby` to link the error to the field
    * Use `aria-invalid="true"` when there is an error
    * Move focus to the first invalid field after validation
    * Provide an error summary at the top of the form
* `aria-errormessage` exists but has limited support (prefer `aria-describedby`)


```html
<label for="email">Your email</label>
<input type="email" id="email" aria-invalid="true" aria-describedby="emailHint">
<p class="hint" id="emailHint">Invalid email address.</p>
```

---

# Forms - Modern input types

* **Use the appropriate input types** to improve the mobile experience:
    * `type="email"`: shows @ on the mobile keyboard
    * `type="tel"`: shows the numeric keypad
    * `type="url"`: shows .com and / on the keyboard
    * `type="number"`: for numeric values
    * `type="date"`, `type="time"`: native pickers
* Native validation + better UX

---

# Forms - Recap

* ✅ **Every field** must have an associated `<label>`
* ✅ Use `<fieldset>` and `<legend>` to group related fields
* ✅ Add `autocomplete` to make data entry easier
* ✅ Clearly indicate **required** fields
* ✅ Display **errors** clearly with `aria-invalid` and `aria-describedby`
* ✅ Use the appropriate **input types**
* ✅ Test **keyboard** navigation (Tab, Enter)

---
layout: cover
---

# Hands-on

---
layout: cover
---

# Workshop 5 - Accessible forms
