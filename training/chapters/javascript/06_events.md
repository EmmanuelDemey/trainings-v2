---
layout: cover
---

# 6 - Event-driven programming

---

# The event-driven model

- The browser is constantly emitting **events**: clicks, key presses, scrolling, page loaded...
- Your code **reacts** by registering **listeners**

```javascript
const button = document.querySelector('#buy');

button.addEventListener('click', () => {
  console.log('Button clicked!');
});
```

- "When **this event** happens on **this element**, run **this function**"
- The page stays responsive: nothing blocks, code runs **when events fire**

---

# Common events

| Event | Fired when... |
|-------|---------------|
| `click` | element is clicked |
| `input` | value of a field changes (every keystroke) |
| `change` | field loses focus with a new value |
| `submit` | form is submitted |
| `keydown` / `keyup` | keyboard key pressed / released |
| `mouseover` / `mouseout` | pointer enters / leaves |
| `DOMContentLoaded` | HTML fully parsed |
| `scroll`, `resize` | page scrolled, window resized |

---

# Adding and removing listeners

```javascript
function onBuy() {
  console.log('purchase!');
}

button.addEventListener('click', onBuy);
button.removeEventListener('click', onBuy); // same reference required!
```

- To remove a listener you need the **same function reference**
  - an inline arrow function **cannot** be removed
- One element can have **several listeners** for the same event
- Listen once, automatically removed after the first call:

```javascript
button.addEventListener('click', onBuy, { once: true });
```

---

# The event object

- The listener receives an **`event` object** full of information

```javascript
const field = document.querySelector('#search');

field.addEventListener('input', (event) => {
  console.log(event.target);        // the element that fired the event
  console.log(event.target.value);  // current content of the field
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
  }
});
```

---

# `preventDefault` and forms

- Some events have a **default behavior** (submit reloads the page, links navigate...)

```javascript
const form = document.querySelector('#signup');

form.addEventListener('submit', (event) => {
  event.preventDefault(); // stop the page reload

  const email = form.querySelector('#email').value;
  if (email === '') {
    errorZone.textContent = 'Email is required';
    return;
  }
  // process the data with JavaScript instead
});
```

---

# Putting it all together

```javascript
const input = document.querySelector('#task');
const list = document.querySelector('#tasks');
const form = document.querySelector('form');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const li = document.createElement('li');
  li.textContent = input.value;
  li.addEventListener('click', () => li.remove());

  list.append(li);
  input.value = '';
});
```

- **DOM + events** = the heart of every interactive interface

---

# Hands-on

## Workshop 6 - Interactive interfaces
- A counter with `+` / `-` buttons that updates a displayed number
- A character counter under a text field (`input` event)
- A form with `submit` validation and error messages in the page
- A mini todo-list: add a task, click on it to delete it
