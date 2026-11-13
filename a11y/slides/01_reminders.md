---
layout: cover
---

# Reminders

---

# Selectors

* Here are different syntaxes to select an HTML element
* These selectors can be used:

* in CSS
```css
#id { }
.className { }
button { }
[aria-hidden='true'] { }
img[aria-hidden='true'] { }
```

* and in JavaScript (modern syntax recommended)
```javascript
// Recommended: querySelector (more flexible)
const element = document.querySelector(selector);
const input = document.querySelector('#nameInput');
const button = document.querySelector('button[aria-label="Submit"]');

// Legacy syntax (still works)
const elementById = document.getElementById("nameInput");
```
---

# Manipulating HTML elements

- Once an element is retrieved, we can manipulate its attributes:

```javascript
const elt = document.querySelector(selector);

elt.hasAttribute("aria-invalid");
elt.setAttribute("aria-invalid", "true");
elt.removeAttribute("aria-invalid");
```

---

# Selecting HTML elements

- To select several elements:

```javascript
// Recommended: querySelectorAll (CSS selectors)
const buttons = document.querySelectorAll("button");
const errorFields = document.querySelectorAll('[aria-invalid="true"]');

// Legacy syntax (still works)
const paragraphs = document.getElementsByTagName("p");
const errors = document.getElementsByClassName("error");
```

- The **querySelectorAll** method returns a **NodeList** object

```javascript
const buttons = document.querySelectorAll("button");
// Classic loop
for (let i = 0; i < buttons.length; i++) {
  console.log(buttons[i]);
}
```

- We can convert it to an **Array** to use modern methods

```javascript
// Converting to an Array (2 ways)
const buttons = Array.from(document.querySelectorAll("button"));
// or
const buttons2 = [...document.querySelectorAll("button")];

// Using Array methods, with error handling
if (!buttons.length) {
  console.log("No button found");
} else {
  buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Button clicked:', button.textContent);
    });
  });
}
```

---

# Event Listener

- To listen to an event on an element, we use the **addEventListener** method.
- By default, an event propagates from element to element.
- This mechanism is called **bubbling**.
- We can stop the **bubbling** and prevent the default behaviour of the event.


```javascript
const button = document.querySelector('button');

button.addEventListener('click', e => {
    e.stopPropagation();
    e.preventDefault();
    ...
});
```

---

# Event Listener

- For example, the **DOMContentLoaded** event lets us run code once the HTML document has been fully loaded and parsed.

```javascript
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
});
```

---

# CSS reminder - the .sr-only class

**Screen Reader Only**: visually hidden, but still available to screen readers

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

# Why .sr-only?

**Context**: some information is visually obvious but not for screen readers

**Common use cases**:
- **Skip links**: "Skip to main content"
- **Hidden labels**: icons without visible text
- **Instructions**: help to navigate a complex component
- **Extra context**: "opens in a new tab"

```html
<!-- Skip link -->
<a href="#main-content" class="sr-only">Skip to main content</a>

<!-- Icon button -->
<button>
  <span class="sr-only">Close</span>
  <svg aria-hidden="true"><!-- X icon --></svg>
</button>

<!-- External link -->
<a href="https://example.com" target="_blank">
  Documentation
  <span class="sr-only">(opens in a new tab)</span>
</a>
```

---

# .sr-only vs other techniques

**DO NOT use these to hide content that must stay accessible**:

```css
/* ❌ display: none - Ignored by screen readers */
.hidden {
  display: none;
}

/* ❌ visibility: hidden - Also ignored */
.invisible {
  visibility: hidden;
}

/* ❌ opacity: 0 - Can be confusing */
.transparent {
  opacity: 0;
}

/* ✅ .sr-only - Only perceivable by screen readers */
.sr-only {
  /* ... code above ... */
}
```

---

# What about frameworks?

* The concepts covered here (selecting elements, events, manipulating attributes) also apply to frameworks
* React, Vue, Angular and Svelte provide their own APIs to manage focus and ARIA attributes
* We will come back to this in the **Frameworks and Libraries** chapter
* In this training, the workshops use **plain HTML, CSS and JavaScript**
