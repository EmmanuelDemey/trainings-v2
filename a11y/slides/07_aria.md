---
layout: cover
---

# ARIA Standard

---

# ARIA Standard

* **WAI-ARIA**: Web Accessibility Initiative – Accessible Rich Interactive Applications
* Adds semantics to HTML content
* Three main categories:
    * **Roles**: define the type of element
    * **States**: properties that change (e.g. `aria-checked`)
    * **Properties**: static characteristics (e.g. `aria-label`)

---

# ARIA rule #1: prefer native HTML

* **⚠️ Important**: only use ARIA when HTML has no equivalent native element
* **Native HTML** gives you for free:
    * Native semantics
    * Keyboard navigation
    * Focus management
    * Expected behavior
* **ARIA** requires you to code everything by hand:
    * Visual appearance (CSS)
    * Behavior (JavaScript)
    * Focusability (`tabindex`)
    * Keyboard navigation (events)

---

# ARIA Standard - Use cases

* Only use ARIA when needed to:
    * Add semantics to non-semantic HTML code
    * Support older browsers
    * Build accessible custom components (widgets)
* **Never use ARIA** to work around CSS/styling issues
* ARIA attributes **only** affect the Accessibility Tree

---

# ARIA Standard - Resources

* **ARIA Authoring Practices Guide (APG)**: https://www.w3.org/WAI/ARIA/apg/
* Official W3C guide with patterns and examples
* **Essential** for implementing ARIA components correctly

---

# Custom checkbox example

```html
<div tabindex="0" role="checkbox" aria-checked="true">
    take the accessibility training
</div>
```

---

# Roles

* A role is added by setting the `role` attribute on an HTML element.

```html
<tr role="...">
    ...
</tr>
```

---

# ARIA roles

* Roles are split into six categories:
    * **Abstract Role**: never use (internal use)
    * **Document Structure Role**: document structure (toolbar, tooltip, etc.)
    * **Landmark Role**: main regions (navigation, main, etc.)
    * **Live Region Role**: dynamic content (alert, status, etc.)
    * **Widget Role**: interactive components (button, slider, tabs, etc.)
    * **Window Role**: windows (dialog, alertdialog)

---

# List of roles

* alert
* banner
* checkbox
* complementary
* contentinfo
* combobox
* link
* search

---

# List of roles

* switch
* radio
* radiogroup
* tab
* tablist
* tabpanel

---

# List of roles

* toolbar
* tree
* treeitem

---

# Landmark Role

* Most landmark roles have an HTML5 equivalent
* Use them **only** to support older browsers
* **Today**: HTML5 elements are enough in most cases

```html
<nav role="navigation">
  <ul>
    <li><a href="#a">Dexter</a></li>
    <li><a href="#b">Doctor Who</a></li>
    <li><a href="#c">Futurama</a></li>
  </ul>
</nav>
```

---

# Landmark Role

```html
<form role="search">
  <label for="search-input">Search this site</label>
  <input type="text" id="search-input" name="search">
  <input type="submit" name="submit-btn" value="Search" />
</form>
```

--- 

# Landmark Role

```html
<footer role="contentinfo">
  <p>&copy; 2020 Small Business Ltd. All rights reserved.</p>
</footer>
```

---

# States

* A **state** is added through an `aria-*` attribute on an HTML element
* A state **must be updated dynamically** in JavaScript based on user interactions
* Example: `aria-checked` must toggle between `true`/`false` on click

```html
<span aria-busy="true">
    ...
</span>
```

---

# States - The most common ones

* List of the most used states:
    * `aria-busy`: element is loading
    * `aria-checked`: checked/unchecked state (checkbox, radio)
    * `aria-current`: current element (page, step, date, etc.)
    * `aria-disabled`: disabled element
    * `aria-expanded`: expanded/collapsed element
    * `aria-hidden`: hides an element from screen readers
    * `aria-invalid`: invalid value in a form
    * `aria-pressed`: toggle button on/off
    * `aria-selected`: selected element (tab, option)

---

# State

```html
<form>
    <label>
        Name
        <input aria-invalid="true"/>
    </label>
    <button type="submit">
        <em class="fa fa-home" aria-hidden="true" />
        Submit
    </button>
</form>
```

---

# Properties

* The ARIA standard also provides **properties**, which are usually static
* Difference with states: rarely changed after initialization
    * `aria-controls`: identifies the controlled element
    * `aria-describedby`: references a description
    * `aria-label`: invisible text label
    * `aria-labelledby`: references an element used as the label
    * `aria-live`: dynamically updated region
    * `aria-required`: required field
    * `aria-haspopup`: indicates a menu/dialog that can open

---

# Creating a button with a more specific role

```html
<button role="switch" aria-checked="true">
    Enable
</button>
```

---

# Integration - Web Components

* **Best practice**: build accessibility directly into your components
* For Web Components: add the ARIA attributes in `connectedCallback`
* That way, accessibility is built in and can't be forgotten

```javascript
class SwitchButton extends HTMLElement {
  connectedCallback(){
    this.setAttribute('role', 'switch');
    this.setAttribute('aria-checked', 'false');
    this.setAttribute('tabindex', '0');
  }
}

window.customElements.define('button-switch', SwitchButton)
```

* **New API**: ARIA Reflection lets you use native JavaScript properties

```javascript
class SwitchButton extends HTMLElement {
  connectedCallback(){
    this.role = 'switch';
    this.ariaChecked = false;
    this.tabIndex = 0;
  }
}

window.customElements.define('button-switch', SwitchButton)
```

---

# Integration - Frameworks

* Example with the Angular CDK (Component Dev Kit)
* The `cdkFocusRegion*` directives handle focus automatically

```html
<a mat-list-item routerLink cdkFocusRegionStart>
    Focus region start
</a>
<a mat-list-item routerLink>Link</a>
<a mat-list-item routerLink cdkFocusInitial>
    Initially focused
</a>
<a mat-list-item routerLink cdkFocusRegionEnd>
    Focus region end
</a>
```

---

# Custom checkbox - Full example

* **⚠️ Reminder**: always prefer the native `<input type="checkbox">`
* This example shows what you must implement if you have to build a custom checkbox

```html
<p id="question">Question</p>
<ul aria-labelledby="question" role="group">
  <li role="checkbox" aria-checked="false" tabindex="0">
    <img aria-hidden="true" src="checkbox.svg" alt="Not selected: " />
    Choice 1
  </li>
  <li role="checkbox" aria-checked="true" tabindex="0">
    <img aria-hidden="true" src="checkbox-checked.svg" alt="Selected: " />
    Choice 2
  </li>
  <li role="checkbox" aria-checked="false" tabindex="0">
    <img aria-hidden="true" src="checkbox.svg" alt="Not selected: " />
    Choice 3
  </li>
</ul>
```

---

# Custom radio - Full example

* **⚠️ Reminder**: always prefer the native `<input type="radio">`
* Note the `tabindex` difference: only the selected element has `tabindex="0"`

```html
<p id="question">Question</p>
<ul aria-labelledby="question" role="radiogroup">
  <li role="radio" aria-checked="false" tabindex="-1">
    <img aria-hidden="true" src="radio.svg" alt="Not selected: " />
    Choice 1
  </li>
  <li role="radio" aria-checked="true" tabindex="0">
    <img aria-hidden="true" src="radio-checked.svg" alt="Selected: " />
    Choice 2
  </li>
  <li role="radio" aria-checked="false" tabindex="-1">
    <img aria-hidden="true" src="radio.svg" alt="Not selected: " />
    Choice 3
  </li>
</ul>
```

---

# Collapsible Panel

* To implement an accessible collapsible panel:
    * `aria-controls`: links the button to the panel it controls
    * `aria-expanded`: indicates the open (`true`) or closed (`false`) state
* These attributes **must be updated dynamically** in JavaScript
* Modern alternative: use the native HTML `<details>` and `<summary>` elements!

```html
<button aria-controls="list" aria-expanded="true">Open</button>
<ul id="list" hidden>
    ...
</ul>
```

---

# Text alternative

* Four ways to define text alternatives (in order of priority):
    1. **Text content** of the element (preferred)
    2. **`aria-labelledby`**: references an existing element (ID)
    3. **`aria-label`**: text directly in the attribute (not translatable)
    4. **Hidden text** with `.sr-only` (translatable)

* **Rule**: `aria-labelledby` > `aria-label` > visible label > content

---

# Additional description

* `aria-describedby`: provides a description **in addition** to the label
* Difference with `aria-labelledby`:
    * `aria-labelledby`: **names** the element (essential)
    * `aria-describedby`: **describes** the element (complementary)
* Example: label="Email", description="Format: name@domain.com"

---

# aria-label / aria-labelledby

```html
<button id="search" aria-label="Search"><img src="..." alt="" /></button>

<h2 id="searchLabel">Search</h2>

<label for="search">Enter search term
  <input type="search" id="search">
</label>

<button aria-labelledby="searchLabel"><img src="..." alt="" /></button>
```

---

# CSS - ARIA selectors

* Using ARIA attributes can simplify stylesheets
* **Benefit**: the style automatically follows the state

```css
/* Style for invalid fields */
input[aria-invalid='true'] {
    border-color: red;
}

/* Style for active toggle buttons */
button[aria-pressed='true'] {
    background-color: #007bff;
}

/* Style for expanded elements */
[aria-expanded='true'] .icon {
    transform: rotate(180deg);
}
```

---

# ARIA - Recap

* ✅ **Rule #1**: don't use ARIA if a native HTML element exists
* ✅ **Rule #2**: never change native semantics
* ✅ **Rule #3**: elements with an interactive role must be focusable
* ✅ **Rule #4**: focusable elements must be keyboard accessible
* ✅ **Rule #5**: don't use `role="presentation"` or `aria-hidden` on focusable elements

* **Documentation**: https://www.w3.org/WAI/ARIA/apg/

---
layout: cover
---

# Hands-on

---
layout: cover
---

# Workshop 6 - Custom ARIA radio group
