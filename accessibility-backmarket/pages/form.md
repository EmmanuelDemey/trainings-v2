# Form Controls

* When developing a form, we have multiple HTML elements 
  * inputs (text, date, number, ...)
  * textarea
  * checkbox and radio
  * textarea
  * select
  * ...
  
---

# Labels

* The most important rule when managing form is to link a label to all inputs
* Multiple solutions are available
  * input inside the label
  * the label linked to the input thanks to the **for** attribute
  * using the **aria-labelledby** or **aria-label** attributes
  * a placeholder **is not** a solution
* When we click on the label, the corresponding input should become focused (*easy to test*) 

---

# Labels

* Here are some examples about defining a label to an input

```html
<label> Name <input /></label>

<label for="firstName">Name</label> <input id="firstName" />

<div id="firstName-label">Name</div> <input aria-labelledBy="firstName-label" />

<input aria-label="Name"/>
```  

--- 

# Labels

* Browser are not able *for the moment* to translate strings defined in a attribute. 
  * Firefox,
  * Safari,
  * Chromium browsers other than Chrome or Edge (Vivaldi, Opera, Brave, Arc, etc.),
  * Internet Explorer,
  * PlayStation Internet Browser
  * ...

--- 

# Labels

* If you need to define an invisible label and the browser need to be able to translate it, 
* You need to use this utility class

```css
.sr-only {
  border: 0 !important;
  clip: rect(1px, 1px, 1px, 1px) !important;
  -webkit-clip-path: inset(50%) !important;
  clip-path: inset(50%) !important;
  height: 1px !important;
  overflow: hidden !important;
  margin: -1px !important;
  padding: 0 !important;
  position: absolute !important;
  width: 1px !important;
  white-space: nowrap !important;
}
```

```html
<div class="sr-only" id="firstName-label">Name</div> <input aria-labelledBy="firstName-label" />
```  

--- 

# Placeholder

* A placeholder is not an option for an input label
  * Can’t be automatically translated;
  * Is oftentimes used in place of a label, locking out assistive technology;
  * Can hide important information when content is entered;
  * Can be too light-colored to be legible;
  * Has limited styling options;
  * May look like pre-filled information and be skipped over.

--- 

# Add help for your user

* If you want a specifiv format for your field, please define the format directly
  * via the label
  * via **aria-describedby**

```html
<label for="expire">Expiration date (MM/YYYY): </label>
<input type="text" name="expire" id="expire">
```

--- 

# Fieldset

* You can create a logical group of inputs with the **fieldset** element
* If you use a fieldset, you must always define a **legend**

```html
<form>
  <fieldset>
    <legend>Choose your favorite monster</legend>

    <input type="radio" id="kraken" name="monster" value="K">
    <label for="kraken">Kraken</label><br>

    <input type="radio" id="sasquatch" name="monster" value="S">
    <label for="sasquatch">Sasquatch</label><br>

    <input type="radio" id="mothman" name="monster" value="M" />
    <label for="mothman">Mothman</label>
  </fieldset>
</form>

```

--- 

# Required fields

* When a field is a required, you should add the *required* or *aria-required* attributes
* The **required** attribute will enable the client-slide validation. The **aria-required** won't
* For people that does not use Screen Readers, you must visually indicate that this input is required

```html
<label> Firstname (obligatoire) <input /></label>
```

```html
<form action="#" method="post">
  <p>Note: * denotes a required field</p>
  <div>
    <label for="usrname">Login name *:</label>
    <input aria-required="true" type="text">
  </div>
  <div>
    <label for="pwd">Password *:</label>
    <input aria-required="true" type="password">
  </div>
</form>
```

---

# Errors Managment

* When the form has errors, we should make the UX as smooth as possible
* Here is few rules
  * do not use only colors
  * do not use only icons
  * define the accepted value as soon as possible
  * linked the input to some interesting information via the **aria-describedby** attribute
  * after submitting the form, give the focus to the first element with an error  

```html
<label for="firstName">Name</label> 
<input id="firstName" aria-describedby="firstName-error"/>
<div id="firstName-error" class="error"> Ce champ est obligatoire </div>
```

---

# Errors Managment

* When an input is invalid, you should set the **aria-invalid** attribute
* You do not need extra CSS class like the **error** CSS class used previously
  * *Hello Angular*
* You can now use more semantic CSS rules

```html
<label for="firstName">Name</label> 
<input id="firstName" aria-invalid="true" aria-describedby="firstName-error"/>
<div id="firstName-error" class="error"> Ce champ est obligatoire </div>
```

```css
[aria-invalid='true']{
  background: red;
}
```


--- 

# Global Errors

* Sometimes we have a global errors block
* You should add focus to this element in order link the user to the beggining of the form
* In order to be focusable, you should add the tabindex attribute to the main HTML element of this block. 

```html
<form>
  <div id="error-blocks" tabindex="-1"> ... </div>
  <button> Valider le formulaire </button>  
</form>  
```

```javascript
document.querySelector('form').addEventListener('submit', () => {
  document.querySelector('#error-blocks').focus();
})
```

---

# Autocomplete

* The **autocomplete** attribute make possible to provide an autocomplete behavior based on previous visited webpage

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

# Autocomplete

* Here is a list of possible values for the autocomplete attribute
  * given-name
  * family-name
  * email
  * username
  * street-address
  * country
  * postal-code
  * ...
* You will find a full list here https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
...

--- 

# DataList

* Component used to provide an easy autocomplete behavior
* Proposals are not based on the **user's data**

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

# Dynamic Autocomplete

* If you need to implement a dynamic autocomplete (with data coming from the server for example), 
* you need to follow the **Combobox Pattern** from the WAI ARIA Authoring Practices Guide
* https://www.w3.org/WAI/ARIA/apg/patterns/combobox/

---
layout: cover
---

# PW : Create the HTML for a shipping form