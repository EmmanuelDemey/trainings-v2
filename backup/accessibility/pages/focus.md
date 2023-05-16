# Focus Managment

* On a web page, only these three categories of elements are focusable by default
  * Form Controls
  * Links **with a href**
  * Buttons
* All other elements are not focusable (but clickable)! 
  * They are not accessible.

---

# Focus Managment

* If you need to make an unfocusable element focusable, you need to use the **tabindex** attribute.

* The attribute accepts three values
  * -1 : the element will only be focusable programmatically
  * 0 : the element will be focusable like a form control, link or button
  * higher than 0 : we will change the focus order

> BTW a link with a href equal to **#**, is a button !

--- 

# Focus Managment

* Here are three HTML elements using the **tabindex** attribute.

```html
<div tabindex="0"> ... </div>

<span tabindex="-1"> ... </span>  

<div tabindex="1"> ... </div>
```

* The **span** is now focusable programmatically. 


```javascript
document.querySelector('span').focus();
```

---

# Focus Managment

* A visual indicator should be added on a focused element. 
* Most of the time, same CSS rules as the one use for the **hover** state

```css
:focus {
    outline: 2px dotted var(--link-color);
}
```

* Only visible element should be focusable
  * You need to implement **Focus Trap**
  * For example **Modal**, **Burger Menu**, ...
* Make important behavior accessible as soon as possible
  * For example: Cookies banner

---
layout: cover
---

# Question :  How would you improve a page with a cookies banner ? 

---
layout: cover
---

# Question :  How would you make invisible elements unfocusable ? 

---
layout: cover
---
# Question :  How would you make items on the background unfocusable ? 

---

# Skip Link

* Simple behavior you can implement in order to bypass all the header of your website. 
* A **SkipLink** is composed of
  * A hidden link
  * this link will appear when the user navigate via the keyboard
  * We will redirect the user to the main part of the page (thanks to **anchor**)
* Here is a list of website using SkipLinks
  * Starbucks
  * Amazon
  * Github
  * Google
  * ...

---

# Skip Link

* Here an example of implementation for a Skip Link.

```html
<a class="skip-link" href="#main">Go to main content</a>

<main id="main" tabindex="-1">
    ...
</main>
```

```css
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: green;
    color: white;
    padding: 9px;''''
    z-index: 100;
}
.skip-link:focus {
    top: 0;
}
```

---

