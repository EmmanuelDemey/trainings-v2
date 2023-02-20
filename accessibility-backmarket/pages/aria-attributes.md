# ARIA attributes

* You must use first HTML Element
* When this it nos possible, and **only** when it is not possible
    * You can create your own HTML structure based on unsemantic elements
    * And add extra metadatas to give the missing semantic
* These metadats can also be used for non native HTML element (**tabs**, **modal**, ...)
* These attributes are defined by the **WAI-ARIA** specification

---

# ARIA Specification

* These ARIA attributes are usefull if
    * you need to make your HTML code more semantic
    * you need to improve the support of Browser and AT
    * you need to use unsemantic HTML code if you need to style them more easily

---

# ARIA Specification

* These metadats will impact only the Accessibility Tree
* They won't have an impct 
    * on the look and feel of your HTML
    * on the behavior
    * on the focus managment
    * on the navigation via the keyboard
* That's the reason you must use semantic HTML element first. 

---

# ARIA Specification

* Aria Design Guide(https://www.w3.org/TR/wai-aria-practices-1.1/)

---

# Example with a Checkbox

```html
<div tabindex="0" role="checkbox" aria-checked="true">
    suivre la formation accessibilité
</div>
```

---

# Roles

* A role will be added on any HTML element thank to the **role** attribute.

```html
<tr role="...">
    ...
</tr>
```

---

# Roles

* Les rôles sont découpés en six catégories :
    * Abstract Role
    * Document Structure Role (toolbar, ...)
    * Landmark Role
    * Live Region Role
    * Widget Role
    * Window Role

---

# Roles list

* alert
* banner
* checkbox
* complementary
* contentinfo
* combobox
* link
* search

---

# Roles list

* switch
* radio
* radiogroup
* tab
* tablist
* tabpanel

---

# Roles list

* toolbar
* tree
* treeitem

---

# Landmark Role

* You can add roles to an existing semantinc HTML element
    * in order to provide a full support on browser / AT
    * in order to override the basic semantic

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

# State

* A `state` can be added thanks to the **aria-** prefix on any HTML elements.
* Theses states will be updated via JavaScript

```html
<span aria-busy="true">
    ...
</span>
```

---

# State

* Here is a short list of available ARIA states :
    * `aria-busy`
    * `aria-checked`
    * `aria-current`
    * `aria-disabled`
    * `aria-expanded`
    * `aria-hidden`
    * `aria-invalid`
    * `aria-pressed`
    * `aria-selected`

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
        Valider
    </button>
</form>
```

---

# Properties

* The **ARIA** specification provide also properties, that won't be updated via JavaScript
    * `aria-controls`
    * `aria-label`
    * `aria-labelledby`
    * `aria-live`
    * `aria-required`
    * ...

---

# Custom Button 

```html
<button role="switch" aria-checked="true">
    Enable
</button>
```

---

# Integration

* You must include Accessibility behavior inside your reusable components
* **But** you have to make configurable, in order to make fully reusable on all your page.

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

---

# Integration

* Here is an example of how `Angular Material` *package* accessibility in their own components

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

# Checkbox Custom

```html
<p id="question">Question</p>
<ul aria-labelledby="question" role="group">
  <li role="checkbox" aria-checked="false" tabindex="0">
    <img aria-hidden="true" src="checkbox.svg" alt="Non sélectionné : " />
    Choix 1
  </li>
  <li role="checkbox" aria-checked="true" tabindex="0">
    <img aria-hidden="true" src="checkbox-checked.svg" alt="Sélectionné : " />
    Choix 2
  </li>
  <li role="checkbox" aria-checked="false" tabindex="0">
    <img aria-hidden="true" src="checkbox.svg" alt="Non sélectionné : " />
    Choix 3
  </li>
</ul>
```

---

# Radio Custom

```html
<p id="question">Question</p>
<ul aria-labelledby="question" role="radiogroup">
  <li role="radio" aria-checked="false" tabindex="-1">
    <img aria-hidden="true" src="radio.svg" alt="Non sélectionné : " />
    Choix 1
  </li>
  <li role="radio" aria-checked="true" tabindex="0">
    <img aria-hidden="true" src="radio-checked.svg" alt="Sélectionné : " />
    Choix 2
  </li>
  <li role="radio" aria-checked="false" tabindex="-1">
    <img aria-hidden="true" src="radio.svg" alt="Non sélectionné : " />
    Choix 3
  </li>
</ul>
```

---

# Collapsible Panel

* When you need to develop your own `Collapsible Panel`, you need to add these attributes : 
    * `aria-controls`
    * `aria-expanded`
* These attributes need to be updated based on the interaction of the user.

```html
<button aria-controls="list" aria-expanded="true">Open</button>
<ul id="list" hidden>
    ...
</ul>
```

---

# Write semantic CSS declarations

* You can use this ARIA roles, properties and states on your CSS selector
* Your CSS stylesheet will be more semantic
* You won't have to create useless CSS class

```css
input[aria-invalid='true']{
    background: red;
}
```